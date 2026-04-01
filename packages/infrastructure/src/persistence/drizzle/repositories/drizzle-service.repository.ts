import { eq } from 'drizzle-orm';
import { Service, Money } from '@crm/domain';
import type { ServiceRepository } from '@crm/domain';
import { services } from '../schema';
import { getDatabase } from '../db';

/**
 * Drizzle implementation of the Service Repository.
 */
export class DrizzleServiceRepository implements ServiceRepository {
  private get db() {
    return getDatabase();
  }

  async findById(id: string): Promise<Service | null> {
    const rows = await this.db.select().from(services).where(eq(services.id, id));
    const row = rows[0];
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Service[]> {
    const rows = await this.db.select().from(services);
    return rows.map((r) => this.toDomain(r));
  }

  async findActive(): Promise<Service[]> {
    const rows = await this.db.select().from(services).where(eq(services.isActive, true));
    return rows.map((r) => this.toDomain(r));
  }

  async save(service: Service): Promise<void> {
    const data = service.toJSON() as Record<string, unknown>;
    await this.db
      .insert(services)
      .values({
        id: data.id as string,
        name: data.name as string,
        description: (data.description as string) ?? null,
        durationMinutes: data.durationMinutes as number,
        priceInCents: data.priceInCents as number,
        currency: data.currency as string,
        isActive: data.isActive as boolean,
        createdAt: data.createdAt as string,
        updatedAt: data.updatedAt as string,
      })
      .onConflictDoUpdate({
        target: services.id,
        set: {
          name: data.name as string,
          description: (data.description as string) ?? null,
          durationMinutes: data.durationMinutes as number,
          priceInCents: data.priceInCents as number,
          currency: data.currency as string,
          isActive: data.isActive as boolean,
          updatedAt: data.updatedAt as string,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(services).where(eq(services.id, id));
  }

  private toDomain(row: typeof services.$inferSelect): Service {
    return Service.reconstitute({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      durationMinutes: row.durationMinutes,
      price: Money.fromCents(row.priceInCents, row.currency),
      isActive: row.isActive,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }
}
