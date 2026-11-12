import { EditorView, ViewPlugin } from '@codemirror/view';
import type { ViewUpdate } from '@codemirror/view';

export const codeMinimap = ViewPlugin.fromClass(class {
  private readonly view: EditorView;
  private readonly dom: HTMLDivElement;
  private bars: HTMLSpanElement[] = [];
  private visibleStart = 0;
  private visibleEnd = 0;
  private cursorLine = 0;

  constructor (view: EditorView) {
    this.view = view;
    this.dom = document.createElement('div');
    this.dom.className = 'cm-minimap';
    this.view.scrollDOM.id = 'editor-scroll-area';
    this.dom.setAttribute('role', 'scrollbar');
    this.dom.setAttribute('aria-label', 'Code minimap');
    this.dom.setAttribute('aria-controls', this.view.scrollDOM.id);
    this.dom.setAttribute('aria-orientation', 'vertical');
    this.dom.setAttribute('tabindex', '0');
    this.dom.addEventListener('click', this.onClick);
    this.dom.addEventListener('keydown', this.onKeyDown);
    this.view.scrollDOM.addEventListener('scroll', this.onScroll, { passive: true });
    this.view.dom.append(this.dom);
    this.render();
  }

  update (update: ViewUpdate): void {
    if (update.docChanged) this.render();
    else if (update.viewportChanged || update.selectionSet) this.updateViewport();
  }

  destroy (): void {
    this.dom.removeEventListener('click', this.onClick);
    this.dom.removeEventListener('keydown', this.onKeyDown);
    this.view.scrollDOM.removeEventListener('scroll', this.onScroll);
    this.view.dom.classList.remove('cm-no-minimap');
    this.dom.remove();
  }

  private render (): void {
    const { state } = this.view;
    const lineCount = state.doc.lines;
    let longestLine = 1;
    for (let number = 1; number <= lineCount; number++) {
      longestLine = Math.max(longestLine, state.doc.line(number).length);
    }
    const fragment = document.createDocumentFragment();
    this.bars = [];

    for (let number = 1; number <= lineCount; number++) {
      const line = state.doc.line(number);
      const bar = document.createElement('span');
      bar.className = 'cm-minimap-line';
      if (line.text.trimStart().startsWith('//')) bar.classList.add('cm-minimap-comment');
      if (/^\s*(?:sam|n|mo)\d+/.test(line.text)) bar.classList.add('cm-minimap-track');
      bar.style.inlineSize = `${Math.max(12, Math.round((line.length / longestLine) * 100))}%`;
      bar.setAttribute('aria-hidden', 'true');
      this.bars.push(bar);
      fragment.append(bar);
    }

    this.dom.replaceChildren(fragment);
    this.dom.hidden = lineCount < 8;
    this.view.dom.classList.toggle('cm-no-minimap', lineCount < 8);
    this.dom.setAttribute('aria-valuemin', '1');
    this.dom.setAttribute('aria-valuemax', String(lineCount));
    this.visibleStart = 0;
    this.visibleEnd = 0;
    this.cursorLine = 0;
    this.updateViewport();
  }

  private updateViewport (): void {
    const { state, viewport } = this.view;
    const firstVisible = state.doc.lineAt(viewport.from).number;
    const lastVisible = state.doc.lineAt(viewport.to).number;
    const activeLine = state.doc.lineAt(state.selection.main.head).number;
    this.dom.setAttribute('aria-valuenow', String(activeLine));
    this.dom.setAttribute('aria-valuetext', `Line ${activeLine} of ${state.doc.lines}`);

    this.setRangeClass(this.visibleStart, this.visibleEnd, 'cm-minimap-visible', false);
    this.setRangeClass(firstVisible, lastVisible, 'cm-minimap-visible', true);
    if (this.cursorLine > 0) this.bars[this.cursorLine - 1]?.classList.remove('cm-minimap-cursor');
    this.bars[activeLine - 1]?.classList.add('cm-minimap-cursor');
    this.visibleStart = firstVisible;
    this.visibleEnd = lastVisible;
    this.cursorLine = activeLine;
  }

  private setRangeClass (from: number, to: number, className: string, enabled: boolean): void {
    for (let number = from; number <= to; number++) {
      this.bars[number - 1]?.classList.toggle(className, enabled);
    }
  }

  private goToLine (number: number): void {
    const bounded = Math.max(1, Math.min(this.view.state.doc.lines, number));
    const position = this.view.state.doc.line(bounded).from;
    this.view.dispatch({
      selection: { anchor: position },
      effects: EditorView.scrollIntoView(position, { y: 'center' })
    });
    this.view.focus();
    this.updateViewport();
  }

  private readonly onClick = (event: MouseEvent): void => {
    const bounds = this.dom.getBoundingClientRect();
    if (!bounds.height) return;
    const ratio = (event.clientY - bounds.top) / bounds.height;
    this.goToLine(Math.floor(ratio * this.view.state.doc.lines) + 1);
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const currentLine = Number(this.dom.getAttribute('aria-valuenow')) || 1;
    const firstVisible = this.view.state.doc.lineAt(this.view.viewport.from).number;
    const lastVisible = this.view.state.doc.lineAt(this.view.viewport.to).number;
    const pageSize = Math.max(1, lastVisible - firstVisible);
    const targets: Record<string, number> = {
      ArrowDown: currentLine + 1,
      ArrowUp: currentLine - 1,
      PageDown: currentLine + pageSize,
      PageUp: currentLine - pageSize,
      Home: 1,
      End: this.view.state.doc.lines
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    this.goToLine(target);
  };

  private readonly onScroll = (): void => {
    this.updateViewport();
  };
});
