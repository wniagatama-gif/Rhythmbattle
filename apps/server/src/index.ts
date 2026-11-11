import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { config } from "./config";
import { healthController } from "./modules/health/health.controller";
import { handleError } from "./middleware/error";

export const app = new Elysia()
  .use(
    cors({
      origin: [config.corsOrigin, "http://localhost:5173", "http://127.0.0.1:5173"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      credentials: true
    })
  )
  .onError(handleError)
  .use(healthController)
  .get("/", () => ({
    message: "Welcome to Modern Rhythm Battle API",
    health: "/api/health"
  }))
  .listen(config.port);

console.log(`🚀 Modern Rhythm Battle Server running at http://localhost:${app.server?.port}`);

