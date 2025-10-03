import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env from parent directory
config({ path: "../.env" });

export default defineConfig({
  schema: "./src/models",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
