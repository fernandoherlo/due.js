import { IApp, ILogger, IStore, IErrorHandler, IDebugger, ILooper, IProxy } from '~/src/vite-env';
import Logger from './Logger';
import Store from './Store';
import ErrorHandler from './Error/handler';
import Debugger from './Debugger';
import Looper from './looper';

import CompilerFactory from '~/src/modules/Compiler/factory';
import EditorFactory from '~/src/modules/Editor/factory';

export default class App implements IApp {
  $debug: boolean;
  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler;
  $debugger: IDebugger;
  $looper: ILooper;
  $proxy: IProxy | undefined;
  $valueFactory: any | undefined;

  constructor (debug: boolean = true, debuggerHtmlId: string = 'debugger') {
    this.$debug = debug;

    this.$logger = new Logger(this);
    this.$store = new Store(this);
    this.$error = new ErrorHandler(this);

    this.$debugger = new Debugger(this, debuggerHtmlId);

    const compiler = CompilerFactory(this);
    const editor = EditorFactory(this);

    this.$looper = new Looper(this, compiler, editor);
  }
}
