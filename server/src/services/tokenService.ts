import { randomUUID } from "node:crypto";

export interface TokenInfo {
  userId: number;
  displayName: string;
}

// In-memory, like the app's other friends-scale state (presence, cursors).
// A restart invalidates every token, so everyone just logs back in.
const tokens = new Map<string, TokenInfo>();

export function issueToken(info: TokenInfo): string {
  const token = randomUUID();
  tokens.set(token, info);
  return token;
}

export function verifyToken(token: string | undefined): TokenInfo | undefined {
  if (!token) return undefined;
  return tokens.get(token);
}

export function revokeToken(token: string): void {
  tokens.delete(token);
}
