import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DrizzleClientRepository } from '../persistence/drizzle/repositories/drizzle-client.repository';
import { DrizzleAppointmentRepository } from '../persistence/drizzle/repositories/drizzle-appointment.repository';
import { DrizzleServiceRepository } from '../persistence/drizzle/repositories/drizzle-service.repository';
import { createAppointmentHandlers } from './handlers/appointment.handler';
import { createClientHandlers } from './handlers/client.handler';
import { createServiceHandlers } from './handlers/service.handler';
import { getDatabase } from '../persistence/drizzle/db';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

/**
 * JSON-RPC 2.0 Server (Sidecar Entry Point)
 * Runs as a standalone Bun HTTP server on localhost.
 * Angular app communicates with this via HTTP.
 */

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number | string;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
  id: number | string | null;
}

// --- Initialize repositories ---
const clientRepo = new DrizzleClientRepository();
const appointmentRepo = new DrizzleAppointmentRepository();
const serviceRepo = new DrizzleServiceRepository();

// --- Build method registry ---
const methodHandlers: Record<
  string,
  (params: Record<string, unknown>) => Promise<unknown>
> = {
  ...createAppointmentHandlers(appointmentRepo, clientRepo, serviceRepo),
  ...createClientHandlers(clientRepo),
  ...createServiceHandlers(serviceRepo),

  // Health check
  'system.ping': async () => ({ pong: true, timestamp: new Date().toISOString() }),
};

// --- Create Hono app ---
const app = new Hono();

app.use('*', cors({ origin: ['http://localhost:4200', 'tauri://localhost'], credentials: true }));

app.post('/rpc', async (c) => {
  const body = (await c.req.json()) as JsonRpcRequest;

  // Validate JSON-RPC 2.0
  if (body.jsonrpc !== '2.0' || !body.method) {
    return c.json<JsonRpcResponse>({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request' },
      id: body.id ?? null,
    });
  }

  const handler = methodHandlers[body.method];
  if (!handler) {
    return c.json<JsonRpcResponse>({
      jsonrpc: '2.0',
      error: { code: -32601, message: `Method not found: ${body.method}` },
      id: body.id,
    });
  }

  try {
    const result = await handler(body.params ?? {});
    return c.json<JsonRpcResponse>({
      jsonrpc: '2.0',
      result,
      id: body.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return c.json<JsonRpcResponse>({
      jsonrpc: '2.0',
      error: { code: -32000, message },
      id: body.id,
    });
  }
});

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Start server ---
const PORT = parseInt(process.env['SIDECAR_PORT'] ?? '3001', 10);

console.warn(`🚀 CRM Sidecar starting on http://127.0.0.1:${PORT}`);

// Ensure db directory exists
const fs = await import('fs');
const path = await import('path');
const dataDir = process.env['DATABASE_URL']
  ? path.dirname(process.env['DATABASE_URL'].replace('file:', ''))
  : './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
getDatabase();

export default {
  port: PORT,
  hostname: '127.0.0.1',
  fetch: app.fetch,
};
