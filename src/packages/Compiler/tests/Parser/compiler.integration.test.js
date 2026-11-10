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
});
