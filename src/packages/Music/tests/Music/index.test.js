import * as Tone from 'tone';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { COMMANDS } from '~/src/packages/Compiler/constants';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import Delay from '~/src/packages/Music/services/Effect/Delay';
import Sampler from '~/src/packages/Music/services/Instrument/Sampler';
import Music from '~/src/packages/Music/services/Music';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

vi.mock('tone', () => ({ FeedbackDelay: vi.fn(), Sampler: vi.fn() }));

vi.mock('~/src/packages/Music/constants', () => {
  const COMMANDS_ELEMENT_MAP = {
    foo: () => {
      return { start: vi.fn(), update: vi.fn(), end: vi.fn() };
    }
  };
  const SAMPLER_MAP = { tom: 'vcsl-tom' };
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
    it('Rejects instructions without a registered runtime command', () => {
      const music = new Music(mockApp);

      expect(() => music.validate([{ name: 'missing', actions: [] }])).toThrow('Unsupported command "missing".');
    });

    it('Rejects actions without a registered runtime command', () => {
      const music = new Music(mockApp);

      expect(() => music.validate([{ name: 'foo', actions: [{ name: 'missing' }] }])).toThrow('Unsupported command "missing".');
    });

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

  describe('Delay', () => {
    it.each([64, 127])('supports the documented program with delay %s', (amount) => {
      const effect = { delayTime: { value: 0 }, feedback: { value: 0 } };
      const feedbackDelay = Tone.FeedbackDelay.mockImplementation(function () {
        return effect;
      });
      const compiler = new Compiler(mockApp, new ValueFactory());
      const plan = compiler.prepare([
        '$bajo=24',
        '$alto=96',
        '',
        `sam3#tom([A2>C2>B2>D3];[1-3];[2-4]):r(64):d(${amount};0.3):v($bajo)`,
        'sam5#harp([G4,E4,C4,A3];0.25;1):v($alto)'
      ].join('\n'));
      const action = plan.addedInstructions[0].actions.find(action => action.name === COMMANDS.d);
      const delay = new Delay(action, mockApp);

      delay.create();

      expect(feedbackDelay).toHaveBeenCalledWith({ maxDelay: 3 });
      expect(effect.delayTime.value).toBeCloseTo(amount / 127 * 3);
      expect(effect.feedback.value).toBe(0.3);
    });
  });

  describe('Sampler', () => {
    it('rejects startup when an audio sample cannot be loaded', async () => {
      const failure = new Error('Sample not found');
      Tone.Sampler.mockImplementation(function (options) {
        options.onerror(failure);
      });
      const sampler = new Sampler({ modifier: 'tom', actions: [] }, mockApp);

      await expect(sampler.start()).rejects.toBe(failure);
    });
  });
});
