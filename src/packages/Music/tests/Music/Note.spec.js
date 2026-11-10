import { describe, expect, it } from 'vitest';
import Note from '~/src/packages/Music/services/Note';

describe('Note defaults', () => {
  it('preserves explicit zero duration and interval', () => {
    const note = new Note({ value: 'C4', value2: 0, value3: 0 }, true);

    expect(note.duration).toBe(0);
    expect(note.interval).toBe(0);
  });

  it('uses defaults only for omitted values', () => {
    const note = new Note({ value: 'C4' }, true);

    expect(note.duration).toBe(0.25);
    expect(note.interval).toBe(2);
  });
});
