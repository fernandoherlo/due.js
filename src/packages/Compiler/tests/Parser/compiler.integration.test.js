import { describe, it, expect, vi } from 'vitest';
import CompilerFactory from '~/src/packages/Compiler/services/Compiler/factory';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

function createCompiler () {
  const app = {
    $logger: { log: vi.fn() },
    $variables: {}
  };

  return CompilerFactory(app, new ValueFactory());
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
});
