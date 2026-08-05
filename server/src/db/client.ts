import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "../env.js";
import * as schema from "./schema.js";

fs.mkdirSync(path.dirname(env.databasePath), { recursive: true });

export const libsql = createClient({ url: `file:${env.databasePath}` });
await libsql.execute("PRAGMA foreign_keys = ON");

export const db = drizzle(libsql, { schema });
