// Global test setup
import { config } from "dotenv";

// Load test environment variables
config({ path: ".env.test" });

// Mock console methods to reduce noise during tests (optional)
// global.console = {
//   ...console,
//   log: () => {},
//   debug: () => {},
//   info: () => {},
//   warn: () => {},
//   error: console.error // Keep error for debugging
// };
