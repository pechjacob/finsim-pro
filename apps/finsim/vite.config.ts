import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/finsim-pro/docs': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    base: '/finsim-pro/',
    plugins: [
      react(),
      // Middleware plugin to handle case-sensitive redirects
      {
        name: 'lowercase-base-redirect',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url || '';

            // Redirect uppercase /FinSim-Pro/ to lowercase /finsim-pro/
            if (url.startsWith('/FinSim-Pro')) {
              const lowercaseUrl = url.replace('/FinSim-Pro', '/finsim-pro');
              res.writeHead(301, { Location: lowercaseUrl });
              res.end();
              return;
            }

            // Block invalid nested paths like /finsim-pro/FinSim-Pro/
            if (url.includes('/finsim-pro/FinSim-Pro/')) {
              res.writeHead(404);
              res.end('Not Found');
              return;
            }

            next();
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(
        process.env.VITE_COMMIT_SHA ||
        (() => {
          try {
            return require('child_process').execSync('git rev-parse HEAD').toString().trim();
          } catch {
            return 'dev-build';
          }
        })()
      ),
      'import.meta.env.VITE_COMMIT_COUNT': JSON.stringify(
        process.env.VITE_COMMIT_COUNT ||
        (() => {
          try {
            // Use git describe to get commits since last tag: v1.1.0-3-gabc1234
            const describe = require('child_process').execSync('git describe --tags --long').toString().trim();
            // Extract the commit count (the "3" in "v1.1.0-3-gabc1234")
            const match = describe.match(/-(\d+)-g[a-f0-9]+$/);
            return match ? match[1] : '0';
          } catch {
            return '0';
          }
        })()
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
