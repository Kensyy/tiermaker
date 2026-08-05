import { createServer } from "node:http";
import { migrate } from "drizzle-orm/libsql/migrator";
import { app } from "./app.js";
import { createSocketServer } from "./sockets/index.js";
import { db } from "./db/client.js";
import { env } from "./env.js";

// Applying pending migrations on boot (idempotent — a no-op once the schema
// is current) means a fresh deploy just needs the volume mounted, no
// separate migration step to remember.
await migrate(db, { migrationsFolder: "./src/db/migrations" });

const httpServer = createServer(app);
const io = createSocketServer(httpServer);
// REST routes that mutate board structure (e.g. tiers) broadcast their
// changes to viewers over this same socket server.
app.set("io", io);

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
