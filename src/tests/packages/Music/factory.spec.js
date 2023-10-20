import { describe, it, expect, vi } from 'vitest';
import Note from '~/src/packages/Music/Note';
import NoteFactory from '~/src/packages/Music/valueFactory';
import getter from '~/src/packages/Music/Variable/getter';

vi.mock('~/src/packages/Music/Note', () => {
  const Note = vi.fn();
  return { default: Note };
});
vi.mock('~/src/packages/Music/Variable/getter', () => {
  const getter = vi.fn();
  return { default: getter };
});

describe('NoteFactory', () => {
  it('Create should return new instance', () => {
    // Arrange
    const data = { foo: 'bar' };
    // Activate
    const note = NoteFactory.create(data);
    // Assert
    expect(note).toBeInstanceOf(Note);
  });
  it('Adapt call getter', () => {
    // Arrange
    const value = 'foo';
    const variables = { foo: 'bar' };
    // Activate
    NoteFactory.adapt(value, variables);
    // Assert
    expect(getter).toHaveBeenCalledWith(value, variables);
  });
});
