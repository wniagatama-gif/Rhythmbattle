import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@rhythm-battle/shared": path.resolve(__dirname, "../../packages/shared/src"),
      "@rhythm-battle/game-data": path.resolve(__dirname, "../../packages/game-data/src")
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
