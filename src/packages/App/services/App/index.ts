import type { IApp, ILogger, IStore, IErrorHandler, IDebugger, IMusic, ICompiler, IEditor, IUi, IMidiIn } from '~/src/types';
import Logger from '../Logger';
import Store from '../Store';
import ErrorHandler from '../Error/handler';
import Debugger from '../Debugger';
import Ui from '../Ui';
import { AUTO_COMPILE_DELAY_MS, LOCAL_STORAGE_KEY_CODE } from '../../constants';

export default class App implements IApp {
  __debugEnabled: boolean;
  __logEnabled: boolean;

  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler;
  $debugger: IDebugger;
  $ui: IUi;

  $compiler: ICompiler | undefined;
  $editor: IEditor | undefined;
  $music: IMusic | undefined;

  $variables: Record<string, string> = {};
  $variablesLive: Record<string, IMidiIn> = {};
  $variablesLiveMap: Record<string, any> = {};

  private compileQueue: Promise<void> = Promise.resolve();
  private autoCompile: boolean = false;
  private autoCompileTimer: number | undefined;

  constructor (debug: boolean = true) {
    this.__debugEnabled = debug;
    this.__logEnabled = true;

    this.$logger = new Logger(this);
    this.$store = new Store();
    this.$error = new ErrorHandler(this);
    this.$debugger = new Debugger(this);
    this.$ui = new Ui(this);
  }

  async start () {
    if (!this.$editor || !this.$music) {
      throw Error('No services set.');
    }

    this.$editor.create();
    await this.$music.start();
    await this.$ui.start();
  }

  compile (): Promise<void> {
    const compilation = this.compileQueue.then(() => this.compileCurrent(false));
    this.compileQueue = compilation.catch(() => {});
    return compilation;
  }

  setAutoCompile (enabled: boolean): void {
    this.autoCompile = enabled;
    clearTimeout(this.autoCompileTimer);
  }

  onCodeChange (): void {
    if (!this.autoCompile) return;

    clearTimeout(this.autoCompileTimer);
    this.autoCompileTimer = window.setTimeout(() => {
      const compilation = this.compileQueue.then(() => this.autoCompile ? this.compileCurrent(true) : undefined);
      this.compileQueue = compilation.catch(() => {});
      // El editor ya marca el error; una compilacion automatica fallida no debe interrumpir la escritura.
      compilation.catch((error: unknown) => this.$logger.log(error));
    }, AUTO_COMPILE_DELAY_MS);
  }

  private async compileCurrent (quantized: boolean): Promise<void> {
    if (!this.$compiler || !this.$editor || !this.$music) {
      throw Error('No services set.');
    }

    try {
      this.$ui.setWaiting();
      const editorCode = this.$editor.getCode();

      if (editorCode !== undefined) {
        const plan = this.$compiler.prepare(editorCode);
        this.$music.validate([...plan.addedInstructions, ...plan.updatedInstructions]);

        if (quantized) {
          await this.$music.waitForNextBar(plan.bpm);
        }

        await this.$music.add(plan.addedInstructions);
        await this.$music.update(plan.updatedInstructions);
        await this.$music.delete(plan.deletedInstructions);

        this.$compiler.commit(plan);
        this.$music.setTempo(plan.bpm);
        this.$editor.setPatternSource(editorCode);

        this.$ui.setOk();

        this.saveInLocalStorage(LOCAL_STORAGE_KEY_CODE, editorCode);
      }
    } catch (error: unknown) {
      this.$ui.setError();
      throw error;
    }
  }

  private saveInLocalStorage (key: string, value: string) {
    localStorage.setItem(key, value || '');
  }

  getFromLocalStorage (key: string): string | null {
    return localStorage.getItem(key);
  }
}
