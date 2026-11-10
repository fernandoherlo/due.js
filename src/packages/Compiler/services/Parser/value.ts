import { AST_KIND, CHARACTERS_INSTRUCTIONS as CHAR, COMMANDS, VALUE_OPERATOR } from '~/src/packages/Compiler/constants';
import ParseError from '~/src/packages/Compiler/services/Parser/error';
import type { IAstValue, IAstValueExpression, ISourceLocation } from '~/src/packages/Compiler/types/IAst';

const COLLECTION_SEPARATORS = [
  [CHAR.SEPARATE_DIFERRENT_VALUES, VALUE_OPERATOR.random],
  [CHAR.SEPARATE_PROGRESSION_VALUES, VALUE_OPERATOR.sequence],
  [CHAR.SEPARATE_CHORD_VALUES, VALUE_OPERATOR.chord]
] as const;

export function parseExpression (rawValue: string, location: ISourceLocation): IAstValueExpression {
  let column = location.column;
  const values = rawValue.split(CHAR.SEPARATE_TYPE_VALUES).map((argument) => {
    const source = argument.trim();
    const bracketed = source.startsWith(CHAR.INIT_MULTIPLE_VALUES) && source.endsWith(CHAR.END_MULTIPLE_VALUES);
    const invalid = (bracketed ? /[()[\]]/ : /[()[\],>|]/).exec(bracketed ? source.slice(1, -1) : source);
    if (invalid) {
      throw new ParseError({
        line: location.line,
        column: column + argument.length - argument.trimStart().length + invalid.index + (bracketed ? 1 : 0)
      }, 'Invalid value structure: use [values] for lists and ; between arguments');
    }
    const node = parseValue(argument, { line: location.line, column });
    column += argument.length + CHAR.SEPARATE_TYPE_VALUES.length;
    return node;
  });
  return { values, rawValue: rawValue.replace(/\s/g, ''), location };
}

function parseValue (source: string, location: ISourceLocation): IAstValue {
  const rawValue = source.replace(/\s/g, '');
  const base = {
    rawValue,
    location: { line: location.line, column: location.column + source.length - source.trimStart().length }
  };
  const bracketed = rawValue.startsWith(CHAR.INIT_MULTIPLE_VALUES) && rawValue.endsWith(CHAR.END_MULTIPLE_VALUES);
  if (rawValue.startsWith(COMMANDS.$) && !rawValue.includes(CHAR.INIT_MULTIPLE_VALUES)) {
    return { ...base, kind: AST_KIND.reference, name: rawValue };
  }
  if (!bracketed) {
    return { ...base, kind: AST_KIND.scalar };
  }

  const content = rawValue.slice(1, -1);
  const separator = COLLECTION_SEPARATORS.find(([token]) => content.includes(token));
  if (separator) {
    const [token, operator] = separator;
    let column = base.location.column + 1;
    const values = content.split(token).map((part) => {
      const node = parseValue(part, { line: location.line, column });
      column += part.length + token.length;
      return node;
    });
    return { ...base, kind: AST_KIND.collection, operator, values };
  }

  const [min, max, extra] = content.split(CHAR.SEPARATE_MIN_MAX_VALUES);
  if (min && max && extra === undefined) {
    return { ...base, kind: AST_KIND.range, min, max };
  }
  return { ...base, kind: AST_KIND.collection, operator: VALUE_OPERATOR.single, values: [] };
}
