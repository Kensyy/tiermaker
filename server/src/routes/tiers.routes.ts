import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { deleteTier, updateTier } from "../services/tierService.js";
import { getIo } from "../sockets/index.js";

export const tiersRouter = Router();

tiersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { label, color } = req.body as { label?: string; color?: string };
    if (label !== undefined && !label.trim()) {
      throw new HttpError(400, "label cannot be empty");
    }
    const tier = await updateTier(id, { label: label?.trim(), color });
    if (!tier) {
      throw new HttpError(404, "Tier not found");
    }
    getIo(req.app).to(`board:${tier.boardId}`).emit("tier:updated", tier);
    res.json(tier);
  }),
);

tiersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const tier = await deleteTier(id);
    if (!tier) {
      throw new HttpError(404, "Tier not found");
    }
    getIo(req.app).to(`board:${tier.boardId}`).emit("tier:removed", { tierId: id });
    res.status(204).end();
  }),
);
