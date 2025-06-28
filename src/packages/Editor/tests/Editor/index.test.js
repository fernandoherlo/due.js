import { describe, it, expect, vi } from 'vitest';
import Editor from '~/src/packages/Editor/services/Editor';

vi.mock('@codemirror/state');
vi.mock('@codemirror/view');
vi.mock('@codemirror/language');
vi.mock('@codemirror/theme-one-dark');

const mockApp = {
  getFromLocalStorage: vi.fn()
};

describe('Editor', () => {
  it('Create new instance', () => {
    // Arrange
    const editor = new Editor(mockApp);
    // Activate
    // Assert
    expect(editor.editor).toBeNull();
  });
});
