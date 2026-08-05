import { Router } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createUser, findUserByDisplayName, findUserById } from "../services/userService.js";
import { issueToken, revokeToken } from "../services/tokenService.js";

const DISPLAY_NAME_PATTERN = /^[a-zA-Z0-9 _-]{2,24}$/;

export const authRouter = Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { displayName, passcode } = req.body as { displayName?: string; passcode?: string };

    if (!displayName || !passcode) {
      throw new HttpError(400, "displayName and passcode are required");
    }
    if (!DISPLAY_NAME_PATTERN.test(displayName)) {
      throw new HttpError(400, "Display name must be 2-24 characters (letters, numbers, spaces, - or _)");
    }
    if (passcode.length < 4) {
      throw new HttpError(400, "Passcode must be at least 4 characters");
    }

    const existing = await findUserByDisplayName(displayName);

    if (existing) {
      const valid = await bcrypt.compare(passcode, existing.passcodeHash);
      if (!valid) {
        throw new HttpError(401, "Incorrect passcode for that name");
      }
      const token = issueToken({ userId: existing.id, displayName: existing.displayName });
      res.json({ id: existing.id, displayName: existing.displayName, token });
      return;
    }

    const passcodeHash = await bcrypt.hash(passcode, 10);
    const created = await createUser(displayName, passcodeHash);
    const token = issueToken({ userId: created.id, displayName: created.displayName });
    res.status(201).json({ id: created.id, displayName: created.displayName, token });
  }),
);

authRouter.post("/logout", requireAuth, (req, res) => {
  const token = req.headers.authorization!.slice("Bearer ".length);
  revokeToken(token);
  res.status(204).end();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.userId!);
    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    res.json({ id: user.id, displayName: user.displayName });
  }),
);
