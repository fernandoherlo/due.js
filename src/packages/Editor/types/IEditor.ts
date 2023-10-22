import { IApp } from '~/src/vite-env';

export interface IEditor {
  _app: IApp;
  _editor: any | null;

  create: () => void;
  getCode: () => string | undefined;
}
