/**
 * Money Value Object
 * Immutable, uses integer cents to avoid floating-point issues.
 */
export class Money {
  private constructor(
    private readonly cents: number,
    private readonly currency: string,
  ) {}

  static fromCents(cents: number, currency: string = 'EUR'): Money {
    if (!Number.isInteger(cents)) {
      throw new Error(`Cents must be an integer, got: ${cents}`);
    }
    if (cents < 0) {
      throw new Error(`Money cannot be negative: ${cents}`);
    }
    return new Money(cents, currency.toUpperCase());
  }

  static fromUnits(units: number, currency: string = 'EUR'): Money {
    return Money.fromCents(Math.round(units * 100), currency);
  }

  toCents(): number {
    return this.cents;
  }

  toUnits(): number {
    return this.cents / 100;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.fromCents(this.cents + other.cents, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.cents - other.cents;
    if (result < 0) {
      throw new Error('Money subtraction would result in negative value');
    }
    return Money.fromCents(result, this.currency);
  }

  equals(other: Money): boolean {
    return this.cents === other.cents && this.currency === other.currency;
  }

  toString(): string {
    return `${this.toUnits().toFixed(2)} ${this.currency}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot operate on different currencies: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}
