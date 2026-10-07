import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set to use Prisma.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: databaseUrl,
  },
});
