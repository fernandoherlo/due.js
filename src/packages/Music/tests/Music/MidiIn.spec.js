import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebMidi } from 'webmidi';
import { COMMANDS } from '~/src/packages/Compiler/constants';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import LiveVariableRegistry from '~/src/packages/App/services/LiveVariableRegistry';
import MidiIn from '~/src/packages/Music/services/MidiIn';
import Music from '~/src/packages/Music/services/Music';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';
import VariableLive from '~/src/packages/Music/services/VariableLive';

const samplerStart = vi.hoisted(() => vi.fn());

vi.mock('webmidi', () => ({
  WebMidi: { inputs: [] }
}));

vi.mock('~/src/packages/Music/constants', () => ({
  COMMANDS_ELEMENT_MAP: {
    [COMMANDS.$$]: (instruction, app) => new VariableLive(instruction, app),
    [COMMANDS.mi]: (instruction, app) => new MidiIn(instruction, app),
    [COMMANDS.sam]: () => ({ start: samplerStart })
  }
}));

describe('MidiIn', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    WebMidi.inputs = [];
  });

  it('updates live variables only for the selected channel and controller', async () => {
    let onMidiMessage;
    const channel = {
      addListener: vi.fn((event, listener) => {
        onMidiMessage = listener;
      }),
      removeListener: vi.fn()
    };
    const update = vi.fn();
    const liveVariableRegistry = new LiveVariableRegistry();
    liveVariableRegistry.configure('$$control');
    liveVariableRegistry.subscribe('$$control', update);
    const app = {
      $logger: { log: vi.fn() },
      $debugger: { add: vi.fn() },
      $liveVariableRegistry: liveVariableRegistry
    };

    WebMidi.inputs = [{ name: 'input', channels: [undefined, undefined, channel] }];

    const midiIn = new MidiIn({
      name: '$$',
      element: '0',
      key: '$$control',
      value: { channel: 2, controller: 5 }
    }, app);

    await midiIn.start();

    onMidiMessage({ data: [177, 5, 80] });
    onMidiMessage({ data: [177, 6, 40] });
    onMidiMessage({ data: [145, 5, 70] });
    onMidiMessage({ data: [176, 5, 60] });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(80, false);
  });

  it('scales a MIDI source through its declared range', async () => {
    let onMidiMessage;
    const channel = {
      addListener: vi.fn((event, listener) => { onMidiMessage = listener; }),
      removeListener: vi.fn()
    };
    const app = {
      $logger: { log: vi.fn() },
      $debugger: { add: vi.fn() },
      $variablesLive: {},
      $liveVariableRegistry: new LiveVariableRegistry()
    };
    WebMidi.inputs = [{ name: 'input', channels: [undefined, channel] }];
    const compiler = new Compiler(app, new ValueFactory());
    const instruction = compiler.prepare('$$dur=mi0(1@7;[0.1-2])').addedInstructions[0];
    const variable = new VariableLive(instruction, app);

    await variable.start();
    onMidiMessage({ data: [176, 7, 0] });
    expect(app.$liveVariableRegistry.getValue('$$dur')).toBe(0.1);

    onMidiMessage({ data: [176, 7, 127] });
    expect(app.$liveVariableRegistry.getValue('$$dur')).toBe(2);

    await variable.end();
    expect(app.$liveVariableRegistry.getValue('$$dur')).toBeUndefined();
  });

  it('updates independent live variables on one channel and removes only the selected listener', async () => {
    const listeners = new Set();
    const channel = {
      addListener: vi.fn((event, listener) => listeners.add(listener)),
      removeListener: vi.fn((event, listener) => listeners.delete(listener))
    };
    const volumeUpdate = vi.fn();
    const filterUpdate = vi.fn();
    const liveVariableRegistry = new LiveVariableRegistry();
    liveVariableRegistry.configure('$$volume');
    liveVariableRegistry.configure('$$filter');
    liveVariableRegistry.subscribe('$$volume', volumeUpdate);
    liveVariableRegistry.subscribe('$$filter', filterUpdate);
    const app = {
      $logger: { log: vi.fn() },
      $debugger: { add: vi.fn() },
      $liveVariableRegistry: liveVariableRegistry
    };
    WebMidi.inputs = [{ name: 'input', channels: [undefined, channel] }];
    const volume = new MidiIn({ element: '0', key: '$$volume', value: { channel: 1, controller: 7 } }, app);
    const filter = new MidiIn({ element: '0', key: '$$filter', value: { channel: 1, controller: 74 } }, app);

    await volume.start();
    await filter.start();
    for (const listener of listeners) listener({ data: [176, 7, 96] });
    for (const listener of listeners) listener({ data: [176, 74, 32] });

    expect(listeners.size).toBe(2);
    expect(volumeUpdate).toHaveBeenCalledWith(96, false);
    expect(filterUpdate).toHaveBeenCalledWith(32, false);

    await volume.end();
    for (const listener of listeners) listener({ data: [176, 74, 64] });

    expect(listeners.size).toBe(1);
    expect(volumeUpdate).toHaveBeenCalledTimes(1);
    expect(filterUpdate).toHaveBeenLastCalledWith(64, false);
  });

  it('keeps a missing MIDI input inactive and allows it to be removed', async () => {
    const app = { $logger: { log: vi.fn() }, $variablesLive: {}, $liveVariableRegistry: new LiveVariableRegistry() };
    const variable = new VariableLive({ element: '0', key: '$$test', value: { channel: 1, controller: 5 } }, app);

    await variable.start();

    expect(app.$logger.log).toHaveBeenCalledWith('MIDI input 0 is not available; $$test will remain inactive.');
    expect(app.$variablesLive.$$test).toBeInstanceOf(MidiIn);

    await variable.end();

    expect(app.$variablesLive).toEqual({});
  });

  it('still rejects an unavailable MIDI channel without registering the variable', async () => {
    WebMidi.inputs = [{ name: 'input', channels: [] }];
    const app = { $logger: { log: vi.fn() }, $variablesLive: {}, $liveVariableRegistry: new LiveVariableRegistry() };
    const variable = new VariableLive({ element: '0', key: '$$test', value: { channel: 1, controller: 5 } }, app);

    await expect(variable.start()).rejects.toThrow('MIDI channel 1 is not available');

    expect(app.$variablesLive).toEqual({});
  });

  it('starts the other instruments in a plan when MIDI is unavailable', async () => {
    const app = {
      $logger: { log: vi.fn() },
      $debugger: { add: vi.fn() },
      $variablesLive: {},
      $liveVariableRegistry: new LiveVariableRegistry()
    };
    const compiler = new Compiler(app, new ValueFactory());
    const music = new Music(app);
    const plan = compiler.prepare('$$test=mi0(1@5)\nsam3#tom(C4;0.25;1)');

    await music.add(plan.addedInstructions);

    expect(samplerStart).toHaveBeenCalledTimes(1);
    expect(app.$variablesLive.$$test).toBeInstanceOf(MidiIn);
  });
});
