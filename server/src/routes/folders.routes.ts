import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createFolder, getFolderTree } from "../services/folderService.js";

export const foldersRouter = Router();

foldersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tree = await getFolderTree();
    res.json(tree);
  }),
);

foldersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, parentId } = req.body as { name?: string; parentId?: number | null };
    if (!name || !name.trim()) {
      throw new HttpError(400, "name is required");
    }
    const folder = await createFolder(name.trim(), parentId ?? null);
    res.status(201).json(folder);
  }),
);
