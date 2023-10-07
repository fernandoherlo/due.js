import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import { IApp } from '~/src/vite-env';

export interface IEditor {
  _app: IApp;
  _htmlId: string;
  _htmlIdProgressBar: string;
  _idTimeoutValid: number | undefined;
  _monaco: monaco.editor.IStandaloneCodeEditor | null;

  create: () => void;
  getCode: () => string | undefined;
  ok: () => void;
  setLoopTime: (steps: number, totalSteps: number) => void;
  setValid: () => void;
  setError: () => void;
  setWaiting: () => void;
}
