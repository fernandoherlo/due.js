import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { IApp } from '~/src/vite-env';

export interface IEditor {
  _app: IApp;
  _monaco: monaco.editor.IStandaloneCodeEditor | null;

  create: () => void;
  getCode: () => string | undefined;
}
