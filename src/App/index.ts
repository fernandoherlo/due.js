import * as Tone from 'tone';
import { IApp, ILogger, IStore, IErrorHandler, IDebugger, ILooper, IProxy } from '../vite-env';
import Logger from './Logger';
import Store from './Store';
import ErrorHandler from './Error/handler';
import Debugger from './Debugger';
import Looper from './looper';

import CompilerFactory from '../Compiler/factory';
import EditorFactory from '../Editor/factory';

export default class App implements IApp {
  $debug: boolean;
  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler;
  $debugger: IDebugger;
  $looper: ILooper;
  $proxy: IProxy | undefined;

  constructor (debug: boolean = true, debuggerHtmlId: string = 'debugger') {
    this.$debug = debug;

    this.$logger = new Logger(this);
    this.$store = new Store(this);
    this.$error = new ErrorHandler(this);

    this.$debugger = new Debugger(this, debuggerHtmlId);

    const compiler = CompilerFactory(this);
    const editor = EditorFactory(this);

    this.$looper = new Looper(this, compiler, editor);

    const container = window || {};
    container.onclick = async () => {
      await Tone.start();
      return false;
    };
  }
}
