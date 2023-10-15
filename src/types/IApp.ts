import { ICompiler, IDebugger, IDue, IEditor, IErrorHandler, ILogger, IStore } from '~/src/vite-env';

export interface IApp {
  $debug: boolean;
  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler
  $debugger: IDebugger;

  $compiler: ICompiler | undefined;
  $editor: IEditor | undefined;
  $proxy: IDue | undefined;

  $valueFactory: any | undefined;
  $variables: any;
  $variablesLive: any;
  $variablesLiveMap: any;

  _steps: number;
  _totalSteps: number;
  _lastInstructions: any;

  start: () => void;
  toggle: () => void;
  compile: () => void;
}
