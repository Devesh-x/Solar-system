import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Solar-system/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      'three': 'three',
      'three/addons': 'three/examples/jsm'
    }
  }
}); 