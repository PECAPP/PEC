import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";
import path from "node:path";

// Load .env relative to this file's location
config({ path: path.join(__dirname, ".env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  engine: "classic",
  datasource: {
    provider: "postgresql",
    url: env("DATABASE_URL"),
  },
});
