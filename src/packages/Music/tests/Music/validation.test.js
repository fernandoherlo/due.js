import { describe, expect, it, vi } from 'vitest';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import validateInstruction from '~/src/packages/Music/helpers/validateInstruction';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

const app = { $logger: { log: vi.fn() } };

function validate (code) {
  const plan = new Compiler(app, new ValueFactory()).prepare(code);
  for (const instruction of plan.addedInstructions) {
    [instruction, ...instruction.actions].forEach(validateInstruction);
  }
}

describe('Numeric validation', () => {
  it.each([
    'sam1#piano(C4;0.25;1)',
    'sam1#piano(C4;[0-1];[1-2])',
    'sam1#piano(C4;[0,1];[1,2])',
    'sam1#piano(C4;0;[0-2])',
    'sam1#piano(C4):v(-1):v(5)',
    'sam1#piano(C4):r(0):cho(127):d(127;1):d(0;0)',
    '$$x=mi0(1@5)\nsam1#piano(C4):v($$x)'
  ])('accepts valid programs: %s', (code) => {
    expect(() => validate(code)).not.toThrow();
  });

  it.each([
    ['sam1#piano(C4;0.25;0)', 'interval must be greater than 0'],
    ['sam1#piano(C4;0.25;-1)', 'interval must be greater than 0'],
    ['sam1#piano(C4;0.25;[0-0])', 'interval must be greater than 0'],
    ['sam1#piano(C4;0.25;[0,2])', 'interval must be greater than 0'],
    ['sam1#piano(C4;-1;1)', 'duration must be'],
    ['sam1#piano(C4;fast;1)', 'duration must be a number'],
    ['sam1#piano(C4):r(128)', 'value must be between 0 and 127'],
    ['sam1#piano(C4):cho(-1)', 'value must be between 0 and 127'],
    ['sam1#piano(C4):d(200)', 'value must be between 0 and 127'],
    ['sam1#piano(C4):d(64;2)', 'feedback must be between 0 and 1'],
    ['sam1#piano(C4):v(loud)', 'value must be a number']
  ])('rejects out-of-range or invalid values: %s', (code, message) => {
    expect(() => validate(code)).toThrow(message);
  });
});

describe('Variables', () => {
  it('rejects undefined variables with their location', () => {
    const compiler = new Compiler(app, new ValueFactory());

    expect(() => compiler.prepare('sam1#piano(C4;1;1):v($missing)')).toThrow('Undefined variable "$missing"');
    expect(() => compiler.prepare('$a=$missing')).toThrow('Undefined variable "$missing"');
  });

  it('replaces every occurrence and prefers longer variable names', () => {
    const plan = new Compiler(app, new ValueFactory()).prepare('$low=1\n$lower=2\nsam1#piano(C4;$low;[$low-$lower])');

    expect(plan.addedInstructions[0].value).toMatchObject({ duration: '1', interval: { min: '1', max: '2' } });
  });
});
