import { describe, it, expect, vi } from 'vitest';
import Note from '~/src/modules/Due/Note';
import NoteFactory from '~/src/modules/Due/Note/factory';

vi.mock('~/src/modules/Due/Note', () => {
  const Note = vi.fn();
  return { default: Note };
});

describe('NoteFactory', () => {
  it('Return new instance', () => {
    // Arrange
    const data = { foo: 'bar' };
    // Activate
    const note = NoteFactory(data);
    // Assert
    expect(note).toBeInstanceOf(Note);
  });
});
