import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { highlightTree, tagHighlighter, tags } from '@lezer/highlight';
import { describe, expect, it, vi } from 'vitest';
import { DueLanguage } from '~/src/packages/Editor/constants/language';
import Editor from '~/src/packages/Editor/services/Editor';
import { getDiagnostics } from '~/src/packages/Editor/services/Editor/diagnostics';

const mockApp = {
  getFromLocalStorage: vi.fn()
};

const highlighter = tagHighlighter([
  { tag: tags.keyword, class: 'command' },
  { tag: tags.variableName, class: 'variable' },
  { tag: tags.labelName, class: 'preset' },
  { tag: tags.atom, class: 'note' },
  { tag: tags.number, class: 'number' },
  { tag: tags.operator, class: 'operator' },
  { tag: tags.separator, class: 'separator' },
  { tag: tags.comment, class: 'comment' }
]);

function highlight (source) {
  const state = EditorState.create({ doc: source, extensions: [DueLanguage] });
  const tokens = [];
  highlightTree(syntaxTree(state), highlighter, (from, to, type) => {
    tokens.push({ text: source.slice(from, to), type });
  });
  return tokens;
}

describe('Editor', () => {
  it('Create new instance', () => {
    // Arrange
    const editor = new Editor(mockApp);
    // Activate
    // Assert
    expect(editor.editor).toBeNull();
  });

  it('highlights due.js commands, values and inline comments', () => {
    const source = '$bajo=24\nsam3#tom([A2>C2];[1-3];2):d(64;0.3):v($bajo) // percussion';

    const tokens = highlight(source);

    expect(tokens).toEqual(expect.arrayContaining([
      { text: '$bajo', type: 'variable' },
      { text: '24', type: 'number' },
      { text: 'sam', type: 'command' },
      { text: '#tom', type: 'preset' },
      { text: 'A2', type: 'note' },
      { text: '>', type: 'operator' },
      { text: '-', type: 'operator' },
      { text: 'd', type: 'command' },
      { text: '0.3', type: 'number' },
      { text: 'v', type: 'command' },
      { text: '// percussion', type: 'comment' }
    ]));
  });

  it('recognizes live MIDI variables, channels, sharps, flats and chords', () => {
    const source = '$$control=mi0(1@5)\nmo1#2([C#4|Db4];0.25;1):v($$control)';

    const tokens = highlight(source);

    expect(tokens).toEqual(expect.arrayContaining([
      { text: '$$control', type: 'variable' },
      { text: 'mi', type: 'command' },
      { text: '@', type: 'separator' },
      { text: 'mo', type: 'command' },
      { text: '#2', type: 'preset' },
      { text: 'C#4', type: 'note' },
      { text: 'Db4', type: 'note' },
      { text: '|', type: 'operator' }
    ]));
  });

  it('continues highlighting incomplete code while editing', () => {
    const tokens = highlight('sam1#piano([C#4>');

    expect(tokens).toEqual(expect.arrayContaining([
      { text: 'sam', type: 'command' },
      { text: '#piano', type: 'preset' },
      { text: 'C#4', type: 'note' },
      { text: '>', type: 'operator' }
    ]));
  });

  it('locates the malformed value on its original line', () => {
    const source = '$bajo=24\n\nsam3#tom(A2>C2>B2D3];[1-3][2-4]):r(64):d(64;0.3):v($bajo)';
    const state = EditorState.create({ doc: source });

    const diagnostics = getDiagnostics(state);

    expect(diagnostics).toEqual([{
      from: source.indexOf('>'),
      to: source.indexOf('>') + 1,
      severity: 'error',
      message: expect.stringContaining('Line 3, column 12')
    }]);
  });

  it('clears syntax diagnostics after correcting the document', () => {
    const state = EditorState.create({ doc: 'sam3#tom([A2>C2];[1-3][2-4])' });
    expect(getDiagnostics(state)).toHaveLength(1);

    const corrected = state.update({
      changes: { from: 0, to: state.doc.length, insert: 'sam3#tom([A2>C2];[1-3];[2-4])' }
    }).state;

    expect(getDiagnostics(corrected)).toEqual([]);
  });
});
