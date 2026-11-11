import { NOTE_NAMES, NOTE_PATTERN, NOTE_SEMITONES, SEMITONES_PER_OCTAVE } from '~/src/packages/Music/constants/notes';

// Unknown notes (for example MIDI numbers) are returned unchanged.
export function transpose (note: string, semitones: number): string {
  const match = NOTE_PATTERN.exec(String(note).trim());
  if (!match) return note;
  const accidental = match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0;
  const midi = (Number(match[3]) + 1) * SEMITONES_PER_OCTAVE + NOTE_SEMITONES[match[1].toUpperCase()] + accidental + semitones;
  const name = NOTE_NAMES[((midi % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE];
  return `${name}${Math.floor(midi / SEMITONES_PER_OCTAVE) - 1}`;
}
