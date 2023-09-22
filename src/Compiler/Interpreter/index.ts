import { IApp, IInstruction, IInterpreter } from '../../vite-env';

export default class Interpreter implements IInterpreter {
  _app: IApp;

  constructor (app: IApp) {
    this._app = app;
  }

  exec (lexical: Array<IInstruction>): any {
    if (!Array.isArray(lexical)) {
      throw Error('"lexical" is not array.');
    }

    const instructions = this._groupLexical(lexical);
    return instructions;
  }

  _groupLexical (lexical: Array<IInstruction>): any {
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

    return instructions;
  }
}
