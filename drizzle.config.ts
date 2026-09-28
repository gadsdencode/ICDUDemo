import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  // Knowledge and workbench tables use additive SQL migrations in server/.
  tablesFilter: ["users", "ai_*"],
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
