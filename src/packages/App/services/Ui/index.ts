import { IApp, IUi } from '~/src/vite-env';

export default class Ui implements IUi {
  _app: IApp;
  _htmlId: string;
  _htmlIdProgressBar: string;
  _idTimeoutValid: number | undefined;

  _steps: number;
  _totalSteps: number;

  constructor (app: IApp, htmlId: string = 'editor') {
    this._app = app;
    this._htmlId = htmlId;
    this._htmlIdProgressBar = `${this._htmlId}-progress-bar`;
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

  _updateProgressBar (width: number) {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.style.width = `${width}%`;
  }
}
