import { TicketCreatedEvent } from "@fctickets/common";
import { TicketCreatedListener } from "../ticketCreatedListener";
import { natsWrapper } from "../../../natsWrapper";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);
  // create a fake data event
  const fakeData: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "testing",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, fakeData, msg };
};
it("creates and saves a ticket", async () => {
  const { listener, fakeData, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(fakeData, msg);
  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(fakeData.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(fakeData.title);
  expect(ticket!.price).toEqual(fakeData.price);
});

it("acks the message", async () => {
  const { fakeData, listener, msg } = await setup();
  // call the onMessage function with the data object + message object
  await listener.onMessage(fakeData, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
