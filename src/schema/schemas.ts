import {
  date,
  decimal,
  index,
  integer,
  pgTable,
  serial,
  smallint,
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
 * Buildings - Physical building information
 */
export const propertiesBuilding = pgTable(
  "properties_building",
  {
    id: serial("id").primaryKey(),
    buildingName: varchar("building_name", { length: 255 }).notNull(),
    buildingTypeCode: integer("building_type_code").notNull(),
    structureTypeCode: integer("structure_type_code").notNull(),
    builtYear: integer("built_year"),
    builtMonth: integer("built_month"),
    maxFloor: integer("max_floor"),
    prefectureCode: varchar("prefecture_code", { length: 255 }).notNull(),
    cityCode: varchar("city_code", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    prefectureCodeIdx: index("properties_building_prefecture_code_idx").on(
      table.prefectureCode,
    ),
    cityCodeIdx: index("properties_building_city_code_idx").on(table.cityCode),
  }),
);

/**
 * Properties (Rooms) - Individual units/rooms in buildings
 */
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  uuid: char("uuid", { length: 36 }).notNull().unique(),
  propertiesBuildingId: integer("properties_building_id")
    .notNull()
    .references(() => propertiesBuilding.id),
  roomNumber: varchar("room_number", { length: 255 }),
  roomSize: doublePrecision("room_size"),
  directionCode: integer("direction_code"),
  layoutAmount: doublePrecision("layout_amount").notNull(),
  layoutTypeCode: integer("layout_type_code").notNull(),
  floor: integer("floor"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Property Locations - Geographic coordinates
 */
export const propertyLocations = pgTable(
  "property_locations",
  {
    id: serial("id").primaryKey(),
    propertiesBuildingId: integer("properties_building_id")
      .notNull()
      .references(() => propertiesBuilding.id),
    longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  },
  (table) => ({
    longitudeIdx: index("property_locations_longitude_idx").on(table.longitude),
    latitudeIdx: index("property_locations_latitude_idx").on(table.latitude),
  }),
);

/**
 * Property Routes - Transportation access
 */
export const propertyRoutes = pgTable(
  "property_routes",
  {
    id: serial("id").primaryKey(),
    propertiesBuildingId: integer("properties_building_id")
      .notNull()
      .references(() => propertiesBuilding.id),
    stationCode: varchar("station_code", { length: 255 }),
    stationId: integer("station_id").notNull(),
    railroadCode: varchar("railroad_code", { length: 255 }).notNull(),
    transportationTypeCode: integer("transportation_type_code").notNull(),
    minutes: integer("minutes").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    stationCodeIdx: index("property_routes_station_code_idx").on(
      table.stationCode,
    ),
    stationIdIdx: index("property_routes_station_id_idx").on(table.stationId),
  }),
);

/**
 * Property Translations - Localized content
 */
export const propertyTranslations = pgTable("property_translations", {
  id: serial("id").primaryKey(),
  propertiesBuildingId: integer("properties_building_id")
    .notNull()
    .references(() => propertiesBuilding.id),
  locale: varchar("locale", { length: 255 }).notNull(),
  addressDetail: varchar("address_detail", { length: 255 }),
  remarks: varchar("remarks", { length: 1000 }),
  sideNote: varchar("side_note", { length: 1000 }),
  catchphrase: varchar("catchphrase", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// CHANGEABLE SCHEMAS
// Rental Listing Information
// These tables represent rental information that changes frequently
// ============================================

/**
 * Property Listings - Rental listings for properties
 */
export const propertyListings = pgTable(
  "property_listings",
  {
    id: serial("id").primaryKey(),
    propertyId: integer("property_id")
      .notNull()
      .references(() => properties.id),
    publishedAt: timestamp("published_at"),
    propertyUpdatedAt: timestamp("property_updated_at"),
    propertyNextUpdateAt: timestamp("property_next_update_at"),
    availableMoveInDate: date("available_move_in_date"),
    availableMoveInTimingCode: integer("available_move_in_timing_code").notNull(),
    isActive: smallint("is_active").notNull().default(1),
    storeId: smallint("store_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    propertyIdIdx: index("property_listings_property_id_idx").on(
      table.propertyId,
    ),
    publishedAtIdx: index("property_listings_published_at_idx").on(
      table.publishedAt,
    ),
  }),
);

/**
 * Property Costs - Pricing and fees for listings (one-to-many with listing)
 */
export const propertyCosts = pgTable("property_costs", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => propertyListings.id),
  rent: integer("rent"),
  managementFee: integer("management_fee"),
  depositPrice: integer("deposit_price"),
  depositMonth: doublePrecision("deposit_month"),
  gratuityFeePrice: integer("gratuity_fee_price"),
  gratuityFeeMonth: doublePrecision("gratuity_fee_month"),
  securityDepositPrice: integer("security_deposit_price"),
  securityDepositMonth: doublePrecision("security_deposit_month"),
  depositRepaymentFeePrice: integer("deposit_repayment_fee_price"),
  depositRepaymentFeeMonth: doublePrecision("deposit_repayment_fee_month"),
  depositRepaymentFeePercent: doublePrecision("deposit_repayment_fee_percent"),
  renewalFeeAmount: doublePrecision("renewal_fee_amount"),
  renewalFeeTypeCode: integer("renewal_fee_type_code"),
  residenceInsuranceNeeded: smallint("residence_insurance_needed")
    .notNull()
    .default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Property Facilities - Building facilities (elevator, parking, etc.)
 */
export const propertyFacilities = pgTable("property_facilities", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => propertyListings.id),
  code: integer("code").notNull(),
  status: integer("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Property Conditions - Structural conditions (earthquake-resistant, etc.)
 */
export const propertyConditions = pgTable("property_conditions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => propertyListings.id),
  code: integer("code").notNull(),
  status: integer("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Property Images - Photos and floor plans
 */
export const propertyImages = pgTable(
  "property_images",
  {
    id: char("id", { length: 36 }).primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => propertyListings.id),
    path: varchar("path", { length: 255 }),
    url: varchar("url", { length: 255 }),
    orderNum: integer("order_num").notNull(),
    typeCode: integer("type_code").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    idIdx: index("property_images_id_idx").on(table.id),
  }),
);

/**
 * Property Campaigns - Marketing campaigns
 */
export const propertyCampaigns = pgTable(
  "property_campaigns",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => propertyListings.id),
    code: integer("code").notNull(),
  },
  (table) => ({
    codeListingIdUnique: unique("property_campaigns_code_listing_id_unique").on(
      table.code,
      table.listingId,
    ),
  }),
);

/**
 * Property Dealings - Transaction types
 */
export const propertyDealings = pgTable("property_dealings", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => propertyListings.id),
  code: integer("code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Property Advertisement Fees - Advertising costs
 */
export const propertyAdvertisementFees = pgTable(
  "property_advertisement_fees",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => propertyListings.id),
    amount: integer("amount").notNull(),
    code: integer("code").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
);

/**
 * Property Advertisement Reprints - Reprint permissions
 */
export const propertyAdvertisementReprints = pgTable(
  "property_advertisement_reprints",
  {
    id: serial("id").primaryKey(),
    listingId: integer("listing_id")
      .notNull()
      .references(() => propertyListings.id),
    code: integer("code").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
);

/**
 * Property Monthlies - Monthly rental options (one-to-many with listing)
 */
export const propertyMonthlies = pgTable("property_monthlies", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => propertyListings.id),
  isMonthly: integer("is_monthly"),
  monthlyDayCost: integer("monthly_day_cost"),
  monthlyCleaningCost: integer("monthly_cleaning_cost"),
  monthlyBedCost: integer("monthly_bed_cost"),
  monthlyFee: integer("monthly_fee"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
