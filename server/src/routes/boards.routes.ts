import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createBoard, getBoardHydration, listBoards } from "../services/boardService.js";
import { createTier } from "../services/tierService.js";
import { getIo } from "../sockets/index.js";

const DEFAULT_NEW_TIER_COLOR = "#4cf3ff";

export const boardsRouter = Router();

boardsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const boards = await listBoards();
    res.json(boards);
  }),
);

boardsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) {
      throw new HttpError(400, "name is required");
    }
    const board = await createBoard(name.trim(), req.session.userId!);
    res.status(201).json(board);
  }),
);

boardsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const hydration = await getBoardHydration(id);
    if (!hydration) {
      throw new HttpError(404, "Board not found");
    }
    res.json(hydration);
  }),
);

boardsRouter.post(
  "/:boardId/tiers",
  asyncHandler(async (req, res) => {
    const boardId = Number(req.params.boardId);
    const { label, color } = req.body as { label?: string; color?: string };
    if (!label || !label.trim()) {
      throw new HttpError(400, "label is required");
    }
    const tier = await createTier(boardId, label.trim(), color ?? DEFAULT_NEW_TIER_COLOR);
    getIo(req.app).to(`board:${boardId}`).emit("tier:added", tier);
    res.status(201).json(tier);
  }),
);
