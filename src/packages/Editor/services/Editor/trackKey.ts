import { AST_KIND } from '~/src/packages/Compiler/constants';
import Parser from '~/src/packages/Compiler/services/Parser';

const parser = new Parser();

// Devuelve las claves de las pistas de la linea (una, o todas las de un grupo); las mismas que usa Music.
export function getTrackKeys (lineText: string): string[] {
  try {
    const [line] = parser.parse(lineText).lines;
    const isGroup = lineText.trimStart().startsWith('[');
    const statements = isGroup ? line.statements : line.statements.slice(0, 1);
    const keys = statements.flatMap(statement => (
      statement.kind === AST_KIND.command && statement.element && !statement.mode
        ? [`${statement.name}${statement.element}`]
        : []
    ));
    return [...new Set(keys)];
  } catch {
    // Una linea con sintaxis invalida no es una pista; el linter ya la senala.
    return [];
  }
}

export function getTrackKey (lineText: string): string | null {
  return getTrackKeys(lineText)[0] ?? null;
}
