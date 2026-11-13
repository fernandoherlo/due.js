export const SYNTH_PRESETS = {
  supersaw: {
    oscillator: { type: 'fatsawtooth', count: 5, spread: 20 }
  }
} as const;

export type SynthPreset = keyof typeof SYNTH_PRESETS;

export function isSynthPreset (name: string): name is SynthPreset {
  return Object.prototype.hasOwnProperty.call(SYNTH_PRESETS, name);
}
