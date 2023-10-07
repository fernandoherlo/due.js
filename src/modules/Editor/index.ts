import * as Tone from 'tone';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import { IApp } from '~/src/vite-env';
import { richLanguageConfiguration, monarchLanguage, languageID, languageExtensionPoint } from './language';
import { IEditor } from '../../types/IEditor';
import { themeDue } from './theme';

export default class Editor implements IEditor {
  _app: IApp;
  _htmlId: string;
  _htmlIdProgressBar: string;
  _idTimeoutValid: number | undefined;
  _monaco: monaco.editor.IStandaloneCodeEditor | null;

  constructor (app: IApp, htmlId: string) {
    this._app = app;
    this._htmlId = htmlId;
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
      value: localStorage.getItem('due#editor') || undefined,
      language: 'due#',
      fontFamily: 'Fira Code',
      fontSize: 26,
      minimap: { enabled: false },
      automaticLayout: true
    });
    this._monaco.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, this._onSave.bind(this));
    this._monaco.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, this._onToogle.bind(this));

    monaco.editor.defineTheme('due', themeDue);
    monaco.editor.setTheme('due');

    const container = window || {};
    container.onresize = () => {
      if (this._monaco) {
        this._monaco.layout();
      }
    };

    const togglePlay: HTMLDivElement | null = document.getElementById('toggle') as HTMLDivElement;
    togglePlay.onclick = async () => {
      await this._onToogle();
    };

    const save: HTMLDivElement | null = document.getElementById('save') as HTMLDivElement;
    save.onclick = () => {
      this._onSave();
    };
  }

  _onSave () {
    this._app.$looper.compile();
  }

  async _onToogle () {
    await Tone.start();
    this._app.$looper.toggle();
  }

  getCode (): string | undefined {
    if (this._monaco) {
      return this._monaco.getValue();
    }
  }

  ok () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('ok');

    clearInterval(this._idTimeoutValid);
    this._idTimeoutValid = window.setTimeout(() => {
      progressBarEditorElement.className = '';
    }, 250);
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
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('valid');
  }

  setError () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('error');
  }

  setWaiting () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('wait');
  }
}
