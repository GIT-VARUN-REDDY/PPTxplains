import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || process.env.VITE_BACKEND_PORT || 5000}`,
        changeOrigin: true
      }
    }
  }
});
