import { COMMANDS } from '~/src/packages/Compiler/constants';
import type { IInstruction } from '~/src/types';

interface Limit { min: number, max: number, positive?: boolean }

const ANY: Limit = { min: -Infinity, max: Infinity };
const MIDI_RANGE: Limit = { min: 0, max: 127 };
const DURATION: Limit = { min: 0, max: Infinity };
const INTERVAL: Limit = { min: 0, max: Infinity, positive: true };

const EFFECT_LIMITS: Record<string, { value: Limit, duration?: Limit }> = {
  [COMMANDS.v]: { value: ANY },
  [COMMANDS.r]: { value: MIDI_RANGE },
  [COMMANDS.cho]: { value: MIDI_RANGE },
  [COMMANDS.d]: { value: MIDI_RANGE, duration: { min: 0, max: 1 } }
};

export default function validateInstruction (instruction: IInstruction): void {
  const limits = EFFECT_LIMITS[instruction.name];
  const label = `${instruction.name}${instruction.element}`;
  for (const note of [instruction.value].flat()) {
    if (!note || typeof note !== 'object') continue;
    if (limits) {
      check(`${label}: value`, note.value, limits.value);
      if (limits.duration) check(`${label}: feedback`, note.duration, limits.duration);
    } else if (instruction.element) {
      check(`${label}: duration`, note.duration, DURATION);
      check(`${label}: interval`, note.interval, INTERVAL);
    }
  }
}

function check (label: string, field: unknown, limit: Limit): void {
  if (field === undefined || field === null) return;
  const range = isRange(field);
  const values = range ? [field.min, field.max] : [field].flat();
  for (const [index, raw] of values.entries()) {
    if (typeof raw === 'string' && raw.startsWith(COMMANDS.$$)) continue;
    const value = typeof raw === 'number' || (typeof raw === 'string' && raw.trim()) ? Number(raw) : NaN;
    if (!Number.isFinite(value)) throw Error(`${label} must be a number.`);
    // A range may start at 0 because the exact lower bound is practically never drawn.
    const empty = limit.positive && (range ? index === 1 : true) && value <= 0;
    if (value < limit.min || value > limit.max || empty) {
      throw Error(`${label} must be ${describe(limit)}.`);
    }
  }
}

function isRange (field: unknown): field is { min: unknown, max: unknown } {
  return typeof field === 'object' && field !== null && 'min' in field && 'max' in field;
}

function describe ({ min, max, positive }: Limit): string {
  if (positive) return 'greater than 0';
  if (Number.isFinite(min) && Number.isFinite(max)) return `between ${min} and ${max}`;
  return Number.isFinite(min) ? `at least ${min}` : 'a finite number';
}
