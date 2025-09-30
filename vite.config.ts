import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Vite automatically loads .env files for the given mode into process.env.
  // We can then use define to make the environment variable available in the client-side code.
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // Replaces occurrences of process.env.API_KEY in the code with the value of VITE_GEMINI_API_KEY.
      // JSON.stringify is necessary to wrap the key in quotes, making it a valid string in the code.
      'process.env.API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || ''),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      }
    }
  };
});