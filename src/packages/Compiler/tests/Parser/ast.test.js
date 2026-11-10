import { describe, expect, it } from 'vitest';
import { AST_KIND, VALUE_OPERATOR } from '~/src/packages/Compiler/constants';
import Parser from '~/src/packages/Compiler/services/Parser';

describe('DSL syntax parser', () => {
  const parser = new Parser();

  it('parses variable declarations as syntax nodes', () => {
    const program = parser.parse('$level=42');

    expect(program.lines[0].statements[0]).toMatchObject({
      kind: AST_KIND.variable,
      name: '$level',
      value: {
        rawValue: '42',
        values: [{ kind: AST_KIND.scalar, rawValue: '42' }]
      },
      location: { line: 1, column: 1 }
    });
  });

  it('parses commands and modifiers without resolving their values', () => {
    const program = parser.parse('sam3#tom([C4>E4];[0.2-1];2)');

    expect(program.lines[0].statements[0]).toMatchObject({
      kind: AST_KIND.command,
      name: 'sam',
      element: '3',
      modifier: 'tom',
      arguments: {
        values: [
          { kind: AST_KIND.collection, operator: VALUE_OPERATOR.sequence },
          { kind: AST_KIND.range, min: '0.2', max: '1' },
          { kind: AST_KIND.scalar, rawValue: '2' }
        ]
      }
    });
  });

  it('parses live variables as declarations referencing a command', () => {
    const program = parser.parse('$$control=mi1(2@5)');

    expect(program.lines[0].statements[0]).toMatchObject({
      kind: AST_KIND.liveVariable,
      name: '$$control',
      command: {
        kind: AST_KIND.command,
        name: 'mi',
        element: '1',
        arguments: { rawValue: '2@5', values: [{ kind: AST_KIND.scalar, rawValue: '2@5' }] }
      }
    });
  });

  it('groups colon-separated commands into the same source line', () => {
    const program = parser.parse('sam1#piano(C4;0.25;1):v(90)');

    expect(program.lines[0].statements.map(statement => statement.name)).toEqual(['sam', 'v']);
  });

  it('represents command variable usage as a reference node', () => {
    const program = parser.parse('v($volume)');

    expect(program.lines[0].statements[0].arguments.values[0]).toMatchObject({
      kind: AST_KIND.reference,
      name: '$volume'
    });
  });

  it('retains the line of a syntax error', () => {
    expect(() => parser.parse('\n\nsam1#piano')).toThrow('Line 3, column 1');
  });

  it.each([
    'sam3#tom(A2>C2>B2D3];[1-3][2-4]):r(64):d(64;0.3):v($bajo)',
    'sam3#tom([A2>C2];[1-3][2-4])',
    'sam3#tom([A2>C2;1;2)',
    'sam3#tom(A2>C2;1;2)',
    'sam3#tom(C4))'
  ])('rejects malformed value structure: %s', (source) => {
    expect(() => parser.parse('\n\n' + source)).toThrow('Line 3, column');
  });

  it('represents => as a connection node rather than a synthetic command', () => {
    const program = parser.parse('sam1#piano(C4)=>out1');

    expect(program.lines[0].statements[1]).toMatchObject({
      kind: AST_KIND.connection,
      target: { rawValue: 'out1', values: [{ kind: AST_KIND.scalar, rawValue: 'out1' }] }
    });
  });
});
