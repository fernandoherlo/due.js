import type { IApp, IUi } from '~/src/types';
export default class Ui implements IUi {
  private app: IApp;
  private htmlIdProgressBar: string;
  private idTimeoutValid: number | undefined;
  private patternStepTimeouts: Map<string, number>;

  constructor (app: IApp) {
    this.app = app;
    this.htmlIdProgressBar = 'progress-bar';
    this.idTimeoutValid = undefined;
    this.patternStepTimeouts = new Map();
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
      setAutoCompile(!auto.classList.contains('active'));
    };

    const autoOption = document.getElementById('option-auto-compile') as HTMLInputElement;
    const setAutoCompile = (enabled: boolean) => {
      auto.classList.toggle('active', enabled);
      auto.setAttribute('aria-pressed', String(enabled));
      this.app.setAutoCompile(enabled);
    };
    autoOption.onchange = () => setAutoCompile(autoOption.checked);

    const debug: HTMLButtonElement = document.getElementById('debug') as HTMLButtonElement;
    const debuggerElement: HTMLDivElement = document.getElementById('debugger') as HTMLDivElement;
    const appElement: HTMLDivElement = document.getElementById('app') as HTMLDivElement;
    const debuggerOption = document.getElementById('option-debugger') as HTMLInputElement;
    const setDebuggerVisible = (visible: boolean) => {
      debuggerElement.classList.toggle('show', visible);
      appElement.classList.toggle('debugger-visible', visible);
      debug.classList.toggle('active', visible);
      debug.setAttribute('aria-pressed', String(visible));
      debuggerOption.checked = visible;
    };
    debug.onclick = () => setDebuggerVisible(!debuggerElement.classList.contains('show'));
    debuggerOption.onchange = () => setDebuggerVisible(debuggerOption.checked);

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

    const menu = document.getElementById('menu') as HTMLButtonElement;
    const optionsDialog = document.getElementById('app-options') as HTMLDialogElement;
    optionsDialog.addEventListener('close', () => {
      menu.setAttribute('aria-expanded', 'false');
    });
    menu.onclick = () => {
      autoOption.checked = auto.classList.contains('active');
      debuggerOption.checked = debuggerElement.classList.contains('show');
      menu.setAttribute('aria-expanded', 'true');
      optionsDialog.showModal();
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

  updateLoopTime (progress: number): void {
    this.updateProgressBar(Math.ceil(progress));
  }

  updatePatternStep (key: string, step: number, duration: number): void {
    this.clearPatternStepTimeout(key);
    if (duration <= 0) {
      this.app.$editor?.clearActivePatternStep(key);
      return;
    }

    this.app.$editor?.setActivePatternStep(key, step);
    const timeout = window.setTimeout(() => {
      this.patternStepTimeouts.delete(key);
      this.app.$editor?.clearActivePatternStep(key);
    }, duration * 1000);
    this.patternStepTimeouts.set(key, timeout);
  }

  clearPatternStep (key: string): void {
    this.clearPatternStepTimeout(key);
    this.app.$editor?.clearActivePatternStep(key);
  }

  clearActiveSteps (): void {
    for (const key of this.patternStepTimeouts.keys()) this.clearPatternStepTimeout(key);
    this.app.$editor?.clearActivePatternSteps();
  }

  private clearPatternStepTimeout (key: string): void {
    const timeout = this.patternStepTimeouts.get(key);
    if (timeout === undefined) return;
    clearTimeout(timeout);
    this.patternStepTimeouts.delete(key);
  }

  private updateProgressBar (width: number) {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this.htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.style.width = `${width}%`;
  }
}
