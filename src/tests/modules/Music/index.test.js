import { describe, afterEach, it, expect, vi } from 'vitest';
import Music from '~/src/modules/Music';

vi.mock('~/src/modules/Music/constants', () => {
  const COMMANDS_ELEMENT_MAP = {
    foo: () => {
      return { start: vi.fn() };
    }
  };
  const SAMPLER_MAP = vi.fn();
  return { COMMANDS_ELEMENT_MAP, SAMPLER_MAP };
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

describe('Music', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create new instance', () => {
    // Arrange
    const music = new Music(mockApp);
    // Activate
    // Assert
    expect(music._debug).toBeTruthy();
    expect(music._app).toEqual(mockApp);
  });

  describe('Instructions', () => {
    it('Add', () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [{ name: 'foo', key: 'bar' }];
      // Activate
      music.add(instructions);
      // Assert
      expect(music._app.$debugger.add).toHaveBeenCalledWith('ADD', expect.anything());
    });

    it('Add empty', () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      music.add(instructions);
      // Assert
      expect(music._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Update', () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = ['foo'];
      // Activate
      music.update(instructions);
      // Assert
      expect(music._app.$debugger.add).toHaveBeenCalledWith('UPDATE', expect.anything());
    });

    it('Update empty', () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      music.update(instructions);
      // Assert
      expect(music._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Delete', () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = ['foo'];
      // Activate
      music.delete(instructions);
      // Assert
      expect(music._app.$debugger.add).toHaveBeenCalledWith('DELETE', expect.anything());
    });

    it('Delete empty', () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      music.delete(instructions);
      // Assert
      expect(music._app.$debugger.add).not.toHaveBeenCalled();
    });
  });
});
