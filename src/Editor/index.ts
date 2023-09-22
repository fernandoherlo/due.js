import { IApp } from '../vite-env';
import { IEditor } from './IEditor';

export default class Editor implements IEditor {
  _app: IApp;
  _htmlId: string;
  _htmlIdCode: string;
  _htmlIdProgressBar: string;
  _idTimeoutValid: number | undefined;

  constructor (app: IApp, htmlId: string) {
    this._app = app;
    this._htmlId = htmlId;
    this._htmlIdCode = `${this._htmlId}-code`;
    this._htmlIdProgressBar = `${this._htmlId}-progress-bar`;
    this._idTimeoutValid = undefined;
  }

  getCode (): string {
    const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    return textAreaEditorElement.value;
  }

  ok () {
    const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    textAreaEditorElement.style.backgroundColor = '#03fc45';

    clearInterval(this._idTimeoutValid);
    this._idTimeoutValid = setTimeout(() => {
      textAreaEditorElement.style.backgroundColor = '';
    }, 150);
  }

  setLoopTime (steps: number, totalSteps: number) {
    const percentage: number = (steps * 100) / totalSteps;
    this._updateProgressBar(Math.ceil(percentage));
  }

  _updateProgressBar (width: number) {
    const progressBarEditorElement: HTMLDivElement | null = document.getElementById(this._htmlIdProgressBar) as HTMLDivElement;
    progressBarEditorElement.style.width = `${width}%`;
  }

  setValid () {
    const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    textAreaEditorElement.style.backgroundColor = '';
  }

  setError () {
    const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    textAreaEditorElement.style.backgroundColor = '#CC0000';
  }

  setWaiting () {
    const textAreaEditorElement: HTMLTextAreaElement | null = document.getElementById(this._htmlIdCode) as HTMLTextAreaElement;
    textAreaEditorElement.style.backgroundColor = '#f8fc03';
  }
}
