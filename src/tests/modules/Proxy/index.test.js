import { describe, afterEach, it, expect, vi } from 'vitest';
import Proxy from '~/src/modules/Proxy';

const mockApp = {
  $debug: true,
  $logger: {
    log: vi.fn()
  },
  $debugger: {
    add: vi.fn()
  }
};

describe('Proxy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create new instance', () => {
    // Arrange
    const proxy = new Proxy(mockApp);
    // Activate
    // Assert
    expect(proxy._debug).toBeTruthy();
    expect(proxy._app).toEqual(mockApp);
  });

  it('Link to app', () => {
    // Arrange
    const proxy = new Proxy(mockApp);
    // Activate
    proxy.linkToApp();
    // Assert
    expect(proxy._app.$proxy).toBe(proxy);
  });

  describe('Instructions', () => {
    it('Add', () => {
      // Arrange
      const proxy = new Proxy(mockApp);
      const instructions = ['foo'];
      // Activate
      proxy.add(instructions);
      // Assert
      expect(proxy._app.$debugger.add).toHaveBeenCalledWith('ADD', expect.anything());
    });

    it('Add empty', () => {
      // Arrange
      const proxy = new Proxy(mockApp);
      const instructions = [];
      // Activate
      proxy.add(instructions);
      // Assert
      expect(proxy._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Update', () => {
      // Arrange
      const proxy = new Proxy(mockApp);
      const instructions = ['foo'];
      // Activate
      proxy.update(instructions);
      // Assert
      expect(proxy._app.$debugger.add).toHaveBeenCalledWith('UPDATE', expect.anything());
    });

    it('Update empty', () => {
      // Arrange
      const proxy = new Proxy(mockApp);
      const instructions = [];
      // Activate
      proxy.update(instructions);
      // Assert
      expect(proxy._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Delete', () => {
      // Arrange
      const proxy = new Proxy(mockApp);
      const instructions = ['foo'];
      // Activate
      proxy.delete(instructions);
      // Assert
      expect(proxy._app.$debugger.add).toHaveBeenCalledWith('DELETE', expect.anything());
    });

    it('Delete empty', () => {
      // Arrange
      const proxy = new Proxy(mockApp);
      const instructions = [];
      // Activate
      proxy.delete(instructions);
      // Assert
      expect(proxy._app.$debugger.add).not.toHaveBeenCalled();
    });
  });
});
