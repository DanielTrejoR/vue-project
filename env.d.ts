/// <reference types="vite/client" />

interface ImportMetaEnv {
  // URL de la API de Laravel con /api al final (ver .env.example)
  readonly VITE_API_BASE_URL: string
  // WebSocket de Laravel Reverb para la campana (opcionales: sin la clave, la campana solo consulta cada tanto)
  readonly VITE_REVERB_APP_KEY?: string
  readonly VITE_REVERB_HOST?: string
  readonly VITE_REVERB_PORT?: string
  readonly VITE_REVERB_SCHEME?: 'http' | 'https'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

