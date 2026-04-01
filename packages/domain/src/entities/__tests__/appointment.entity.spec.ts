import { describe, test, expect } from 'bun:test';
import { Appointment, AppointmentStatus } from '../appointment.entity';

describe('Appointment Entity', () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const validParams = {
    id: 'appt-001',
    clientId: 'client-001',
    serviceId: 'svc-001',
    startTime: now,
    endTime: oneHourLater,
    notes: 'First visit',
  };

  test('should create a valid appointment with PENDING status', () => {
    const appt = Appointment.create(validParams);

    expect(appt.id).toBe('appt-001');
    expect(appt.clientId).toBe('client-001');
    expect(appt.serviceId).toBe('svc-001');
    expect(appt.status).toBe(AppointmentStatus.PENDING);
    expect(appt.timeSlot.getDurationMinutes()).toBe(60);
  });

  test('should emit AppointmentCreatedEvent on creation', () => {
    const appt = Appointment.create(validParams);
    const events = appt.pullDomainEvents();

    expect(events).toHaveLength(1);
    expect(events[0]!.eventName).toBe('appointment.created');
  });

  test('should confirm a pending appointment', () => {
    const appt = Appointment.create(validParams);
    appt.confirm();

    expect(appt.status).toBe(AppointmentStatus.CONFIRMED);
    const events = appt.pullDomainEvents();
    // Created + Confirmed events
    expect(events.length).toBeGreaterThanOrEqual(1);
  });

  test('should not confirm an already cancelled appointment', () => {
    const appt = Appointment.create(validParams);
    appt.cancel();

    expect(() => appt.confirm()).toThrow('Cannot confirm');
  });

  test('should cancel a pending appointment', () => {
    const appt = Appointment.create(validParams);
    appt.cancel();

    expect(appt.status).toBe(AppointmentStatus.CANCELLED);
  });

  test('should complete a confirmed appointment', () => {
    const appt = Appointment.create(validParams);
    appt.confirm();
    appt.complete();

    expect(appt.status).toBe(AppointmentStatus.COMPLETED);
  });

  test('should not complete a pending appointment', () => {
    const appt = Appointment.create(validParams);
    expect(() => appt.complete()).toThrow('Cannot complete');
  });

  test('should detect overlapping appointments', () => {
    const appt1 = Appointment.create(validParams);
    const appt2 = Appointment.create({
      ...validParams,
      id: 'appt-002',
      startTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 min into first
      endTime: new Date(now.getTime() + 90 * 60 * 1000),
    });

    expect(appt1.overlaps(appt2)).toBe(true);
  });

  test('should not detect overlap for non-overlapping appointments', () => {
    const appt1 = Appointment.create(validParams);
    const appt2 = Appointment.create({
      ...validParams,
      id: 'appt-002',
      startTime: oneHourLater,
      endTime: twoHoursLater,
    });

    expect(appt1.overlaps(appt2)).toBe(false);
  });

  test('should reschedule an appointment', () => {
    const appt = Appointment.create(validParams);
    appt.confirm();
    appt.reschedule(oneHourLater, twoHoursLater);

    expect(appt.status).toBe(AppointmentStatus.PENDING); // Reset after reschedule
    expect(appt.timeSlot.getStart().getTime()).toBe(oneHourLater.getTime());
  });

  test('should throw on invalid time slot (end before start)', () => {
    expect(() =>
      Appointment.create({
        ...validParams,
        startTime: oneHourLater,
        endTime: now,
      }),
    ).toThrow('TimeSlot end must be after start');
  });

  test('should serialize to JSON', () => {
    const appt = Appointment.create(validParams);
    const json = appt.toJSON();

    expect(json.id).toBe('appt-001');
    expect(json.status).toBe('PENDING');
    expect(json.durationMinutes).toBe(60);
    expect(typeof json.startTime).toBe('string');
  });
});
