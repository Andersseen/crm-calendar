import { Client } from '../entities/client.entity';

/**
 * Client Repository Interface
 * Defines the contract for client persistence. Implemented in infrastructure layer.
 */
export interface ClientRepository {
  findById(id: string): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAll(): Promise<Client[]>;
  search(query: string): Promise<Client[]>;
  save(client: Client): Promise<void>;
  delete(id: string): Promise<void>;
}
