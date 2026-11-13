import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { config } from "./config";
import { healthController } from "./modules/health/health.controller";
import { PvpRoomManager } from "./modules/pvp/PvpRoomManager";
import { handleError } from "./middleware/error";

const pvpManager = new PvpRoomManager();

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
  .ws("/ws/pvp", {
    open(ws) {
      pvpManager.registerConnection(ws.id, (msg) => {
        ws.send(JSON.stringify(msg));
      });
    },
    message(ws, message) {
      pvpManager.handleRawMessage(ws.id, message);
    },
    close(ws) {
      pvpManager.handleDisconnect(ws.id);
    }
  })
  .get("/", () => ({
    message: "Welcome to Modern Rhythm Battle API",
    health: "/api/health",
    pvpWs: "/ws/pvp"
  }))
  .listen(config.port);

console.log(`Modern Rhythm Battle Server running at http://localhost:${app.server?.port}`);
