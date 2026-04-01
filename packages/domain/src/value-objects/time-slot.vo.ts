/**
 * TimeSlot Value Object
 * Represents a bounded time range with start, end, and computed duration.
 */
export class TimeSlot {
  private constructor(
    private readonly start: Date,
    private readonly end: Date,
  ) {}

  static create(start: Date, end: Date): TimeSlot {
    if (end <= start) {
      throw new Error('TimeSlot end must be after start');
    }
    return new TimeSlot(new Date(start), new Date(end));
  }

  getStart(): Date {
    return new Date(this.start);
  }

  getEnd(): Date {
    return new Date(this.end);
  }

  /** Duration in minutes */
  getDurationMinutes(): number {
    return (this.end.getTime() - this.start.getTime()) / (1000 * 60);
  }

  /** Check if this slot overlaps with another */
  overlaps(other: TimeSlot): boolean {
    return this.start < other.end && this.end > other.start;
  }

  /** Check if a specific time falls within this slot */
  contains(time: Date): boolean {
    return time >= this.start && time <= this.end;
  }

  equals(other: TimeSlot): boolean {
    return this.start.getTime() === other.start.getTime() && this.end.getTime() === other.end.getTime();
  }

  toString(): string {
    return `${this.start.toISOString()} - ${this.end.toISOString()}`;
  }
}
