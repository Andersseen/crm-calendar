import { Appointment, AppointmentStatus } from '../entities/appointment.entity';

/**
 * Appointment Repository Interface
 * Defines the contract for appointment persistence.
 */
export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByClientId(clientId: string): Promise<Appointment[]>;
  findByDateRange(start: Date, end: Date): Promise<Appointment[]>;
  findByStatus(status: AppointmentStatus): Promise<Appointment[]>;
  findOverlapping(start: Date, end: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
  delete(id: string): Promise<void>;
}
