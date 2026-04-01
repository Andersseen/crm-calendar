import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';

export interface ClientProps {
  id: string;
  firstName: string;
  lastName: string;
  email: Email;
  phone: Phone;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Client Entity
 * Represents a customer of the beauty center.
 */
export class Client {
  private constructor(private props: ClientProps) {}

  static create(params: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  }): Client {
    if (!params.firstName.trim()) {
      throw new Error('Client first name is required');
    }
    if (!params.lastName.trim()) {
      throw new Error('Client last name is required');
    }
    const now = new Date();
    return new Client({
      id: params.id,
      firstName: params.firstName.trim(),
      lastName: params.lastName.trim(),
      email: Email.create(params.email),
      phone: Phone.create(params.phone),
      notes: params.notes?.trim(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ClientProps): Client {
    return new Client(props);
  }

  get id(): string {
    return this.props.id;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get email(): Email {
    return this.props.email;
  }

  get phone(): Phone {
    return this.props.phone;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateContact(email: string, phone: string): void {
    this.props.email = Email.create(email);
    this.props.phone = Phone.create(phone);
    this.props.updatedAt = new Date();
  }

  updateName(firstName: string, lastName: string): void {
    if (!firstName.trim() || !lastName.trim()) {
      throw new Error('First and last name are required');
    }
    this.props.firstName = firstName.trim();
    this.props.lastName = lastName.trim();
    this.props.updatedAt = new Date();
  }

  updateNotes(notes: string): void {
    this.props.notes = notes.trim();
    this.props.updatedAt = new Date();
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      email: this.props.email.toString(),
      phone: this.props.phone.toString(),
      notes: this.props.notes,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
