import type { Diagnostic } from '@codemirror/lint';
import type { EditorState } from '@codemirror/state';
import Parser from '~/src/packages/Compiler/services/Parser';
import { AST_KIND, CHARACTERS_INSTRUCTIONS as CHAR, COMMANDS } from '~/src/packages/Compiler/constants';
import ParseError from '~/src/packages/Compiler/services/Parser/error';

const parser = new Parser();

export function getDiagnostics (state: EditorState): Diagnostic[] {
  try {
    const program = parser.parse(state.doc.toString());
    const buses = new Set<string>();
    for (const line of program.lines) {
      for (const statement of line.statements) {
        if (statement.kind === AST_KIND.command && statement.name === COMMANDS.bus) buses.add(statement.element);
      }
    }
    for (const line of program.lines) {
      const connection = line.statements.find(statement => statement.kind === AST_KIND.connection);
      if (!connection) continue;
      const target = connection.target.rawValue;
      if (!target.startsWith(CHAR.BUS_PREFIX) || buses.has(target.slice(CHAR.BUS_PREFIX.length))) continue;
      const lineText = state.doc.line(connection.location.line);
      const from = lineText.from + lineText.text.indexOf(target, connection.location.column - 1);
      return [{
        from,
        to: from + target.length,
        severity: 'error',
        message: `Unknown bus "${target.slice(CHAR.BUS_PREFIX.length)}".`
      }];
    }
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
