import * as Tone from 'tone';
import { describe, expect, it, vi } from 'vitest';
import Music from '~/src/packages/Music/services/Music';

vi.mock('tone', () => ({ getTransport: vi.fn(), getDraw: vi.fn(), start: vi.fn() }));
vi.mock('webmidi', () => ({ WebMidi: { enable: vi.fn() } }));
vi.mock('~/src/packages/Music/constants', () => ({ COMMANDS_ELEMENT_MAP: {} }));
vi.mock('~/src/packages/Music/constants/modes', () => ({ MODES_MAP: {} }));
vi.mock('~/src/packages/Music/constants/samplers', () => ({ SAMPLER_MAP: {} }));

const createTransport = (state, seconds) => {
  const listeners = {};
  return {
    state,
    seconds,
    scheduleOnce: vi.fn((callback) => { listeners.bar = callback; return 7; }),
    clear: vi.fn(),
    once: vi.fn((event, callback) => { listeners[event] = callback; }),
    off: vi.fn(),
    listeners
  };
};

describe('Music waitForNextBar', () => {
  const music = new Music({});

  it('does not wait when the transport is not running', async () => {
    const transport = createTransport('stopped', 3);
    Tone.getTransport.mockReturnValue(transport);

    await music.waitForNextBar(120);

    expect(transport.scheduleOnce).not.toHaveBeenCalled();
  });

  it('resolves at the next bar boundary (4 beats)', async () => {
    const transport = createTransport('started', 5);
    Tone.getTransport.mockReturnValue(transport);

    const waiting = music.waitForNextBar(120);
    expect(transport.scheduleOnce).toHaveBeenCalledWith(expect.any(Function), 6);

    transport.listeners.bar();
    await waiting;
    expect(transport.clear).toHaveBeenCalledWith(7);
  });

  it('always waits for a future bar, even exactly on a boundary', async () => {
    const transport = createTransport('started', 4);
    Tone.getTransport.mockReturnValue(transport);

    const waiting = music.waitForNextBar(120);
    expect(transport.scheduleOnce).toHaveBeenCalledWith(expect.any(Function), 6);

    transport.listeners.bar();
    await waiting;
  });

  it('does not block when the transport stops while waiting', async () => {
    const transport = createTransport('started', 1);
    Tone.getTransport.mockReturnValue(transport);

    const waiting = music.waitForNextBar(60);
    transport.listeners.stop();

    await expect(waiting).resolves.toBeUndefined();
  });
});
