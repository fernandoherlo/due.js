import * as monaco from 'monaco-editor';
import { COMMANDS } from '../Compiler/constants';

type IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
type ILanguage = monaco.languages.IMonarchLanguage;

export const richLanguageConfiguration: IRichLanguageConfiguration = {
  // If we want to support code folding, brackets ... ( [], (), {}....), we can override some properties here
  // check the doc
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  }
};

const keywords: any[] = [];
Object.keys(COMMANDS).forEach((key) => {
  keywords.push(`${COMMANDS[key]}`);
  for (let i = 0; i < 10; i++) {
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
      [/[; \t\r\n]+/, '']
    ],
    comment: [
      [/[^/*]+/, 'comment'],
      [/\*\//, 'comment', '@pop'],
      [/[/*]/, 'comment']
    ],
    string: [
      [/[^)]+/, 'string'],
      [/(@escapes)/, 'string.escape'],
      // [/\\./, 'string.escape.invalid'],
      [/\)/, 'string', '@pop']
    ]
  }
};

export const languageID = 'due#';

export const languageExtensionPoint: monaco.languages.ILanguageExtensionPoint = {
  id: languageID
};
