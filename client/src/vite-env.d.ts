/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The server's public origin, e.g. https://tiermaker-server.up.railway.app. Empty/unset in dev (same-origin via the Vite proxy). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
