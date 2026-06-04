import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // No tocar Wasp output ni node_modules
    exclude: ["node_modules", ".wasp/**"],
  },
});
