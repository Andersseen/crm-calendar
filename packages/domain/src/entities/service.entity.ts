import { Money } from '../value-objects/money.vo';

export interface ServiceProps {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: Money;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service Entity
 * Represents an aesthetics service offered by the beauty center (e.g., manicure, facial).
 */
export class Service {
  private constructor(private props: ServiceProps) {}

  static create(params: {
    id: string;
    name: string;
    description?: string;
    durationMinutes: number;
    priceInCents: number;
    currency?: string;
  }): Service {
    if (!params.name.trim()) {
      throw new Error('Service name is required');
    }
    if (params.durationMinutes <= 0 || !Number.isInteger(params.durationMinutes)) {
      throw new Error('Service duration must be a positive integer (minutes)');
    }
    if (params.durationMinutes > 480) {
      throw new Error('Service duration cannot exceed 8 hours (480 minutes)');
    }
    const now = new Date();
    return new Service({
      id: params.id,
      name: params.name.trim(),
      description: params.description?.trim(),
      durationMinutes: params.durationMinutes,
      price: Money.fromCents(params.priceInCents, params.currency ?? 'EUR'),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ServiceProps): Service {
    return new Service(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get durationMinutes(): number {
    return this.props.durationMinutes;
  }

  get price(): Money {
    return this.props.price;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  updatePrice(priceInCents: number, currency?: string): void {
    this.props.price = Money.fromCents(priceInCents, currency ?? this.props.price.getCurrency());
    this.props.updatedAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      durationMinutes: this.props.durationMinutes,
      priceInCents: this.props.price.toCents(),
      currency: this.props.price.getCurrency(),
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
