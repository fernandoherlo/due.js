import { IDebugger, IDue, IErrorHandler, ILogger, ILooper, IStore } from '~/src/vite-env';

export interface IApp {
  $debug: boolean;
  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler
  $debugger: IDebugger;
  $looper: ILooper;
  $proxy: IDue | undefined;
  $valueFactory: any | undefined;
  $variables: any;
  $variablesLive: any;
  $variablesLiveMap: any;
}
