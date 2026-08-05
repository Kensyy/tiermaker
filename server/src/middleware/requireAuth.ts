import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/tokenService.js";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      displayName?: string;
    }
  }
}

function bearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const info = verifyToken(bearerToken(req));
  if (!info) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  req.userId = info.userId;
  req.displayName = info.displayName;
  next();
}
