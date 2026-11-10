import type { IAstCollection, IAstRange, IAstScalar, IAstValue, IAstValueExpression, ISourceLocation } from '../../types/IAst';

export default class ValueSyntaxParser {
  parseExpression (rawValue: string, location: ISourceLocation): IAstValueExpression {
    const values = this.splitTopLevel(rawValue, ';').map(part => this.parseValue(part.value, {
      line: location.line,
      column: location.column + part.offset
    }));

    return { values, rawValue, location };
  }

  private parseValue (rawValue: string, location: ISourceLocation): IAstValue {
    const value = rawValue.trim();
    const valueLocation = {
      line: location.line,
      column: location.column + rawValue.indexOf(value)
    };

    if (/^\$[^\s]+$/.test(value)) {
      return {
        kind: 'variable-reference',
        name: value,
        rawValue: value,
        location: valueLocation
      };
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      const content = value.slice(1, -1);
      const separators = [
        { token: ',', operator: 'random' as const },
        { token: '>', operator: 'sequence' as const },
        { token: '|', operator: 'chord' as const }
      ];
      const separator = separators.find(candidate => content.includes(candidate.token));

      if (separator) {
        const values = this.splitTopLevel(content, separator.token).map(part => this.parseValue(part.value, {
          line: valueLocation.line,
          column: valueLocation.column + 1 + part.offset
        }));

        return {
          kind: 'collection',
          operator: separator.operator,
          values,
          rawValue: value,
          location: valueLocation
        };
      }

      const rangeSeparator = content.indexOf('-');
      if (rangeSeparator > 0 && rangeSeparator === content.lastIndexOf('-') && rangeSeparator < content.length - 1) {
        const range: IAstRange = {
          kind: 'range',
          min: content.slice(0, rangeSeparator),
          max: content.slice(rangeSeparator + 1),
          rawValue: value,
          location: valueLocation
        };
        return range;
      }

      const scalar: IAstScalar = {
        kind: 'scalar',
        rawValue: value,
        location: valueLocation
      };
      const collection: IAstCollection = {
        kind: 'collection',
        operator: 'single',
        values: [scalar],
        rawValue: value,
        location: valueLocation
      };
      return collection;
    }

    return {
      kind: 'scalar',
      rawValue: value,
      location: valueLocation
    };
  }

  private splitTopLevel (value: string, separator: string): Array<{ value: string; offset: number }> {
    const parts: Array<{ value: string; offset: number }> = [];
    let depth = 0;
    let start = 0;

    for (let index = 0; index < value.length; index++) {
      if (value[index] === '[') {
        depth++;
      } else if (value[index] === ']') {
        depth--;
      } else if (value[index] === separator && depth === 0) {
        parts.push({ value: value.slice(start, index), offset: start });
        start = index + 1;
      }
    }

    parts.push({ value: value.slice(start), offset: start });
    return parts;
  }
}
