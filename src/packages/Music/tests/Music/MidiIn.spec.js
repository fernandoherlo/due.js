import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebMidi } from 'webmidi';
import MidiIn from '~/src/packages/Music/services/MidiIn';

vi.mock('webmidi', () => ({
  WebMidi: { inputs: [] }
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
});
