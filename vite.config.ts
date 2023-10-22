import { splitVendorChunkPlugin } from 'vite';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    splitVendorChunkPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'due.js',
        short_name: 'due.js',
        description: 'Due.js Editor',
        theme_color: '#15141b',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
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
