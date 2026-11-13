import type { ICompiler, IDebugger, IMusic, IEditor, IErrorHandler, ILogger, IStore, IUi, IMidiIn } from '~/src/types';
import type { ILiveVariableRegistry } from '~/src/packages/App/types/ILiveVariableRegistry';

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

  $variables: Record<string, string>;
  $variablesLive: Record<string, IMidiIn>;
  $liveVariableRegistry: ILiveVariableRegistry;

  start: () => Promise<void>;
  compile: () => Promise<void>;
  setAutoCompile: (enabled: boolean) => void;
  onCodeChange: () => void;

  getFromLocalStorage: (key: string) => string | null;
}
