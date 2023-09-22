import { IApp } from '../../vite-env';

export interface IDebugger {
  _app: IApp;
  _debug: boolean;
  _htmlId: string;

  add: (title: string, string: string) => void;
}
