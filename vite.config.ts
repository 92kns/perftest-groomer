import { defineConfig } from 'vite';

export default defineConfig({
  base: '/perftest-groomer/',
  build: {
    outDir: 'dist',
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
