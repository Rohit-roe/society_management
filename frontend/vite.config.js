import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // --- Vendor splits by package (order matters: most specific first) ---

          // Recharts + D3 ecosystem (~400kB)
          if (
            id.includes('/node_modules/recharts/') ||
            id.includes('/node_modules/d3-') ||
            id.includes('/node_modules/d3/')
          ) {
            return 'vendor-recharts';
          }

          // Socket.io client (~42kB)
          if (
            id.includes('/node_modules/socket.io-client/') ||
            id.includes('/node_modules/engine.io-client/') ||
            id.includes('/node_modules/@socket.io/')
          ) {
            return 'vendor-socket';
          }

          // React core (~190kB)
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/') ||
            id.includes('/node_modules/react-router') ||
            id.includes('/node_modules/@remix-run/')
          ) {
            return 'vendor-react';
          }

          // --- App page splits by role ---
          if (id.includes('/pages/appAdmin/')) return 'chunk-app-admin';
          if (id.includes('/pages/societyAdmin/')) return 'chunk-society-admin';
          if (id.includes('/pages/resident/')) return 'chunk-resident';
          if (id.includes('/pages/security/')) return 'chunk-security';
          if (id.includes('/pages/public/')) return 'chunk-public';
        },
      },
    },
  },
});


