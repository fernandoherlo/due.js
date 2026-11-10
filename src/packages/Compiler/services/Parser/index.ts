import { AST_KIND, CHARACTERS_INSTRUCTIONS as CHAR, COMMANDS } from '~/src/packages/Compiler/constants';
import { parseExpression } from '~/src/packages/Compiler/services/Parser/value';
import type {
  IAstCommand, IAstLine, IAstProgram, IAstStatement, ISourceLocation
} from '~/src/packages/Compiler/types/IAst';

export default class Parser {
  parse (source: string): IAstProgram {
    if (typeof source !== 'string') {
      throw Error('Code is not string.');
    }
    const lines = source.split('\n').map((code, index) => this.parseLine(code.split(CHAR.COMMENT)[0], index + 1));
    return { lines };
  }

  private parseLine (source: string, line: number): IAstLine {
    const connectionIndex = source.indexOf(CHAR.CONNECT);
    const commandGroup = connectionIndex < 0 ? source : source.slice(0, connectionIndex);
    let column = 1;
    const statements: IAstStatement[] = commandGroup.split(CHAR.CONCATENATE_COMMANDS).flatMap((rawCommand) => {
      const location = { line, column: column + rawCommand.length - rawCommand.trimStart().length };
      column += rawCommand.length + CHAR.CONCATENATE_COMMANDS.length;
      return rawCommand.trim() ? [this.parseStatement(rawCommand.trim(), location)] : [];
    });
    if (connectionIndex >= 0) {
      const target = source.slice(connectionIndex + CHAR.CONNECT.length);
      if (target.trim()) {
        const location = { line, column: connectionIndex + 1 };
        statements.push({
          kind: AST_KIND.connection,
          target: parseExpression(target, { line, column: location.column + CHAR.CONNECT.length }),
          location
        });
      }
    }
    return { statements, location: { line, column: 1 } };
  }

  private parseStatement (source: string, location: ISourceLocation): IAstStatement {
    const assignmentIndex = source.indexOf(CHAR.EQUAL);
    if (!source.startsWith(COMMANDS.$) || assignmentIndex < 1) {
      return this.parseCommand(source, location);
    }
    const name = source.slice(0, assignmentIndex).replace(/\s/g, '');
    const rawValue = source.slice(assignmentIndex + CHAR.EQUAL.length);
    const valueLocation = { line: location.line, column: location.column + assignmentIndex + CHAR.EQUAL.length };
    if (!rawValue.trim()) {
      throw syntaxError(location, 'Variable assignment is missing a value');
    }
    return name.startsWith(COMMANDS.$$)
      ? { kind: AST_KIND.liveVariable, name, command: this.parseCommand(rawValue, valueLocation), location }
      : { kind: AST_KIND.variable, name, value: parseExpression(rawValue, valueLocation), location };
  }

  private parseCommand (source: string, location: ISourceLocation): IAstCommand {
    const valueStart = source.indexOf(CHAR.INIT_VALUE_COMMAND);
    if (valueStart <= 0 || !source.endsWith(CHAR.END_VALUE_COMMAND)) {
      throw syntaxError(location, 'Expected command syntax name(value)');
    }
    const [commandId, modifier] = source.slice(0, valueStart).replace(/\s/g, '').split(CHAR.IDENTIFIER);
    const match = /^([a-z]+)(\d+)?$/.exec(commandId);
    if (!match) {
      throw syntaxError(location, `Invalid command name "${commandId}"`);
    }
    return {
      kind: AST_KIND.command,
      name: match[1],
      element: match[2] || '',
      modifier: modifier || undefined,
      arguments: parseExpression(source.slice(valueStart + 1, -1), {
        line: location.line, column: location.column + valueStart + 1
      }),
      location
    };
  }
}

function syntaxError (location: ISourceLocation, message: string): Error {
  return Error(`Line ${location.line}, column ${location.column}: ${message}.`);
}
