import { IApp, ICompiler, IEditor } from '~/src/vite-env';

export interface ILooper {
  _app: IApp;
  _steps: number;
  _totalSteps: number;
  _lastInstructions: any;

  _compiler: ICompiler;
  _editor: IEditor;

  start: () => void;
  compile: () => void;
  toggle: () => void;
}
