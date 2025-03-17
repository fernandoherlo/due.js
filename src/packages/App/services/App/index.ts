import { IApp, ILogger, IStore, IErrorHandler, IDebugger, IMusic, ICompiler, IEditor, IUi, IValueFactory, IMidiIn } from '~/src/vite-env';
import Logger from '../Logger';
import Store from '../Store';
import ErrorHandler from '../Error/handler';
import Debugger from '../Debugger';
import Ui from '../Ui';
import { LOCAL_STORAGE_KEY_CODE } from '../../constants';

export default class App implements IApp {
  $debugEnabled: boolean;
  $logEnabled: boolean;
  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler;
  $debugger: IDebugger;
  $ui: IUi;

  $compiler: ICompiler | undefined;
  $editor: IEditor | undefined;
  $music: IMusic | undefined;

  $valueFactory: IValueFactory | undefined;

  $variables: Record<string, string> = {};
  $variablesLive: Record<string, IMidiIn> = {};
  $variablesLiveMap: Record<string, any> = {};

  constructor (debug: boolean = true) {
    this.$debugEnabled = debug;
    this.$logEnabled = true;

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

  async compile () {
    if (!this.$compiler || !this.$editor || !this.$music) {
      throw Error('No services set.');
    }

    try {
      this.$ui.setWaiting();
      const editorCode = this.$editor.getCode();

      if (editorCode) {
        const [, addedInstructions, updatedInstructions, deletedInstructions] = this.$compiler.exec(editorCode);

        await this.$music.add(addedInstructions);
        await this.$music.update(updatedInstructions);
        await this.$music.delete(deletedInstructions);

        this.$ui.setOk();

        this.saveInLocalStorage(LOCAL_STORAGE_KEY_CODE, editorCode);
      }
    } catch (e: any) {
      this.$ui.setError();
      throw Error(`Error in proxy composer. ${e.message}`);
    }
  }

  saveInLocalStorage (key: string, value: any) {
    localStorage.setItem(key, value || '');
  }

  getFromLocalStorage (key: string) {
    return localStorage.getItem(key);
  }
}
