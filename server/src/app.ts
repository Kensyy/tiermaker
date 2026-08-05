import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { authRouter } from "./routes/auth.routes.js";
import { boardsRouter } from "./routes/boards.routes.js";
import { foldersRouter } from "./routes/folders.routes.js";
import { imagesRouter } from "./routes/images.routes.js";
import { tiersRouter } from "./routes/tiers.routes.js";

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());
app.use("/uploads", express.static(env.uploadDir));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/boards", requireAuth, boardsRouter);
app.use("/api/folders", requireAuth, foldersRouter);
app.use("/api/images", requireAuth, imagesRouter);
app.use("/api/tiers", requireAuth, tiersRouter);

app.use(errorHandler);
