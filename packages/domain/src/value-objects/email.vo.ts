/**
 * Email Value Object
 * Immutable, self-validating email address.
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    const trimmed = email.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email address: ${email}`);
    }
    return new Email(trimmed);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
