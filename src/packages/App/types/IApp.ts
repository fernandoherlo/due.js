import type { ICompiler, IDebugger, IMusic, IEditor, IErrorHandler, ILogger, IStore, IUi, IValueFactory, IMidiIn } from '~/src/types';

export interface IApp {
  __debugEnabled: boolean;
  __logEnabled: boolean;

  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler
  $debugger: IDebugger;
  $ui: IUi;

  $compiler: ICompiler | undefined;
  $editor: IEditor | undefined;
  $music: IMusic | undefined;

  $valueFactory: IValueFactory | undefined;

  $variables: Record<string, string>;
  $variablesLive: Record<string, IMidiIn>;
  $variablesLiveMap: Record<string, any>;

  start: () => Promise<void>;
  compile: () => Promise<void>;

  saveInLocalStorage: (key: string, value: any) => void;
  getFromLocalStorage: (key: string) => string | null;
}
