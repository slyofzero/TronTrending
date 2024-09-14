declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      TRENDING_BUY_BOT_API: string | undefined;
      BOT_TOKEN: string | undefined;
      BOT_USERNAME: string | undefined;
      ENCRYPTION_KEY: string | undefined;
      RPC_ENDPOINT: string | undefined;
      CHANNEL_ID: string | undefined;
      DEX_URL: string | undefined;
      NETWORK_NAME: string | undefined;
      PORT: string | undefined;
      API_AUTH_KEY: string | undefined;
      TRENDING_PRICES: string | undefined;
      AD_PRICES: string | undefined;
      FIREBASE_PREFIX: string | undefined;
      TRENDING_CHANNEL_LINK: string | undefined;
      FIREBASE_KEY: string | undefined;
      BANNED_TOKENS: string | undefined;
      PAYMENT_LOGS_CHANNEL: string | undefined;
      MAIN_ACCOUNT: string | undefined;
      DEXTOOLS_API_KEY: string | undefined;
      DISCLAIMER_LINK: string | undefined;
    }
  }
}

export {};
