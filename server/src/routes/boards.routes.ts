import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createBoard, getBoardHydration, listBoards } from "../services/boardService.js";

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
