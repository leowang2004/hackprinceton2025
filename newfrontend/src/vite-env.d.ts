/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_KNOT_CLIENT_ID: string
  readonly VITE_KNOT_ENVIRONMENT: 'development' | 'production'
  // Add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
