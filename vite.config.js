import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bottlebats/',
  build: {
    outDir: 'docs',
    assetsInlineLimit: 0
  }
});
