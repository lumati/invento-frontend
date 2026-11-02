/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Invento backend API, e.g. http://127.0.0.1:8000/api/v1 */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
