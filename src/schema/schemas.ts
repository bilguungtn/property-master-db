import {
  boolean,
  date,
  decimal,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
  doublePrecision,
  char,
  unique,
} from "drizzle-orm/pg-core";

// ============================================
// IMMUTABLE SCHEMAS
// Physical Property Characteristics
// These tables represent physical building and property information that rarely changes
// ============================================

/**
 * Stores - Property management stores
 */
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/**
 * Buildings - Physical building information
 */
export const buildings = pgTable(
  "buildings",
  {
    id: serial("id").primaryKey(),
    building_name: varchar("building_name", { length: 255 }).notNull(),
    building_type_code: varchar("building_type_code", { length: 50 }).notNull(),
    structure_type_code: varchar("structure_type_code", { length: 50 }).notNull(),
    built_year: integer("built_year"),
    built_month: integer("built_month"),
    max_floor: integer("max_floor"),
    prefecture_code: varchar("prefecture_code", { length: 255 }).notNull(),
    city_code: varchar("city_code", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    prefecture_code_idx: index("buildings_prefecture_code_idx").on(
      table.prefecture_code,
    ),
    city_code_idx: index("buildings_city_code_idx").on(table.city_code),
  }),
);

/**
 * Rooms - Individual units/rooms in buildings
 */
export const rooms = pgTable("rooms", {
  uuid: char("uuid", { length: 36 }).primaryKey(),
  building_id: integer("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  store_id: integer("store_id")
    .notNull()
    .references(() => stores.id, { onDelete: "cascade" }),
  room_number: varchar("room_number", { length: 255 }),
  room_size: doublePrecision("room_size"),
  direction_code: integer("direction_code"),
  layout_amount: doublePrecision("layout_amount").notNull(),
  layout_type_code: integer("layout_type_code").notNull(),
  floor: integer("floor"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/**
 * Property Locations - Geographic coordinates
 */
export const property_locations = pgTable(
  "property_locations",
  {
    building_id: integer("building_id")
      .notNull()
      .references(() => buildings.id, { onDelete: "cascade" }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  },
  (table) => ({
    longitude_idx: index("property_locations_longitude_idx").on(table.longitude),
    latitude_idx: index("property_locations_latitude_idx").on(table.latitude),
  }),
);

/**
 * Property Routes - Transportation access
 */
export const property_routes = pgTable(
  "property_routes",
  {
    id: serial("id").primaryKey(),
    building_id: integer("building_id")
      .notNull()
      .references(() => buildings.id, { onDelete: "cascade" }),
    station_code: varchar("station_code", { length: 255 }),
    station_id: integer("station_id").notNull(),
    railroad_id: integer("railroad_id").notNull(),
    railroad_code: varchar("railroad_code", { length: 255 }).notNull(),
    transportation_type_code: integer("transportation_type_code").notNull(),
    minutes: integer("minutes").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    station_code_idx: index("property_routes_station_code_idx").on(
      table.station_code,
    ),
    station_id_idx: index("property_routes_station_id_idx").on(table.station_id),
    railroad_code_idx: index("property_routes_railroad_code_idx").on(
      table.railroad_code,
    ),
    railroad_id_idx: index("property_routes_railroad_id_idx").on(
      table.railroad_id,
    ),
  }),
);

/**
 * Property Translations - Localized content
 */
export const property_translations = pgTable("property_translations", {
  id: serial("id").primaryKey(),
  building_id: integer("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  locale: varchar("locale", { length: 255 }).notNull(),
  address_detail: varchar("address_detail", { length: 255 }),
  remarks: varchar("remarks", { length: 1000 }),
  side_note: varchar("side_note", { length: 1000 }),
  catchphrase: varchar("catchphrase", { length: 500 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ============================================
// CHANGEABLE SCHEMAS
// Rental Listing Information
// These tables represent rental information that changes frequently
// ============================================

/**
 * Property Listings - Rental listings for rooms
 */
export const property_listings = pgTable(
  "property_listings",
  {
    id: serial("id").primaryKey(),
    room_uuid: char("room_uuid", { length: 36 })
      .notNull()
      .references(() => rooms.uuid, { onDelete: "cascade" }),
    published_at: timestamp("published_at"),
    property_updated_at: timestamp("property_updated_at"),
    property_next_update_at: timestamp("property_next_update_at"),
    available_move_in_year: integer("available_move_in_year"),
    available_move_in_month: integer("available_move_in_month"),
    available_move_in_timing_code: integer(
      "available_move_in_timing_code",
    ).notNull(),
    is_active: boolean("is_active").notNull().default(true),
    store_id: integer("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    room_uuid_idx: index("property_listings_room_uuid_idx").on(table.room_uuid),
    published_at_idx: index("property_listings_published_at_idx").on(
      table.published_at,
    ),
  }),
);

/**
 * Property Costs - Pricing and fees for listings (one-to-many with listing)
 */
export const property_costs = pgTable("property_costs", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id")
    .notNull()
    .references(() => property_listings.id, { onDelete: "cascade" }),
  rent: integer("rent"),
  management_fee: integer("management_fee"),
  deposit_price: integer("deposit_price"),
  deposit_month: doublePrecision("deposit_month"),
  gratuity_fee_price: integer("gratuity_fee_price"),
  gratuity_fee_month: doublePrecision("gratuity_fee_month"),
  security_deposit_price: integer("security_deposit_price"),
  security_deposit_month: doublePrecision("security_deposit_month"),
  deposit_repayment_fee_price: integer("deposit_repayment_fee_price"),
  deposit_repayment_fee_month: doublePrecision("deposit_repayment_fee_month"),
  deposit_repayment_fee_percent: doublePrecision("deposit_repayment_fee_percent"),
  renewal_fee_amount: doublePrecision("renewal_fee_amount"),
  renewal_fee_type_code: integer("renewal_fee_type_code"),
  residence_insurance_needed: boolean("residence_insurance_needed")
    .notNull()
    .default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/**
 * Property Facilities - Building facilities (elevator, parking, etc.)
 */
export const property_facilities = pgTable("property_facilities", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id")
    .notNull()
    .references(() => property_listings.id, { onDelete: "cascade" }),
  code: integer("code").notNull(),
  // status: integer("status").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * Property Conditions - Structural conditions (earthquake-resistant, etc.)
 */
export const property_conditions = pgTable("property_conditions", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id")
    .notNull()
    .references(() => property_listings.id, { onDelete: "cascade" }),
  code: integer("code").notNull(),
  // status: integer("status").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

/**
 * Property Images - Photos and floor plans
 */
export const property_images = pgTable(
  "property_images",
  {
    id: char("id", { length: 36 }).primaryKey(),
    listing_id: integer("listing_id")
      .notNull()
      .references(() => property_listings.id, { onDelete: "cascade" }),
    path: varchar("path", { length: 255 }),
    url: varchar("url", { length: 255 }),
    order_num: integer("order_num").notNull(),
    type_code: integer("type_code").notNull(),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    id_idx: index("property_images_id_idx").on(table.id),
  }),
);

/**
 * Property Campaigns - Marketing campaigns
 */
export const property_campaigns = pgTable(
  "property_campaigns",
  {
    id: serial("id").primaryKey(),
    listing_id: integer("listing_id")
      .notNull()
      .references(() => property_listings.id, { onDelete: "cascade" }),
    code: integer("code").notNull(),
  },
  (table) => ({
    code_listing_id_unique: unique("property_campaigns_code_listing_id_unique").on(
      table.code,
      table.listing_id,
    ),
  }),
);

/**
 * Property Dealings - Transaction types and advertisement reprints
 */
export const property_dealings = pgTable("property_dealings", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id")
    .notNull()
    .references(() => property_listings.id, { onDelete: "cascade" }),
  code: integer("code").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'dealing' or 'advertisement_reprint'
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

/**
 * Property Advertisement Fees - Advertising costs
 */
export const property_advertisement_fees = pgTable(
  "property_advertisement_fees",
  {
    id: serial("id").primaryKey(),
    listing_id: integer("listing_id")
      .notNull()
      .references(() => property_listings.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    code: integer("code").notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
);

/**
 * Property Monthlies - Monthly rental options (one-to-many with listing)
 */
export const property_monthlies = pgTable("property_monthlies", {
  id: serial("id").primaryKey(),
  listing_id: integer("listing_id")
    .notNull()
    .references(() => property_listings.id, { onDelete: "cascade" }),
  is_monthly: integer("is_monthly"),
  monthly_day_cost: integer("monthly_day_cost"),
  monthly_cleaning_cost: integer("monthly_cleaning_cost"),
  monthly_bed_cost: integer("monthly_bed_cost"),
  monthly_fee: integer("monthly_fee"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
