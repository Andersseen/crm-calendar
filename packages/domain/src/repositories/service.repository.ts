import { Service } from '../entities/service.entity';

/**
 * Service Repository Interface
 * Defines the contract for service persistence.
 */
export interface ServiceRepository {
  findById(id: string): Promise<Service | null>;
  findAll(): Promise<Service[]>;
  findActive(): Promise<Service[]>;
  save(service: Service): Promise<void>;
  delete(id: string): Promise<void>;
}
