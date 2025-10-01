import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        proxy: {
          // This proxies all requests starting with /api to the local Firebase Functions emulator.
          // This is the core of the backend solution for development.
          '/api': {
            // The target is the local emulator URL for the 'api' function.
            target: 'http://127.0.0.1:5001/content-generator-98c94/us-central1/api',
            changeOrigin: true, // Necessary for virtual hosted sites
            rewrite: (path) => path.replace(/^\/api/, ''), // Rewrite /api/foo to /foo
          },
        },
      },
    };
});
