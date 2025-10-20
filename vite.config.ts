import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path"; // ✅ Додай цей імпорт

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ai-ui/components": path.resolve(__dirname, "packages/ai-ui/src"),
    },
  },
});
