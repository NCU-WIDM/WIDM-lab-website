/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLIENT_ID: string;
    readonly VITE_REDIRECT_URI: string;
    // 其他環境變量也可以在這裡定義
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  