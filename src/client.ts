import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Create a database connection
 * @param connectionString - PostgreSQL connection string
 * @returns Drizzle database instance
 */
export function createDatabaseClient(connectionString?: string) {
  const url =
    connectionString ||
    process.env.PROPERTY_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/property_db';

  const queryClient = postgres(url);
  const db = drizzle(queryClient, { schema });

  return { db, queryClient };
}

// Default database instance (singleton)
let defaultDbInstance: ReturnType<typeof createDatabaseClient> | null = null;

export function getDatabase() {
  if (!defaultDbInstance) {
    defaultDbInstance = createDatabaseClient();
  }
  return defaultDbInstance.db;
}

export function closeDatabase() {
  if (defaultDbInstance) {
    defaultDbInstance.queryClient.end();
    defaultDbInstance = null;
  }
}
