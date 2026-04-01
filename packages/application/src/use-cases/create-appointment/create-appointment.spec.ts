import { describe, test, expect, mock } from 'bun:test';
import { CreateAppointmentHandler } from './create-appointment.handler';
import { Client, Service, Money } from '@crm/domain';
import type {
  AppointmentRepository,
  ClientRepository,
  ServiceRepository,
} from '@crm/domain';

describe('CreateAppointmentHandler', () => {
  const mockClient = Client.create({
    id: 'client-001',
    firstName: 'María',
    lastName: 'García',
    email: 'maria@example.com',
    phone: '+34612345678',
  });

  const mockService = Service.create({
    id: 'svc-001',
    name: 'Manicura',
    durationMinutes: 60,
    priceInCents: 3500,
  });

  function createMockRepos() {
    const appointmentRepo: AppointmentRepository = {
      findById: mock(() => Promise.resolve(null)),
      findByClientId: mock(() => Promise.resolve([])),
      findByDateRange: mock(() => Promise.resolve([])),
      findByStatus: mock(() => Promise.resolve([])),
      findOverlapping: mock(() => Promise.resolve([])),
      save: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    };

    const clientRepo: ClientRepository = {
      findById: mock(() => Promise.resolve(mockClient)),
      findByEmail: mock(() => Promise.resolve(null)),
      findAll: mock(() => Promise.resolve([])),
      search: mock(() => Promise.resolve([])),
      save: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    };

    const serviceRepo: ServiceRepository = {
      findById: mock(() => Promise.resolve(mockService)),
      findAll: mock(() => Promise.resolve([])),
      findActive: mock(() => Promise.resolve([])),
      save: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    };

    return { appointmentRepo, clientRepo, serviceRepo };
  }

  test('should create an appointment successfully', async () => {
    const repos = createMockRepos();
    const handler = new CreateAppointmentHandler(
      repos.appointmentRepo,
      repos.clientRepo,
      repos.serviceRepo,
    );

    const now = new Date();
    const result = await handler.execute({
      clientId: 'client-001',
      serviceId: 'svc-001',
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    });

    expect(result.appointment.clientId).toBe('client-001');
    expect(result.appointment.serviceId).toBe('svc-001');
    expect(result.appointment.status).toBe('PENDING');
    expect(repos.appointmentRepo.save).toHaveBeenCalledTimes(1);
  });

  test('should throw when client not found', async () => {
    const repos = createMockRepos();
    repos.clientRepo.findById = mock(() => Promise.resolve(null));
    const handler = new CreateAppointmentHandler(
      repos.appointmentRepo,
      repos.clientRepo,
      repos.serviceRepo,
    );

    const now = new Date();
    await expect(
      handler.execute({
        clientId: 'nonexistent',
        serviceId: 'svc-001',
        startTime: now.toISOString(),
        endTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      }),
    ).rejects.toThrow('Client not found');
  });

  test('should throw on overlapping appointment', async () => {
    const repos = createMockRepos();
    const now = new Date();
    const existingAppt = {
      overlaps: () => true,
    };
    repos.appointmentRepo.findOverlapping = mock(() =>
      Promise.resolve([existingAppt as never]),
    );

    const handler = new CreateAppointmentHandler(
      repos.appointmentRepo,
      repos.clientRepo,
      repos.serviceRepo,
    );

    await expect(
      handler.execute({
        clientId: 'client-001',
        serviceId: 'svc-001',
        startTime: now.toISOString(),
        endTime: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
      }),
    ).rejects.toThrow('conflicts');
  });
});
