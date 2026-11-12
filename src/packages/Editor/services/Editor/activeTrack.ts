import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { AST_KIND, COMMANDS, VALUE_OPERATOR } from '~/src/packages/Compiler/constants';
import type { IAstValue } from '~/src/packages/Compiler/types/IAst';
import Parser from '~/src/packages/Compiler/services/Parser';

interface PatternRange {
  from: number;
  to: number;
}

interface ActivePatternState {
  rangesByKey: Map<string, PatternRange[][]>;
  stepsByKey: Map<string, number>;
  decorations: ReturnType<typeof Decoration.set>;
}

const parser = new Parser();
export const setPatternSource = StateEffect.define<string>();
export const setActivePatternStep = StateEffect.define<{ key: string, step: number }>();
export const clearActivePatternSteps = StateEffect.define<null>();
export const clearActivePatternStep = StateEffect.define<string>();

const activePatternNote = Decoration.mark({ attributes: { class: 'cm-active-pattern-note' } });

export const activePatternHighlight = StateField.define<ActivePatternState>({
  create () {
    return createState(new Map(), new Map());
  },
  update (activeState, transaction) {
    let rangesByKey = transaction.docChanged ? new Map<string, PatternRange[][]>() : activeState.rangesByKey;
    let stepsByKey = transaction.docChanged ? new Map<string, number>() : activeState.stepsByKey;
    let changed = transaction.docChanged;

    for (const effect of transaction.effects) {
      if (effect.is(setPatternSource)) {
        rangesByKey = getPatternRanges(effect.value);
        stepsByKey = new Map();
        changed = true;
      } else if (effect.is(setActivePatternStep)) {
        stepsByKey = new Map(stepsByKey);
        stepsByKey.set(effect.value.key, effect.value.step);
        changed = true;
      } else if (effect.is(clearActivePatternSteps)) {
        stepsByKey = new Map();
        changed = true;
      } else if (effect.is(clearActivePatternStep)) {
        stepsByKey = new Map(stepsByKey);
        stepsByKey.delete(effect.value);
        changed = true;
      }
    }

    return changed ? createState(rangesByKey, stepsByKey) : activeState;
  },
  provide: field => EditorView.decorations.from(field, state => state.decorations)
});

function getPatternRanges (source: string): Map<string, PatternRange[][]> {
  const program = parser.parse(source);
  const lineOffsets = getLineOffsets(source);
  const rangesByKey = new Map<string, PatternRange[][]>();

  for (const line of program.lines) {
    for (const statement of line.statements) {
      if (statement.kind !== AST_KIND.command || statement.mode || !isNoteCommand(statement.name) || !statement.element) {
        continue;
      }

      const pattern = statement.arguments.values[0];
      if (!pattern) continue;
      const steps = getPatternSteps(pattern, lineOffsets);
      if (steps.length) rangesByKey.set(`${statement.name}${statement.element}`, steps);
    }
  }

  return rangesByKey;
}

function getPatternSteps (value: IAstValue, lineOffsets: number[]): PatternRange[][] {
  if (value.kind === AST_KIND.collection) {
    if (value.operator === VALUE_OPERATOR.chord) return [value.values.flatMap(note => getValueRanges(note, lineOffsets))];
    return value.values.map(note => getValueRanges(note, lineOffsets));
  }
  const ranges = getValueRanges(value, lineOffsets);
  return ranges.length ? [ranges] : [];
}

function getValueRanges (value: IAstValue, lineOffsets: number[]): PatternRange[] {
  if (value.kind !== AST_KIND.scalar && value.kind !== AST_KIND.reference) return [];
  const from = lineOffsets[value.location.line - 1] + value.location.column - 1;
  const weightIndex = value.rawValue.lastIndexOf('^');
  const valueLength = weightIndex > 0 ? weightIndex : value.rawValue.length;
  return [{ from, to: from + valueLength }];
}

function isNoteCommand (name: string): boolean {
  return name === COMMANDS.n || name === COMMANDS.sam || name === COMMANDS.mo;
}

function getLineOffsets (source: string): number[] {
  const offsets: number[] = [];
  let offset = 0;
  for (const line of source.split('\n')) {
    offsets.push(offset);
    offset += line.length + 1;
  }
  return offsets;
}

function createState (
  rangesByKey: Map<string, PatternRange[][]>,
  stepsByKey: Map<string, number>
): ActivePatternState {
  const ranges = [...stepsByKey.entries()].flatMap(([key, step]) => {
    const patternSteps = rangesByKey.get(key) ?? [];
    const activeRanges = patternSteps[step % patternSteps.length] ?? [];
    return activeRanges.map(range => activePatternNote.range(range.from, range.to));
  }).sort((left, right) => left.from - right.from);
  const decorations = Decoration.set(ranges);
  return { rangesByKey, stepsByKey, decorations };
}
