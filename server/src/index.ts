import { createServer } from "node:http";
import { app } from "./app.js";
import { createSocketServer } from "./sockets/index.js";
import { env } from "./env.js";

const httpServer = createServer(app);
const io = createSocketServer(httpServer);
// REST routes that mutate board structure (e.g. tiers) broadcast their
// changes to viewers over this same socket server.
app.set("io", io);

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
