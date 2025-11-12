import { getDatabase, closeDatabase } from "../client";
import {
  stores,
  buildings,
  rooms,
  propertyLocations,
  propertyRoutes,
  propertyTranslations,
  propertyListings,
  propertyCosts,
  propertyImages,
  propertyFacilities,
  propertyConditions,
  propertyCampaigns,
  propertyDealings,
  propertyMonthlies,
} from "../schema";

/**
 * Seed the database with sample data
 */
async function seed() {
  console.log("🌱 Starting database seed...");

  const db = getDatabase();

  try {
    // ============================================
    // CREATE STORE
    // ============================================

    const [store] = await db.insert(stores).values({}).returning();

    console.log("✅ Created store:", store.id);

    // ============================================
    // CREATE BUILDING WITH IMMUTABLE DATA
    // ============================================

    const [building] = await db
      .insert(buildings)
      .values({
        buildingName: "Tokyo Central Tower",
        buildingTypeCode: "apartment",
        structureTypeCode: "reinforced_concrete",
        builtYear: 2020,
        builtMonth: 6,
        maxFloor: 10,
        prefectureCode: "13",
        cityCode: "101",
      })
      .returning();

    console.log("✅ Created building:", building.buildingName);

    // Create location for the building
    await db.insert(propertyLocations).values({
      buildingId: building.id,
      longitude: "139.7671248",
      latitude: "35.6812362",
    });

    // Create route for the building
    await db.insert(propertyRoutes).values({
      buildingId: building.id,
      stationCode: "ST001",
      stationId: 1,
      railroadId: 1,
      railroadCode: "RR001",
      transportationTypeCode: 1,
      minutes: 5,
    });

    // Create translation for the building
    await db.insert(propertyTranslations).values({
      buildingId: building.id,
      locale: "en",
      addressDetail: "1-1-1 Chiyoda, Tokyo",
      remarks: "Modern building in central Tokyo",
      sideNote: "Near shopping and restaurants",
      catchphrase: "Your perfect home in the heart of Tokyo!",
    });

    console.log("✅ Created location, route, and translation");

    // ============================================
    // CREATE ROOMS
    // ============================================

    // Room 1: Room 101
    const [room1] = await db
      .insert(rooms)
      .values({
        uuid: crypto.randomUUID(),
        buildingId: building.id,
        storeId: store.id,
        roomNumber: "101",
        roomSize: 45.5,
        directionCode: 1,
        layoutAmount: 2,
        layoutTypeCode: 1,
        floor: 1,
      })
      .returning();

    // Room 2: Room 201
    const [room2] = await db
      .insert(rooms)
      .values({
        uuid: crypto.randomUUID(),
        buildingId: building.id,
        storeId: store.id,
        roomNumber: "201",
        roomSize: 55.0,
        directionCode: 2,
        layoutAmount: 3,
        layoutTypeCode: 1,
        floor: 2,
      })
      .returning();

    console.log("✅ Created 2 rooms");

    // ============================================
    // CREATE LISTING 1 (for Room 1)
    // ============================================

    const [listing1] = await db
      .insert(propertyListings)
      .values({
        roomUuid: room1.uuid,
        publishedAt: new Date("2024-01-01"),
        availableMoveInYear: 2024,
        availableMoveInMonth: 2,
        availableMoveInTimingCode: 1,
        isActive: true,
        storeId: store.id,
      })
      .returning();

    console.log("✅ Created listing 1");

    // Multiple costs for listing 1 (price history - one-to-many)
    await db.insert(propertyCosts).values([
      {
        listingId: listing1.id,
        rent: 120000,
        managementFee: 10000,
        depositPrice: 120000,
        depositMonth: 1,
        gratuityFeePrice: 120000,
        gratuityFeeMonth: 1,
        residenceInsuranceNeeded: true,
      },
      {
        listingId: listing1.id,
        rent: 125000, // Price increased
        managementFee: 10000,
        depositPrice: 125000,
        depositMonth: 1,
        gratuityFeePrice: 125000,
        gratuityFeeMonth: 1,
        residenceInsuranceNeeded: true,
      },
    ]);

    // Multiple monthly options for listing 1 (one-to-many)
    await db.insert(propertyMonthlies).values([
      {
        listingId: listing1.id,
        isMonthly: 1,
        monthlyDayCost: 5000,
        monthlyCleaningCost: 3000,
        monthlyBedCost: 2000,
        monthlyFee: 10000,
      },
      {
        listingId: listing1.id,
        isMonthly: 1,
        monthlyDayCost: 4500, // Discounted rate
        monthlyCleaningCost: 3000,
        monthlyBedCost: 2000,
        monthlyFee: 9500,
      },
    ]);

    console.log("✅ Created 2 cost records and 2 monthly options (one-to-many)");

    // Images for listing 1
    await db.insert(propertyImages).values([
      {
        id: crypto.randomUUID(),
        listingId: listing1.id,
        url: "https://example.com/images/property1-exterior.jpg",
        orderNum: 1,
        typeCode: 1, // Exterior
      },
      {
        id: crypto.randomUUID(),
        listingId: listing1.id,
        url: "https://example.com/images/property1-interior.jpg",
        orderNum: 2,
        typeCode: 2, // Interior
      },
      {
        id: crypto.randomUUID(),
        listingId: listing1.id,
        url: "https://example.com/images/property1-floorplan.jpg",
        orderNum: 3,
        typeCode: 3, // Floor plan
      },
    ]);

    // Facilities for listing 1
    await db.insert(propertyFacilities).values([
      { listingId: listing1.id, code: 1 }, // Elevator
      { listingId: listing1.id, code: 2 }, // Parking
      { listingId: listing1.id, code: 3 }, // Auto-lock
    ]);

    // Conditions for listing 1
    await db.insert(propertyConditions).values([
      { listingId: listing1.id, code: 1 }, // Earthquake-resistant
      { listingId: listing1.id, code: 2 }, // Fire-resistant
    ]);

    // Campaign for listing 1
    await db.insert(propertyCampaigns).values({
      listingId: listing1.id,
      code: 1, // New Year Campaign
    });

    // Dealing for listing 1
    await db.insert(propertyDealings).values({
      listingId: listing1.id,
      code: 1, // Rental only
      type: "dealing",
    });

    console.log("✅ Created images, facilities, conditions, campaign, and dealing for listing 1");

    // ============================================
    // CREATE LISTING 2 (for Room 2)
    // ============================================

    const [listing2] = await db
      .insert(propertyListings)
      .values({
        roomUuid: room2.uuid,
        publishedAt: new Date("2024-02-01"),
        availableMoveInYear: 2024,
        availableMoveInMonth: 3,
        availableMoveInTimingCode: 1,
        isActive: true,
        storeId: store.id,
      })
      .returning();

    console.log("✅ Created listing 2");

    // Multiple costs for listing 2
    await db.insert(propertyCosts).values([
      {
        listingId: listing2.id,
        rent: 150000,
        managementFee: 12000,
        depositPrice: 150000,
        depositMonth: 1,
        gratuityFeePrice: 150000,
        gratuityFeeMonth: 1,
        residenceInsuranceNeeded: true,
      },
    ]);

    // Monthly options for listing 2
    await db.insert(propertyMonthlies).values([
      {
        listingId: listing2.id,
        isMonthly: 1,
        monthlyDayCost: 6000,
        monthlyCleaningCost: 4000,
        monthlyBedCost: 3000,
        monthlyFee: 13000,
      },
    ]);

    // Images for listing 2
    await db.insert(propertyImages).values([
      {
        id: crypto.randomUUID(),
        listingId: listing2.id,
        url: "https://example.com/images/property2-exterior.jpg",
        orderNum: 1,
        typeCode: 1,
      },
      {
        id: crypto.randomUUID(),
        listingId: listing2.id,
        url: "https://example.com/images/property2-interior.jpg",
        orderNum: 2,
        typeCode: 2,
      },
    ]);

    // Facilities for listing 2
    await db.insert(propertyFacilities).values([
      { listingId: listing2.id, code: 1 }, // Elevator
      { listingId: listing2.id, code: 4 }, // Balcony
    ]);

    // Conditions for listing 2
    await db.insert(propertyConditions).values([
      { listingId: listing2.id, code: 1 }, // Earthquake-resistant
    ]);

    console.log("✅ Created complete data for listing 2");

    console.log("✨ Seed completed successfully!");
    console.log("📊 Summary:");
    console.log("   - 1 store");
    console.log("   - 1 building with location, route, and translation");
    console.log("   - 2 rooms");
    console.log("   - 2 listings with full details");
    console.log("   - 3 total cost records (demonstrating one-to-many)");
    console.log("   - 3 total monthly options (demonstrating one-to-many)");
    console.log("   - 5 images, 5 facilities, 3 conditions, 1 campaign, 1 dealing");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

seed();
