import { defineConfig } from 'vite';

export default defineConfig({
  preview: {
        host: "0.0.0.0",
        port: 8084
    },
  plugins: [],
  build: {
    emptyOutDir: true
  }
});