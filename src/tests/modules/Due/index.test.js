import { describe, afterEach, it, expect, vi } from 'vitest';
import Due from '~/src/modules/Due';

vi.mock('~/src/modules/Due/constants', () => {
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

describe('Due', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create new instance', () => {
    // Arrange
    const due = new Due(mockApp);
    // Activate
    // Assert
    expect(due._debug).toBeTruthy();
    expect(due._app).toEqual(mockApp);
  });

  describe('Instructions', () => {
    it('Add', () => {
      // Arrange
      const due = new Due(mockApp);
      const instructions = [{ name: 'foo', key: 'bar' }];
      // Activate
      due.add(instructions);
      // Assert
      expect(due._app.$debugger.add).toHaveBeenCalledWith('ADD', expect.anything());
    });

    it('Add empty', () => {
      // Arrange
      const due = new Due(mockApp);
      const instructions = [];
      // Activate
      due.add(instructions);
      // Assert
      expect(due._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Update', () => {
      // Arrange
      const due = new Due(mockApp);
      const instructions = ['foo'];
      // Activate
      due.update(instructions);
      // Assert
      expect(due._app.$debugger.add).toHaveBeenCalledWith('UPDATE', expect.anything());
    });

    it('Update empty', () => {
      // Arrange
      const due = new Due(mockApp);
      const instructions = [];
      // Activate
      due.update(instructions);
      // Assert
      expect(due._app.$debugger.add).not.toHaveBeenCalled();
    });

    it('Delete', () => {
      // Arrange
      const due = new Due(mockApp);
      const instructions = ['foo'];
      // Activate
      due.delete(instructions);
      // Assert
      expect(due._app.$debugger.add).toHaveBeenCalledWith('DELETE', expect.anything());
    });

    it('Delete empty', () => {
      // Arrange
      const due = new Due(mockApp);
      const instructions = [];
      // Activate
      due.delete(instructions);
      // Assert
      expect(due._app.$debugger.add).not.toHaveBeenCalled();
    });
  });
});
