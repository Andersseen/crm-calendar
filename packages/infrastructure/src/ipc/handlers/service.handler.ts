import { Service } from '@crm/domain';
import type { ServiceRepository } from '@crm/domain';

/**
 * Service JSON-RPC method handlers.
 */
export function createServiceHandlers(serviceRepo: ServiceRepository) {
  return {
    'service.create': async (params: Record<string, unknown>) => {
      const service = Service.create({
        id: crypto.randomUUID(),
        name: params.name as string,
        description: params.description as string | undefined,
        durationMinutes: params.durationMinutes as number,
        priceInCents: params.priceInCents as number,
        currency: params.currency as string | undefined,
      });
      await serviceRepo.save(service);
      return service.toJSON();
    },

    'service.get': async (params: Record<string, unknown>) => {
      const service = await serviceRepo.findById(params.id as string);
      if (!service) throw new Error('Service not found');
      return service.toJSON();
    },

    'service.list': async () => {
      const services = await serviceRepo.findAll();
      return services.map((s) => s.toJSON());
    },

    'service.listActive': async () => {
      const services = await serviceRepo.findActive();
      return services.map((s) => s.toJSON());
    },

    'service.deactivate': async (params: Record<string, unknown>) => {
      const service = await serviceRepo.findById(params.id as string);
      if (!service) throw new Error('Service not found');
      service.deactivate();
      await serviceRepo.save(service);
      return service.toJSON();
    },

    'service.delete': async (params: Record<string, unknown>) => {
      await serviceRepo.delete(params.id as string);
      return { success: true };
    },
  };
}
