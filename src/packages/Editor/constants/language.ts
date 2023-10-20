import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { COMMANDS } from '~/src/packages/Compiler/constants';

type IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
type ILanguage = monaco.languages.IMonarchLanguage;

export const richLanguageConfiguration: IRichLanguageConfiguration = {
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  }
};

const keywords: any[] = [];
Object.keys(COMMANDS).forEach((key) => {
  keywords.push(`${COMMANDS[key]}`);
  for (let i = 0; i < 20; i++) {
    keywords.push(`${COMMANDS[key]}${i}`);
  }
});

export const monarchLanguage = <ILanguage>{
  defaultToken: 'invalid',
  keywords,
  typeKeywords: [],
  operators: [
    '#', ':'
  ],
  symbols: /[#]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  digits: /\d+(_+\d+)*/,
  tokenizer: {
    root: [
      [/[a-zA-Z_$][\w$]*/, {
        cases: {
          '@keywords': { token: 'keyword' },
          '@default': 'identifier'
        }
      }],
      { include: '@whitespace' },
      [/\(/, 'string', '@string']
    ],
    whitespace: [
      [/[ \t\r\n]+/, ''],
      [/\/\*\*(?!\/)/, 'comment.doc', '@jsdoc'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment']
    ],
    comment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[/*]/, 'comment']
    ],
    jsdoc: [
      [/[^/*]+/, 'comment.doc'],
      [/\*\//, 'comment.doc', '@pop'],
      [/[/*]/, 'comment.doc']
    ],
    string: [
      [/[^)]+/, 'string'],
      [/(@escapes)/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/\)/, 'string', '@pop']
    ]
  }
};

export const languageID = 'due#';

export const languageExtensionPoint: monaco.languages.ILanguageExtensionPoint = {
  id: languageID
};
