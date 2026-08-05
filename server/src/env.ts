import "dotenv/config";
import path from "node:path";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(required("PORT", "3001")),
  // Both default under ./data so a single mounted volume (e.g. on Railway)
  // covers persistence for the whole app.
  databasePath: path.resolve(process.cwd(), required("DATABASE_PATH", "./data/tiermaker.sqlite")),
  uploadDir: path.resolve(process.cwd(), required("UPLOAD_DIR", "./data/uploads")),
  clientOrigin: required("CLIENT_ORIGIN", "http://localhost:5173"),
};
