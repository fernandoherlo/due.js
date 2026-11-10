import { describe, expect, it, vi } from 'vitest';
import { COMMANDS, COMMANDS_MAP, TYPE_VALUE } from '~/src/packages/Compiler/constants';
import Analyzer from '~/src/packages/Compiler/services/Analyzer';
import Parser from '~/src/packages/Compiler/services/Parser';

describe('DSL value parser', () => {
  const parser = new Parser();

  it('creates a normal value with its separated parameters', () => {
    const valueFactory = { adapt: source => source, create: vi.fn(data => data) };
    const analyzer = new Analyzer(valueFactory);

    const result = analyzer.exec(parser.parse('sam1(C4;0.25;1)'));
    const { value, typeValue } = result.instructions[`${COMMANDS_MAP[COMMANDS.sam]}1`];

    expect(typeValue).toBe(TYPE_VALUE.normal);
    expect(value).toEqual({ value: 'C4', value2: '0.25', value3: '1' });
    expect(valueFactory.create).toHaveBeenCalledWith({ value: 'C4', value2: '0.25', value3: '1' }, true);
  });

  it('parses random choices and range parameters', () => {
    const valueFactory = { adapt: source => source, create: vi.fn(data => data) };
    const analyzer = new Analyzer(valueFactory);

    const result = analyzer.exec(parser.parse('sam1([C4,E4];[0,1];[2-4])'));
    const { value: values, typeValue } = result.instructions[`${COMMANDS_MAP[COMMANDS.sam]}1`];

    expect(typeValue).toBe(TYPE_VALUE.random);
    expect(values).toEqual([
      { value: 'C4', value2: ['0', '1'], value3: { min: '2', max: '4' } },
      { value: 'E4', value2: ['0', '1'], value3: { min: '2', max: '4' } }
    ]);
  });

  it('parses progression and chord values with their distinct types', () => {
    const valueFactory = { adapt: source => source, create: vi.fn(data => data) };
    const analyzer = new Analyzer(valueFactory);

    const result = analyzer.exec(parser.parse('sam1([C4>E4];1;2)\nsam2([C4|E4];1;2)'));
    const sequence = result.instructions[`${COMMANDS_MAP[COMMANDS.sam]}1`];
    const chord = result.instructions[`${COMMANDS_MAP[COMMANDS.sam]}2`];

    expect(sequence.typeValue).toBe(TYPE_VALUE.sequence);
    expect(sequence.value.map(note => note.value)).toEqual(['C4', 'E4']);
    expect(chord.typeValue).toBe(TYPE_VALUE.multi);
    expect(chord.value.value).toBe('[C4|E4]');
  });
});
