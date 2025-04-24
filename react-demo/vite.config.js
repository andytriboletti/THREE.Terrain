import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import terminal from 'vite-plugin-terminal';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    // Configure Vite to show more detailed error messages
    hmr: {
      overlay: true,
    },
  },
  // Configure build options
  build: {
    sourcemap: true,
  },
  // Configure error handling
  optimizeDeps: {
    exclude: [],
  },
  // Configure console output
  logLevel: 'info',
});
