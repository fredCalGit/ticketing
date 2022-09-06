import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@fctickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
