import type { IApp, ILogger, IStore, IErrorHandler, IDebugger, IMusic, ICompiler, IEditor, IUi, IMidiIn } from '~/src/types';
import { stringify } from 'flatted';
import Logger from '../Logger';
import Store from '../Store';
import ErrorHandler from '../Error/handler';
import Debugger from '../Debugger';
import Ui from '../Ui';
import { LOCAL_STORAGE_KEY_CODE } from '../../constants';

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
    const compilation = this.compileQueue.then(() => this.compileCurrent());
    this.compileQueue = compilation.catch(() => {});
    return compilation;
  }

  private async compileCurrent (): Promise<void> {
    if (!this.$compiler || !this.$editor || !this.$music) {
      throw Error('No services set.');
    }

    try {
      this.$ui.setWaiting();
      const editorCode = this.$editor.getCode();

      if (editorCode !== undefined) {
        const plan = this.$compiler.prepare(editorCode);
        this.$music.validate([...plan.addedInstructions, ...plan.updatedInstructions]);

        await this.$music.add(plan.addedInstructions);
        await this.$music.update(plan.updatedInstructions);
        await this.$music.delete(plan.deletedInstructions);

        this.$compiler.commit(plan);

        this.$ui.setOk();

        this.saveInLocalStorage(LOCAL_STORAGE_KEY_CODE, editorCode);
      }
    } catch (e: unknown) {
      this.$ui.setError();
      throw Error(`Error in proxy composer. ${stringify(e)}`);
    }
  }

  private saveInLocalStorage (key: string, value: string) {
    localStorage.setItem(key, value || '');
  }

  getFromLocalStorage (key: string): string | null {
    return localStorage.getItem(key);
  }
}
