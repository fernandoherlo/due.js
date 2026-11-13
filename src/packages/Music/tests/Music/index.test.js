import * as Tone from 'tone';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WebMidi } from 'webmidi';
import { COMMANDS } from '~/src/packages/Compiler/constants';
import LiveVariableRegistry from '~/src/packages/App/services/LiveVariableRegistry';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import Delay from '~/src/packages/Music/services/Effect/Delay';
import Volumen from '~/src/packages/Music/services/Effect/Volumen';
import Instrument from '~/src/packages/Music/services/Instrument';
import Sampler from '~/src/packages/Music/services/Instrument/Sampler';
import Synth from '~/src/packages/Music/services/Instrument/Synth';
import Reverse from '~/src/packages/Music/services/Modes/Reverse';
import Music from '~/src/packages/Music/services/Music';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

vi.mock('tone', async (importOriginal) => {
  const original = await importOriginal();
  const sampler = vi.fn();
  sampler.prototype.triggerAttackRelease = original.Sampler.prototype.triggerAttackRelease;
  return {
    ...original,
    FeedbackDelay: vi.fn(),
    Volume: vi.fn(),
    getDraw: vi.fn(() => ({ schedule: callback => callback() })),
    Loop: vi.fn(),
    Sampler: sampler,
    Synth: vi.fn(),
    ToneAudioBuffer: { load: vi.fn() },
    getTransport: vi.fn(),
    start: vi.fn()
  };
});

vi.mock('webmidi', () => ({ WebMidi: { enable: vi.fn() } }));

const fakeVolume = vi.hoisted(() => instruction => ({
  ...instruction,
  effect: {},
  create: vi.fn(),
  toDestination: vi.fn(),
  connect: vi.fn(),
  end: vi.fn()
}));

vi.mock('~/src/packages/Music/constants', () => {
  const COMMANDS_ELEMENT_MAP = {
    sam: (instruction, app) => new Sampler(instruction, app),
    v: fakeVolume,
    foo: () => {
      return { start: vi.fn(), update: vi.fn(), end: vi.fn() };
    }
  };
  return { COMMANDS_ELEMENT_MAP };
});

vi.mock('~/src/packages/Music/constants/effects', () => ({ EFFECTS_MAP: { v: fakeVolume } }));

vi.mock('~/src/packages/Music/constants/samplers', () => ({
  SAMPLER_MAP: { birds: 'birds', test: 'test', tom: 'vcsl-tom' }
}));

vi.mock('~/src/packages/Music/constants/samples.json', () => ({
  default: { birds: ['1.mp3'], test: { C4: 'c4.wav' }, 'vcsl-tom': { C2: 'c2.wav' } }
}));

const mockApp = {
  __debugEnabled: true,
  $logger: {
    log: vi.fn()
  },
  $debugger: {
    add: vi.fn()
  },
  $liveVariableRegistry: new LiveVariableRegistry(),
  $ui: {
    setMidiUnavailable: vi.fn(),
    updateLoopTime: vi.fn(),
    updatePatternStep: vi.fn(),
    clearPatternStep: vi.fn(),
    clearActiveSteps: vi.fn()
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

  it('skips a rest step and continues an ordered note pattern', async () => {
    const compiler = new Compiler(mockApp, new ValueFactory());
    const instruction = compiler.prepare('sam1#birds([C4>~>E4];1;1)').addedInstructions[0];
    const instrument = new Instrument(instruction, mockApp);
    const triggerAttackRelease = vi.fn();
    Tone.Loop.mockReset().mockImplementation((callback, interval) => ({
      callback,
      interval,
      start: vi.fn().mockReturnThis()
    }));
    instrument.instrument = { triggerAttackRelease };

    await instrument.play();
    const loop = Tone.Loop.mock.results[0].value;
    loop.callback(0);
    loop.callback(1);
    loop.callback(2);

    expect(triggerAttackRelease.mock.calls.map(([note]) => note)).toEqual(['C4', 'E4']);
    expect(mockApp.$ui.updatePatternStep.mock.calls).toEqual([
      ['sam1', 0, 1],
      ['sam1', 1, 0],
      ['sam1', 2, 1]
    ]);
    expect(mockApp.$ui.clearPatternStep).not.toHaveBeenCalled();
  });

  it('switches between the default and supersaw synth configurations on update', async () => {
    Tone.Synth.mockImplementation(options => ({
      options,
      connect: vi.fn(),
      toDestination: vi.fn(),
      triggerAttackRelease: vi.fn(),
      detune: { setValueAtTime: vi.fn() },
      disconnect: vi.fn(),
      dispose: vi.fn()
    }));
    Tone.Loop.mockReset().mockImplementation((callback, interval) => ({
      callback,
      interval,
      start: vi.fn().mockReturnThis(),
      cancel: vi.fn().mockReturnThis(),
      dispose: vi.fn().mockReturnThis()
    }));
    const compiler = new Compiler(mockApp, new ValueFactory());
    const supersaw = compiler.prepare('n1#supersaw(C4;1;1)').addedInstructions[0];
    const normal = compiler.prepare('n1(C4;1;1)').addedInstructions[0];
    const synth = new Synth(supersaw, mockApp);

    await synth.start();
    await synth.update(normal);

    expect(Tone.Synth).toHaveBeenNthCalledWith(1, {
      oscillator: { type: 'fatsawtooth', count: 5, spread: 20 }
    });
    expect(Tone.Synth).toHaveBeenNthCalledWith(2, {});
  });

  it('keeps the active marker until a delayed note is due', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    mockApp.$ui.clearPatternStep.mockClear();
    mockApp.$ui.updatePatternStep.mockClear();
    const compiler = new Compiler(mockApp, new ValueFactory());
    const instruction = compiler.prepare('sam1#birds(C4;1;1)::late(1;4)').addedInstructions[0];
    const instrument = new Instrument(instruction, mockApp);
    const triggerAttackRelease = vi.fn();
    const draw = { schedule: vi.fn() };
    Tone.getDraw.mockReturnValue(draw);
    Tone.Loop.mockReset().mockImplementation((callback, interval) => ({
      callback,
      interval,
      start: vi.fn().mockReturnThis()
    }));
    instrument.instrument = { triggerAttackRelease };

    await instrument.play();
    Tone.Loop.mock.results[0].value.callback(10);

    expect(mockApp.$ui.clearPatternStep).not.toHaveBeenCalled();
    expect(triggerAttackRelease).toHaveBeenCalledWith('C4', 1, 12);
    expect(draw.schedule).toHaveBeenCalledWith(expect.any(Function), 12);

    draw.schedule.mock.calls[0][0]();
    expect(mockApp.$ui.updatePatternStep).toHaveBeenCalledWith('sam1', 0, 1);
  });

  it('fans a live value out to effects and releases only the updated destination', async () => {
    const toneVolumes = [];
    Tone.Volume.mockImplementation(() => {
      const volume = { volume: { value: 0 }, debug: false, disconnect: vi.fn(), dispose: vi.fn() };
      toneVolumes.push(volume);
      return volume;
    });
    const registry = new LiveVariableRegistry();
    const app = { ...mockApp, $liveVariableRegistry: registry };
    const first = new Volumen({ name: COMMANDS.v, key: 'volume1', value: { value: '$$control' } }, app);
    const second = new Volumen({ name: COMMANDS.v, key: 'volume2', value: { value: '$$control' } }, app);

    first.create();
    second.create();
    registry.configure('$$control');
    registry.publish('$$control', 127);
    const lateTarget = new Volumen({ name: COMMANDS.v, key: 'volume3', value: { value: '$$control' } }, app);
    lateTarget.create();

    expect(toneVolumes.map(volume => volume.volume.value)).toEqual([30, 30, 30]);
    await first.update(64);
    registry.publish('$$control', 0);

    expect(toneVolumes[0].volume.value).toBeCloseTo((64 / 127) * 60 - 30);
    expect(toneVolumes[1].volume.value).toBe(-30);
    expect(toneVolumes[2].volume.value).toBe(-30);
    registry.publish('$$control', 127);

    expect(toneVolumes[0].volume.value).toBeCloseTo((64 / 127) * 60 - 30);
    expect(toneVolumes[1].volume.value).toBe(30);
    expect(toneVolumes[2].volume.value).toBe(30);

    registry.reset('$$control');
    expect(toneVolumes[1].volume.value).toBe(-30);
    expect(toneVolumes[2].volume.value).toBe(-30);

    await second.end();
    await lateTarget.end();

    expect(registry.getValue('$$control')).toBeUndefined();
  });

  it('uses an explicit live range as the effect value without remapping it', async () => {
    const feedbackDelay = {
      delayTime: { value: 0 },
      feedback: { value: 0 },
      disconnect: vi.fn(),
      dispose: vi.fn()
    };
    Tone.FeedbackDelay.mockReturnValue(feedbackDelay);
    const registry = new LiveVariableRegistry();
    const app = { ...mockApp, $liveVariableRegistry: registry };
    registry.configure('$$duration', { min: 0.1, max: 2 });
    const delay = new Delay({
      name: COMMANDS.d,
      key: 'sam1',
      value: { value: '$$duration', duration: '0.35' }
    }, app);

    delay.create();
    expect(feedbackDelay.delayTime.value).toBe(0.1);

    registry.publish('$$duration', 127);
    expect(feedbackDelay.delayTime.value).toBe(2);

    await delay.end();
    registry.reset('$$duration');
  });

  describe('Startup', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      Tone.getTransport.mockReturnValue({
        scheduleRepeat: vi.fn(), clear: vi.fn(), bpm: { value: 0 }, seconds: 0, toggle: vi.fn()
      });
      Tone.start.mockResolvedValue(undefined);
    });

    it.each(['Permission to use Web MIDI API was not granted.', 'Web MIDI API is not supported.'])(
      'keeps audio and transport controls available when MIDI fails: %s', async (message) => {
        const failure = new Error(message);
        WebMidi.enable.mockRejectedValue(failure);
        const music = new Music(mockApp);
        const transport = Tone.getTransport();

        await music.start();
        await music.toggle();

        expect(mockApp.$logger.log).toHaveBeenCalledWith(['MIDI unavailable:', failure]);
        expect(mockApp.$ui.setMidiUnavailable).toHaveBeenCalledWith(message);
        expect(transport.scheduleRepeat).toHaveBeenCalledWith(expect.any(Function), 0.5, 0);
        expect(transport.bpm.value).toBe(120);
        expect(Tone.start).toHaveBeenCalledOnce();
        expect(transport.toggle).toHaveBeenCalledOnce();
      }
    );

    it('does not show a MIDI warning when MIDI is enabled', async () => {
      WebMidi.enable.mockResolvedValue(undefined);
      const music = new Music(mockApp);

      await music.start();

      expect(WebMidi.enable).toHaveBeenCalledOnce();
      expect(mockApp.$ui.setMidiUnavailable).not.toHaveBeenCalled();
      expect(Tone.getTransport().scheduleRepeat).toHaveBeenCalledOnce();
    });

    it('still rejects failures in audio initialization', async () => {
      WebMidi.enable.mockResolvedValue(undefined);
      const failure = new Error('Audio transport unavailable');
      Tone.getTransport().scheduleRepeat.mockImplementation(() => { throw failure; });
      const music = new Music(mockApp);

      await expect(music.start()).rejects.toBe(failure);

      expect(mockApp.$ui.setMidiUnavailable).not.toHaveBeenCalled();
    });

    it('updates the visual beat interval without changing the audio transport tempo', async () => {
      const transport = {
        scheduleRepeat: vi.fn().mockReturnValueOnce(11).mockReturnValueOnce(12),
        clear: vi.fn(),
        bpm: { value: 0 },
        seconds: 2,
        toggle: vi.fn()
      };
      const draw = { schedule: vi.fn(callback => callback()) };
      Tone.getTransport.mockReturnValue(transport);
      Tone.getDraw.mockReturnValue(draw);
      const music = new Music(mockApp);

      await music.start();
      music.setTempo(90);
      transport.scheduleRepeat.mock.calls[1][0](2.5);

      expect(transport.clear).toHaveBeenCalledWith(11);
      expect(transport.scheduleRepeat).toHaveBeenLastCalledWith(expect.any(Function), 60 / 90, 2);
      expect(mockApp.$ui.updateLoopTime).toHaveBeenCalledWith(25);
      expect(draw.schedule).toHaveBeenCalledWith(expect.any(Function), 2.5);
      expect(transport.bpm.value).toBe(120);
    });
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

    it('keeps an explicit feedback of 0 and defaults only when it is omitted', () => {
      const effect = { delayTime: { value: 0 }, feedback: { value: 0 } };
      Tone.FeedbackDelay.mockImplementation(function () {
        return effect;
      });
      const compiler = new Compiler(mockApp, new ValueFactory());
      const [explicit, omitted] = ['d(64;0)', 'd(64)'].map(action =>
        compiler.prepare(`sam1#tom(C4;1;1):${action}`).addedInstructions[0].actions[0]);

      new Delay(explicit, mockApp).create();
      expect(effect.feedback.value).toBe(0);

      new Delay(omitted, mockApp).create();
      expect(effect.feedback.value).toBe(0.5);
    });
  });

  describe('Reverse playback', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      vi.spyOn(Math, 'random').mockReturnValue(0);
      Tone.Sampler.mockReset().mockImplementation(function (options) {
        if (options.onload) queueMicrotask(options.onload);
      });
      Object.assign(Tone.Sampler.prototype, {
        ...createAudioNode(),
        context: { createBuffer: createPcmBuffer },
        add: vi.fn().mockReturnThis(),
        triggerAttack: vi.fn().mockReturnThis(),
        triggerRelease: vi.fn().mockReturnThis(),
        toSeconds: time => time ?? 0
      });
      Tone.ToneAudioBuffer.load.mockReset().mockImplementation(async () => createSampleBuffer());
      Tone.Loop.mockReset().mockImplementation((callback, interval) => ({
        ...createAudioNode(), callback, interval, cancel: vi.fn()
      }));
      Tone.getTransport.mockReturnValue({ seconds: 0 });
    });

    it.each([
      'sam1#birds(C4):reverse(127)',
      'n1(C4)::reverse(127)',
      'sam1#birds(C4)::reverse1(127)',
      'sam1#birds(C4)::reverse(127)::reverse(64)',
      'sam1#birds(C4):::reverse(127)',
      'sam1#birds(C4)::grain(90)'
    ])('rejects invalid or removed playback modes: %s', (code) => {
      const compiler = new Compiler(mockApp, new ValueFactory());

      expect(() => compiler.prepare(code)).toThrow();
    });

    it.each(['[0>127]', '[0|127]', '[0-127]', '90;', '1;2;3;4'])(
      'rejects invalid mode argument structure in the analyzer: %s', (argument) => {
        const compiler = new Compiler(mockApp, new ValueFactory());

        expect(() => compiler.prepare(`sam1#birds(C4)::reverse(${argument})`)).toThrow('one scalar argument');
        expect(Tone.Sampler).not.toHaveBeenCalled();
      }
    );

    it.each(['', '-1', '128', 'C4'])(
      'rejects invalid mode arguments before allocating audio: %s', (argument) => {
        const compiler = new Compiler(mockApp, new ValueFactory());
        const music = new Music(mockApp);
        const plan = compiler.prepare(`sam1#birds(C4)::reverse(${argument})`);

        expect(() => music.validate(plan.addedInstructions)).toThrow();
        expect(Tone.Sampler).not.toHaveBeenCalled();
      }
    );

    it('reverses every channel without changing the original samples or their sample rate', async () => {
      const left = Float32Array.from([1, 2, 3]);
      const right = Float32Array.from([4, 5, 6]);
      const buffer = createSampleBuffer([left, right]);
      const reverse = new Reverse({ value: { value: 127 } }, { C4: buffer });

      reverse.triggerAttackRelease('C4', 0.003);

      const reversed = Tone.Sampler.prototype.add.mock.calls.at(-1)[1];
      expect([...reversed.getChannelData(0)]).toEqual([3, 2, 1]);
      expect([...reversed.getChannelData(1)]).toEqual([6, 5, 4]);
      expect([...left]).toEqual([1, 2, 3]);
      expect([...right]).toEqual([4, 5, 6]);
      expect(reversed.sampleRate).toBe(buffer.sampleRate);
    });

    it('reverses the note-length fragment instead of starting in a quiet sample tail', async () => {
      const buffer = createSampleBuffer([Float32Array.from([0.8, 0.4, 0.2, 0.001, 0.001, 0.001])]);
      Tone.ToneAudioBuffer.load.mockResolvedValueOnce(buffer);
      const compiler = new Compiler(mockApp, new ValueFactory());
      const sampler = new Sampler(compiler.prepare('sam1#test(C4;0.003;1)::reverse(127)').addedInstructions[0], mockApp);
      await sampler.start();

      Tone.Loop.mock.results[0].value.callback();

      const selected = Tone.Sampler.prototype.add.mock.calls.at(-1)[1];
      expect(selected.length).toBe(3);
      expect([...selected.getChannelData(0)]).toEqual([...Float32Array.from([0.2, 0.4, 0.8])]);
    });

    it.each([0, 127])('does not draw random numbers for endpoint probability %s', async (probability) => {
      const compiler = new Compiler(mockApp, new ValueFactory());
      const instruction = compiler.prepare(`sam1#test(C4;2;4)::reverse(${probability})`).addedInstructions[0];
      const sampler = new Sampler(instruction, mockApp);
      const forward = createSampleBuffer();
      Tone.ToneAudioBuffer.load.mockResolvedValueOnce(forward);
      await sampler.start();

      Tone.Loop.mock.results[0].value.callback();

      expect(Math.random).not.toHaveBeenCalled();
      const added = Tone.Sampler.prototype.add.mock.calls.at(-1);
      if (probability === 0) expect(added).toBeUndefined();
      else expect(added[1]).not.toBe(forward);
      expect(Tone.Sampler.prototype.triggerAttack).toHaveBeenCalledWith('C4', 0, 1);
    });

    it('chooses once per chord and restores forward playback on the next step', async () => {
      const compiler = new Compiler(mockApp, new ValueFactory());
      const instruction = compiler.prepare('sam1#test([C4|E4|G4];2;4)::reverse(64)').addedInstructions[0];
      const sampler = new Sampler(instruction, mockApp);
      const forward = createSampleBuffer();
      Tone.ToneAudioBuffer.load.mockResolvedValueOnce(forward);
      await sampler.start();
      Math.random.mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);

      Tone.Loop.mock.results[0].value.callback();
      const reversed = Tone.Sampler.prototype.add.mock.calls.at(-1)[1];
      Tone.Loop.mock.results[0].value.callback();

      expect(Math.random).toHaveBeenCalledTimes(2);
      expect(reversed).not.toBe(forward);
      expect(Tone.Sampler.prototype.add.mock.calls.at(-1)[1]).toBe(forward);
      expect(Tone.Sampler.prototype.triggerAttack).toHaveBeenNthCalledWith(1, 'C4', 0, 1);
      expect(Tone.Sampler.prototype.triggerRelease).toHaveBeenCalledWith('G4', 2);
    });

    it('adjusts the reversed fragment length for transposed notes in a chord', async () => {
      const buffer = createSampleBuffer([Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8])]);
      Tone.ToneAudioBuffer.load.mockResolvedValueOnce(buffer);
      const compiler = new Compiler(mockApp, new ValueFactory());
      const instruction = compiler.prepare('sam1#test([C4|C5];0.003;1)::reverse(127)').addedInstructions[0];
      const sampler = new Sampler(instruction, mockApp);
      await sampler.start();

      Tone.Loop.mock.results[0].value.callback();

      const selections = Tone.Sampler.prototype.add.mock.calls.map(call => [...call[1].getChannelData(0)]);
      expect(selections).toEqual([[3, 2, 1], [6, 5, 4, 3, 2, 1]]);
      expect(Tone.Sampler.prototype.triggerRelease).toHaveBeenCalledWith('C4', 0.003);
      expect(Tone.Sampler.prototype.triggerRelease).toHaveBeenCalledWith('C5', 0.003);
    });

    it('preserves notes, durations, intervals and effect routing through the compiler and music services', async () => {
      const compiler = new Compiler(mockApp, new ValueFactory());
      const music = new Music(mockApp);
      const plan = compiler.prepare('$chance=127\nsam1#birds([C4|G4];4;8)::reverse($chance):v(48)');

      music.validate(plan.addedInstructions);
      await music.add(plan.addedInstructions);
      Tone.Loop.mock.results[0].value.callback();

      const effect = music.instructions.sam1.actions[1];
      expect(plan.addedInstructions[0].actions[0].mode).toBe(true);
      expect(Tone.Loop).toHaveBeenCalledWith(expect.any(Function), 8);
      expect(Tone.Sampler.prototype.triggerAttack).toHaveBeenCalledWith('C4', 0, 1);
      expect(Tone.Sampler.prototype.triggerAttack).toHaveBeenCalledWith('G4', 0, 1);
      expect(Tone.Sampler.prototype.triggerRelease).toHaveBeenCalledWith('G4', 4);
      expect(Tone.Sampler.prototype.connect).toHaveBeenCalledWith(effect.effect);
      expect(effect.toDestination).toHaveBeenCalledOnce();
    });

    it('keeps native sampler chord playback when no mode is selected', async () => {
      const compiler = new Compiler(mockApp, new ValueFactory());
      const instruction = compiler.prepare('sam1#birds([C4|G4];2;4)').addedInstructions[0];
      const sampler = new Sampler(instruction, mockApp);
      const trigger = vi.spyOn(Tone.Sampler.prototype, 'triggerAttackRelease');
      await sampler.start();

      Tone.Loop.mock.results[0].value.callback();

      expect(trigger).toHaveBeenCalledExactlyOnceWith(['C4', 'G4'], 2, undefined);
      expect(Tone.Sampler).toHaveBeenCalledWith(expect.objectContaining({ urls: { 0: 'samples/birds/1.mp3' } }));
      expect(Tone.Sampler.prototype.add).not.toHaveBeenCalled();
      expect(Math.random).not.toHaveBeenCalled();
    });

    it.each([
      ['', '::reverse(127)'],
      ['::reverse(127)', '']
    ])('changes playback from sam%s to sam%s on recompilation', async (originalMode, nextMode) => {
      const compiler = new Compiler(mockApp, new ValueFactory());
      const original = compiler.prepare(`sam1#birds(C4;1;2)${originalMode}`).addedInstructions[0];
      const replacement = compiler.prepare(`sam1#birds(C4;1;2)${nextMode}`).addedInstructions[0];
      const sampler = new Sampler(original, mockApp);
      await sampler.start();
      Tone.Loop.mock.results[0].value.callback();
      Tone.Sampler.prototype.add.mockClear();

      await sampler.update(replacement);
      Tone.Loop.mock.results[1].value.callback();

      expect(Tone.Sampler).toHaveBeenCalledTimes(2);
      expect(Tone.Sampler.prototype.dispose).toHaveBeenCalledOnce();
      expect(Tone.ToneAudioBuffer.load).toHaveBeenCalledOnce();
      expect(Tone.Sampler.prototype.add).toHaveBeenCalledTimes(nextMode ? 1 : 0);
    });

    it('rebuilds on probability changes and cleans up effects and loops on deletion', async () => {
      const compiler = new Compiler(mockApp, new ValueFactory());
      const music = new Music(mockApp);
      const original = compiler.prepare('sam1#birds(C4;4;8)::reverse(0):v(48)').addedInstructions;
      await music.add(original);
      const firstLoop = Tone.Loop.mock.results[0].value;
      const firstEffect = music.instructions.sam1.actions[1];
      const replacement = compiler.prepare('sam1#birds(C4;4;8)::reverse(127):v(48)').addedInstructions;

      await music.update(replacement);
      await music.delete(replacement);

      expect(Tone.Sampler.prototype.dispose).toHaveBeenCalledTimes(2);
      expect(firstLoop.dispose).toHaveBeenCalledTimes(2);
      expect(firstEffect.end).toHaveBeenCalledOnce();
      expect(Tone.Loop.mock.results[1].value.dispose).toHaveBeenCalledOnce();
    });
  });

  describe('Sampler', () => {
    it('rejects unknown sample presets before allocating audio', () => {
      const compiler = new Compiler(mockApp, new ValueFactory());
      const music = new Music(mockApp);
      const plan = compiler.prepare('sam1#nothing(C4;1;1)');

      expect(() => music.validate(plan.addedInstructions)).toThrow('Unknown sample preset "nothing"');
      expect(Tone.Sampler).not.toHaveBeenCalled();
    });

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

function createSampleBuffer (channels = [new Float32Array(6000).fill(0.25)]) {
  return {
    sampleRate: 1000,
    length: channels[0].length,
    numberOfChannels: channels.length,
    getChannelData: channel => channels[channel]
  };
}

function createPcmBuffer (channelCount, length, sampleRate) {
  const channels = Array.from({ length: channelCount }, () => new Float32Array(length));
  return {
    sampleRate,
    length,
    numberOfChannels: channelCount,
    getChannelData: channel => channels[channel],
    copyToChannel: (samples, channel) => channels[channel].set(samples)
  };
}

function createAudioNode () {
  return {
    context: { transport: { seconds: 0 } },
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn().mockReturnThis(),
    dispose: vi.fn().mockReturnThis(),
    start: vi.fn().mockReturnThis(),
    toDestination: vi.fn().mockReturnThis()
  };
}
