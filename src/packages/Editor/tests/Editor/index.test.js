import { describe, afterEach, it, expect, vi } from 'vitest';
import Editor from '~/src/packages/Editor/services/Editor';

vi.mock('monaco-editor/esm/vs/editor/editor.api.js', () => {
  const monaco = vi.fn();
  return { default: monaco };
});

const mockApp = {
  $music: true,
  compile: vi.fn(),
  getFromLocalStorage: vi.fn()
};

describe('Editor', () => {
  global.window = {
    onresize: vi.fn()
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create new instance', () => {
    // Arrange
    const editor = new Editor(mockApp);
    // Activate
    // Assert
    expect(editor._monaco).toBeNull();
  });
});
