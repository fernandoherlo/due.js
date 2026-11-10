import { describe, expect, it, vi } from 'vitest';
import Analyzer from '~/src/packages/Compiler/services/Analyzer';
import Parser from '~/src/packages/Compiler/services/Parser';

describe('track groups', () => {
  const parser = new Parser();
  const analyzer = new Analyzer({ adapt: source => source, create: vi.fn(data => data) });

  it('applies the group effects after the own effects of every track', () => {
    const { instructions } = analyzer.exec(parser.parse('[sam1#kick(C2;1;1):v(1), sam2#hats([C4,E4];1;1)]:r(2):v(-1)'));

    expect(Object.values(instructions).map(instruction => instruction.key)).toEqual(['sam1', 'sam2']);
    expect(instructions.sampler1.actions.map(action => action.name)).toEqual(['v', 'r', 'v']);
    expect(instructions.sampler2.actions.map(action => action.name)).toEqual(['r', 'v']);
  });

  it('accepts groups without effects', () => {
    const { instructions } = analyzer.exec(parser.parse('[sam1(C2;1;1),n1(A3;1;1)]'));

    expect(Object.values(instructions).map(instruction => instruction.key)).toEqual(['n1', 'sam1']);
    expect(instructions.sampler1.actions).toEqual([]);
  });

  it.each([
    ['[sam1(C2;1;1)', 'missing ]'],
    ['[sam1(C2;1;1),]', 'Empty track'],
    ['[sam1(C2;1;1)]v(1)', 'Expected :']
  ])('rejects %s', (source, message) => {
    expect(() => parser.parse(source)).toThrow(message);
  });
});
