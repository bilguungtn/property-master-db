import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Run database migrations
 */
async function runMigrations() {
  const connectionString =
    process.env.PROPERTY_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/property_db';

  console.log('🚀 Starting migrations...');
  console.log(`📦 Connection: ${connectionString.replace(/:[^:]*@/, ':****@')}`);

  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();
