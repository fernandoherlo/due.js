import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import { IApp } from '~/src/vite-env';
import { richLanguageConfiguration, monarchLanguage, languageID, languageExtensionPoint } from './language';
import { IEditor } from '../../types/IEditor';
import { themeDue } from './theme';

export default class Editor implements IEditor {
  _app: IApp;
  _monaco: monaco.editor.IStandaloneCodeEditor | null;

  constructor (app: IApp) {
    this._app = app;
    this._monaco = null;
  }

  create () {
    monaco.languages.register(languageExtensionPoint);
    monaco.languages.onLanguage(languageID, () => {
      monaco.languages.setMonarchTokensProvider(languageID, monarchLanguage);
      monaco.languages.setLanguageConfiguration(languageID, richLanguageConfiguration);
    });

    this._monaco = monaco.editor.create(document.body, {
      value: localStorage.getItem('due#editor') || undefined,
      language: 'due#',
      fontFamily: 'Fira Code',
      fontSize: 26,
      minimap: { enabled: false },
      automaticLayout: true
    });
    this._monaco.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, this._app.compile.bind(this._app));
    if (this._app.$music) {
      this._monaco.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, this._app.$music.toggle.bind(this._app.$music));
    }

    monaco.editor.defineTheme('due', themeDue);
    monaco.editor.setTheme('due');

    const container = window || {};
    container.onresize = () => {
      if (this._monaco) {
        this._monaco.layout();
      }
    };
  }

  getCode (): string | undefined {
    if (this._monaco) {
      return this._monaco.getValue();
    }
  }
}
