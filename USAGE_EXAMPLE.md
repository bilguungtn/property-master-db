# Usage Examples

## Quick Start in NestJS Backend

### 1. Add Package Dependency

```json
// apps/backend/your-service/package.json
{
  "dependencies": {
    "property_database": "workspace:*"
  }
}
```

### 2. Create a Property Module

```typescript
// apps/backend/your-service/src/modules/property/property.module.ts
import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
```

### 3. Create Property Service

```typescript
// apps/backend/your-service/src/modules/property/property.service.ts
import { Injectable } from '@nestjs/common';
import {
  getDatabase,
  propertyListings,
  properties,
  propertiesBuilding,
  propertyCosts,
  propertyImages,
} from 'property_database';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

@Injectable()
export class PropertyService {
  private db = getDatabase();

  // Get all active listings with details
  async findAllActiveListings() {
    return await this.db.query.propertyListings.findMany({
      where: (listings, { eq }) => eq(listings.isActive, 1),
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
      orderBy: (listings, { desc }) => [desc(listings.publishedAt)],
      limit: 20,
    });
  }

  // Get listing by ID
  async findListingById(id: number) {
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
        campaigns: true,
        monthlies: true,
      },
    });
  }

  // Search properties by criteria
  async searchProperties(filters: {
    minRent?: number;
    maxRent?: number;
    minSize?: number;
    maxSize?: number;
    prefectureCode?: string;
    cityCode?: string;
  }) {
    const conditions = [];

    // Build dynamic WHERE conditions
    if (filters.minRent || filters.maxRent) {
      // Need to join with costs table
    }

    if (filters.minSize !== undefined) {
      conditions.push(gte(properties.roomSize, filters.minSize));
    }

    if (filters.maxSize !== undefined) {
      conditions.push(lte(properties.roomSize, filters.maxSize));
    }

    if (filters.prefectureCode) {
      conditions.push(eq(propertiesBuilding.prefectureCode, filters.prefectureCode));
    }

    if (filters.cityCode) {
      conditions.push(eq(propertiesBuilding.cityCode, filters.cityCode));
    }

    return await this.db
      .select({
        listing: propertyListings,
        property: properties,
        building: propertiesBuilding,
        costs: propertyCosts,
      })
      .from(propertyListings)
      .innerJoin(properties, eq(propertyListings.propertyId, properties.id))
      .innerJoin(
        propertiesBuilding,
        eq(properties.propertiesBuildingId, propertiesBuilding.id),
      )
      .leftJoin(propertyCosts, eq(propertyListings.id, propertyCosts.listingId))
      .where(
        and(
          eq(propertyListings.isActive, 1),
          ...(conditions.length > 0 ? conditions : []),
          filters.minRent ? gte(propertyCosts.rent, filters.minRent) : undefined,
          filters.maxRent ? lte(propertyCosts.rent, filters.maxRent) : undefined,
        ),
      )
      .limit(50);
  }

  // Create a new property listing
  async createPropertyListing(data: {
    building: {
      buildingName: string;
      buildingTypeCode: number;
      structureTypeCode: number;
      prefectureCode: string;
      cityCode: string;
    };
    property: {
      roomNumber: string;
      roomSize: number;
      layoutAmount: number;
      layoutTypeCode: number;
      floor: number;
    };
    listing: {
      availableMoveInTimingCode: number;
      storeId: number;
    };
    costs: {
      rent: number;
      managementFee: number;
      depositPrice?: number;
      depositMonth?: number;
    };
  }) {
    return await this.db.transaction(async (tx) => {
      // Create building
      const [building] = await tx
        .insert(propertiesBuilding)
        .values(data.building)
        .returning();

      // Create property (room)
      const [property] = await tx
        .insert(properties)
        .values({
          ...data.property,
          uuid: crypto.randomUUID(),
          propertiesBuildingId: building.id,
        })
        .returning();

      // Create listing
      const [listing] = await tx
        .insert(propertyListings)
        .values({
          ...data.listing,
          propertyId: property.id,
          publishedAt: new Date(),
          isActive: 1,
        })
        .returning();

      // Create costs
      await tx.insert(propertyCosts).values({
        ...data.costs,
        listingId: listing.id,
        residenceInsuranceNeeded: 1,
      });

      return listing;
    });
  }

  // Update listing costs
  async updateListingCosts(
    listingId: number,
    costs: {
      rent?: number;
      managementFee?: number;
      depositPrice?: number;
      depositMonth?: number;
    },
  ) {
    return await this.db
      .update(propertyCosts)
      .set(costs)
      .where(eq(propertyCosts.listingId, listingId))
      .returning();
  }

  // Deactivate listing
  async deactivateListing(listingId: number) {
    return await this.db
      .update(propertyListings)
      .set({ isActive: 0 })
      .where(eq(propertyListings.id, listingId))
      .returning();
  }

  // Get properties by prefecture
  async findByPrefecture(prefectureCode: string) {
    return await this.db.query.propertiesBuilding.findMany({
      where: (buildings, { eq }) => eq(buildings.prefectureCode, prefectureCode),
      with: {
        properties: {
          with: {
            listings: {
              where: (listings, { eq }) => eq(listings.isActive, 1),
              with: {
                costs: true,
                images: true,
              },
            },
          },
        },
        locations: true,
        routes: true,
      },
    });
  }
}
```

### 4. Create Controller

```typescript
// apps/backend/your-service/src/modules/property/property.controller.ts
import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { PropertyService } from './property.service';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  async findAll(@Query('active') active?: string) {
    if (active === 'true') {
      return this.propertyService.findAllActiveListings();
    }
    // Return all listings
  }

  @Get('search')
  async search(
    @Query('minRent') minRent?: string,
    @Query('maxRent') maxRent?: string,
    @Query('minSize') minSize?: string,
    @Query('maxSize') maxSize?: string,
    @Query('prefecture') prefectureCode?: string,
    @Query('city') cityCode?: string,
  ) {
    return this.propertyService.searchProperties({
      minRent: minRent ? parseInt(minRent) : undefined,
      maxRent: maxRent ? parseInt(maxRent) : undefined,
      minSize: minSize ? parseFloat(minSize) : undefined,
      maxSize: maxSize ? parseFloat(maxSize) : undefined,
      prefectureCode,
      cityCode,
    });
  }

  @Get('prefecture/:code')
  async findByPrefecture(@Param('code') prefectureCode: string) {
    return this.propertyService.findByPrefecture(prefectureCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.propertyService.findListingById(parseInt(id));
  }

  @Post()
  async create(@Body() createDto: any) {
    return this.propertyService.createPropertyListing(createDto);
  }

  @Put(':id/costs')
  async updateCosts(@Param('id') id: string, @Body() costsDto: any) {
    return this.propertyService.updateListingCosts(parseInt(id), costsDto);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.propertyService.deactivateListing(parseInt(id));
  }
}
```

## Environment Setup

```env
# In your backend service .env file
PROPERTY_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/property_db
```

## Type-Safe DTOs with Zod

```typescript
// apps/backend/your-service/src/modules/property/property.dto.ts
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { propertyListings, propertyCosts } from 'property_database';
import { z } from 'zod';

// Generate schemas from Drizzle tables
export const insertListingSchema = createInsertSchema(propertyListings);
export const selectListingSchema = createSelectSchema(propertyListings);
export const insertCostsSchema = createInsertSchema(propertyCosts);
export const selectCostsSchema = createSelectSchema(propertyCosts);

// Custom validation schemas
export const searchPropertiesSchema = z.object({
  minRent: z.number().min(0).optional(),
  maxRent: z.number().min(0).optional(),
  minSize: z.number().min(0).optional(),
  maxSize: z.number().min(0).optional(),
  prefectureCode: z.string().optional(),
  cityCode: z.string().optional(),
});

export type SearchPropertiesDto = z.infer<typeof searchPropertiesSchema>;
```

## Running Migrations in CI/CD

```yaml
# .github/workflows/deploy.yml
- name: Run Database Migrations
  run: |
    cd packages/property-database
    pnpm db:migrate
  env:
    PROPERTY_DATABASE_URL: ${{ secrets.PROPERTY_DATABASE_URL }}
```

## Testing

```typescript
// apps/backend/your-service/src/modules/property/property.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PropertyService } from './property.service';

describe('PropertyService', () => {
  let service: PropertyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyService],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests
});
```
