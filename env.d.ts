/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL de la API de Laravel con /api al final (ver .env.example)
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

