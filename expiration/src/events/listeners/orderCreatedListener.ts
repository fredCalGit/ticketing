import { Listener, OrderCreatedEvent, Subjects } from "@fctickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { expirationQueue } from "../../queues/expirationQueue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(delay);
    await expirationQueue.add(
      { orderId: data.id },
      {
        delay: 600000,
      }
    );

    msg.ack();
  }
}
