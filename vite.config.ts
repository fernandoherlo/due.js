import { fileURLToPath } from 'url';

export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks (id: string) {
          // creating a chunk to tone
          if (id.includes('tone/') || id.includes('standardized-audio-context/')) {
            return '@1tone'; // 1...first or error in magenta
          }
          // creating a chunk to @magenta
          if (id.includes('@magenta') || id.includes('@tensorflow')) {
            return '@magenta';
          }
        }
      }
    }
  },
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './src/tests/coverage'
    }
  },
  resolve: {
    alias: [
      { find: '~', replacement: fileURLToPath(new URL('./', import.meta.url)) }
    ]
  }
};
