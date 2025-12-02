import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bottlebats/',
  build: {
    outDir: 'docs',
    assetsInlineLimit: 0,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.log
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        toplevel: true  // Mangle top-level variable names
      },
      format: {
        comments: false  // Remove all comments
      }
    }
  }
});
