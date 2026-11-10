import { describe, expect, it, vi } from 'vitest';
import SemanticAnalyzer from '~/src/packages/Compiler/services/Parser/SemanticAnalyzer';
import SyntaxParser from '~/src/packages/Compiler/services/Parser/SyntaxParser';

describe('DSL semantic analyzer', () => {
  it('resolves variables in source order and emits runtime instructions', () => {
    const valueFactory = {
      adapt: vi.fn((value, variables) => value.replace(/\$[a-z]+/g, name => variables[name] || name)),
      create: vi.fn()
    };
    const valueParser = {
      exec: vi.fn(value => [value, 'normal'])
    };
    const syntax = new SyntaxParser();
    const analyzer = new SemanticAnalyzer(valueFactory, valueParser);
    const program = syntax.parse([
      { code: '$level=42', line: 1 },
      { code: 'sam1#piano($level;0.25;1)', line: 2 }
    ]);

    const result = analyzer.exec(program);

    expect(result.variables).toEqual({ $level: '42' });
    expect(result.instructions[0]).toEqual([]);
    expect(result.instructions[1][0]).toMatchObject({
      name: 'sam',
      element: '1',
      modifier: 'piano',
      type: 'sampler',
      value: '42;0.25;1'
    });
    expect(valueFactory.adapt).toHaveBeenLastCalledWith('$level;0.25;1', result.variables);
  });

  it('emits live-variable instructions without value parsing', () => {
    const valueFactory = { adapt: vi.fn(), create: vi.fn() };
    const valueParser = { exec: vi.fn() };
    const analyzer = new SemanticAnalyzer(valueFactory, valueParser);
    const program = new SyntaxParser().parse([{ code: '$$control=mi1(2@5)', line: 1 }]);

    const result = analyzer.exec(program);

    expect(result.instructions[0][0]).toMatchObject({
      name: '$$',
      element: '1',
      modifier: 'control',
      key: '$$control',
      value: '2@5'
    });
    expect(valueParser.exec).not.toHaveBeenCalled();
  });
});
