/// <reference types="vite/client" />

declare module 'v-calendar/style.css'

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}
