# Property Database Package

A shared database package using Drizzle ORM and PostgreSQL for managing property listings across the monorepo.

## Overview

This package provides:
- **Type-safe database schemas** for property management
- **Database client utilities** with connection pooling
- **Migration management** with Drizzle Kit
- **Seed scripts** for development data
- **Shared types** for use across backend services

### Data Model

The database is organized into two main groups:

#### 1. **Immutable Property Data** (Physical Characteristics)
Tables that represent physical building and property information that rarely changes:

- `properties_building` - Building information (name, type, structure, built year)
- `properties` - Individual rooms/units in buildings
- `property_locations` - Geographic coordinates (longitude, latitude)
- `property_routes` - Transportation access (stations, travel time)
- `property_translations` - Localized content (address details, descriptions)

#### 2. **Changeable Listing Data** (Rental Information)
Tables that represent rental information that changes frequently:

- `property_listings` - Rental listings (published date, availability)
- `property_costs` - Pricing and fees (rent, deposit, management fees)
- `property_images` - Photos and floor plans
- `property_facilities` - Building facilities (elevator, parking)
- `property_conditions` - Structural conditions (earthquake-resistant, etc.)
- `property_campaigns` - Marketing campaigns
- `property_dealings` - Transaction types
- `property_advertisement_fees` - Advertising costs
- `property_advertisement_reprints` - Reprint permissions
- `property_monthlies` - Monthly rental options

This separation enables:
- Multiple listings per property over time
- Historical tracking of pricing changes
- Efficient updates without duplicating physical data

## Installation

This package is part of the monorepo workspace and is automatically linked.

From **any backend service** that needs it:

```json
{
  "dependencies": {
    "property_database": "workspace:*"
  }
}
```

## Setup

### 1. Database Setup

#### Option A: Using Docker (Recommended)

```bash
docker run --name property-postgres \
  -e POSTGRES_DB=property_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14
```

#### Option B: Local PostgreSQL

```sql
CREATE DATABASE property_db;
```

### 2. Environment Configuration

Create `.env` in the package directory:

```bash
cd packages/property-database
cp .env.example .env
```

Update the connection string:

```env
PROPERTY_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_db
```

### 3. Generate and Run Migrations

```bash
# Navigate to package directory
cd packages/property-database

# Generate migration files from schemas
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Or push schema directly (development only)
pnpm db:push
```

### 4. Seed Database (Optional)

```bash
pnpm db:seed
```

## Usage

### In NestJS Backend Services

#### 1. Add Package Dependency

```json
// apps/backend/your-service/package.json
{
  "dependencies": {
    "property_database": "workspace:*"
  }
}
```

#### 2. Use in Services

```typescript
// apps/backend/your-service/src/modules/property/property.service.ts
import { Injectable } from '@nestjs/common';
import { getDatabase, propertyListings, properties } from 'property_database';

@Injectable()
export class PropertyService {
  private db = getDatabase();

  async findAll() {
    return await this.db.query.propertyListings.findMany({
      with: {
        property: {
          with: {
            building: true,
          },
        },
        costs: true,
        images: true,
      },
      limit: 10,
    });
  }

  async findById(id: number) {
    return await this.db.query.propertyListings.findFirst({
      where: (listings, { eq }) => eq(listings.id, id),
      with: {
        property: {
          with: {
            building: {
              with: {
                locations: true,
                routes: true,
                translations: true,
              },
            },
          },
        },
        costs: true,
        images: true,
        facilities: true,
        conditions: true,
      },
    });
  }
}
```

### Direct Database Operations

#### Query Examples

```typescript
import {
  getDatabase,
  propertyListings,
  properties,
  propertiesBuilding,
} from 'property_database';
import { eq, and, gte, lte } from 'drizzle-orm';

const db = getDatabase();

// Query with relations using query API (recommended)
const listings = await db.query.propertyListings.findMany({
  with: {
    property: {
      with: {
        building: true,
      },
    },
    costs: true,
  },
  where: (listings, { eq }) => eq(listings.isActive, 1),
});

// Query with joins using SQL-like syntax
const results = await db
  .select()
  .from(propertyListings)
  .innerJoin(properties, eq(propertyListings.propertyId, properties.id))
  .innerJoin(
    propertiesBuilding,
    eq(properties.propertiesBuildingId, propertiesBuilding.id),
  )
  .where(
    and(
      eq(propertyListings.isActive, 1),
      gte(properties.roomSize, 40),
      lte(properties.roomSize, 60),
    ),
  );
```

#### Insert Examples

```typescript
import {
  getDatabase,
  propertiesBuilding,
  properties,
  propertyListings,
  propertyCosts,
} from 'property_database';

const db = getDatabase();

// Insert building
const [building] = await db
  .insert(propertiesBuilding)
  .values({
    buildingName: 'Tokyo Tower Residence',
    buildingTypeCode: 1,
    structureTypeCode: 1,
    builtYear: 2022,
    builtMonth: 4,
    maxFloor: 15,
    prefectureCode: '13',
    cityCode: '101',
  })
  .returning();

// Insert property (room)
const [property] = await db
  .insert(properties)
  .values({
    uuid: crypto.randomUUID(),
    propertiesBuildingId: building.id,
    roomNumber: '301',
    roomSize: 55.0,
    layoutAmount: 2,
    layoutTypeCode: 1,
    floor: 3,
  })
  .returning();

// Insert listing with costs in a transaction
await db.transaction(async (tx) => {
  const [listing] = await tx
    .insert(propertyListings)
    .values({
      propertyId: property.id,
      publishedAt: new Date(),
      availableMoveInTimingCode: 1,
      isActive: 1,
      storeId: 1,
    })
    .returning();

  await tx.insert(propertyCosts).values({
    listingId: listing.id,
    rent: 150000,
    managementFee: 12000,
    depositPrice: 150000,
    depositMonth: 1,
    residenceInsuranceNeeded: 1,
  });
});
```

#### Update Examples

```typescript
import { getDatabase, propertyListings, propertyCosts } from 'property_database';
import { eq } from 'drizzle-orm';

const db = getDatabase();

// Update listing status
await db
  .update(propertyListings)
  .set({ isActive: 0 })
  .where(eq(propertyListings.id, 1));

// Update costs
await db
  .update(propertyCosts)
  .set({
    rent: 160000,
    managementFee: 13000,
  })
  .where(eq(propertyCosts.listingId, 1));
```

### Type Inference

Drizzle provides excellent TypeScript inference:

```typescript
import type { InferSelectModel, InferInsertModel } from 'property_database';
import { propertyListings, propertiesBuilding } from 'property_database';

// Select types (what you get from queries)
type PropertyListing = InferSelectModel<typeof propertyListings>;
type Building = InferSelectModel<typeof propertiesBuilding>;

// Insert types (what you need to insert)
type NewPropertyListing = InferInsertModel<typeof propertyListings>;
type NewBuilding = InferInsertModel<typeof propertiesBuilding>;

// Use in function signatures
async function createListing(data: NewPropertyListing): Promise<PropertyListing> {
  const [listing] = await db.insert(propertyListings).values(data).returning();
  return listing;
}
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm db:generate` | Generate migration files from schemas |
| `pnpm db:migrate` | Apply pending migrations to database |
| `pnpm db:push` | Push schema directly to database (dev only) |
| `pnpm db:studio` | Open Drizzle Studio GUI |
| `pnpm db:seed` | Seed database with sample data |
| `pnpm typecheck` | Type-check TypeScript files |

## Database Schema Diagram

```
┌─────────────────────┐
│ properties_building │
│                     │
│ - id (PK)           │
│ - building_name     │
│ - building_type_code│
│ - prefecture_code   │
│ - city_code         │
└─────────┬───────────┘
          │
          ├──────┬──────────┬────────────────┐
          │      │          │                │
          ▼      ▼          ▼                ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│ properties  │ │ property_    │ │ property_    │ │ property_        │
│             │ │ locations    │ │ routes       │ │ translations     │
│ - id (PK)   │ │              │ │              │ │                  │
│ - uuid      │ │ - longitude  │ │ - station_id │ │ - locale         │
│ - room_no   │ │ - latitude   │ │ - minutes    │ │ - address_detail │
└──────┬──────┘ └──────────────┘ └──────────────┘ └──────────────────┘
       │
       │
       ▼
┌──────────────────┐
│ property_        │
│ listings         │
│                  │
│ - id (PK)        │
│ - property_id    │
│ - published_at   │
│ - is_active      │
└────────┬─────────┘
         │
         ├────────┬──────────┬───────────┬─────────────┐
         │        │          │           │             │
         ▼        ▼          ▼           ▼             ▼
┌────────────┐ ┌────────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐
│ property_  │ │ property_  │ │ property_ │ │ property_│ │ property_│
│ costs      │ │ images     │ │ facilities│ │ campaigns│ │ monthlies│
│            │ │            │ │           │ │          │ │          │
│ - rent     │ │ - url      │ │ - code    │ │ - code   │ │ - is_    │
│ - deposit  │ │ - order    │ │ - status  │ │          │ │   monthly│
└────────────┘ └────────────┘ └───────────┘ └──────────┘ └──────────┘
```

## Drizzle Studio

Browse and edit your database with a GUI:

```bash
cd packages/property-database
pnpm db:studio
```

Opens at `https://local.drizzle.studio`

## Migrations Workflow

### Creating Migrations

1. Modify schemas in `src/schema/`
2. Generate migration:
   ```bash
   pnpm db:generate
   ```
3. Review SQL in `drizzle/` directory
4. Apply migration:
   ```bash
   pnpm db:migrate
   ```

### Development Workflow

For rapid iteration:

```bash
# Push schema directly (no migration files)
pnpm db:push
```

⚠️ **Warning**: Use `db:push` only in development. Production should use migrations.

## Best Practices

### 1. Use Transactions for Related Inserts

```typescript
await db.transaction(async (tx) => {
  const [listing] = await tx.insert(propertyListings).values(...).returning();
  await tx.insert(propertyCosts).values({ listingId: listing.id, ... });
  await tx.insert(propertyImages).values([...]);
});
```

### 2. Leverage Type Safety

```typescript
// TypeScript will catch errors
const listing = await db.query.propertyListings.findFirst({
  with: {
    costs: true, // Auto-complete knows this relation exists
  },
});

console.log(listing?.costs?.rent); // Type: number | null | undefined
```

### 3. Use Query API for Relations

```typescript
// Preferred (cleaner, type-safe)
const listings = await db.query.propertyListings.findMany({
  with: {
    property: {
      with: { building: true },
    },
    costs: true,
  },
});

// Instead of manual joins
```

### 4. Close Connections in Scripts

```typescript
import { closeDatabase } from 'property_database';

try {
  // Database operations
} finally {
  closeDatabase();
}
```

## Troubleshooting

### Connection Issues

```bash
# Test database connection
psql postgresql://postgres:postgres@localhost:5432/property_db

# If using Docker
docker ps
docker logs property-postgres
```

### Migration Conflicts

```bash
# Reset migrations (⚠️ destroys data)
pnpm db:push --force

# Or manually fix and mark migration as applied
```

### Type Errors

```bash
# Regenerate types
pnpm db:generate

# Restart TypeScript server in your IDE
```

## Contributing

When updating schemas:

1. **Document changes** in migration messages
2. **Test migrations** before committing
3. **Update seed scripts** if structure changes
4. **Coordinate with backend teams** using this package

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## License

UNLICENSED
