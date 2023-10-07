import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

import { IApp } from '~/src/vite-env';
import { richLanguageConfiguration, monarchLanguage, languageID, languageExtensionPoint } from './language';
import { IEditor } from '../../types/IEditor';

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
      value: `// .#####..##..##.######........######..####..
// .##..##.##..##.##................##.##.....
// .##..##.##..##.####..............##..####..
// .##..##.##..##.##.......##...##..##.....##.
// .#####...####..######...##....####...####..
sam1#glock([A#4,C3,D2];5;[2-4]):d(0.2-0.1):r(6):v(8)
//sam2#guitar4([A4,A2,D3];12;[4,16]):cho(0.5):v(-9)
sam3([A4,C3,A4,F4];[2];[0.5-4]):r(6):v(9)
//sam4#bass([A3,C2,D2];[2-8];[2,7]):d(0.5-0.7):r(6):v(1)
sam5(D3;3;7):d(1-0.5):r(6):v(8)
sam6#ocean([G3>D3>A4];6;[6-8]):v(11):r(1)
//sam7#violin([C3>E3>G3>C4>E4>G4];1;[1,2]):v(-14)
//sam8#guitar([C3=E3=G3>C5=E5=G5];1;[9-15]):cho(1):v(-9)
sam9#cellos([C3=E3=G3];3;[11-14]):v(-8)
sam10#birds([A3,C2];1;[2-4]):v(-8)`,
      language: 'due#',
      fontFamily: 'Fira Code',
      fontSize: 26,
      minimap: { enabled: false },
      // glyphMargin: false,
      // lineDecorationsWidth: 0,
      // lineNumbersMinChars: 0,
      automaticLayout: true
      // fixedOverflowWidgets: true
    });
    this._monaco.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, this._onSave.bind(this));
    this._monaco.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, this._onToogle.bind(this));

    monaco.editor.defineTheme('default', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        {
          token: 'comment',
          foreground: '3c3b3d'
        },
        {
          token: 'string',
          foreground: 'bd93f9'
        },
        {
          token: 'identifier', // sample
          foreground: 'd5eb34'
        },
        {
          foreground: '8be9fd', // instrument / efecct
          token: 'keyword'
        }
      ],
      colors: {
        'editor.background': '#282a36'
      }
    });
    monaco.editor.setTheme('default');

    const container = window || {};
    container.onresize = () => {
      if (this._monaco) {
        this._monaco.layout();
      }
    };

    const togglePlay: HTMLDivElement | null = document.getElementById('toggle') as HTMLDivElement;
    togglePlay.onclick = () => {
      this._onToogle();
    };

    const save: HTMLDivElement | null = document.getElementById('save') as HTMLDivElement;
    save.onclick = () => {
      this._onSave();
    };
  }

  _onSave () {
    this._app.$looper.compile();
  }

  _onToogle () {
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
