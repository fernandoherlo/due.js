import type { IApp, IUi } from '~/src/types';

export default class Ui implements IUi {
  private app: IApp;
  private htmlIdProgressBar: string;
  private idTimeoutValid: number | undefined;

  private steps: number;
  private totalSteps: number;

  constructor (app: IApp) {
    this.app = app;
    this.htmlIdProgressBar = 'progress-bar';
    this.idTimeoutValid = undefined;

    this.steps = 1;
    this.totalSteps = 4;
  }

  async start () {
    const togglePlay: HTMLDivElement | null = document.getElementById('toggle') as HTMLDivElement;
    togglePlay.onclick = async () => {
      if (this.app.$music) {
        await this.app.$music.toggle();
      }
    };

    const save: HTMLDivElement | null = document.getElementById('save') as HTMLDivElement;
    save.onclick = async () => {
      await this.app.compile();
    };

    const menu: HTMLDivElement | null = document.getElementById('menu') as HTMLDivElement;
    menu.onclick = () => {};

    const debug: HTMLDivElement | null = document.getElementById('debug') as HTMLDivElement;
    debug.onclick = () => {
      const debuggerElement: HTMLDivElement | null = document.getElementById('debugger') as HTMLDivElement;
      debuggerElement.classList.toggle('show');
    };
  }

  setOk () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('ok');

    clearInterval(this.idTimeoutValid);
    this.idTimeoutValid = window.setTimeout(() => {
      progressBarEditorElement.className = '';
    }, 250);
  }

  setValid () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('valid');
  }

  setError () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('error');
  }

  setWaiting () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('wait');
  }

  updateLoopTime () {
    const percentage: number = (this.steps * 100) / this.totalSteps;
    this.updateProgressBar(Math.ceil(percentage));
  }

  updateSteps () {
    if (this.steps === this.totalSteps) {
      this.steps = 1;
    } else {
      this.steps++;
    }
  }

  private updateProgressBar (width: number) {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.style.width = `${width}%`;
  }
}
