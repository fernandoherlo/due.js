import * as monaco from 'monaco-editor';

import { IApp } from '../vite-env';
import { richLanguageConfiguration, monarchLanguage, languageID, languageExtensionPoint } from './language';
import { IEditor } from './IEditor';

export default class Editor implements IEditor {
  _app: IApp;
  _htmlId: string;
  _htmlIdCode: string;
  _htmlIdProgressBar: string;
  _idTimeoutValid: number | undefined;
  _monaco: monaco.editor.IStandaloneCodeEditor | null;

  constructor (app: IApp, htmlId: string) {
    this._app = app;
    this._htmlId = htmlId;
    this._htmlIdCode = `${this._htmlId}-code`;
    this._htmlIdProgressBar = `${this._htmlId}-progress-bar`;
    this._idTimeoutValid = undefined;
    this._monaco = null;
  }

  create () {
    monaco.languages.register(languageExtensionPoint);
    monaco.languages.onLanguage(languageID, () => {
      monaco.languages.setMonarchTokensProvider(languageID, monarchLanguage);
      monaco.languages.setLanguageConfiguration(languageID, richLanguageConfiguration);
    });

    this._monaco = monaco.editor.create(document.body, {
      value: `//sam3#glock([A4,C4,D4];5;[9-17])
//sam4#guitar([A6,A2,D3];2;[11,16])
//sam2(A4;1;7)
//sam1#bass([A3,C3,D3];[3-8];[4,7]):v(3)
sam5(D3;3;7):d(1-0.5):r(6):v(8)`,
      language: 'due#',
      theme: 'vs-dark',
      fontSize: 32,
      minimap: { enabled: false },
      lineNumbers: 'off',
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0
    });
  }

  getCode (): string | undefined {
    if (this._monaco) {
      return this._monaco.getValue();
    }
  }

  ok () {
    // const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    // textAreaEditorElement.style.backgroundColor = '#03fc45';

    // clearInterval(this._idTimeoutValid);
    // this._idTimeoutValid = setTimeout(() => {
    //   textAreaEditorElement.style.backgroundColor = '';
    // }, 150);
  }

  setLoopTime (steps: number, totalSteps: number) {
    const percentage: number = (steps * 100) / totalSteps;
    this._updateProgressBar(Math.ceil(percentage));
  }

  _updateProgressBar (width: number) {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.style.width = `${width}%`;
  }

  setValid () {
    // const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    // textAreaEditorElement.style.backgroundColor = '';
  }

  setError () {
    // const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    // textAreaEditorElement.style.backgroundColor = '#CC0000';
  }

  setWaiting () {
    // const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    // textAreaEditorElement.style.backgroundColor = '#f8fc03';
  }
}
