import { relations } from "drizzle-orm";
import {
  propertiesBuilding,
  properties,
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
  propertyAdvertisementReprints,
  propertyMonthlies,
} from "./schemas";

// ============================================
// RELATIONS - IMMUTABLE SCHEMAS
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

// ============================================
// RELATIONS - CHANGEABLE SCHEMAS
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
