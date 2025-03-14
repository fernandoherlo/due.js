import { IApp, IInstruction, IInterpreter } from '~/src/vite-env';

export default class Interpreter implements IInterpreter {
  private _app: IApp;

  constructor (app: IApp) {
    this._app = app;
  }

  exec (lexical: IInstruction[]): IInstruction[] {
    if (!Array.isArray(lexical)) {
      throw Error('"lexical" is not array.');
    }

    const instructions = this._groupLexical(lexical);
    return instructions;
  }

  private _groupLexical (lexical: IInstruction[]): IInstruction[] {
    const instructions: any = {};

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

      this._app.$logger.log(instruction);

      throw Error('Can`t interprete command');
    }

    const orderedInstructions: any = Object.keys(instructions).sort().reduce(
      (obj: any, key) => {
        obj[key] = instructions[key];
        return obj;
      },
      {}
    );

    return orderedInstructions;
  }
}
