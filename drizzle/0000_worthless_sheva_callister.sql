CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" char(36) NOT NULL,
	"properties_building_id" integer NOT NULL,
	"room_number" varchar(255),
	"room_size" double precision,
	"direction_code" integer,
	"layout_amount" double precision NOT NULL,
	"layout_type_code" integer NOT NULL,
	"floor" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "properties_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "properties_building" (
	"id" serial PRIMARY KEY NOT NULL,
	"building_name" varchar(255) NOT NULL,
	"building_type_code" integer NOT NULL,
	"structure_type_code" integer NOT NULL,
	"built_year" integer,
	"built_month" integer,
	"max_floor" integer,
	"prefecture_code" varchar(255) NOT NULL,
	"city_code" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_advertisement_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"code" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"code" integer NOT NULL,
	CONSTRAINT "property_campaigns_code_listing_id_unique" UNIQUE("code","listing_id")
);
--> statement-breakpoint
CREATE TABLE "property_conditions" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"code" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_costs" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"rent" integer,
	"management_fee" integer,
	"deposit_price" integer,
	"deposit_month" double precision,
	"gratuity_fee_price" integer,
	"gratuity_fee_month" double precision,
	"security_deposit_price" integer,
	"security_deposit_month" double precision,
	"deposit_repayment_fee_price" integer,
	"deposit_repayment_fee_month" double precision,
	"deposit_repayment_fee_percent" double precision,
	"renewal_fee_amount" double precision,
	"renewal_fee_type_code" integer,
	"residence_insurance_needed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_dealings" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"code" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_facilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"code" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" char(36) PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"path" varchar(255),
	"url" varchar(255),
	"order_num" integer NOT NULL,
	"type_code" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"published_at" timestamp,
	"property_updated_at" timestamp,
	"property_next_update_at" timestamp,
	"available_move_in_date" date,
	"available_move_in_timing_code" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"store_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"properties_building_id" integer NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"latitude" numeric(10, 7) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_monthlies" (
	"id" serial PRIMARY KEY NOT NULL,
	"listing_id" integer NOT NULL,
	"is_monthly" integer,
	"monthly_day_cost" integer,
	"monthly_cleaning_cost" integer,
	"monthly_bed_cost" integer,
	"monthly_fee" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"properties_building_id" integer NOT NULL,
	"station_code" varchar(255),
	"station_id" integer NOT NULL,
	"railroad_code" varchar(255) NOT NULL,
	"transportation_type_code" integer NOT NULL,
	"minutes" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"properties_building_id" integer NOT NULL,
	"locale" varchar(255) NOT NULL,
	"address_detail" varchar(255),
	"remarks" varchar(1000),
	"side_note" varchar(1000),
	"catchphrase" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_properties_building_id_properties_building_id_fk" FOREIGN KEY ("properties_building_id") REFERENCES "public"."properties_building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_advertisement_fees" ADD CONSTRAINT "property_advertisement_fees_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_campaigns" ADD CONSTRAINT "property_campaigns_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_conditions" ADD CONSTRAINT "property_conditions_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_costs" ADD CONSTRAINT "property_costs_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_dealings" ADD CONSTRAINT "property_dealings_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_facilities" ADD CONSTRAINT "property_facilities_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_listings" ADD CONSTRAINT "property_listings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_listings" ADD CONSTRAINT "property_listings_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_locations" ADD CONSTRAINT "property_locations_properties_building_id_properties_building_id_fk" FOREIGN KEY ("properties_building_id") REFERENCES "public"."properties_building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_monthlies" ADD CONSTRAINT "property_monthlies_listing_id_property_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."property_listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_routes" ADD CONSTRAINT "property_routes_properties_building_id_properties_building_id_fk" FOREIGN KEY ("properties_building_id") REFERENCES "public"."properties_building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_translations" ADD CONSTRAINT "property_translations_properties_building_id_properties_building_id_fk" FOREIGN KEY ("properties_building_id") REFERENCES "public"."properties_building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "properties_building_prefecture_code_idx" ON "properties_building" USING btree ("prefecture_code");--> statement-breakpoint
CREATE INDEX "properties_building_city_code_idx" ON "properties_building" USING btree ("city_code");--> statement-breakpoint
CREATE INDEX "property_images_id_idx" ON "property_images" USING btree ("id");--> statement-breakpoint
CREATE INDEX "property_listings_property_id_idx" ON "property_listings" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "property_listings_published_at_idx" ON "property_listings" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "property_locations_longitude_idx" ON "property_locations" USING btree ("longitude");--> statement-breakpoint
CREATE INDEX "property_locations_latitude_idx" ON "property_locations" USING btree ("latitude");--> statement-breakpoint
CREATE INDEX "property_routes_station_code_idx" ON "property_routes" USING btree ("station_code");--> statement-breakpoint
CREATE INDEX "property_routes_station_id_idx" ON "property_routes" USING btree ("station_id");