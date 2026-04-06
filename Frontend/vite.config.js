import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // 👈 this was missing

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Fix for "process is not defined" errors
    "process.env": "{}",
  },
  optimizeDeps: {
    // Exclude Node.js-only packages from being bundled
    exclude: ["eslint"],
  },
});