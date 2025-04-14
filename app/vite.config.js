import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "localhost",
    open: "localhost:8080", // Add this to be explicit
    strictPort: true, // Add this to ensure port binding
    port: 8080,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
  },
  define: {
    "process.env": {},
    // Add global process definition
    "global.process": {},
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "build",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  esbuild: {
    loader: "jsx",
    include: ["src/**/*.jsx", "src/**/*.js"],
    exclude: ["node_modules", "build"],
  },
  plugins: [react()],
});
