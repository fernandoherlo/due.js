import { describe, afterEach, it, expect, vi, beforeEach } from 'vitest';
import Parser from '~/src/packages/Compiler/services/Parser';
import Instruction from '~/src/packages/Compiler/services/Instruction';

const mockApp = {
  $valueFactory: {
    create: vi.fn().mockReturnValue((value) => value),
    adapt: vi.fn().mockReturnValue((value) => value)
  },
  $variables: vi.fn()
};

describe('Parser', () => {
  let parser, mockValueParser;

  beforeEach(() => {
    mockValueParser = {
      exec: vi.fn()
    };
    parser = new Parser(mockApp, mockValueParser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Create new instance', () => {
    // Arrange
    // Activate
    // Assert
    expect(parser.app).toEqual(mockApp);
    expect(parser.valueParser).toEqual(mockValueParser);
  });

  describe('line', () => {
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
        element: '',
        key: 'foo',
        modifier: undefined,
        name: 'foo',
        type: undefined,
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: undefined,
          value3: undefined
        },
        actions: []
      }],
      ['foo1(bar)', {
        element: '1',
        name: 'foo',
        key: 'foo1',
        modifier: undefined,
        type: undefined,
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: undefined,
          value3: undefined
        },
        actions: []
      }],
      ['foo1(bar;2;3)', {
        element: '1',
        name: 'foo',
        key: undefined,
        modifier: undefined,
        type: undefined,
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: '2',
          value3: '3'
        },
        actions: []
      }],
      ['foo1([bar,ter])', {
        element: '1',
        name: 'foo',
        key: undefined,
        modifier: undefined,
        type: undefined,
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
        }],
        actions: []
      }],
      ['foo1([bar,ter];0;1)', {
        element: '1',
        name: 'foo',
        key: undefined,
        modifier: undefined,
        type: undefined,
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
        }],
        actions: []
      }],
      ['foo1([bar>ter];3;10)', {
        element: '1',
        name: 'foo',
        key: undefined,
        modifier: undefined,
        type: undefined,
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
        }],
        actions: []
      }],
      ['foo3#mod([bar,ter];[1,3];[1-10])', {
        element: '3',
        name: 'foo',
        key: 'mod',
        modifier: 'mod',
        type: undefined,
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
        }],
        actions: []
      }],
      ['foo3#mod([bar=ter,tor=bor];1;2)', {
        element: '3',
        name: 'foo',
        key: 'mod',
        modifier: 'mod',
        type: undefined,
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
        }],
        actions: []
      }],
      ['foo2([bar|ter>tor|bor];1;2)', {
        element: '2',
        name: 'foo',
        key: 'foo2',
        modifier: undefined,
        type: undefined,
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
        }],
        actions: []
      }],
      ['foo1(bar;[1-2];[1,2,3])', {
        element: '1',
        name: 'foo',
        key: undefined,
        modifier: undefined,
        type: undefined,
        typeValue: 'normal',
        value: {
          value: 'bar',
          value2: { min: '1', max: '2' },
          value3: ['1', '2', '3']
        },
        actions: []
      }],
      ['foo1([bar|ter])', {
        element: '1',
        name: 'foo',
        key: undefined,
        modifier: undefined,
        type: undefined,
        typeValue: 'multi',
        value: {
          value: '[bar|ter]',
          value2: undefined,
          value3: undefined
        },
        actions: []
      }]
    ])('should parse command `%s`', (command, expected) => {
      // Arrange
      mockValueParser.exec.mockReturnValue([expected?.value, expected?.typeValue]);
      // Activate
      const result = parser.command(command);
      // Assert
      expect(result).toStrictEqual(expected ? new Instruction(expected) : undefined);
    });
  });

  it('should call factory with defaults false', () => {
    // Arrange
    mockValueParser.exec.mockReturnValue(['', '']);

    const command = 'foo(1)';
    // Activate
    parser.command(command);
    // Assert
    expect(mockApp.$valueFactory.adapt).toHaveBeenCalledWith('1', mockApp.$variables);
  });

  it('should call factory with defaults true', () => {
    // Arrange
    mockValueParser.exec.mockReturnValue(['', '']);

    const command = 'foo1(2)';
    // Activate
    parser.command(command);
    // Assert
    expect(mockApp.$valueFactory.adapt).toHaveBeenCalledWith('2', mockApp.$variables);
  });
});
