import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Dynamically determine the backend port from server/.env if present
let backendPort = 5001;
try {
  const envPath = path.resolve(__dirname, '../server/.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const portMatch = envContent.match(/^PORT\s*=\s*(\d+)/m);
    if (portMatch) {
      backendPort = parseInt(portMatch[1], 10);
    }
  }
} catch (e) {
  backendPort = 5001;
}

const targetUrl = `http://localhost:${backendPort}`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: targetUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
