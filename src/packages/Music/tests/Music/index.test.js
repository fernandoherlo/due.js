import { describe, afterEach, it, expect, vi } from 'vitest';
import Music from '~/src/packages/Music/services/Music';

vi.mock('~/src/packages/Music/constants', () => {
  const COMMANDS_ELEMENT_MAP = {
    foo: () => {
      return { start: vi.fn(), update: vi.fn(), end: vi.fn() };
    }
  };
  const SAMPLER_MAP = vi.fn();
  return { COMMANDS_ELEMENT_MAP, SAMPLER_MAP };
});

const mockApp = {
  __debugEnabled: true,
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
    expect(music.app).toEqual(mockApp);
  });

  describe('Instructions', () => {
    it('Add', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [{ name: 'foo', key: 'bar' }];
      // Activate
      await music.add(instructions);
      // Assert
      expect(mockApp.$debugger.add).toHaveBeenCalledWith('ADD', expect.anything());
      expect(music.instructions).toHaveProperty('bar');
    });

    it('Add empty', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      await music.add(instructions);
      // Assert
      expect(mockApp.$debugger.add).not.toHaveBeenCalled();
    });

    it('Update', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [{ name: 'foo', key: 'bar' }];
      await music.add(instructions);
      // Activate
      await music.update(instructions);
      // Assert
      expect(mockApp.$debugger.add).toHaveBeenCalledWith('UPDATE', expect.anything());
      expect(music.instructions.bar.update).toHaveBeenCalled();
    });

    it('Update empty', async () => {
      // Arrange
      const music = new Music(mockApp);
      // Activate
      await music.update([]);
      // Assert
      expect(mockApp.$debugger.add).not.toHaveBeenCalled();
    });

    it('Delete', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [{ name: 'foo', key: 'bar' }];
      await music.add(instructions);
      // Activate
      await music.delete(instructions);
      // Assert
      expect(mockApp.$debugger.add).toHaveBeenCalledWith('DELETE', expect.anything());
      expect(music.instructions).not.toHaveProperty('bar');
    });

    it('Delete empty', async () => {
      // Arrange
      const music = new Music(mockApp);
      const instructions = [];
      // Activate
      await music.delete(instructions);
      // Assert
      expect(mockApp.$debugger.add).not.toHaveBeenCalled();
    });
  });
});
