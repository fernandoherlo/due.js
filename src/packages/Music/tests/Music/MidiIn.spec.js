import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebMidi } from 'webmidi';
import { COMMANDS } from '~/src/packages/Compiler/constants';
import Compiler from '~/src/packages/Compiler/services/Compiler';
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
  },
  SAMPLER_MAP: {}
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
    const app = {
      $logger: { log: vi.fn() },
      $debugger: { add: vi.fn() },
      $variablesLiveMap: { $$control: { update } }
    };

    WebMidi.inputs = [{ name: 'input', channels: [undefined, undefined, channel] }];

    const midiIn = new MidiIn({
      name: '$$',
      element: '0',
      key: '$$control',
      value: '2@5'
    }, app);

    await midiIn.start();

    onMidiMessage({ data: [177, 5, 80] });
    onMidiMessage({ data: [177, 6, 40] });
    onMidiMessage({ data: [145, 5, 70] });
    onMidiMessage({ data: [176, 5, 60] });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(80);
  });

  it('keeps a missing MIDI input inactive and allows it to be removed', async () => {
    const app = { $logger: { log: vi.fn() }, $variablesLive: {} };
    const variable = new VariableLive({ element: '0', key: '$$test', value: '1@5' }, app);

    await variable.start();

    expect(app.$logger.log).toHaveBeenCalledWith('MIDI input 0 is not available; $$test will remain inactive.');
    expect(app.$variablesLive.$$test).toBeInstanceOf(MidiIn);

    await variable.end();

    expect(app.$variablesLive).toEqual({});
  });

  it('still rejects an unavailable MIDI channel without registering the variable', async () => {
    WebMidi.inputs = [{ name: 'input', channels: [] }];
    const app = { $logger: { log: vi.fn() }, $variablesLive: {} };
    const variable = new VariableLive({ element: '0', key: '$$test', value: '1@5' }, app);

    await expect(variable.start()).rejects.toThrow('MIDI channel 1 is not available');

    expect(app.$variablesLive).toEqual({});
  });

  it('starts the other instruments in a plan when MIDI is unavailable', async () => {
    const app = {
      $logger: { log: vi.fn() },
      $debugger: { add: vi.fn() },
      $variablesLive: {}
    };
    const compiler = new Compiler(app, new ValueFactory());
    const music = new Music(app);
    const plan = compiler.prepare('$$test=mi0(1@5)\nsam3#tom(C4;0.25;1)');

    await music.add(plan.addedInstructions);

    expect(samplerStart).toHaveBeenCalledTimes(1);
    expect(app.$variablesLive.$$test).toBeInstanceOf(MidiIn);
  });
});
