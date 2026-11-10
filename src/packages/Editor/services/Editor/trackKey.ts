import { AST_KIND } from '~/src/packages/Compiler/constants';
import Parser from '~/src/packages/Compiler/services/Parser';

const parser = new Parser();

// Devuelve la clave de la pista (p. ej. "sam1") si la linea empieza una; la misma que usa Music.
export function getTrackKey (lineText: string): string | null {
  try {
    const [line] = parser.parse(lineText).lines;
    const statement = line.statements[0];
    if (statement?.kind === AST_KIND.command && statement.element) {
      return `${statement.name}${statement.element}`;
    }
  } catch {
    // Una linea con sintaxis invalida no es una pista; el linter ya la senala.
  }
  return null;
}
