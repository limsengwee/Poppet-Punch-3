import { fileURLToPath, URL } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Fix: Replaced `process.cwd()` with a method using `import.meta.url` to avoid TypeScript errors where `process.cwd` is not defined on the Process type.
    const env = loadEnv(mode, fileURLToPath(new URL('.', import.meta.url)), '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      },
      resolve: {
        alias: {
          // Fix: Replaced `path.resolve` with `__dirname` with the modern `import.meta.url` approach for ESM compatibility.
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      }
    };
});