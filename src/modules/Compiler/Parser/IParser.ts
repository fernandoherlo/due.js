import { IApp } from '~/src/vite-env';

export interface IParser {
  _app: IApp;

  line: (line: string) => Array<string>;
  command: (command: string) => undefined | object;
}
