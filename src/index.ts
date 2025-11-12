// Export database client
export { createDatabaseClient, getDatabase, closeDatabase } from './client';

// Export all schemas
export * from './schema';

// Export types
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
