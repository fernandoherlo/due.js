import { IApp } from '../vite-env';

export interface IEditor {
  _app: IApp;
  _htmlId: string;
  _htmlIdCode: string;
  _htmlIdProgressBar: string;
  _idTimeoutValid: number | undefined;

  getCode: () => string;
  ok: () => void;
  setLoopTime: (steps: number, totalSteps: number) => void;
  setValid: () => void;
  setError: () => void;
  setWaiting: () => void;
}
