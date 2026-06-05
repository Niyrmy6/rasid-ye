import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

function pwaBuildPlugin(buildId: string): Plugin {
  return {
    name: 'pwa-build-id',
    transformIndexHtml(html) {
      return html
        .replaceAll('__APP_BUILD__', buildId)
        .replace(/href="\/icon\.svg\?v=[^"]*"/, `href="/icon.svg?v=${buildId}"`);
    },
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist/sw.js');
      if (!fs.existsSync(swPath)) return;
      const sw = fs.readFileSync(swPath, 'utf8').replaceAll('__BUILD_ID__', buildId);
      fs.writeFileSync(swPath, sw);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const buildId =
    env.VITE_BUILD_ID ||
    process.env.VITE_BUILD_ID ||
    `${mode}-${Date.now().toString(36)}`;

  return {
    plugins: [react(), tailwindcss(), pwaBuildPlugin(buildId)],
    define: {
      'import.meta.env.VITE_BUILD_ID': JSON.stringify(buildId),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('node_modules/@sentry')) return 'sentry';
            if (
              id.includes('node_modules/leaflet') ||
              id.includes('node_modules/react-leaflet')
            ) {
              return 'leaflet';
            }
            if (
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/react/')
            ) {
              return 'react-vendor';
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
