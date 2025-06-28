import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { syntaxHighlighting } from '@codemirror/language';
import { sassLanguage } from '@codemirror/lang-sass';

import { DueTheme, DueThemeHighlightStyle } from '../../constants/theme';

import type { IApp, IEditor } from '~/src/types';
import { LOCAL_STORAGE_KEY_CODE } from '~/src/packages/App/constants';

export default class Editor implements IEditor {
  private app: IApp;
  private editor: EditorView | null;

  constructor (app: IApp) {
    this.app = app;
    this.editor = null;
  }

  create () {
    const code = this.app.getFromLocalStorage(LOCAL_STORAGE_KEY_CODE) || undefined;

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

    this.editor = new EditorView({
      state: startState
    });

    const editorViewElement: HTMLDivElement | null = document.getElementById('editor-view') as HTMLDivElement;
    editorViewElement.append(this.editor.dom);
  }

  getCode (): string | undefined {
    return this.editor?.state.doc.toString();
  }
}
