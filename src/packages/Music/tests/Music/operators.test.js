import { afterEach, describe, expect, it, vi } from 'vitest';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import { createOperator, createOperators } from '~/src/packages/Music/helpers/createOperators';
import { transpose } from '~/src/packages/Music/helpers/transpose';
import TriggerAttack from '~/src/packages/Music/services/Instrument/triggerAttack';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

const app = { $variables: {}, $logger: { log: vi.fn() } };

function actionsOf (code) {
  return new Compiler(app, new ValueFactory()).prepare(code).addedInstructions[0].actions;
}

function operator (name, ...args) {
  return createOperator({ name, mode: true, modeParameters: args.map(String) });
}

const event = (notes, time) => ({ notes, duration: 1, time });

describe('Note operators', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['C4', 12, 'C5'],
    ['C4', -12, 'C3'],
    ['C#4', 7, 'G#4'],
    ['Db4', 1, 'D4'],
    ['B3', 1, 'C4'],
    ['A0', -12, 'A-1']
  ])('transposes %s by %i semitones', (note, semitones, expected) => {
    expect(transpose(note, semitones)).toBe(expected);
  });

  it('leaves unknown note names unchanged', () => {
    expect(transpose('foo', 12)).toBe('foo');
  });

  it('parses chained operators after n and sam tracks', () => {
    expect(actionsOf('n1(C4)::oct(0.2;1)::late(0.3)').map(action => action.name)).toEqual(['oct', 'late']);
    expect(actionsOf('sam1#piano(C4):v(60)::human(0.02)').map(action => action.name)).toEqual(['v', 'human']);
  });

  it.each([
    'n1(C4):oct(0.2)',
    'oct1(0.2)',
    'mo1(C4)::oct(0.2)',
    'n1(C4)::reverse(10)',
    'sam1#piano(C4)::oct#x(0.2)'
  ])('rejects invalid usage: %s', (code) => {
    expect(() => new Compiler(app, new ValueFactory()).prepare(code)).toThrow();
  });

  it.each([
    ['oct'], ['oct', 2], ['oct', 'a'], ['oct', 0.5, 1.5], ['oct', 0.5, 1, 2],
    ['late', -0.1], ['late', 0.5, -1],
    ['chord'], ['chord', 0.5, 1],
    ['human', -1], ['human', 1, 2],
    ['unique'], ['unique', -1], ['unique', 'a'], ['unique', 1, 2],
    ['walk'], ['walk', -1], ['walk', 'a'], ['walk', 1, 2],
    ['trans'], ['trans', 1.5], ['trans', 'a'], ['trans', 1, 2]
  ])('rejects invalid arguments: %s', (name, ...args) => {
    expect(() => operator(name, ...args)).toThrow();
  });

  it('shifts every note by octaves (default 1) with the given probability', () => {
    expect(operator('oct', 1).apply(event(['C4', 'E4'])).notes).toEqual(['C5', 'E5']);
    expect(operator('oct', 1, -2).apply(event(['C4', 'E4'])).notes).toEqual(['C2', 'E2']);
    expect(operator('oct', 0, 1).apply(event(['C4', 'E4'])).notes).toEqual(['C4', 'E4']);
  });

  it('delays the note up to the maximum', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(operator('late', 1, 2).apply(event(['C4'], 10)).time).toBe(11);
    expect(operator('late', 1).apply(event(['C4'], 10)).time).toBe(10.25);
    expect(operator('late', 1).apply(event(['C4'])).time).toBeUndefined();
  });

  it('adds a fifth and an octave to the notes', () => {
    expect(operator('chord', 1).apply(event(['C4'])).notes).toEqual(['C4', 'G4', 'C5']);
  });

  it('humanizes time and duration', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1);

    const result = operator('human', 0.1).apply(event(['C4'], 2));

    expect(result.time).toBeCloseTo(2.1);
    expect(result.duration).toBeCloseTo(1.1);
  });

  it('drops notes repeated within the window and keeps the rest', () => {
    const unique = operator('unique', 4);

    expect(unique.apply(event(['C4', 'E4'], 0)).notes).toEqual(['C4', 'E4']);
    expect(unique.apply(event(['C4', 'G4'], 2)).notes).toEqual(['G4']);
    expect(unique.apply(event(['C4'], 3)).notes).toEqual([]);
    expect(unique.apply(event(['C4'], 4)).notes).toEqual(['C4']);
  });

  it('transposes every note by a fixed number of semitones', () => {
    expect(operator('trans', 3).apply(event(['C4', 'G4'])).notes).toEqual(['D#4', 'A#4']);
    expect(operator('trans', -12).apply(event(['C4'])).notes).toEqual(['C3']);
    expect(operator('trans', 0).apply(event(['C4'])).notes).toEqual(['C4']);
  });

  it('limits leaps to notes of the pool within the step', () => {
    const walk = operator('walk', 4);
    const pool = ['C4', 'E4', 'C5'];
    const withPool = note => ({ ...event([note]), pool });

    expect(walk.apply(withPool('C4')).notes).toEqual(['C4']);
    expect(['C4', 'E4']).toContain(walk.apply(withPool('C5')).notes[0]);
    expect(walk.apply(withPool('C4')).notes).toHaveLength(1);
  });

  it('falls back to the closest note when none is within the step', () => {
    const walk = operator('walk', 1);
    const pool = ['G4', 'A4', 'C5'];

    walk.apply({ ...event(['C4']), pool });
    expect(walk.apply({ ...event(['C5']), pool }).notes).toEqual(['G4']);
  });

  it('leaves chords and events without pool unchanged', () => {
    const walk = operator('walk', 1);

    walk.apply(event(['C4']));
    expect(walk.apply(event(['C5'])).notes).toEqual(['C5']);
    expect(walk.apply(event(['C4', 'G4'])).notes).toEqual(['C4', 'G4']);
  });

  it('keeps every note when there is no scheduled time', () => {
    expect(operator('unique', 4).apply(event(['C4'])).notes).toEqual(['C4']);
  });

  it('creates operators only from operator modes', () => {
    const actions = [{ name: 'v' }, { name: 'reverse', mode: true }, { name: 'oct', mode: true, modeParameters: ['1'] }];

    expect(createOperators(actions)).toHaveLength(1);
  });

  describe('TriggerAttack', () => {
    it('plays unchanged without operators', () => {
      const instrument = { triggerAttackRelease: vi.fn() };

      const logged = TriggerAttack.play({ value: 'C4', duration: 0.5 }, 'normal', 0, instrument, 3);

      expect(instrument.triggerAttackRelease).toHaveBeenCalledWith('C4', 0.5, 3);
      expect(logged).toEqual(['C4', 0.5]);
    });

    it('does not trigger an instrument for a rest step', () => {
      const instrument = { triggerAttackRelease: vi.fn() };

      const logged = TriggerAttack.play({ value: '~', duration: 0.5 }, 'normal', 0, instrument, 3);

      expect(instrument.triggerAttackRelease).not.toHaveBeenCalled();
      expect(logged).toBeUndefined();
    });

    it('excludes rests from the note pool used by operators', () => {
      expect(TriggerAttack.getPool([
        { value: 'C4' },
        { value: '~' },
        { value: 'E4' }
      ])).toEqual(['C4', 'E4']);
    });

    it('feeds each operator with the previous result', () => {
      const instrument = { triggerAttackRelease: vi.fn() };
      const operators = [operator('chord', 1), operator('oct', 1, 1)];

      TriggerAttack.play({ value: 'C4', duration: 0.5 }, 'normal', 0, instrument, 3, operators);

      expect(instrument.triggerAttackRelease).toHaveBeenCalledWith(['C5', 'G5', 'C6'], 0.5, 3);
    });

    it('does not play when every note was removed', () => {
      const instrument = { triggerAttackRelease: vi.fn() };
      const unique = operator('unique', 10);

      TriggerAttack.play({ value: 'C4', duration: 0.5 }, 'normal', 0, instrument, 1, [unique]);
      const logged = TriggerAttack.play({ value: 'C4', duration: 0.5 }, 'normal', 0, instrument, 2, [unique]);

      expect(instrument.triggerAttackRelease).toHaveBeenCalledOnce();
      expect(logged).toBeUndefined();
    });

    it('keeps a single note as a string', () => {
      const instrument = { triggerAttackRelease: vi.fn() };

      TriggerAttack.play({ value: 'C4', duration: 0.5 }, 'normal', 0, instrument, 3, [operator('oct', 1, 1)]);

      expect(instrument.triggerAttackRelease).toHaveBeenCalledWith('C5', 0.5, 3);
    });
  });
});
