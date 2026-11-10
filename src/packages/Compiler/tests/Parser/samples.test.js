import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import { SAMPLER_MAP } from '~/src/packages/Music/constants/samplers';
import validateInstruction from '~/src/packages/Music/helpers/validateInstruction';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

const app = { $logger: { log: vi.fn() } };
const samples = readdirSync('doc').filter(file => file.endsWith('.duejs'));

describe('Documented samples', () => {
  it.each(samples)('%s compiles and passes validation', (file) => {
    const plan = new Compiler(app, new ValueFactory()).prepare(readFileSync(`doc/${file}`, 'utf8'));

    expect(plan.addedInstructions.length).toBeGreaterThan(0);
    for (const instruction of plan.addedInstructions) {
      [instruction, ...instruction.actions].forEach(validateInstruction);
      if (instruction.name === 'sam') expect(SAMPLER_MAP).toHaveProperty(instruction.modifier);
    }
  });
});
