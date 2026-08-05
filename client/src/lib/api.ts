// Same-origin ("") in dev, where Vite proxies /api to the local server.
// In production the client and server are deployed separately, so this
// points at the server's public URL (set via VITE_API_URL at build time).
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "";

/** Resolves a server-relative asset path (e.g. an uploaded image's url) against the API origin. */
export function resolveAssetUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

const TOKEN_STORAGE_KEY = "tiermaker.authToken";

// Auth is a bearer token, not a cookie — the client and server are deployed
// on separate domains, and browsers increasingly block cross-site cookies
// regardless of SameSite/Secure. Kept in localStorage so a page refresh
// doesn't force a re-login.
let authToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
  else localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (typeof init?.body === "string") headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE_URL}/api${path}`, { headers, ...init });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  postForm: <T>(path: string, form: FormData) => request<T>(path, { method: "POST", body: form }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
