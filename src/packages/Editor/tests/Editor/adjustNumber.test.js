import { describe, expect, it } from 'vitest';
import { adjustNumber } from '~/src/packages/Editor/services/Editor/adjustNumber';

const apply = (text, column, direction) => {
  const edit = adjustNumber(text, column, direction);
  return edit && text.slice(0, edit.from) + edit.insert + text.slice(edit.to);
};

describe('adjustNumber', () => {
  it.each([
    ['v(-1)', 3, 1, 'v(0)'],
    ['v(0)', 2, -1, 'v(-1)'],
    ['sam1#kick(C2;0.25b;1b)', 13, 1, 'sam1#kick(C2;0.35b;1b)'],
    ['sam1#kick(C2;0.25b;1b)', 20, 1, 'sam1#kick(C2;0.25b;2b)'],
    ['bpm(120)', 6, -1, 'bpm(119)'],
    ['bpm(120)', 4, 1, 'bpm(121)'],
    ['sam3#tom([A2>C2];[1-3];[11-18])', 29, 1, 'sam3#tom([A2>C2];[1-3];[11-19])'],
    ['r(0.5)', 5, -1, 'r(0.4)']
  ])('%s at column %i by %i', (text, column, direction, expected) => {
    expect(apply(text, column, direction)).toBe(expected);
  });

  it('does not go below zero on the upper bound of a range', () => {
    expect(apply('x(1-0)', 4, -1)).toBe('x(1-0)');
  });

  it.each([
    ['sam1#kick(C2;1;1)', 3],
    ['n1(A#3;1;1)', 6],
    ['sam1#kick(C2;1;1)', 12]
  ])('ignores numbers that are part of a name: %s at %i', (text, column) => {
    expect(adjustNumber(text, column, 1)).toBeNull();
  });

  it('returns null when the cursor is not on a number', () => {
    expect(adjustNumber('v(1)', 0, 1)).toBeNull();
  });
});
