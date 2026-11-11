export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const NOTE_SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const NOTE_PATTERN = /^([A-Ga-g])(#|b)?(-?\d+)$/;

export const SEMITONES_PER_OCTAVE = 12;

export const SEMITONES_PER_FIFTH = 7;
