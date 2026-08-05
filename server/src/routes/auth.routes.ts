import { Router } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createUser, findUserByDisplayName, findUserById } from "../services/userService.js";

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
      req.session.userId = existing.id;
      req.session.displayName = existing.displayName;
      res.json({ id: existing.id, displayName: existing.displayName });
      return;
    }

    const passcodeHash = await bcrypt.hash(passcode, 10);
    const created = await createUser(displayName, passcodeHash);
    req.session.userId = created.id;
    req.session.displayName = created.displayName;
    res.status(201).json({ id: created.id, displayName: created.displayName });
  }),
);

authRouter.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.status(204).end();
  });
});

authRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const user = await findUserById(req.session.userId);
    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    res.json({ id: user.id, displayName: user.displayName });
  }),
);
