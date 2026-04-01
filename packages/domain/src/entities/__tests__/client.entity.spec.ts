import { describe, test, expect } from 'bun:test';
import { Client } from '../client.entity';

describe('Client Entity', () => {
  const validParams = {
    id: 'client-001',
    firstName: 'María',
    lastName: 'García',
    email: 'maria@example.com',
    phone: '+34 612 345 678',
    notes: 'VIP client',
  };

  test('should create a valid client', () => {
    const client = Client.create(validParams);

    expect(client.id).toBe('client-001');
    expect(client.firstName).toBe('María');
    expect(client.lastName).toBe('García');
    expect(client.fullName).toBe('María García');
    expect(client.email.toString()).toBe('maria@example.com');
    expect(client.phone.toString()).toBe('+34612345678');
    expect(client.notes).toBe('VIP client');
    expect(client.createdAt).toBeInstanceOf(Date);
  });

  test('should throw on empty first name', () => {
    expect(() =>
      Client.create({ ...validParams, firstName: '  ' }),
    ).toThrow('Client first name is required');
  });

  test('should throw on empty last name', () => {
    expect(() =>
      Client.create({ ...validParams, lastName: '' }),
    ).toThrow('Client last name is required');
  });

  test('should throw on invalid email', () => {
    expect(() =>
      Client.create({ ...validParams, email: 'not-an-email' }),
    ).toThrow('Invalid email');
  });

  test('should update contact info', () => {
    const client = Client.create(validParams);
    const originalUpdatedAt = client.updatedAt;

    // Wait a tick so timestamps differ
    client.updateContact('new@example.com', '+34 600 111 222');

    expect(client.email.toString()).toBe('new@example.com');
    expect(client.phone.toString()).toBe('+34600111222');
    expect(client.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
  });

  test('should serialize to JSON', () => {
    const client = Client.create(validParams);
    const json = client.toJSON();

    expect(json.id).toBe('client-001');
    expect(json.firstName).toBe('María');
    expect(json.email).toBe('maria@example.com');
    expect(typeof json.createdAt).toBe('string');
  });
});
