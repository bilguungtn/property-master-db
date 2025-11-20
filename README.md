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

- `stores` - Property management stores
- `buildings` - Building information (name, type, structure, built year)
- `rooms` - Individual rooms/units in buildings (identified by UUID)
- `property_locations` - Geographic coordinates (longitude, latitude)
- `property_routes` - Transportation access (stations, travel time, railroad info)
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
- Multiple listings per room over time
- Historical tracking of pricing changes
- Efficient updates without duplicating physical data
- Cascade deletion ensures referential integrity across all relationships

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
                    ┌────────────┐
                    │   stores   │
                    │            │
                    │ - id (PK)  │
                    └──────┬─────┘
                           │
                ┌──────────┴─────────────┐
                │                        │
                ▼                        ▼
┌─────────────────────────┐    ┌──────────────────────┐
│       buildings         │    │  property_listings   │
│                         │    │                      │
│ - id (PK)               │    │ - id (PK)            │
│ - building_name         │    │ - room_uuid (FK)     │
│ - building_type_code    │◄───┼─┐ - store_id (FK)   │
│   (varchar)             │    │ │ - published_at     │
│ - structure_type_code   │    │ │ - is_active (bool) │
│   (varchar)             │    │ │ - move_in_year     │
│ - prefecture_code       │    │ │ - move_in_month    │
│ - city_code             │    │ │                    │
└───────┬─────────────────┘    └─┼────────┬───────────┘
        │                        │        │
        ├──────┬──────────┬──────┴────┐   │
        │      │          │           │   │
        ▼      ▼          ▼           ▼   │
┌─────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│property_│ │property_ │ │ property_ │ │  rooms   │
│locations│ │routes    │ │translation│ │          │
│         │ │          │ │           │ │ - uuid   │
│-building│ │-building │ │ -building │ │   (PK)   │
│  _id    │ │  _id     │ │   _id     │ │ -building│
│-long    │ │-station  │ │ -locale   │ │   _id(FK)│
│-lat     │ │-railroad │ │ -address  │ │ -store_id│
│         │ │  _id     │ │           │ │   (FK)   │
└─────────┘ │-minutes  │ └───────────┘ │ -room_   │
            └──────────┘                 │  number │
                                        │ -room_   │
                                        │  size    │
                                        │ -floor   │
                                        └─────┬────┘
                                              │
                                              │
             ┌────────────────────────────────┘
             │
             │
             ▼ (via room_uuid)
┌─────────────────────────────────────────────────────┐
│                  property_listings                  │
│                                                     │
└──┬──────┬──────────┬───────────┬─────────┬─────────┘
   │      │          │           │         │
   ▼      ▼          ▼           ▼         ▼
┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐
│costs │ │images│ │facility│ │campaign│ │monthly │
│      │ │      │ │        │ │        │ │        │
│-list │ │-list │ │ -list  │ │ -list  │ │ -list  │
│ _id  │ │ _id  │ │  _id   │ │  _id   │ │  _id   │
│-rent │ │-url  │ │ -code  │ │ -code  │ │ -is_   │
│-mgmt │ │-order│ │        │ │        │ │monthly │
│ _fee │ │ _num │ │        │ │        │ │        │
└──────┘ └──────┘ └────────┘ └────────┘ └────────┘

Note: All foreign keys have cascade delete for referential integrity
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


### 5. Close Connections in Scripts

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
