import { getDatabase, closeDatabase } from '../client';
import {
  propertiesBuilding,
  properties,
  propertyLocations,
  propertyRoutes,
  propertyTranslations,
  propertyListings,
  propertyCosts,
} from '../schema';

/**
 * Seed the database with sample data
 */
async function seed() {
  console.log('🌱 Starting database seed...');

  const db = getDatabase();

  try {
    // Create a sample building
    const [building] = await db
      .insert(propertiesBuilding)
      .values({
        buildingName: 'Sample Tower',
        buildingTypeCode: 1,
        structureTypeCode: 1,
        builtYear: 2020,
        builtMonth: 6,
        maxFloor: 10,
        prefectureCode: '13',
        cityCode: '101',
      })
      .returning();

    console.log('✅ Created building:', building.id);

    // Create a location for the building
    await db.insert(propertyLocations).values({
      propertiesBuildingId: building.id,
      longitude: '139.7671248',
      latitude: '35.6812362',
    });

    console.log('✅ Created location for building');

    // Create a route for the building
    await db.insert(propertyRoutes).values({
      propertiesBuildingId: building.id,
      stationCode: 'ST001',
      stationId: 1,
      railroadCode: 'RR001',
      transportationTypeCode: 1,
      minutes: 5,
    });

    console.log('✅ Created route for building');

    // Create a translation for the building
    await db.insert(propertyTranslations).values({
      propertiesBuildingId: building.id,
      locale: 'en',
      addressDetail: '1-1-1 Sample Street, Tokyo',
      remarks: 'Modern building in central location',
      sideNote: 'Near shopping and restaurants',
      catchphrase: 'Your perfect home awaits!',
    });

    console.log('✅ Created translation for building');

    // Create a sample property (room)
    const [property] = await db
      .insert(properties)
      .values({
        uuid: crypto.randomUUID(),
        propertiesBuildingId: building.id,
        roomNumber: '101',
        roomSize: 45.5,
        directionCode: 1,
        layoutAmount: 2,
        layoutTypeCode: 1,
        floor: 1,
      })
      .returning();

    console.log('✅ Created property:', property.id);

    // Create a listing for the property
    const [listing] = await db
      .insert(propertyListings)
      .values({
        propertyId: property.id,
        publishedAt: new Date(),
        availableMoveInTimingCode: 1,
        isActive: 1,
        storeId: 1,
      })
      .returning();

    console.log('✅ Created listing:', listing.id);

    // Create costs for the listing
    await db.insert(propertyCosts).values({
      listingId: listing.id,
      rent: 120000,
      managementFee: 10000,
      depositPrice: 120000,
      depositMonth: 1,
      gratuityFeePrice: 120000,
      gratuityFeeMonth: 1,
      residenceInsuranceNeeded: 1,
    });

    console.log('✅ Created costs for listing');

    console.log('✨ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

seed();
