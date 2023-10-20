import { describe, it, expect, vi } from 'vitest';
import Note from '~/src/packages/Music/services/Note';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';
import getter from '~/src/packages/Music/services/Variable/getter';

vi.mock('~/src/packages/Music/services/Note', () => {
  const Note = vi.fn();
  return { default: Note };
});
vi.mock('~/src/packages/Music/services/Variable/getter', () => {
  const getter = vi.fn();
  return { default: getter };
});

describe('ValueFactory', () => {
  it('Create should return new instance', () => {
    // Arrange
    const data = { foo: 'bar' };
    const valueFactory = new ValueFactory();
    // Activate
    const note = valueFactory.create(data);
    // Assert
    expect(note).toBeInstanceOf(Note);
  });
  it('Adapt call getter', () => {
    // Arrange
    const value = 'foo';
    const variables = { foo: 'bar' };
    const valueFactory = new ValueFactory();
    // Activate
    valueFactory.adapt(value, variables);
    // Assert
    expect(getter).toHaveBeenCalledWith(value, variables);
  });
});
