import { afterEach, describe, expect, it, vi } from 'vitest';
import TriggerAttack from '~/src/packages/Music/services/Instrument/triggerAttack';

describe('TriggerAttack ranges', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('chooses a continuous value for fractional ranges', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(TriggerAttack.getValue({ min: '0.2', max: '1' })).toBeCloseTo(0.6);
  });

  it('supports zero as a range endpoint', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(TriggerAttack.getValue({ min: '0', max: '1' })).toBeCloseTo(0.5);
  });
});
