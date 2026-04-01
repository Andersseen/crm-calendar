import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Database connection factory.
 * Creates or returns existing database connection.
 * SQLite file is auto-created if it doesn't exist.
 */
export function getDatabase(dbPath?: string) {
  if (!dbInstance) {
    const path = dbPath ?? process.env['DATABASE_URL'] ?? './data/crm.db';
    const sqlite = new Database(path, { create: true });

    // Enable WAL mode for better concurrent read performance
    sqlite.exec('PRAGMA journal_mode = WAL;');
    sqlite.exec('PRAGMA foreign_keys = ON;');

    dbInstance = drizzle(sqlite, { schema });
  }
  return dbInstance;
}

/**
 * Close the database connection (for graceful shutdown).
 */
export function closeDatabase() {
  dbInstance = null;
}
