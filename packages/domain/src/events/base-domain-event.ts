/**
 * Base Domain Event
 * All domain events extend this abstract class.
 */
export abstract class BaseDomainEvent {
  public readonly occurredOn: Date;
  public readonly eventId: string;

  constructor() {
    this.occurredOn = new Date();
    this.eventId = crypto.randomUUID();
  }

  abstract get eventName(): string;
}
