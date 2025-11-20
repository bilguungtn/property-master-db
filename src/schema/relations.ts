import { relations } from "drizzle-orm";
import {
  stores,
  buildings,
  rooms,
  property_locations,
  property_routes,
  property_translations,
  property_listings,
  property_costs,
  property_facilities,
  property_conditions,
  property_images,
  property_campaigns,
  property_dealings,
  property_advertisement_fees,
  property_monthlies,
} from "./schemas";

// ============================================
// RELATIONS - IMMUTABLE SCHEMAS
// ============================================

export const stores_relations = relations(stores, ({ many }) => ({
  rooms: many(rooms),
  listings: many(property_listings),
}));

export const buildings_relations = relations(
  buildings,
  ({ many }) => ({
    rooms: many(rooms),
    locations: many(property_locations),
    routes: many(property_routes),
    translations: many(property_translations),
  }),
);

export const rooms_relations = relations(rooms, ({ one, many }) => ({
  building: one(buildings, {
    fields: [rooms.building_id],
    references: [buildings.id],
  }),
  store: one(stores, {
    fields: [rooms.store_id],
    references: [stores.id],
  }),
  listings: many(property_listings),
}));

export const property_locations_relations = relations(
  property_locations,
  ({ one }) => ({
    building: one(buildings, {
      fields: [property_locations.building_id],
      references: [buildings.id],
    }),
  }),
);

export const property_routes_relations = relations(property_routes, ({ one }) => ({
  building: one(buildings, {
    fields: [property_routes.building_id],
    references: [buildings.id],
  }),
}));

export const property_translations_relations = relations(
  property_translations,
  ({ one }) => ({
    building: one(buildings, {
      fields: [property_translations.building_id],
      references: [buildings.id],
    }),
  }),
);

// ============================================
// RELATIONS - CHANGEABLE SCHEMAS
// ============================================

export const property_listings_relations = relations(
  property_listings,
  ({ one, many }) => ({
    room: one(rooms, {
      fields: [property_listings.room_uuid],
      references: [rooms.uuid],
    }),
    store: one(stores, {
      fields: [property_listings.store_id],
      references: [stores.id],
    }),
    costs: many(property_costs),
    facilities: many(property_facilities),
    conditions: many(property_conditions),
    images: many(property_images),
    campaigns: many(property_campaigns),
    dealings: many(property_dealings),
    advertisement_fees: many(property_advertisement_fees),
    monthlies: many(property_monthlies),
  }),
);

export const property_costs_relations = relations(property_costs, ({ one }) => ({
  listing: one(property_listings, {
    fields: [property_costs.listing_id],
    references: [property_listings.id],
  }),
}));

export const property_facilities_relations = relations(
  property_facilities,
  ({ one }) => ({
    listing: one(property_listings, {
      fields: [property_facilities.listing_id],
      references: [property_listings.id],
    }),
  }),
);

export const property_conditions_relations = relations(
  property_conditions,
  ({ one }) => ({
    listing: one(property_listings, {
      fields: [property_conditions.listing_id],
      references: [property_listings.id],
    }),
  }),
);

export const property_images_relations = relations(property_images, ({ one }) => ({
  listing: one(property_listings, {
    fields: [property_images.listing_id],
    references: [property_listings.id],
  }),
}));

export const property_campaigns_relations = relations(
  property_campaigns,
  ({ one }) => ({
    listing: one(property_listings, {
      fields: [property_campaigns.listing_id],
      references: [property_listings.id],
    }),
  }),
);

export const property_dealings_relations = relations(
  property_dealings,
  ({ one }) => ({
    listing: one(property_listings, {
      fields: [property_dealings.listing_id],
      references: [property_listings.id],
    }),
  }),
);

export const property_advertisement_fees_relations = relations(
  property_advertisement_fees,
  ({ one }) => ({
    listing: one(property_listings, {
      fields: [property_advertisement_fees.listing_id],
      references: [property_listings.id],
    }),
  }),
);

export const property_monthlies_relations = relations(
  property_monthlies,
  ({ one }) => ({
    listing: one(property_listings, {
      fields: [property_monthlies.listing_id],
      references: [property_listings.id],
    }),
  }),
);
