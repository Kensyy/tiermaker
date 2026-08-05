# Tiermaker

A real-time, collaborative tier-list maker. Create a board, upload images into folders, and drag them into S/A/B/C/D/F tiers together with friends — everyone sees moves, placements, and cursors live.

## Features

- **Shared boards** — create multiple named boards; anyone logged in can open and edit one together.
- **Live collaboration** — item placement, movement, and removal sync instantly across everyone viewing a board, via WebSockets.
- **Live cursors** — see where everyone else's mouse is on the board in real time, Figma-style.
- **Image library** — upload images, organized into a shared folder tree with nested subfolders.
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
