import "dotenv/config";
import { getDatabase, closeDatabase } from "../client";
import {
  stores,
  buildings,
  rooms,
  property_locations,
  property_routes,
  property_translations,
  property_listings,
  property_costs,
  property_images,
  property_facilities,
  property_conditions,
  property_campaigns,
  property_dealings,
  property_monthlies,
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
        building_name: "Tokyo Central Tower",
        building_type_code: "apartment",
        structure_type_code: "reinforced_concrete",
        built_year: 2020,
        built_month: 6,
        max_floor: 10,
        prefecture_code: "13",
        city_code: "101",
      })
      .returning();

    console.log("✅ Created building:", building.building_name);

    // Create location for the building
    await db.insert(property_locations).values({
      building_id: building.id,
      longitude: "139.7671248",
      latitude: "35.6812362",
    });

    // Create route for the building
    await db.insert(property_routes).values({
      building_id: building.id,
      station_code: "ST001",
      station_id: 1,
      railroad_id: 1,
      railroad_code: "RR001",
      transportation_type_code: 1,
      minutes: 5,
    });

    // Create translation for the building
    await db.insert(property_translations).values({
      building_id: building.id,
      locale: "en",
      address_detail: "1-1-1 Chiyoda, Tokyo",
      remarks: "Modern building in central Tokyo",
      side_note: "Near shopping and restaurants",
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
        building_id: building.id,
        store_id: store.id,
        room_number: "101",
        room_size: 45.5,
        direction_code: 1,
        layout_amount: 2,
        layout_type_code: 1,
        floor: 1,
      })
      .returning();

    // Room 2: Room 201
    const [room2] = await db
      .insert(rooms)
      .values({
        uuid: crypto.randomUUID(),
        building_id: building.id,
        store_id: store.id,
        room_number: "201",
        room_size: 55.0,
        direction_code: 2,
        layout_amount: 3,
        layout_type_code: 1,
        floor: 2,
      })
      .returning();

    console.log("✅ Created 2 rooms");

    // ============================================
    // CREATE LISTING 1 (for Room 1)
    // ============================================

    const [listing1] = await db
      .insert(property_listings)
      .values({
        room_uuid: room1.uuid,
        published_at: new Date("2024-01-01"),
        available_move_in_year: 2024,
        available_move_in_month: 2,
        available_move_in_timing_code: 1,
        is_active: true,
        store_id: store.id,
      })
      .returning();

    console.log("✅ Created listing 1");

    // Multiple costs for listing 1 (price history - one-to-many)
    await db.insert(property_costs).values([
      {
        listing_id: listing1.id,
        rent: 120000,
        management_fee: 10000,
        deposit_price: 120000,
        deposit_month: 1,
        gratuity_fee_price: 120000,
        gratuity_fee_month: 1,
        residence_insurance_needed: true,
      },
      {
        listing_id: listing1.id,
        rent: 125000, // Price increased
        management_fee: 10000,
        deposit_price: 125000,
        deposit_month: 1,
        gratuity_fee_price: 125000,
        gratuity_fee_month: 1,
        residence_insurance_needed: true,
      },
    ]);

    // Multiple monthly options for listing 1 (one-to-many)
    await db.insert(property_monthlies).values([
      {
        listing_id: listing1.id,
        is_monthly: 1,
        monthly_day_cost: 5000,
        monthly_cleaning_cost: 3000,
        monthly_bed_cost: 2000,
        monthly_fee: 10000,
      },
      {
        listing_id: listing1.id,
        is_monthly: 1,
        monthly_day_cost: 4500, // Discounted rate
        monthly_cleaning_cost: 3000,
        monthly_bed_cost: 2000,
        monthly_fee: 9500,
      },
    ]);

    console.log("✅ Created 2 cost records and 2 monthly options (one-to-many)");

    // Images for listing 1
    await db.insert(property_images).values([
      {
        id: crypto.randomUUID(),
        listing_id: listing1.id,
        url: "https://example.com/images/property1-exterior.jpg",
        order_num: 1,
        type_code: 1, // Exterior
      },
      {
        id: crypto.randomUUID(),
        listing_id: listing1.id,
        url: "https://example.com/images/property1-interior.jpg",
        order_num: 2,
        type_code: 2, // Interior
      },
      {
        id: crypto.randomUUID(),
        listing_id: listing1.id,
        url: "https://example.com/images/property1-floorplan.jpg",
        order_num: 3,
        type_code: 3, // Floor plan
      },
    ]);

    // Facilities for listing 1
    await db.insert(property_facilities).values([
      { listing_id: listing1.id, code: 1 }, // Elevator
      { listing_id: listing1.id, code: 2 }, // Parking
      { listing_id: listing1.id, code: 3 }, // Auto-lock
    ]);

    // Conditions for listing 1
    await db.insert(property_conditions).values([
      { listing_id: listing1.id, code: 1 }, // Earthquake-resistant
      { listing_id: listing1.id, code: 2 }, // Fire-resistant
    ]);

    // Campaign for listing 1
    await db.insert(property_campaigns).values({
      listing_id: listing1.id,
      code: 1, // New Year Campaign
    });

    // Dealing for listing 1
    await db.insert(property_dealings).values({
      listing_id: listing1.id,
      code: 1, // Rental only
      type: "dealing",
    });

    console.log("✅ Created images, facilities, conditions, campaign, and dealing for listing 1");

    // ============================================
    // CREATE LISTING 2 (for Room 2)
    // ============================================

    const [listing2] = await db
      .insert(property_listings)
      .values({
        room_uuid: room2.uuid,
        published_at: new Date("2024-02-01"),
        available_move_in_year: 2024,
        available_move_in_month: 3,
        available_move_in_timing_code: 1,
        is_active: true,
        store_id: store.id,
      })
      .returning();

    console.log("✅ Created listing 2");

    // Multiple costs for listing 2
    await db.insert(property_costs).values([
      {
        listing_id: listing2.id,
        rent: 150000,
        management_fee: 12000,
        deposit_price: 150000,
        deposit_month: 1,
        gratuity_fee_price: 150000,
        gratuity_fee_month: 1,
        residence_insurance_needed: true,
      },
    ]);

    // Monthly options for listing 2
    await db.insert(property_monthlies).values([
      {
        listing_id: listing2.id,
        is_monthly: 1,
        monthly_day_cost: 6000,
        monthly_cleaning_cost: 4000,
        monthly_bed_cost: 3000,
        monthly_fee: 13000,
      },
    ]);

    // Images for listing 2
    await db.insert(property_images).values([
      {
        id: crypto.randomUUID(),
        listing_id: listing2.id,
        url: "https://example.com/images/property2-exterior.jpg",
        order_num: 1,
        type_code: 1,
      },
      {
        id: crypto.randomUUID(),
        listing_id: listing2.id,
        url: "https://example.com/images/property2-interior.jpg",
        order_num: 2,
        type_code: 2,
      },
    ]);

    // Facilities for listing 2
    await db.insert(property_facilities).values([
      { listing_id: listing2.id, code: 1 }, // Elevator
      { listing_id: listing2.id, code: 4 }, // Balcony
    ]);

    // Conditions for listing 2
    await db.insert(property_conditions).values([
      { listing_id: listing2.id, code: 1 }, // Earthquake-resistant
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
