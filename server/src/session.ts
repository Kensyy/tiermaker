import session from "express-session";
import { env } from "./env.js";

// In-memory store: fine at friends-project scale. Only board/user/image data
// needs to survive a restart (per the app's requirements) — a server restart
// simply requires everyone to log back in, which express-session's default
// MemoryStore already handles correctly.
export const sessionMiddleware = session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
});
