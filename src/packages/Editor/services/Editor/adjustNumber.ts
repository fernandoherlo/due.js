import { EditorSelection } from '@codemirror/state';
import type { Command } from '@codemirror/view';

export interface INumberEdit {
  from: number;
  to: number;
  insert: string;
}

// Un numero pegado a una letra, # o $ forma parte de un nombre (sam1, C4, A#3, $low2), no es un valor.
export function adjustNumber (text: string, column: number, direction: 1 | -1): INumberEdit | null {
  for (const match of text.matchAll(/\d+(?:\.\d+)?/g)) {
    const start = match.index;
    const end = start + match[0].length;
    if (column < start || column > end || /[\w#$.]/.test(text[start - 1] ?? '')) continue;

    const decimals = match[0].split('.')[1]?.length ?? 0;
    const previous = text[start - 1];
    const negative = previous === '-' && !/[\w\])]/.test(text[start - 2] ?? '');
    const upperBound = previous === '-' && !negative;
    const current = (negative ? -1 : 1) * parseFloat(match[0]);
    let next = current + direction * (decimals ? 0.1 : 1);
    if (upperBound) next = Math.max(next, 0);

    const insert = decimals ? next.toFixed(decimals) : String(next);
    return { from: negative ? start - 1 : start, to: end, insert };
  }
  return null;
}

export function adjustNumberAtCursor (direction: 1 | -1): Command {
  return (view) => {
    const { state } = view;
    const changes = [];
    const ranges = [];
    for (const range of state.selection.ranges) {
      const line = state.doc.lineAt(range.head);
      const edit = adjustNumber(line.text, range.head - line.from, direction);
      if (!edit) {
        ranges.push(range);
        continue;
      }
      changes.push({ from: line.from + edit.from, to: line.from + edit.to, insert: edit.insert });
      ranges.push(EditorSelection.cursor(line.from + edit.from + edit.insert.length));
    }
    if (changes.length) {
      view.dispatch({ changes, selection: EditorSelection.create(ranges, state.selection.mainIndex), userEvent: 'input' });
    }
    return true;
  };
}
