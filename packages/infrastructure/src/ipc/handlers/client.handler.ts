import { Client } from '@crm/domain';
import type { ClientRepository } from '@crm/domain';

/**
 * Client JSON-RPC method handlers.
 */
export function createClientHandlers(clientRepo: ClientRepository) {
  return {
    'client.create': async (params: Record<string, unknown>) => {
      const client = Client.create({
        id: crypto.randomUUID(),
        firstName: params.firstName as string,
        lastName: params.lastName as string,
        email: params.email as string,
        phone: params.phone as string,
        notes: params.notes as string | undefined,
      });
      await clientRepo.save(client);
      return client.toJSON();
    },

    'client.get': async (params: Record<string, unknown>) => {
      const client = await clientRepo.findById(params.id as string);
      if (!client) throw new Error('Client not found');
      return client.toJSON();
    },

    'client.list': async () => {
      const clients = await clientRepo.findAll();
      return clients.map((c) => c.toJSON());
    },

    'client.search': async (params: Record<string, unknown>) => {
      const clients = await clientRepo.search(params.query as string);
      return clients.map((c) => c.toJSON());
    },

    'client.update': async (params: Record<string, unknown>) => {
      const client = await clientRepo.findById(params.id as string);
      if (!client) throw new Error('Client not found');

      if (params.firstName && params.lastName) {
        client.updateName(params.firstName as string, params.lastName as string);
      }
      if (params.email && params.phone) {
        client.updateContact(params.email as string, params.phone as string);
      }
      if (params.notes !== undefined) {
        client.updateNotes(params.notes as string);
      }

      await clientRepo.save(client);
      return client.toJSON();
    },

    'client.delete': async (params: Record<string, unknown>) => {
      await clientRepo.delete(params.id as string);
      return { success: true };
    },
  };
}
