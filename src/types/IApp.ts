import { IDebugger, IErrorHandler, ILogger, ILooper, IProxy, IStore } from '~/src/vite-env';

export interface IApp {
  $debug: boolean;
  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler
  $debugger: IDebugger;
  $looper: ILooper;
  $proxy: IProxy | undefined;
  $valueFactory: any | undefined;
  $variables: any;
  $variablesLive: any;
  $variablesLiveMap: any;
}
