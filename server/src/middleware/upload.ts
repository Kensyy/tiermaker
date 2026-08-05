import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { env } from "../env.js";

fs.mkdirSync(env.uploadDir, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Unsupported file type"));
      return;
    }
    cb(null, true);
  },
});
