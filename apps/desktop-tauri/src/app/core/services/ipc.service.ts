import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  result?: T;
  error?: { code: number; message: string };
  id: number;
}

/**
 * IPC Service
 * JSON-RPC 2.0 client that communicates with the Bun sidecar.
 * Uses HTTP transport to localhost:3001.
 */
@Injectable({ providedIn: 'root' })
export class IpcService {
  private readonly baseUrl = signal('http://127.0.0.1:3001');
  private requestId = 0;

  constructor(private readonly http: HttpClient) {}

  /**
   * Call a JSON-RPC method on the sidecar.
   * @param method - The method name (e.g., 'appointment.create')
   * @param params - Method parameters
   * @returns The result payload
   */
  async call<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: ++this.requestId,
    };

    const response = await firstValueFrom(
      this.http.post<JsonRpcResponse<T>>(`${this.baseUrl()}/rpc`, request),
    );

    if (response.error) {
      throw new Error(`[IPC Error ${response.error.code}] ${response.error.message}`);
    }

    return response.result as T;
  }

  /** Health check */
  async ping(): Promise<boolean> {
    try {
      const result = await this.call<{ pong: boolean }>('system.ping');
      return result.pong === true;
    } catch {
      return false;
    }
  }
}
