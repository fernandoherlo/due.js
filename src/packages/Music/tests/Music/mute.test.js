import { describe, expect, it, vi } from 'vitest';
import Music from '~/src/packages/Music/services/Music';

vi.mock('tone', () => ({ getTransport: vi.fn(), getDraw: vi.fn(), start: vi.fn() }));
vi.mock('webmidi', () => ({ WebMidi: { enable: vi.fn() } }));
vi.mock('~/src/packages/Music/constants', () => ({
  COMMANDS_ELEMENT_MAP: { foo: () => ({ start: vi.fn(), setMuted: vi.fn(), end: vi.fn() }) }
}));
vi.mock('~/src/packages/Music/constants/modes', () => ({ MODES_MAP: {} }));
vi.mock('~/src/packages/Music/constants/samplers', () => ({ SAMPLER_MAP: {} }));

const app = {
  $logger: { log: vi.fn() },
  $debugger: { add: vi.fn() },
  $ui: { clearPatternStep: vi.fn() }
};

describe('Music mute', () => {
  it('toggles the muted state of a track and applies it to the running instrument', async () => {
    const music = new Music(app);
    await music.add([{ name: 'foo', key: 'foo1' }]);
    const element = music.instructions.foo1;

    expect(music.toggleMute('foo1')).toBe(true);
    expect(music.isMuted('foo1')).toBe(true);
    expect(element.setMuted).toHaveBeenLastCalledWith(true);
    expect(app.$ui.clearPatternStep).toHaveBeenCalledWith('foo1');

    expect(music.toggleMute('foo1')).toBe(false);
    expect(music.isMuted('foo1')).toBe(false);
    expect(element.setMuted).toHaveBeenLastCalledWith(false);
  });

  it('keeps the mute state for a track created after it was muted', async () => {
    const music = new Music(app);
    music.toggleMute('foo1');

    await music.add([{ name: 'foo', key: 'foo1' }]);

    expect(music.instructions.foo1.setMuted).toHaveBeenCalledWith(true);
  });
});
