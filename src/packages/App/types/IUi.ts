import { IApp } from '~/src/vite-env';

export interface IUi {
  _app: IApp;
  _htmlIdProgressBar: string;
  _idTimeoutValid: number | undefined;
  _steps: number;
  _totalSteps: number;

  start: () => Promise<void>;

  setOk: () => void;
  setValid: () => void;
  setError: () => void;
  setWaiting: () => void;

  updateLoopTime: () => void;
  updateSteps: () => void;
}
