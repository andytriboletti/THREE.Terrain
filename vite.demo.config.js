import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import terminal from 'vite-plugin-terminal';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    terminal({
      console: {
        enabled: true,
        showTimestamps: true,
        showAllLevels: true,
        // Customize output format for better visibility
        output: {
          // Customize colors for different log levels
          error: { color: 'red', badge: '❌' },
          warn: { color: 'yellow', badge: '⚠️' },
          info: { color: 'cyan', badge: 'ℹ️' },
          log: { color: 'white', badge: '📝' },
          debug: { color: 'gray', badge: '🔍' },
        },
        // Filter to include all messages
        filter: {
          includes: ['[VITE-TERMINAL']
        }
      },
      errors: {
        enabled: true,
        fullStack: true
      }
    })
  ],
  server: {
    open: true,
    fs: {
      // Allow serving files from demo, src, and node_modules
      allow: ['demo', 'src', 'node_modules']
    }
  },
  build: {
    outDir: 'dist/demo',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  // Specify the entry point
  root: './',
  publicDir: 'demo',
  resolve: {
    alias: {
      'three': 'three',
      'three/examples/': 'three/examples/'
    }
  },
  optimizeDeps: {
    include: ['three', 'dat.gui']
  }
});