import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "node:path";

const databasePath = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "./data/tiermaker.sqlite");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "turso",
  dbCredentials: {
    url: `file:${databasePath}`,
  },
});
