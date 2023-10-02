import { describe, it, expect, vi } from 'vitest';
import Editor from '../../Editor';
import EditorFactory from '../../Editor/factory';

vi.mock('../../Editor', () => {
  const Editor = vi.fn();
  return { default: Editor };
});

const mockApp = {
  $debug: true,
  $logger: {
    log: vi.fn()
  },
  $debugger: {
    add: vi.fn()
  }
};

describe('EditorFactory', () => {
  it('Return new instance', () => {
    // Arrange
    const htmlId = 'fooId';
    // Activate
    const editor = EditorFactory(mockApp, htmlId);
    // Assert
    expect(editor).toBeInstanceOf(Editor);
  });
});
