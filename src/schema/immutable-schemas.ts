import { relations } from 'drizzle-orm';
import {
  decimal,
  index,
  int,
  pgTable,
  serial,
  timestamp,
  varchar,
  doublePrecision,
  char,
} from 'drizzle-orm/pg-core';

// ============================================
// IMMUTABLE: Physical Property Characteristics
// ============================================

/**
 * Buildings - Physical building information
 */
export const propertiesBuilding = pgTable(
  'properties_building',
  {
    id: serial('id').primaryKey(),
    buildingName: varchar('building_name', { length: 255 }).notNull(),
    buildingTypeCode: int('building_type_code').notNull(),
    structureTypeCode: int('structure_type_code').notNull(),
    builtYear: int('built_year'),
    builtMonth: int('built_month'),
    maxFloor: int('max_floor'),
    prefectureCode: varchar('prefecture_code', { length: 255 }).notNull(),
    cityCode: varchar('city_code', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    prefectureCodeIdx: index('properties_building_prefecture_code_idx').on(
      table.prefectureCode,
    ),
    cityCodeIdx: index('properties_building_city_code_idx').on(table.cityCode),
  }),
);

/**
 * Properties (Rooms) - Individual units/rooms in buildings
 */
export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  uuid: char('uuid', { length: 36 }).notNull().unique(),
  propertiesBuildingId: int('properties_building_id')
    .notNull()
    .references(() => propertiesBuilding.id),
  roomNumber: varchar('room_number', { length: 255 }),
  roomSize: doublePrecision('room_size'),
  directionCode: int('direction_code'),
  layoutAmount: doublePrecision('layout_amount').notNull(),
  layoutTypeCode: int('layout_type_code').notNull(),
  floor: int('floor'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Property Locations - Geographic coordinates
 */
export const propertyLocations = pgTable(
  'property_locations',
  {
    id: serial('id').primaryKey(),
    propertiesBuildingId: int('properties_building_id')
      .notNull()
      .references(() => propertiesBuilding.id),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  },
  (table) => ({
    longitudeIdx: index('property_locations_longitude_idx').on(table.longitude),
    latitudeIdx: index('property_locations_latitude_idx').on(table.latitude),
  }),
);

/**
 * Property Routes - Transportation access
 */
export const propertyRoutes = pgTable(
  'property_routes',
  {
    id: serial('id').primaryKey(),
    propertiesBuildingId: int('properties_building_id')
      .notNull()
      .references(() => propertiesBuilding.id),
    stationCode: varchar('station_code', { length: 255 }),
    stationId: int('station_id').notNull(),
    railroadCode: varchar('railroad_code', { length: 255 }).notNull(),
    transportationTypeCode: int('transportation_type_code').notNull(),
    minutes: int('minutes').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    stationCodeIdx: index('property_routes_station_code_idx').on(
      table.stationCode,
    ),
    stationIdIdx: index('property_routes_station_id_idx').on(table.stationId),
  }),
);

/**
 * Property Translations - Localized content
 */
export const propertyTranslations = pgTable('property_translations', {
  id: serial('id').primaryKey(),
  propertiesBuildingId: int('properties_building_id')
    .notNull()
    .references(() => propertiesBuilding.id),
  locale: varchar('locale', { length: 255 }).notNull(),
  addressDetail: varchar('address_detail', { length: 255 }),
  remarks: varchar('remarks', { length: 1000 }),
  sideNote: varchar('side_note', { length: 1000 }),
  catchphrase: varchar('catchphrase', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================
// Relations
// ============================================

export const propertiesBuildingRelations = relations(
  propertiesBuilding,
  ({ many }) => ({
    properties: many(properties),
    locations: many(propertyLocations),
    routes: many(propertyRoutes),
    translations: many(propertyTranslations),
  }),
);

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  building: one(propertiesBuilding, {
    fields: [properties.propertiesBuildingId],
    references: [propertiesBuilding.id],
  }),
}));

export const propertyLocationsRelations = relations(
  propertyLocations,
  ({ one }) => ({
    building: one(propertiesBuilding, {
      fields: [propertyLocations.propertiesBuildingId],
      references: [propertiesBuilding.id],
    }),
  }),
);

export const propertyRoutesRelations = relations(propertyRoutes, ({ one }) => ({
  building: one(propertiesBuilding, {
    fields: [propertyRoutes.propertiesBuildingId],
    references: [propertiesBuilding.id],
  }),
}));

export const propertyTranslationsRelations = relations(
  propertyTranslations,
  ({ one }) => ({
    building: one(propertiesBuilding, {
      fields: [propertyTranslations.propertiesBuildingId],
      references: [propertiesBuilding.id],
    }),
  }),
);
