import { defaultKeymap, history, historyKeymap, toggleComment } from '@codemirror/commands';
import { syntaxHighlighting } from '@codemirror/language';
import { linter, lintGutter } from '@codemirror/lint';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { LOCAL_STORAGE_KEY_CODE } from '~/src/packages/App/constants';
import { DueLanguage } from '~/src/packages/Editor/constants/language';
import { DueTheme, DueThemeHighlightStyle } from '~/src/packages/Editor/constants/theme';
import {
  activePatternHighlight,
  clearActivePatternStep,
  clearActivePatternSteps,
  setActivePatternStep,
  setPatternSource
} from '~/src/packages/Editor/services/Editor/activeTrack';
import { getDiagnostics } from '~/src/packages/Editor/services/Editor/diagnostics';
import { adjustNumberAtCursor } from '~/src/packages/Editor/services/Editor/adjustNumber';
import { muteGutter, toggleMuteSelection } from '~/src/packages/Editor/services/Editor/muteGutter';
import type { IApp, IEditor } from '~/src/types';

export default class Editor implements IEditor {
  private app: IApp;
  private editor: EditorView | null;

  constructor (app: IApp) {
    this.app = app;
    this.editor = null;
  }

  create () {
    const code = this.app.getFromLocalStorage(LOCAL_STORAGE_KEY_CODE) || undefined;

    const theme = EditorView.theme(DueTheme, { dark: true });
    let hasSyntaxError = false;

    const startState = EditorState.create({
      doc: code,
      extensions: [
        history(),
        keymap.of([
          { key: 'Mod-/', run: toggleComment },
          { key: 'Mod-Shift-m', preventDefault: true, run: toggleMuteSelection(this.app) },
          { key: 'Mod-Alt-ArrowUp', run: adjustNumberAtCursor(1) },
          { key: 'Mod-Alt-ArrowDown', run: adjustNumberAtCursor(-1) },
          { key: 'Mod-Enter', run: () => { this.app.$music?.toggle(); return true; } },
          // En teclado español "/" es Shift+7.
          { key: 'Mod-Shift-7', run: toggleComment, preventDefault: true },
          ...defaultKeymap,
          ...historyKeymap
        ]),
        lineNumbers(),
        activePatternHighlight,
        muteGutter(this.app),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) this.app.onCodeChange();
        }),
        DueLanguage,
        lintGutter(),
        linter((view) => {
          const diagnostics = getDiagnostics(view.state);
          if (diagnostics.length) {
            this.app.$ui.setError();
          } else if (hasSyntaxError) {
            this.app.$ui.setValid();
          }
          hasSyntaxError = diagnostics.length > 0;
          return diagnostics;
        }, { delay: 200 }),
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

  setPatternSource (source: string): void {
    this.editor?.dispatch({ effects: setPatternSource.of(source) });
  }

  setActivePatternStep (key: string, step: number): void {
    this.editor?.dispatch({ effects: setActivePatternStep.of({ key, step }) });
  }

  clearActivePatternStep (key: string): void {
    this.editor?.dispatch({ effects: clearActivePatternStep.of(key) });
  }

  clearActivePatternSteps (): void {
    this.editor?.dispatch({ effects: clearActivePatternSteps.of(null) });
  }
}
