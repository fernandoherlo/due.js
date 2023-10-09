import { describe, it, expect, vi } from 'vitest';
import Note from '~/src/modules/Due/Note';
import NoteFactory from '~/src/modules/Due/Note/factory';
import getter from '~/src/modules/Due/Variable/getter';

vi.mock('~/src/modules/Due/Note', () => {
  const Note = vi.fn();
  return { default: Note };
});
vi.mock('~/src/modules/Due/Variable/getter', () => {
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
