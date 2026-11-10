import { describe, expect, it } from 'vitest';
import { getTrackKey, getTrackKeys } from '~/src/packages/Editor/services/Editor/trackKey';

describe('getTrackKeys', () => {
  it('returns every track of a group once', () => {
    expect(getTrackKeys('[sam1#kick(C2;1;1):v(1), n2(A3;1;1)]:r(2)')).toEqual(['sam1', 'n2']);
  });

  it('returns nothing for an invalid group', () => {
    expect(getTrackKeys('[sam1(C2;1;1)')).toEqual([]);
  });
});

describe('getTrackKey', () => {
  it.each([
    ['sam1#kick(C2;0.25b;1b):v(-1)', 'sam1'],
    ['  ai1#trombbone(;;[1,12])', 'ai1'],
    ['n1(A3;0.5;1)', 'n1'],
    ['sam9#guitar([C5|E5|G5];1b;4b)::reverse(64)', 'sam9']
  ])('returns the key of the track in %s', (line, key) => {
    expect(getTrackKey(line)).toBe(key);
  });

  it.each([
    '', '// sam1#kick(C2;1;1)', 'bpm(120)', '$low=-1', '$$test=mi0(1@5)', 'sam1#kick(', ':v(1)'
  ])('returns null for lines that are not a track: %s', (line) => {
    expect(getTrackKey(line)).toBeNull();
  });
});
