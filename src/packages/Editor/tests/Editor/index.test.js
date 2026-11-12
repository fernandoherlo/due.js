import { foldable, syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { highlightTree, tagHighlighter, tags } from '@lezer/highlight';
import { describe, expect, it, vi } from 'vitest';
import { DueLanguage } from '~/src/packages/Editor/constants/language';
import Editor from '~/src/packages/Editor/services/Editor';
import { getDiagnostics } from '~/src/packages/Editor/services/Editor/diagnostics';
import { dueRegionFolding } from '~/src/packages/Editor/services/Editor/regions';
import {
  activePatternHighlight,
  setActivePatternStep,
  setPatternSource
} from '~/src/packages/Editor/services/Editor/activeTrack';

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

  it('folds from a standalone comment to the next standalone comment', () => {
    const source = [
      '// title',
      'bpm(120)',
      '// drums',
      'sam1#kick(C2;0.25;1)',
      'sam2#snare(D2;0.25;1)',
      '// melody',
      'sam3#harp(C4;1;2)',
      'sam3#hats(F#3;0.1;0.5) // inline comment',
      '// outro',
      'sam4#piano(C4;1;1)'
    ].join('\n');
    const state = EditorState.create({ doc: source, extensions: [dueRegionFolding] });
    const title = state.doc.line(1);
    const drums = state.doc.line(3);
    const inlineComment = state.doc.line(8);
    const lastComment = state.doc.line(9);

    expect(foldable(state, title.from, title.to)).toEqual({
      from: title.to,
      to: drums.from - 1
    });
    expect(foldable(state, drums.from, drums.to)).toEqual({
      from: drums.to,
      to: state.doc.line(6).from - 1
    });
    expect(foldable(state, inlineComment.from, inlineComment.to)).toBeNull();
    expect(foldable(state, lastComment.from, lastComment.to)).toBeNull();
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

  it('does not report random chord patterns as syntax errors', () => {
    const state = EditorState.create({
      doc: '$low=24\nsam7#piano([A2|C2|B2,D2|A2|G2];[7-8];[8-10]):r(17):d(0.2):v($low)'
    });

    const diagnostics = getDiagnostics(state);

    expect(diagnostics).toEqual([]);
  });

  it('highlights the exact ordered note token and clears stale marks while editing', () => {
    const source = 'sam1#piano([C4>E4>C4];1;1)';
    const state = EditorState.create({ doc: source, extensions: [activePatternHighlight] });
    const compiled = state.update({ effects: setPatternSource.of(source) }).state;
    const active = compiled.update({ effects: setActivePatternStep.of({ key: 'sam1', step: 1 }) }).state;
    const ranges = [];

    active.field(activePatternHighlight).decorations.between(0, active.doc.length, (from, to, decoration) => {
      ranges.push({ text: active.doc.sliceString(from, to), className: decoration.spec.attributes.class });
    });

    expect(ranges).toEqual([{ text: 'E4', className: 'cm-active-pattern-note' }]);

    const edited = active.update({ changes: { from: 0, insert: '// lead\n' } }).state;
    const remaining = [];
    edited.field(activePatternHighlight).decorations.between(0, edited.doc.length, (from, to) => {
      remaining.push(edited.doc.sliceString(from, to));
    });

    expect(remaining).toEqual([]);
  });

  it('highlights the active occurrence when a note repeats in a sequence', () => {
    const source = 'sam1#piano([C4>E4>C4];1;1)';
    const state = EditorState.create({ doc: source, extensions: [activePatternHighlight] });
    const compiled = state.update({ effects: setPatternSource.of(source) }).state;
    const active = compiled.update({ effects: setActivePatternStep.of({ key: 'sam1', step: 2 }) }).state;
    const ranges = [];

    active.field(activePatternHighlight).decorations.between(0, active.doc.length, (from, to, decoration) => {
      ranges.push({ from, text: active.doc.sliceString(from, to), className: decoration.spec.attributes.class });
    });

    expect(ranges).toEqual([{
      from: source.lastIndexOf('C4'),
      text: 'C4',
      className: 'cm-active-pattern-note'
    }]);
  });

  it('highlights the selected weighted random chord without its weight suffix', () => {
    const source = 'sam1#piano([C4^4,E4|G4^2,G4];1;1)';
    const state = EditorState.create({ doc: source, extensions: [activePatternHighlight] });
    const compiled = state.update({ effects: setPatternSource.of(source) }).state;
    const active = compiled.update({ effects: setActivePatternStep.of({ key: 'sam1', step: 1 }) }).state;
    const ranges = [];

    active.field(activePatternHighlight).decorations.between(0, active.doc.length, (from, to) => {
      ranges.push(active.doc.sliceString(from, to));
    });

    expect(ranges).toEqual(['E4|G4']);
  });

  it('keeps the source range when note operators follow the pattern', () => {
    const source = 'sam1#piano([C4>E4];1;1)::trans(5)::oct(1)';
    const state = EditorState.create({ doc: source, extensions: [activePatternHighlight] });
    const compiled = state.update({ effects: setPatternSource.of(source) }).state;
    const active = compiled.update({ effects: setActivePatternStep.of({ key: 'sam1', step: 1 }) }).state;
    const ranges = [];

    active.field(activePatternHighlight).decorations.between(0, active.doc.length, (from, to) => {
      ranges.push(active.doc.sliceString(from, to));
    });

    expect(ranges).toEqual(['E4']);
  });
});
