import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.PROPERTY_DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/property_db",
  },
  verbose: true,
  strict: true,
});
