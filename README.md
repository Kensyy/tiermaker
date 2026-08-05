# Tiermaker

A real-time, collaborative tier-list maker. Create a board, upload images into folders, and drag them into S/A/B/C/D/F tiers together with friends — everyone sees moves, placements, and cursors live.

## Features

- **Shared boards** — create multiple named boards; anyone logged in can open and edit one together.
- **Live collaboration** — item placement, movement, and removal sync instantly across everyone viewing a board, via WebSockets.
- **Live cursors** — see where everyone else's mouse is on the board in real time, Figma-style.
- **Image library** — upload images, organized into a shared folder tree with nested subfolders.
- **Editable tiers** — rename a tier, recolor it, add new tiers, or delete one (and its placements).
- **Activity toasts** — see "Bob moved pepperoni.png to S" pop up when someone else acts on the board.
- **Export as PNG** — download the current board as an image to share outside the app.
- **Persistence** — boards, tiers, placements, folders, and images all survive a server restart (SQLite).
- **Lightweight auth** — pick a display name and passcode; no email, no password reset flow, just enough to attribute who placed what.

## Stack

- **Frontend**: React, TypeScript, Vite, [dnd-kit](https://dndkit.com/) for drag-and-drop, Tailwind CSS, Zustand for realtime state.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: SQLite via [Drizzle ORM](https://orm.drizzle.team/) (using [libSQL](https://github.com/tursodatabase/libsql) as the driver — no native build tooling required).
- **Uploads**: Multer, stored on disk and served statically.

## Getting started

Requires Node.js 20+.

```bash
npm install
cp server/.env.example server/.env
npm run db:generate
npm run db:migrate
npm run dev
```

This starts the API/WebSocket server on `http://localhost:3001` and the Vite dev server on `http://localhost:5173`. Open the latter — the client proxies `/api`, `/uploads`, and `/socket.io` to the server, so everything works from one origin in dev.

To try real-time collaboration, open the app in two browser windows (or have a friend on the same network hit your machine's address) and log in with two different names.

## Project structure

```
client/    React app (pages, components, realtime state)
server/    Express API + Socket.io + Drizzle/SQLite
shared/    TypeScript types and Socket.io event contracts shared by both
```

See `server/src/db/schema.ts` for the data model and `server/src/sockets/` for the realtime event handlers.

## Deployment

The client and server deploy separately, since the server needs a persistent process and disk (SQLite, uploads, in-memory presence) that serverless platforms don't provide.

**Server** — any host that gives you a long-running Node process and a persistent volume works: [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io), or a small VPS.
- Start command: `npm run start -w server` (run from the repo root, so npm workspaces resolve `@tiermaker/shared`).
- Mount a persistent volume over the server workspace's `data/` directory (where `DATABASE_PATH`/`UPLOAD_DIR` default to) — otherwise boards and uploads reset on every deploy.
- Env vars: `SESSION_SECRET` (long random string), `CLIENT_ORIGIN` (the client's deployed URL), `PORT` (most hosts set this for you).
- Migrations apply automatically on boot (see `server/src/index.ts`) — no separate migration step needed after the first deploy.

**Client** — [Vercel](https://vercel.com) is a natural fit for the Vite build:
- Root Directory: `client` (Vercel detects the npm workspace and installs from the repo root automatically).
- Env var: `VITE_API_URL` set to the server's public URL — the client uses this to reach the API, uploaded images, and the Socket.io connection (see `client/src/lib/api.ts`).

Because the two are on different domains in this setup, the session cookie needs `SameSite=None; Secure` — already handled in `server/src/session.ts`, gated on `NODE_ENV=production`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run client + server together in watch mode |
| `npm run build` | Production build of the client |
| `npm run typecheck` | Type-check all workspaces |
| `npm run db:generate` | Generate a Drizzle migration from `schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio to browse the database |

## Notes on scope

- **Sessions are in-memory**, not persisted to the database — a server restart logs everyone out, but all board/user/image data is untouched. This is a deliberate tradeoff for a small friends-scale deployment; swapping in a persistent session store later is a small, isolated change (`server/src/session.ts`).
- Auth is intentionally minimal: a display name plus a passcode, hashed with bcrypt. There's no account recovery — it's meant for a trusted group of friends, not a public app.
