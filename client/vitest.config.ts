import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      thresholds: {
        statements: 70,
        branches: 50,
        functions: 70,
        lines: 70,
      },
      exclude: [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "**/*.config.{js,ts}",
        "**/*.d.ts",
        "**/__tests__/**",
        "**/types.js",
        "src/main.jsx",
      ],
    },
  },
});
