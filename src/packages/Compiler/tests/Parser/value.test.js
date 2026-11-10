import { describe, expect, it, vi } from 'vitest';
import ValueParser from '~/src/packages/Compiler/services/Parser/value';

describe('DSL value parser', () => {
  it('creates a normal value with its separated parameters', () => {
    const valueFactory = { create: vi.fn(data => data) };
    const parser = new ValueParser(valueFactory);

    const [value, type] = parser.exec('C4;0.25;1', true);

    expect(type).toBe('normal');
    expect(value).toEqual({ value: 'C4', value2: '0.25', value3: '1' });
    expect(valueFactory.create).toHaveBeenCalledWith({ value: 'C4', value2: '0.25', value3: '1' }, true);
  });

  it('parses random choices and range parameters', () => {
    const valueFactory = { create: vi.fn(data => data) };
    const parser = new ValueParser(valueFactory);

    const [values, type] = parser.exec('[C4,E4];[0,1];[2-4]', false);

    expect(type).toBe('random');
    expect(values).toEqual([
      { value: 'C4', value2: ['0', '1'], value3: { min: '2', max: '4' } },
      { value: 'E4', value2: ['0', '1'], value3: { min: '2', max: '4' } }
    ]);
  });

  it('parses progression and chord values with their distinct types', () => {
    const valueFactory = { create: vi.fn(data => data) };
    const parser = new ValueParser(valueFactory);

    const [sequence, sequenceType] = parser.exec('[C4>E4];1;2', false);
    const [chord, chordType] = parser.exec('[C4|E4];1;2', false);

    expect(sequenceType).toBe('sequence');
    expect(sequence.map(value => value.value)).toEqual(['C4', 'E4']);
    expect(chordType).toBe('multi');
    expect(chord.value).toBe('[C4|E4]');
  });
});
