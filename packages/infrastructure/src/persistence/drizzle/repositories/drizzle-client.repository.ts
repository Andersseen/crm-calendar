import { eq } from 'drizzle-orm';
import { Client, Email, Phone } from '@crm/domain';
import type { ClientRepository } from '@crm/domain';
import { clients } from '../schema';
import { getDatabase } from '../db';

/**
 * Drizzle implementation of the Client Repository.
 */
export class DrizzleClientRepository implements ClientRepository {
  private get db() {
    return getDatabase();
  }

  async findById(id: string): Promise<Client | null> {
    const rows = await this.db.select().from(clients).where(eq(clients.id, id));
    const row = rows[0];
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByEmail(email: string): Promise<Client | null> {
    const rows = await this.db
      .select()
      .from(clients)
      .where(eq(clients.email, email.toLowerCase()));
    const row = rows[0];
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Client[]> {
    const rows = await this.db.select().from(clients);
    return rows.map((r) => this.toDomain(r));
  }

  async search(query: string): Promise<Client[]> {
    // Simple LIKE search on name and email
    const all = await this.findAll();
    const lower = query.toLowerCase();
    return all.filter(
      (c) =>
        c.fullName.toLowerCase().includes(lower) ||
        c.email.toString().includes(lower),
    );
  }

  async save(client: Client): Promise<void> {
    const data = client.toJSON() as Record<string, unknown>;
    await this.db
      .insert(clients)
      .values({
        id: data.id as string,
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        email: data.email as string,
        phone: data.phone as string,
        notes: (data.notes as string) ?? null,
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
      })
      .onConflictDoUpdate({
        target: clients.id,
        set: {
          firstName: data.firstName as string,
          lastName: data.lastName as string,
          email: data.email as string,
          phone: data.phone as string,
          notes: (data.notes as string) ?? null,
          updatedAt: data.updatedAt as string,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(clients).where(eq(clients.id, id));
  }

  private toDomain(row: typeof clients.$inferSelect): Client {
    return Client.reconstitute({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: Email.create(row.email),
      phone: Phone.create(row.phone),
      notes: row.notes ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
