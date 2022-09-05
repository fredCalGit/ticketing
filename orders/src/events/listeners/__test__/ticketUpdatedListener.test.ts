import { TicketUpdatedListener } from "../ticketUpdatedListener";
import { natsWrapper } from "../../../natsWrapper";
import { TicketUpdatedEvent } from "@fctickets/common";
import { Ticket } from "../../../models/ticket";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);
  // create and save a ticket
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "testing",
    price: 10,
  });
  await ticket.save();
  // create a fake data event
  const fakeData: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "edited testing title",
    price: 999,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, fakeData, msg, ticket };
};
it("finds, updates and saves a ticket", async () => {
  const { listener, fakeData, msg, ticket } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(fakeData, msg);
  // write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(fakeData.title);
  expect(updatedTicket!.price).toEqual(fakeData.price);
  expect(updatedTicket!.version).toEqual(fakeData.version);
});

it("acks the message", async () => {
  const { fakeData, listener, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(fakeData, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { msg, fakeData, listener, ticket } = await setup();

  fakeData.version = 10;

  try {
    await listener.onMessage(fakeData, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
