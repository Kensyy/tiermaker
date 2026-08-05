import { createServer } from "node:http";
import { app } from "./app.js";
import { createSocketServer } from "./sockets/index.js";
import { env } from "./env.js";

const httpServer = createServer(app);
createSocketServer(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
