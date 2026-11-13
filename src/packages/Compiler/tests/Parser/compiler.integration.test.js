import { describe, it, expect, vi } from 'vitest';
import { COMMANDS, COMMANDS_MAP, TYPE_VALUE } from '~/src/packages/Compiler/constants';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

function createCompiler () {
  const app = {
    $logger: { log: vi.fn() },
    $variables: {}
  };

  return new Compiler(app, new ValueFactory());
}

describe('Compiler integration', () => {
  it('keeps instrument identity independent from its preset modifier', () => {
    const compiler = createCompiler();
    const result = compiler.prepare([
      'sam3#tom(C4;0.25;1)',
      'sam4#tom(E4;0.25;1)'
    ].join('\n'));

    expect(result.addedInstructions.map(instruction => instruction.key).sort()).toEqual(['sam3', 'sam4']);
  });

  it('attaches effects written on the same line to their instrument', () => {
    const compiler = createCompiler();
    const result = compiler.prepare('sam1#piano(C4;0.25;1):v(90)');

    expect(result.addedInstructions[0].actions.map(action => action.name)).toEqual(['v']);
  });

  it('does not attach an effect from another line to the previous instrument', () => {
    const compiler = createCompiler();

    expect(() => compiler.prepare('sam1#piano(C4;0.25;1)\nv(90)')).toThrow();
  });

  it('accepts whitespace and inline comments around instructions', () => {
    const compiler = createCompiler();
    const plan = compiler.prepare('  sam1 # piano ( C4 ; 0.25 ; 1 )  // lead sound\n');

    expect(plan.addedInstructions).toHaveLength(1);
    expect(plan.addedInstructions[0].modifier).toBe('piano');
  });

  it('does not advance the previous program until a plan is committed', () => {
    const compiler = createCompiler();
    const source = 'sam1#piano(C4;0.25;1)';

    const firstPlan = compiler.prepare(source);
    const repeatedPlan = compiler.prepare(source);

    expect(firstPlan.addedInstructions).toHaveLength(1);
    expect(repeatedPlan.addedInstructions).toHaveLength(1);

    compiler.commit(repeatedPlan);
    expect(compiler.prepare('').deletedInstructions).toHaveLength(1);
  });

  it('stages variables until a compilation plan is committed', () => {
    const compiler = createCompiler();
    const plan = compiler.prepare('$level=42\nsam1#piano(C4;0.25;1)');

    expect(plan.variables).toEqual({ $level: '42' });
    expect(compiler.prepare('sam1#piano(C4;0.25;1)').variables).toEqual({});

    compiler.commit(plan);
    expect(compiler.prepare('sam1#piano(C4;0.25;1)').variables).toEqual({});
  });

  it('resolves variables used inside command values', () => {
    const compiler = createCompiler();
    const plan = compiler.prepare('$pitch=C4\nsam1#piano($pitch;0.25;1)');

    expect(plan.addedInstructions[0].value).toMatchObject({
      value: 'C4',
      duration: '0.25',
      interval: '1'
    });
  });

  it('keeps multiple live variables from the same MIDI input as separate instructions', () => {
    const compiler = createCompiler();
    const plan = compiler.prepare('$$volume=mi0(1@7)\n$$filter=mi0(1@74)');

    expect(plan.addedInstructions.map(instruction => instruction.key).sort()).toEqual(['$$filter', '$$volume']);
  });

  it('accepts a declared live variable as an effect value', () => {
    const compiler = createCompiler();
    const plan = compiler.prepare('$$control=mi0(1@5)\nsam1#piano(C4;1;1):v($$control)');

    expect(plan.addedInstructions.map(instruction => instruction.key)).toEqual(['$$control', 'sam1']);
  });

  it('stores an optional range on the live source config', () => {
    const plan = createCompiler().prepare('$$dur=mi0(1@7;[0.1-2])\nsam1#piano(C4;1;1):r($$dur)');

    expect(plan.addedInstructions[0].value).toEqual({
      channel: 1,
      controller: 7,
      range: { min: 0.1, max: 2 }
    });
  });

  it.each([
    ['$$control=sam1(C4)', 'in the form miN'],
    ['$$control=mi(1@5)', 'in the form miN'],
    ['$$control=mi0(0@5)', 'channel must be between 1 and 16'],
    ['$$control=mi0(1@128)', 'controller must be between 0 and 127'],
    ['$$control=mi0(1@)', 'must use channel or channel@controller'],
    ['$$control=mi0(1@5;7)', 'range must use [min-max]']
  ])('rejects invalid live variable sources: %s', (source, message) => {
    expect(() => createCompiler().prepare(source)).toThrow(message);
  });

  it('rejects live variable references without a prior MIDI declaration', () => {
    expect(() => createCompiler().prepare('v($$missing)')).toThrow('Undefined live variable "$$missing"');
  });

  it('rejects a declared range outside the supported effect range', () => {
    expect(() => createCompiler().prepare('$$decay=mi0(1@5;[0-30])\nsam1#piano(C4;1;1):r($$decay)'))
      .toThrow('Live variable range for r must be between 0 and 20');
  });

  it.each([
    'sam1#piano($$control;1;1)',
    'sam1#piano(C4;$$control;1)',
    'sam1#piano(C4;1;$$control)',
    'sam1#piano(C4;1;1):d(64;$$control)',
    'sam1#piano(C4;1;1)::late($$control)'
  ])('rejects live variable references outside supported effect values: %s', (target) => {
    const source = `$$control=mi0(1@5)\n${target}`;

    expect(() => createCompiler().prepare(source)).toThrow('Live variables are currently supported only in effect values');
  });

  it('updates, retains and deletes instructions relative to the committed snapshot', () => {
    const compiler = createCompiler();
    const initial = compiler.prepare('sam1(C4)\nsam2(E4)\nsam3(G4)');
    compiler.commit(initial);

    const next = compiler.prepare('sam1(D4)\nsam2(E4)');

    expect(next.addedInstructions).toEqual([]);
    expect(next.updatedInstructions.map(instruction => instruction.key)).toEqual(['sam1']);
    expect(next.deletedInstructions.map(instruction => instruction.key)).toEqual(['sam3']);
    compiler.commit(next);
    expect(compiler.prepare('sam1(D4)\nsam2(E4)').updatedInstructions).toEqual([]);
  });

  it('expands sequence variables while preserving ranges and action defaults', () => {
    const compiler = createCompiler();

    const plan = compiler.prepare('$notes=[C4>E4]\nsam1($notes;[0-1];0):v(90)');
    const instruction = plan.instructions[`${COMMANDS_MAP[COMMANDS.sam]}1`];

    expect(instruction.typeValue).toBe(TYPE_VALUE.sequence);
    expect(instruction.value).toMatchObject([
      { value: 'C4', duration: { min: '0', max: '1' }, interval: '0' },
      { value: 'E4', duration: { min: '0', max: '1' }, interval: '0' }
    ]);
    expect(instruction.actions[0].value.duration).toBeUndefined();
    expect(instruction.actions[0].value.interval).toBeUndefined();
  });

  it.each([
    ['sam1#piano([C4>~>E4];1;1)', TYPE_VALUE.sequence],
    ['n1([C4,~,E4];1;1)', TYPE_VALUE.random]
  ])('preserves rest steps in note patterns: %s', (source, typeValue) => {
    const instruction = createCompiler().prepare(source).addedInstructions[0];

    expect(instruction.typeValue).toBe(typeValue);
    expect(instruction.value.map(note => note.value)).toEqual(['C4', '~', 'E4']);
  });

  it('parses weights on random choices without changing their note values', () => {
    const instruction = createCompiler()
      .prepare('sam1#piano([C4^4,E4|G4^2,~^0];1;1)').addedInstructions[0];

    expect(instruction.value.map(({ value, weight }) => ({ value, weight }))).toEqual([
      { value: 'C4', weight: 4 },
      { value: 'E4|G4', weight: 2 },
      { value: '~', weight: 0 }
    ]);
  });

  it.each([
    [',', TYPE_VALUE.random],
    ['>', TYPE_VALUE.sequence]
  ])('supports chords inside a %s pattern', (separator, typeValue) => {
    const compiler = createCompiler();
    const source = '$low=24\nsam7#piano([A2|C2|B2' + separator +
      'D2|A2|G2];[7-8];[8-10]):r(17):d(0.2):v($low)';

    const plan = compiler.prepare(source);
    const instruction = plan.addedInstructions[0];

    expect(instruction.typeValue).toBe(typeValue);
    expect(instruction.value).toMatchObject([
      { value: 'A2|C2|B2', duration: { min: '7', max: '8' }, interval: { min: '8', max: '10' } },
      { value: 'D2|A2|G2', duration: { min: '7', max: '8' }, interval: { min: '8', max: '10' } }
    ]);
    expect(instruction.actions.map(action => action.name)).toEqual([COMMANDS.r, COMMANDS.d, COMMANDS.v]);
    expect(instruction.actions[2].value.value).toBe('24');
  });
});
