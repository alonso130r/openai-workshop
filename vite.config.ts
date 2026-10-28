import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "manim-react": fileURLToPath(
        new URL("./vendor/manim-entry.ts", import.meta.url),
      ),
    },
  },
  build: { chunkSizeWarningLimit: 900 },
});
