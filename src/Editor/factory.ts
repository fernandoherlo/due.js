import { IApp } from '../vite-env';
import Editor from './';

export default function EditorFactory (app: IApp, htmlId: string = 'editor') {
  return new Editor(app, htmlId);
}
