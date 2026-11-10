import { describe, expect, it, vi } from 'vitest';
import { COMMANDS, COMMANDS_MAP } from '~/src/packages/Compiler/constants';
import Analyzer from '~/src/packages/Compiler/services/Analyzer';
import Parser from '~/src/packages/Compiler/services/Parser';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

describe('DSL semantic analyzer', () => {
  const parser = new Parser();

  it('resolves variables in source order and emits runtime instructions', () => {
    const analyzer = new Analyzer(new ValueFactory());
    const program = parser.parse('$level=42\nsam1#piano($level;0.25;1)');

    const result = analyzer.exec(program);

    expect(result.variables).toEqual({ $level: '42' });
    expect(Object.keys(result.instructions)).toEqual([`${COMMANDS_MAP[COMMANDS.sam]}1`]);
    expect(result.instructions[`${COMMANDS_MAP[COMMANDS.sam]}1`]).toMatchObject({
      name: COMMANDS.sam,
      element: '1',
      modifier: 'piano',
      type: COMMANDS_MAP[COMMANDS.sam],
      value: { value: '42', duration: '0.25', interval: '1' }
    });
  });

  it('emits live-variable instructions without value parsing', () => {
    const valueFactory = { adapt: vi.fn(), create: vi.fn() };
    const analyzer = new Analyzer(valueFactory);
    const program = parser.parse('$$control=mi1(2@5)');

    const result = analyzer.exec(program);

    expect(result.instructions[`${COMMANDS_MAP[COMMANDS.$$]}1`]).toMatchObject({
      name: COMMANDS.$$,
      element: '1',
      modifier: 'control',
      key: '$$control',
      value: '2@5'
    });
    expect(valueFactory.create).not.toHaveBeenCalled();
    expect(valueFactory.adapt).not.toHaveBeenCalled();
  });

  it('lowers a connection node to the existing runtime command', () => {
    const analyzer = new Analyzer(new ValueFactory());
    const program = parser.parse('sam1#piano(C4)=>out1');

    const result = analyzer.exec(program);

    expect(result.instructions[`${COMMANDS_MAP[COMMANDS.sam]}1`].actions[0]).toMatchObject({
      name: COMMANDS.con,
      type: COMMANDS_MAP[COMMANDS.con],
      value: { value: 'out1' }
    });
  });

  it('does not retain variables when the same analyzer is reused after an error', () => {
    const analyzer = new Analyzer(new ValueFactory());
    const invalid = parser.parse('$level=42\nv($level)');

    expect(() => analyzer.exec(invalid)).toThrow('Line 2, column 1');
    const result = analyzer.exec(parser.parse('sam1(C4):v($level)'));

    expect(result.variables).toEqual({});
    expect(result.instructions[`${COMMANDS_MAP[COMMANDS.sam]}1`].actions[0].value.value).toBe('$level');
  });
});
