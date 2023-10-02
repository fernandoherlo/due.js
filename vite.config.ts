import monacoEditorPlugin, { type IMonacoEditorOpts } from 'vite-plugin-monaco-editor';
const monacoEditorPluginDefault = ((monacoEditorPlugin as any).default) as (options: IMonacoEditorOpts) => any;

export default {
  plugins: [
    monacoEditorPluginDefault({
      languageWorkers: ['editorWorkerService']
    })
  ],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './src/Tests/coverage'
    }
  }
};
