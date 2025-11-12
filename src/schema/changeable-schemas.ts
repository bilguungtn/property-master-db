import { relations } from 'drizzle-orm';
import {
  date,
  index,
  int,
  pgTable,
  serial,
  smallint,
  timestamp,
  varchar,
  doublePrecision,
  char,
  unique,
} from 'drizzle-orm/pg-core';
import { properties } from './immutable-schemas';

// ============================================
// CHANGEABLE: Rental Listing Information
// ============================================

/**
 * Property Listings - Rental listings for properties
 */
export const propertyListings = pgTable(
  'property_listings',
  {
    id: serial('id').primaryKey(),
    propertyId: int('property_id')
      .notNull()
      .references(() => properties.id),
    publishedAt: timestamp('published_at'),
    propertyUpdatedAt: timestamp('property_updated_at'),
    propertyNextUpdateAt: timestamp('property_next_update_at'),
    availableMoveInDate: date('available_move_in_date'),
    availableMoveInTimingCode: int('available_move_in_timing_code').notNull(),
    isActive: smallint('is_active').notNull().default(1),
    storeId: smallint('store_id').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    propertyIdIdx: index('property_listings_property_id_idx').on(
      table.propertyId,
    ),
    publishedAtIdx: index('property_listings_published_at_idx').on(
      table.publishedAt,
    ),
  }),
);

/**
 * Property Costs - Pricing and fees for listings (one-to-one with listing)
 */
export const propertyCosts = pgTable('property_costs', {
  id: serial('id').primaryKey(),
  listingId: int('listing_id')
    .notNull()
    .unique()
    .references(() => propertyListings.id),
  rent: int('rent'),
  managementFee: int('management_fee'),
  depositPrice: int('deposit_price'),
  depositMonth: doublePrecision('deposit_month'),
  gratuityFeePrice: int('gratuity_fee_price'),
  gratuityFeeMonth: doublePrecision('gratuity_fee_month'),
  securityDepositPrice: int('security_deposit_price'),
  securityDepositMonth: doublePrecision('security_deposit_month'),
  depositRepaymentFeePrice: int('deposit_repayment_fee_price'),
  depositRepaymentFeeMonth: doublePrecision('deposit_repayment_fee_month'),
  depositRepaymentFeePercent: doublePrecision('deposit_repayment_fee_percent'),
  renewalFeeAmount: doublePrecision('renewal_fee_amount'),
  renewalFeeTypeCode: int('renewal_fee_type_code'),
  residenceInsuranceNeeded: smallint('residence_insurance_needed')
    .notNull()
    .default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Property Facilities - Building facilities (elevator, parking, etc.)
 */
export const propertyFacilities = pgTable('property_facilities', {
  id: serial('id').primaryKey(),
  listingId: int('listing_id')
    .notNull()
    .references(() => propertyListings.id),
  code: int('code').notNull(),
  status: int('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Property Conditions - Structural conditions (earthquake-resistant, etc.)
 */
export const propertyConditions = pgTable('property_conditions', {
  id: serial('id').primaryKey(),
  listingId: int('listing_id')
    .notNull()
    .references(() => propertyListings.id),
  code: int('code').notNull(),
  status: int('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Property Images - Photos and floor plans
 */
export const propertyImages = pgTable(
  'property_images',
  {
    id: char('id', { length: 36 }).primaryKey(),
    listingId: int('listing_id')
      .notNull()
      .references(() => propertyListings.id),
    path: varchar('path', { length: 255 }),
    url: varchar('url', { length: 255 }),
    orderNum: int('order_num').notNull(),
    typeCode: int('type_code').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    idIdx: index('property_images_id_idx').on(table.id),
  }),
);

/**
 * Property Campaigns - Marketing campaigns
 */
export const propertyCampaigns = pgTable(
  'property_campaigns',
  {
    id: serial('id').primaryKey(),
    listingId: int('listing_id')
      .notNull()
      .references(() => propertyListings.id),
    code: int('code').notNull(),
  },
  (table) => ({
    codeListingIdUnique: unique('property_campaigns_code_listing_id_unique').on(
      table.code,
      table.listingId,
    ),
  }),
);

/**
 * Property Dealings - Transaction types
 */
export const propertyDealings = pgTable('property_dealings', {
  id: serial('id').primaryKey(),
  listingId: int('listing_id')
    .notNull()
    .references(() => propertyListings.id),
  code: int('code').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Property Advertisement Fees - Advertising costs
 */
export const propertyAdvertisementFees = pgTable(
  'property_advertisement_fees',
  {
    id: serial('id').primaryKey(),
    listingId: int('listing_id')
      .notNull()
      .references(() => propertyListings.id),
    amount: int('amount').notNull(),
    code: int('code').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
);

/**
 * Property Advertisement Reprints - Reprint permissions
 */
export const propertyAdvertisementReprints = pgTable(
  'property_advertisement_reprints',
  {
    id: serial('id').primaryKey(),
    listingId: int('listing_id')
      .notNull()
      .references(() => propertyListings.id),
    code: int('code').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
);

/**
 * Property Monthlies - Monthly rental options (one-to-one with listing)
 */
export const propertyMonthlies = pgTable('property_monthlies', {
  listingId: int('listing_id')
    .primaryKey()
    .notNull()
    .references(() => propertyListings.id),
  isMonthly: int('is_monthly'),
  monthlyDayCost: int('monthly_day_cost'),
  monthlyCleaningCost: int('monthly_cleaning_cost'),
  monthlyBedCost: int('monthly_bed_cost'),
  monthlyFee: int('monthly_fee'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// Relations
// ============================================

export const propertyListingsRelations = relations(
  propertyListings,
  ({ one, many }) => ({
    property: one(properties, {
      fields: [propertyListings.propertyId],
      references: [properties.id],
    }),
    costs: one(propertyCosts, {
      fields: [propertyListings.id],
      references: [propertyCosts.listingId],
    }),
    facilities: many(propertyFacilities),
    conditions: many(propertyConditions),
    images: many(propertyImages),
    campaigns: many(propertyCampaigns),
    dealings: many(propertyDealings),
    advertisementFees: many(propertyAdvertisementFees),
    advertisementReprints: many(propertyAdvertisementReprints),
    monthlies: one(propertyMonthlies, {
      fields: [propertyListings.id],
      references: [propertyMonthlies.listingId],
    }),
  }),
);

export const propertyCostsRelations = relations(propertyCosts, ({ one }) => ({
  listing: one(propertyListings, {
    fields: [propertyCosts.listingId],
    references: [propertyListings.id],
  }),
}));

export const propertyFacilitiesRelations = relations(
  propertyFacilities,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyFacilities.listingId],
      references: [propertyListings.id],
    }),
  }),
);

export const propertyConditionsRelations = relations(
  propertyConditions,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyConditions.listingId],
      references: [propertyListings.id],
    }),
  }),
);

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  listing: one(propertyListings, {
    fields: [propertyImages.listingId],
    references: [propertyListings.id],
  }),
}));

export const propertyCampaignsRelations = relations(
  propertyCampaigns,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyCampaigns.listingId],
      references: [propertyListings.id],
    }),
  }),
);

export const propertyDealingsRelations = relations(
  propertyDealings,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyDealings.listingId],
      references: [propertyListings.id],
    }),
  }),
);

export const propertyAdvertisementFeesRelations = relations(
  propertyAdvertisementFees,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyAdvertisementFees.listingId],
      references: [propertyListings.id],
    }),
  }),
);

export const propertyAdvertisementReprintsRelations = relations(
  propertyAdvertisementReprints,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyAdvertisementReprints.listingId],
      references: [propertyListings.id],
    }),
  }),
);

export const propertyMonthliesRelations = relations(
  propertyMonthlies,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyMonthlies.listingId],
      references: [propertyListings.id],
    }),
  }),
);
