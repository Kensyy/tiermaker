import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";

export async function findUserByDisplayName(displayName: string) {
  const [user] = await db.select().from(users).where(eq(users.displayName, displayName));
  return user ?? null;
}

export async function findUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}

export async function createUser(displayName: string, passcodeHash: string) {
  const [user] = await db
    .insert(users)
    .values({ displayName, passcodeHash, createdAt: Date.now() })
    .returning();
  return user;
}

const CURSOR_COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#2dd4bf",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
];

/** Deterministic color per user so the same person always gets the same cursor color. */
export function colorForUser(userId: number): string {
  return CURSOR_COLORS[userId % CURSOR_COLORS.length];
}
