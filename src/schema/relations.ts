import { relations } from "drizzle-orm";
import {
  stores,
  buildings,
  rooms,
  propertyLocations,
  propertyRoutes,
  propertyTranslations,
  propertyListings,
  propertyCosts,
  propertyFacilities,
  propertyConditions,
  propertyImages,
  propertyCampaigns,
  propertyDealings,
  propertyAdvertisementFees,
  propertyMonthlies,
} from "./schemas";

// ============================================
// RELATIONS - IMMUTABLE SCHEMAS
// ============================================

export const storesRelations = relations(stores, ({ many }) => ({
  rooms: many(rooms),
  listings: many(propertyListings),
}));

export const buildingsRelations = relations(
  buildings,
  ({ many }) => ({
    rooms: many(rooms),
    locations: many(propertyLocations),
    routes: many(propertyRoutes),
    translations: many(propertyTranslations),
  }),
);

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  building: one(buildings, {
    fields: [rooms.buildingId],
    references: [buildings.id],
  }),
  store: one(stores, {
    fields: [rooms.storeId],
    references: [stores.id],
  }),
  listings: many(propertyListings),
}));

export const propertyLocationsRelations = relations(
  propertyLocations,
  ({ one }) => ({
    building: one(buildings, {
      fields: [propertyLocations.buildingId],
      references: [buildings.id],
    }),
  }),
);

export const propertyRoutesRelations = relations(propertyRoutes, ({ one }) => ({
  building: one(buildings, {
    fields: [propertyRoutes.buildingId],
    references: [buildings.id],
  }),
}));

export const propertyTranslationsRelations = relations(
  propertyTranslations,
  ({ one }) => ({
    building: one(buildings, {
      fields: [propertyTranslations.buildingId],
      references: [buildings.id],
    }),
  }),
);

// ============================================
// RELATIONS - CHANGEABLE SCHEMAS
// ============================================

export const propertyListingsRelations = relations(
  propertyListings,
  ({ one, many }) => ({
    room: one(rooms, {
      fields: [propertyListings.roomUuid],
      references: [rooms.uuid],
    }),
    store: one(stores, {
      fields: [propertyListings.storeId],
      references: [stores.id],
    }),
    costs: many(propertyCosts),
    facilities: many(propertyFacilities),
    conditions: many(propertyConditions),
    images: many(propertyImages),
    campaigns: many(propertyCampaigns),
    dealings: many(propertyDealings),
    advertisementFees: many(propertyAdvertisementFees),
    monthlies: many(propertyMonthlies),
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

export const propertyMonthliesRelations = relations(
  propertyMonthlies,
  ({ one }) => ({
    listing: one(propertyListings, {
      fields: [propertyMonthlies.listingId],
      references: [propertyListings.id],
    }),
  }),
);
