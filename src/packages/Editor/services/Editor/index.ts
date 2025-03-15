import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { syntaxHighlighting } from '@codemirror/language';
import { sassLanguage } from '@codemirror/lang-sass';

import { DueTheme, DueThemeHighlightStyle } from '../../constants/theme';

import { IApp, IEditor } from '~/src/vite-env';
import { LOCAL_STORAGE_KEY_CODE } from '~/src/packages/App/constants';

export default class Editor implements IEditor {
  private _app: IApp;
  private _editor: EditorView | null;

  constructor (app: IApp) {
    this._app = app;
    this._editor = null;
  }

  create () {
    const code = this._app.getFromLocalStorage(LOCAL_STORAGE_KEY_CODE) || undefined;

    const theme = EditorView.theme(DueTheme);

    const startState = EditorState.create({
      doc: code,
      extensions: [
        lineNumbers(),
        sassLanguage,
        theme,
        syntaxHighlighting(DueThemeHighlightStyle)
      ]
    });

    this._editor = new EditorView({
      state: startState
    });

    const editorViewElement: HTMLDivElement | null = document.getElementById('editor-view') as HTMLDivElement;
    editorViewElement.append(this._editor.dom);
  }

  getCode (): string | undefined {
    return this._editor?.state.doc.toString();
  }
}
