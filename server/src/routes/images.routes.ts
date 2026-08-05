import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { upload } from "../middleware/upload.js";
import { createImage, listImages } from "../services/imageService.js";

export const imagesRouter = Router();

imagesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const folderIdRaw = req.query.folderId;
    const folderId = folderIdRaw === undefined || folderIdRaw === "" ? null : Number(folderIdRaw);
    const results = await listImages(folderId);
    res.json(results);
  }),
);

imagesRouter.post(
  "/",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "image file is required");
    }
    const folderIdRaw = req.body.folderId;
    const folderId = folderIdRaw === undefined || folderIdRaw === "" ? null : Number(folderIdRaw);

    const image = await createImage({
      folderId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      uploadedBy: req.userId!,
    });
    res.status(201).json(image);
  }),
);
