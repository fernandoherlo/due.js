import type { Diagnostic } from '@codemirror/lint';
import type { EditorState } from '@codemirror/state';
import Parser from '~/src/packages/Compiler/services/Parser';
import ParseError from '~/src/packages/Compiler/services/Parser/error';

const parser = new Parser();

export function getDiagnostics (state: EditorState): Diagnostic[] {
  try {
    parser.parse(state.doc.toString());
    return [];
  } catch (error) {
    if (!(error instanceof ParseError)) throw error;
    const line = state.doc.line(error.location.line);
    const from = Math.min(line.from + error.location.column - 1, line.to);
    return [{
      from,
      to: Math.min(from + 1, line.to),
      severity: 'error',
      message: error.message
    }];
  }
}
