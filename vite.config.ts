import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
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
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
