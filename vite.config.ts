import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true, // Listen on all network interfaces
    // Allow subdomain access (spice.localhost:5174, *.localhost:5174)
    allowedHosts: [
      '.localhost', // Allow all *.localhost subdomains
      '.yourdomain.com', // Replace with your production domain
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: false, // Preserve subdomain (spice.localhost)
        ws: true, // Support WebSocket (Socket.IO)
      },
    },
  },
});
