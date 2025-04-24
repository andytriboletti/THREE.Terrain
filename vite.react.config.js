import { defineConfig } from 'vite';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';
import terminal from 'vite-plugin-terminal';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    terminal()
  ],
  server: {
    open: true
  },
  // Specify the entry point
  root: 'react-demo',
  publicDir: 'public',
  resolve: {
    alias: {
      'three': 'three',
      'three/examples/': 'three/examples/'
    }
  },
  optimizeDeps: {
    include: [
      'three',
      'dat.gui',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/rapier'
    ]
  }
});
