import { describe, expect, it } from 'vitest';
import SyntaxParser from '~/src/packages/Compiler/services/Parser/SyntaxParser';

describe('DSL syntax parser', () => {
  const parser = new SyntaxParser();

  it('parses variable declarations as syntax nodes', () => {
    const program = parser.parse([{ code: '$level=42', line: 1 }]);

    expect(program.lines[0].statements[0]).toMatchObject({
      kind: 'variable',
      name: '$level',
      value: {
        rawValue: '42',
        values: [{ kind: 'scalar', rawValue: '42' }]
      },
      location: { line: 1, column: 1 }
    });
  });

  it('parses commands and modifiers without resolving their values', () => {
    const program = parser.parse([{ code: 'sam3#tom([C4>E4];[0.2-1];2)', line: 1 }]);

    expect(program.lines[0].statements[0]).toMatchObject({
      kind: 'command',
      name: 'sam',
      element: '3',
      modifier: 'tom',
      arguments: {
        values: [
          { kind: 'collection', operator: 'sequence' },
          { kind: 'range', min: '0.2', max: '1' },
          { kind: 'scalar', rawValue: '2' }
        ]
      }
    });
  });

  it('parses live variables as declarations referencing a command', () => {
    const program = parser.parse([{ code: '$$control=mi1(2@5)', line: 1 }]);

    expect(program.lines[0].statements[0]).toMatchObject({
      kind: 'live-variable',
      name: '$$control',
      command: {
        kind: 'command',
        name: 'mi',
        element: '1',
        arguments: { rawValue: '2@5', values: [{ kind: 'scalar', rawValue: '2@5' }] }
      }
    });
  });

  it('groups colon-separated commands into the same source line', () => {
    const program = parser.parse([{ code: 'sam1#piano(C4;0.25;1):v(90)', line: 1 }]);

    expect(program.lines[0].statements.map(statement => statement.name)).toEqual(['sam', 'v']);
  });

  it('represents command variable usage as a reference node', () => {
    const program = parser.parse([{ code: 'v($volume)', line: 1 }]);

    expect(program.lines[0].statements[0].arguments.values[0]).toMatchObject({
      kind: 'variable-reference',
      name: '$volume'
    });
  });

  it('retains the line of a syntax error', () => {
    expect(() => parser.parse([{ code: 'sam1#piano', line: 3 }])).toThrow('Line 3, column 1');
  });

  it('represents => as a connection node rather than a synthetic command', () => {
    const program = parser.parse([{ code: 'sam1#piano(C4)=>out1', line: 1 }]);

    expect(program.lines[0].statements[1]).toMatchObject({
      kind: 'connection',
      target: { rawValue: 'out1', values: [{ kind: 'scalar', rawValue: 'out1' }] }
    });
  });
});
