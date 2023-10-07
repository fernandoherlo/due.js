import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

export const themeDue: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      token: 'comment',
      foreground: '6d6d6d'
    },
    {
      token: 'string',
      foreground: 'a277ff'
    },
    {
      token: 'identifier', // sample
      foreground: 'ffca85'
    },
    {
      foreground: '82e2ff', // instrument / efecct
      token: 'keyword'
    }
  ],
  colors: {
    'editor.background': '#15141b'
  }
};
