import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";

export default defineConfig({
  schema: "./src/database/schema/index.ts",
  out: "./src/database/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name
  }
});

