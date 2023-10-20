import { describe, afterEach, it, expect, vi, beforeEach } from 'vitest';
import Parser from '~/src/packages/Compiler/services/Parser';

const mockApp = {
  $valueFactory: {
    create: (value) => value,
    adapt: (value) => value
  }
};

describe('Parser', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create new instance', () => {
    // Arrange
    const parser = new Parser(mockApp);
    // Activate
    // Assert
    expect(parser._app).toEqual(mockApp);
  });

  describe('line', () => {
    let parser;
    beforeEach(() => {
      parser = new Parser(mockApp);
    });
    it('should throw error if line is empty', () => {
      // Arrange
      const line = '';
      // Activate
      // Assert
      expect(() => {
        parser.line(line);
      }).toThrowError();
    });
    it('should throw error if line not string', () => {
      // Arrange
      const line = ['foo'];
      // Activate
      // Assert
      expect(() => {
        parser.line(line);
      }).toThrowError();
    });
    it.each([
      ['foo', ['foo']],
      ['foo => ', ['foo']],
      ['foo => bar', ['foo', 'con(bar)']],
      ['foo:ter => bar', ['foo', 'ter', 'con(bar)']]
    ])('should parse line `%s`', (line, expected) => {
      // Arrange
      // Activate
      const result = parser.line(line);
      // Assert
      expect(result).toStrictEqual(expected);
    });
  });

  describe('command', () => {
    let parser;
    beforeEach(() => {
      parser = new Parser(mockApp);
    });
    it('should throw error if command is empty', () => {
      // Arrange
      const command = '';
      // Activate
      // Assert
      expect(() => {
        parser.command(command);
      }).toThrowError();
    });
    it('should throw error if command not string', () => {
      // Arrange
      const command = ['foo'];
      // Activate
      // Assert
      expect(() => {
        parser.command(command);
      }).toThrowError();
    });
    it('should throw error if not command', () => {
      // Arrange
      const command = '#bar(ter)';
      // Activate
      // Assert
      expect(() => {
        parser.command(command);
      }).toThrowError();
    });
    it.each([
      ['foo', undefined],
      ['//', undefined],
      ['foo(bar)', {
        element: undefined,
        modifier: undefined,
        name: 'foo',
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: undefined,
          value3: undefined
        }
      }],
      ['foo1(bar)', {
        element: '1',
        name: 'foo',
        modifier: undefined,
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: undefined,
          value3: undefined
        }
      }],
      ['foo1(bar;2;3)', {
        element: '1',
        name: 'foo',
        modifier: undefined,
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: '2',
          value3: '3'
        }
      }],
      ['foo1([bar,ter])', {
        element: '1',
        name: 'foo',
        modifier: undefined,
        typeValue: 'random',
        value: [{
          value: 'bar',
          value2: undefined,
          value3: undefined
        },
        {
          value: 'ter',
          value2: undefined,
          value3: undefined
        }]
      }],
      ['foo1([bar,ter];0;1)', {
        element: '1',
        name: 'foo',
        modifier: undefined,
        typeValue: 'random',
        value: [{
          value: 'bar',
          value2: '0',
          value3: '1'
        },
        {
          value: 'ter',
          value2: '0',
          value3: '1'
        }]
      }],
      ['foo1([bar>ter];3;10)', {
        element: '1',
        name: 'foo',
        modifier: undefined,
        typeValue: 'sequence',
        value: [{
          value: 'bar',
          value2: '3',
          value3: '10'
        },
        {
          value: 'ter',
          value2: '3',
          value3: '10'
        }]
      }],
      ['foo3#mod([bar,ter];[1,3];[1-10])', {
        element: '3',
        name: 'foo',
        modifier: 'mod',
        typeValue: 'random',
        value: [{
          value: 'bar',
          value2: ['1', '3'],
          value3: { min: '1', max: '10' }
        },
        {
          value: 'ter',
          value2: ['1', '3'],
          value3: { min: '1', max: '10' }
        }]
      }],
      ['foo3#mod([bar=ter,tor=bor];1;2)', {
        element: '3',
        name: 'foo',
        modifier: 'mod',
        typeValue: 'random',
        value: [{
          value: 'bar=ter',
          value2: '1',
          value3: '2'
        },
        {
          value: 'tor=bor',
          value2: '1',
          value3: '2'
        }]
      }],
      ['foo2([bar|ter>tor|bor];1;2)', {
        element: '2',
        name: 'foo',
        modifier: undefined,
        typeValue: 'sequence',
        value: [{
          value: 'bar|ter',
          value2: '1',
          value3: '2'
        },
        {
          value: 'tor|bor',
          value2: '1',
          value3: '2'
        }]
      }],
      ['foo1(bar;[1-2];[1,2,3])', {
        element: '1',
        name: 'foo',
        modifier: undefined,
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: { min: '1', max: '2' },
          value3: ['1', '2', '3']
        }
      }],
      ['foo1([bar|ter])', {
        element: '1',
        name: 'foo',
        modifier: undefined,
        typeValue: 'multi',
        value: {
          value: '[bar|ter]',
          value2: undefined,
          value3: undefined
        }
      }]
    ])('should parse command `%s`', (command, expected) => {
      // Arrange
      // Activate
      const result = parser.command(command);
      // Assert
      expect(result).toStrictEqual(expected);
    });
  });

  it('should call factory with defaults false', () => {
    // Arrange
    const parser = new Parser(mockApp);
    mockApp.$valueFactory.create = vi.fn();

    const command = 'foo(1)';
    // Activate
    parser.command(command);
    // Assert
    expect(mockApp.$valueFactory.create).toHaveBeenCalledWith(expect.anything(), false);
  });

  it('should call factory with defaults true', () => {
    // Arrange
    const parser = new Parser(mockApp);
    mockApp.$valueFactory.create = vi.fn();

    const command = 'foo1(1)';
    // Activate
    parser.command(command);
    // Assert
    expect(mockApp.$valueFactory.create).toHaveBeenCalledWith(expect.anything(), true);
  });
});
