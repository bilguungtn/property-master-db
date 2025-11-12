# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a shared database package for property management using Drizzle ORM and PostgreSQL. It's designed to be consumed as a workspace dependency (`property_database`) in a monorepo structure, primarily by NestJS backend services.

## Database Commands

```bash
# Generate migration files from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly to database (development only - skips migration files)
pnpm db:push

# Open Drizzle Studio GUI (runs at https://local.drizzle.studio)
pnpm db:studio

# Seed database with sample data
pnpm db:seed

# Type-check TypeScript files
pnpm typecheck
```

## Architecture

### Two-Tier Schema Design

The database schema is intentionally split into two conceptual groups within a single file:

**1. Immutable Schemas** (top section of `src/schema/schemas.ts`)
Physical property characteristics that rarely change:
- `properties_building` - Building-level data (name, type, structure, location codes)
- `properties` - Individual rooms/units (identified by UUID, linked to building)
- `property_locations` - Geographic coordinates per building
- `property_routes` - Transportation access per building
- `property_translations` - Localized content per building

**2. Changeable Schemas** (bottom section of `src/schema/schemas.ts`)
Rental listing information that changes frequently:
- `property_listings` - Core listing (linked to a property via `property_id`)
- `property_costs` - Pricing (one-to-one with listing via unique `listing_id`)
- `property_images` - Photos ordered by `order_num`
- `property_facilities` - Building amenities (elevator, parking, etc.)
- `property_conditions` - Structural features (earthquake-resistant, etc.)
- `property_campaigns` - Marketing campaigns
- `property_dealings` - Transaction types
- `property_advertisement_fees` - Advertising costs
- `property_advertisement_reprints` - Reprint permissions
- `property_monthlies` - Monthly rental options (one-to-one with listing)

**Key Design Principle**: A single property (room) can have multiple listings over time. Physical building data is never duplicated across listings.

### Database Client Pattern

The package exports a singleton database client via `getDatabase()` defined in `src/client.ts`:

```typescript
import { getDatabase, closeDatabase } from 'property_database';

const db = getDatabase(); // Returns singleton instance
// When done (in scripts):
closeDatabase();
```

Connection string priority:
1. Explicit parameter to `createDatabaseClient(connectionString)`
2. `PROPERTY_DATABASE_URL` environment variable
3. Default: `postgresql://postgres:postgres@localhost:5432/property_db`

### Drizzle Relations

All schemas define Drizzle relations for type-safe relational queries in `src/schema/relations.ts`:
- Use `db.query.<tableName>.findMany({ with: { ... } })` for queries with relations
- Relations are separated from table definitions for cleaner organization
- One-to-one relations: `costs` (listing ← costs), `monthlies` (listing ← monthlies)
- One-to-many relations: `building` → `properties`, `listing` → `images`, etc.

### Migration Workflow

1. Modify table definitions in `src/schema/schemas.ts`
2. Run `pnpm db:generate` to create migration SQL files in `drizzle/` directory
3. Review generated SQL
4. Run `pnpm db:migrate` to apply migrations

**Development shortcut**: `pnpm db:push` applies schema changes directly without creating migration files. Only use this locally, never in production.

**Note**: Relations changes in `src/schema/relations.ts` do not require migrations as they're TypeScript-only and don't affect the database structure.

## Important Patterns

### Always Use Transactions for Related Inserts

When creating a listing with costs, images, or other related data, wrap in a transaction:

```typescript
await db.transaction(async (tx) => {
  const [listing] = await tx.insert(propertyListings).values({...}).returning();
  await tx.insert(propertyCosts).values({ listingId: listing.id, ... });
  await tx.insert(propertyImages).values([...]);
});
```

### Prefer Query API Over Manual Joins

```typescript
// Preferred - cleaner, type-safe with relations
const listings = await db.query.propertyListings.findMany({
  with: {
    property: { with: { building: true } },
    costs: true,
    images: true,
  },
});

// Avoid unless you need custom join logic
const results = await db.select().from(propertyListings).innerJoin(...)
```

### Generate UUIDs for Properties

The `properties.uuid` field must be populated when creating a property:

```typescript
await tx.insert(properties).values({
  uuid: crypto.randomUUID(),
  propertiesBuildingId: building.id,
  // ... other fields
});
```

### Close Connections in Scripts

Scripts using the database should clean up:

```typescript
import { closeDatabase } from 'property_database';

try {
  // Database operations
} finally {
  closeDatabase();
}
```

## Schema File Organization

- `src/schema/schemas.ts` - All table definitions (separated by comment sections for immutable vs changeable)
- `src/schema/relations.ts` - All Drizzle ORM relations
- `src/schema/index.ts` - Re-exports all schemas and relations

## Configuration Files

- `drizzle.config.ts` - Drizzle Kit configuration (schema paths, output directory, credentials)
- `.env` - Local environment variables (not committed); should contain `PROPERTY_DATABASE_URL`
- `tsconfig.json` - TypeScript configuration extending `@repo/typescript-config`

## Type Exports

The package exports type helpers from Drizzle ORM:

```typescript
import type { InferSelectModel, InferInsertModel } from 'property_database';
import { propertyListings } from 'property_database';

type PropertyListing = InferSelectModel<typeof propertyListings>;
type NewPropertyListing = InferInsertModel<typeof propertyListings>;
```

## Database Setup

PostgreSQL database required. Connection defaults expect:
- Database name: `property_db`
- User: `postgres`
- Password: `postgres`
- Host: `localhost:5432`

Override with `PROPERTY_DATABASE_URL` environment variable.
