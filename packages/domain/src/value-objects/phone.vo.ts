/**
 * Phone Value Object
 * Immutable, self-validating phone number.
 * Accepts international formats: +34 612 345 678, (612) 345-678, etc.
 */
export class Phone {
  private static readonly PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

  private constructor(private readonly value: string) {}

  static create(phone: string): Phone {
    const trimmed = phone.trim();
    if (!Phone.PHONE_REGEX.test(trimmed)) {
      throw new Error(`Invalid phone number: ${phone}`);
    }
    // Normalize: keep only digits and leading +
    const normalized = trimmed.startsWith('+')
      ? '+' + trimmed.slice(1).replace(/\D/g, '')
      : trimmed.replace(/\D/g, '');
    return new Phone(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Phone): boolean {
    return this.value === other.value;
  }
}
