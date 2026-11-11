import { Elysia } from "elysia";
import type { HealthResponse } from "@rhythm-battle/shared";

export const healthController = new Elysia({ prefix: "/api" })
  .get("/health", (): HealthResponse => {
    return {
      success: true,
      message: "Modern Rhythm Battle API is running",
      service: "server",
      timestamp: new Date().toISOString()
    };
  });

