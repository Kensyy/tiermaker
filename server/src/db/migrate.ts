import { migrate } from "drizzle-orm/libsql/migrator";
import { db, libsql } from "./client.js";

await migrate(db, { migrationsFolder: "./src/db/migrations" });
console.log("Migrations applied.");
libsql.close();
