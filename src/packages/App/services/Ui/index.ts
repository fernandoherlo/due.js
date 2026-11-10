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
    const toggle = async () => {
      if (this.app.$music) {
        await this.app.$music.toggle();
      }
    };
    togglePlay.onclick = toggle;

    const save: HTMLDivElement | null = document.getElementById('save') as HTMLDivElement;
    const compile = async () => {
      await this.app.compile();
    };
    save.onclick = compile;

    const auto: HTMLButtonElement = document.getElementById('auto') as HTMLButtonElement;
    auto.onclick = () => {
      const enabled = !auto.classList.contains('active');
      auto.classList.toggle('active', enabled);
      auto.setAttribute('aria-pressed', String(enabled));
      this.app.setAutoCompile(enabled);
    };

    document.addEventListener('keydown', (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.code === 'KeyS') {
        event.preventDefault();
        compile();
        return;
      }
      // Fuera del editor y de botones, donde Space escribe o pulsa.
      const target = event.target as HTMLElement;
      if (event.code === 'Space' && !event.repeat && !target.closest('.cm-editor, button, input, textarea')) {
        event.preventDefault();
        toggle();
      }
    });

    const menu: HTMLDivElement | null = document.getElementById('menu') as HTMLDivElement;
    menu.onclick = () => {};

    const debug: HTMLDivElement | null = document.getElementById('debug') as HTMLDivElement;
    debug.onclick = () => {
      const debuggerElement: HTMLDivElement | null = document.getElementById('debugger') as HTMLDivElement;
      debuggerElement.classList.toggle('show');
    };
  }

  setMidiUnavailable (reason: string): void {
    const status = document.querySelector<HTMLElement>('#midi-status')!;
    status.hidden = false;
    status.textContent = 'MIDI off';
    status.title = reason;
    status.setAttribute('aria-label', `MIDI unavailable: ${reason}`);
  }

  setOk () {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('ok');

    clearTimeout(this.idTimeoutValid);
    this.idTimeoutValid = window.setTimeout(() => {
      progressBarEditorElement.className = '';
    }, 250);
  }

  setValid () {
    clearTimeout(this.idTimeoutValid);
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('valid');
  }

  setError () {
    clearTimeout(this.idTimeoutValid);
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.className = '';
    progressBarEditorElement.classList.add('error');
    progressBarEditorElement.style.width = '100%';
  }

  setWaiting () {
    clearTimeout(this.idTimeoutValid);
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
