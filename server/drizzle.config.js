import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env from the server folder
config({ path: "./.env" });

export default defineConfig({
  schema: "./src/models/**/*.js", 
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
