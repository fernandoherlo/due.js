import * as Tone from 'tone';

// Same key rules as Tone.Sampler: note names or MIDI numbers.
export function toMidi (note: string): number {
  return /^\d+$/.test(note) ? Tone.Frequency(Number(note), 'midi').toMidi() : Tone.Frequency(note).toMidi();
}
