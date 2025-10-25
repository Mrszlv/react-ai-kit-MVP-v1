import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    target: "esnext",

    lib: {
      entry: path.resolve(__dirname, "packages/ai-ui/src/index.ts"),
      name: "AiUiComponents",
      fileName: (format) => `index.${format}.js`,
    },

    rollupOptions: {
      output: {
        format: "es",

        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },

      external: ["react", "react-dom"],
    },
  },

  resolve: {
    alias: {
      "@ai-ui/components": path.resolve(__dirname, "packages/ai-ui/src"),
    },
  },
});
