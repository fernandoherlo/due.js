import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';
import monacoEditorPlugin, { type IMonacoEditorOpts } from 'vite-plugin-monaco-editor';
const monacoEditorPluginDefault = ((monacoEditorPlugin as any).default) as (options: IMonacoEditorOpts) => any;

export default {
  plugins: [
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
    }),
    monacoEditorPluginDefault({
      languageWorkers: ['editorWorkerService']
    })
  ],
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
