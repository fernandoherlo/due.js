import { IApp, IUi } from '~/src/vite-env';

export default class Ui implements IUi {
  private _app: IApp;
  private _htmlIdProgressBar: string;
  private _idTimeoutValid: number | undefined;

  private _steps: number;
  private _totalSteps: number;

  constructor (app: IApp) {
    this._app = app;
    this._htmlIdProgressBar = 'progress-bar';
    this._idTimeoutValid = undefined;

    this._steps = 1;
    this._totalSteps = 4;
  }

  async start () {
    const togglePlay: HTMLDivElement | null = document.getElementById('toggle') as HTMLDivElement;
    togglePlay.onclick = async () => {
      if (this._app.$music) {
        await this._app.$music.toggle();
      }
    };

    const save: HTMLDivElement | null = document.getElementById('save') as HTMLDivElement;
    save.onclick = async () => {
      await this._app.compile();
    };

    const menu: HTMLDivElement | null = document.getElementById('menu') as HTMLDivElement;
    menu.onclick = async () => {
    };

    const debug: HTMLDivElement | null = document.getElementById('debug') as HTMLDivElement;
    debug.onclick = async () => {
      const debuggerElement: HTMLDivElement | null = document.getElementById('debugger') as HTMLDivElement;
      debuggerElement.classList.toggle('show');
    };
  }

  setOk () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('ok');

    clearInterval(this._idTimeoutValid);
    this._idTimeoutValid = window.setTimeout(() => {
      progressBarEditorElement.className = '';
    }, 250);
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

  updateLoopTime () {
    const percentage: number = (this._steps * 100) / this._totalSteps;
    this._updateProgressBar(Math.ceil(percentage));
  }

  updateSteps () {
    if (this._steps === this._totalSteps) {
      this._steps = 1;
    } else {
      this._steps++;
    }
  }

  private _updateProgressBar (width: number) {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.style.width = `${width}%`;
  }
}
