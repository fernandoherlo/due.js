import { describe, afterEach, it, expect, vi } from 'vitest';
import Music from '~/src/packages/Music';

vi.mock('~/src/packages/Music/constants', () => {
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
    it('Add', async () => {
      // Arrange
      const music = new Music(mockApp);
      music._lastInstructions = {};
      const instructions = { foo: { name: 'foo', key: 'bar' } };
      // Activate
      await music.process(instructions);
      // Assert
      expect(music._app.$debugger.add).toHaveBeenCalledWith('ADD', expect.anything());
    });

    it('Add empty', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      await music.process(instructions);
      // Assert
      expect(music._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Update', async () => {
      // Arrange
      const music = new Music(mockApp);
      music._lastInstructions = { foo: { name: 'foo', key: 'bar' } };
      const instructions = { foo: { name: 'ter', key: 'tor' } };
      // Activate
      console.log(music._lastInstructions);
      await music.process(instructions);
      console.log(music._lastInstructions);
      // Assert
      expect(music._app.$debugger.add).toHaveBeenCalledWith('UPDATE', expect.anything());
    });

    it('Update empty', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      await music.process(instructions);
      // Assert
      expect(music._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Delete', async () => {
      // Arrange
      const music = new Music(mockApp);
      music._lastInstructions = { foo: { name: 'foo', key: 'bar' } };
      const instructions = {};
      // Activate
      await music.process(instructions);
      // Assert
      expect(music._app.$debugger.add).toHaveBeenCalledWith('DELETE', expect.anything());
    });

    it('Delete empty', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      await music.process(instructions);
      // Assert
      expect(music._app.$debugger.add).not.toHaveBeenCalled();
    });
  });
});
