import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/persistence/drizzle/schema.ts',
  out: './src/persistence/drizzle/migrations',
  dialect: 'sqlite',
});
