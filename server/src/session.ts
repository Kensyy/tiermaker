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
    // In dev, client and server share an origin via the Vite proxy, so "lax"
    // is enough. In production they're on different domains (e.g. a Vercel
    // client + a Railway server), which requires "none" — and browsers only
    // honor SameSite=None on cookies marked Secure, so the two go together.
    sameSite: env.isProduction ? "none" : "lax",
    secure: env.isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
});
