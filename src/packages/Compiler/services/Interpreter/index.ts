import type { IApp, IInstruction, IInterpreter } from '~/src/types';

export default class Interpreter implements IInterpreter {
  private app: IApp;

  constructor (app: IApp) {
    this.app = app;
  }

  exec (lexical: IInstruction[]): Record<string, IInstruction> {
    if (!Array.isArray(lexical)) {
      throw Error('"lexical" is not array.');
    }

    return this.groupLexical(lexical);
  }

  private groupLexical (lexical: IInstruction[]): Record<string, IInstruction> {
    const instructions: Record<string, IInstruction> = {};

    let actualElement;
    for (let i = 0; i < lexical.length; i++) {
      const instruction = lexical[i];

      if (instruction.type && !instruction.element && actualElement) {
        actualElement.actions.push(instruction);
        continue;
      }

      if (instruction.type && instruction.element) {
        instructions[`${instruction.type}${instruction.element}`] = instruction;
        actualElement = instruction;
        continue;
      }

      this.app.$logger.log(instruction);

      throw Error('Can`t interprete command');
    }

    const orderedInstructions: Record<string, IInstruction> = Object.keys(instructions).sort().reduce(
      (obj: Record<string, IInstruction>, key) => {
        obj[key] = instructions[key];
        return obj;
      },
      {}
    );

    return orderedInstructions;
  }
}
