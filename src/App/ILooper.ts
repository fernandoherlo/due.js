import { IApp, ICompiler, IEditor } from '../vite-env';

export interface ILooper {
  _app: IApp;
  _steps: number;
  _totalSteps: number;
  _lastInstructions: any;

  _compiler: ICompiler;
  _editor: IEditor;

  loop: () => void;
  compile: () => void;
  toggle: () => void;
}
