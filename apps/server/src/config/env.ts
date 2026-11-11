export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  database: {
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: Number(process.env.DATABASE_PORT) || 3306,
    name: process.env.DATABASE_NAME || "modern_rhythm_battle",
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || ""
  }
};

