import { describe, expect, it, vi } from 'vitest';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

const app = { $logger: { log: vi.fn() } };

function prepare (code) {
  return new Compiler(app, new ValueFactory()).prepare(code);
}

describe('Tempo and beats', () => {
  it('keeps plain numbers as seconds at any tempo', () => {
    const { addedInstructions: [instruction] } = prepare('bpm(60)\nsam1#piano(C4;1;2)');

    expect(instruction.value).toMatchObject({ duration: '1', interval: '2' });
  });

  it.each([
    [120, '0.5', '2'],
    [60, '1', '4'],
    [90, '0.666667', '2.666667']
  ])('converts beats to seconds with bpm(%s)', (bpm, duration, interval) => {
    const { addedInstructions: [instruction] } = prepare(`bpm(${bpm})\nsam1#piano(C4;1b;4b)`);

    expect(instruction.value).toMatchObject({ duration, interval });
  });

  it('uses 120 bpm by default and converts lists, ranges, decimals and variables', () => {
    const { addedInstructions: [instruction] } = prepare('$beat=2b\nsam1#piano(C4;[1b,$beat];[0.5b-1b])');

    expect(instruction.value).toMatchObject({ duration: ['0.5', '1'], interval: { min: '0.25', max: '0.5' } });
  });

  it('allows bpm after the instruments that use it', () => {
    const { addedInstructions: [instruction] } = prepare('sam1#piano(C4;1b;1b)\nbpm(60)');

    expect(instruction.value).toMatchObject({ duration: '1', interval: '1' });
  });

  it('updates beat-based instruments when only the tempo changes', () => {
    const compiler = new Compiler(app, new ValueFactory());
    compiler.commit(compiler.prepare('bpm(120)\nsam1#piano(C4;1b;2b)\nsam2#piano(C4;1;2)'));

    const plan = compiler.prepare('bpm(60)\nsam1#piano(C4;1b;2b)\nsam2#piano(C4;1;2)');

    expect(plan.updatedInstructions.map(instruction => instruction.key)).toEqual(['sam1']);
  });

  it.each([
    ['bpm(10)', 'between 20 and 300'],
    ['bpm(301)', 'between 20 and 300'],
    ['bpm(fast)', 'between 20 and 300'],
    ['bpm(100;2)', 'between 20 and 300'],
    ['bpm(90)\nbpm(100)', 'Only one bpm'],
    ['sam1#piano(C4):bpm(90)', 'alone on its own line'],
    ['bpm1(90)', 'alone on its own line']
  ])('rejects invalid tempo declarations: %s', (code, message) => {
    expect(() => prepare(code)).toThrow(message);
  });
});
