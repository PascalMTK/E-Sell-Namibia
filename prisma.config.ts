import { defineConfig } from "prisma/config";
import { loadEnvFile } from "node:process";

try {
  loadEnvFile(".env");
} catch {
  // .env is optional (e.g. when DATABASE_URL is provided by the host environment)
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
