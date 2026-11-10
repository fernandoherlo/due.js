import type { IAstCommand, IAstLine, IAstProgram, IAstStatement, ISourceLine, ISourceLocation } from '../../types/IAst';
import { COMMANDS, CHARACTERS_INSTRUCTIONS } from '~/src/packages/Compiler/constants';
import ValueSyntaxParser from './ValueSyntaxParser';

export default class SyntaxParser {
  private valueSyntaxParser = new ValueSyntaxParser();

  parse (sourceLines: ISourceLine[]): IAstProgram {
    if (!Array.isArray(sourceLines)) {
      throw Error('Source lines must be an array.');
    }

    return { lines: sourceLines.map(sourceLine => this.parseLine(sourceLine)) };
  }

  private parseLine (sourceLine: ISourceLine): IAstLine {
    const connectionIndex = sourceLine.code.indexOf(CHARACTERS_INSTRUCTIONS.CONNECT);
    const commandGroup = connectionIndex === -1 ? sourceLine.code : sourceLine.code.slice(0, connectionIndex);
    const connection = connectionIndex === -1 ? '' : sourceLine.code.slice(connectionIndex + CHARACTERS_INSTRUCTIONS.CONNECT.length).trim();
    const statements: IAstStatement[] = [];
    let offset = 0;

    commandGroup.split(CHARACTERS_INSTRUCTIONS.CONCATENATE_COMMANDS).forEach((rawCommand) => {
      const leadingWhitespace = rawCommand.length - rawCommand.trimStart().length;
      const command = rawCommand.trim();
      if (command) {
        statements.push(this.parseStatement(command, {
          line: sourceLine.line,
          column: offset + leadingWhitespace + 1
        }));
      }
      offset += rawCommand.length + 1;
    });

    if (connection) {
      const location = {
        line: sourceLine.line,
        column: connectionIndex + CHARACTERS_INSTRUCTIONS.CONNECT.length + 1
      };
      statements.push({
        kind: 'connection',
        target: this.valueSyntaxParser.parseExpression(connection, location),
        location
      });
    }

    return {
      statements,
      location: { line: sourceLine.line, column: 1 }
    };
  }

  private parseStatement (rawStatement: string, location: ISourceLocation): IAstStatement {
    const statement = rawStatement.replace(/\s/g, '');
    const assignmentIndex = statement.indexOf(CHARACTERS_INSTRUCTIONS.EQUAL);

    if (assignmentIndex > 0 && statement.startsWith(COMMANDS.$)) {
      const name = statement.slice(0, assignmentIndex);
      const rawValue = statement.slice(assignmentIndex + 1);

      if (!rawValue) {
        throw this.syntaxError(location, 'Variable assignment is missing a value');
      }

      if (name.startsWith(COMMANDS.$$)) {
        return {
          kind: 'live-variable',
          name,
          command: this.parseCommand(rawValue, {
            line: location.line,
            column: location.column + name.length + 1
          }),
          location
        };
      }

      return {
        kind: 'variable',
        name,
        value: this.valueSyntaxParser.parseExpression(rawValue, {
          line: location.line,
          column: location.column + name.length + 1
        }),
        location
      };
    }

    return this.parseCommand(statement, location);
  }

  private parseCommand (command: string, location: ISourceLocation): IAstCommand {
    const valueStart = command.indexOf(CHARACTERS_INSTRUCTIONS.INIT_VALUE_COMMAND);
    if (valueStart <= 0 || !command.endsWith(CHARACTERS_INSTRUCTIONS.END_VALUE_COMMAND)) {
      throw this.syntaxError(location, 'Expected command syntax name(value)');
    }

    const [commandId, modifier] = command.slice(0, valueStart).split(CHARACTERS_INSTRUCTIONS.IDENTIFIER);
    const match = /^([a-z]+)(\d+)?$/.exec(commandId);
    if (!match) {
      throw this.syntaxError(location, `Invalid command name "${commandId}"`);
    }

    const valueLocation = {
      line: location.line,
      column: location.column + valueStart + 1
    };

    return {
      kind: 'command',
      name: match[1],
      element: match[2] || '',
      modifier: modifier || undefined,
      arguments: this.valueSyntaxParser.parseExpression(command.slice(valueStart + 1, -1), valueLocation),
      location
    };
  }

  private syntaxError (location: ISourceLocation, message: string): Error {
    return Error(`Line ${location.line}, column ${location.column}: ${message}.`);
  }
}
