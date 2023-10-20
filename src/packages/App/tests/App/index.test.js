import { describe, afterEach, it, expect, vi } from 'vitest';
import App from '~/src/packages/App/services/App';

describe('App', () => {
  global.window = {
    onerror: vi.fn()
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create new instance', () => {
    // Arrange
    const app = new App(true);
    // Activate
    // Assert
    expect(app.$debug).toBeTruthy();
  });
});
