import * as Tone from 'tone';
import { WebMidi } from 'webmidi';
import { IApp, ILooper, ICompiler, IEditor, IInstruction } from '~/src/vite-env';
import { compareInstructions } from '~/src/modules/Compiler/Instruction/compare';

export default class Looper implements ILooper {
  _app: IApp;
  _steps: number;
  _totalSteps: number;
  _lastInstructions: any;

  _compiler: ICompiler;
  _editor: IEditor;

  constructor (app: IApp, compiler: ICompiler, editor: IEditor) {
    this._app = app;

    this._steps = 1;
    this._totalSteps = 4;

    this._lastInstructions = {};

    this._compiler = compiler;
    this._editor = editor;
  }

  async start () {
    await WebMidi.enable();

    this._editor.create();

    Tone.Transport.scheduleRepeat(async (time) => {
      if (!this._compiler || !this._editor) {
        throw new Error('Compiler or editor are undefined.');
      }
      Tone.Draw.schedule(() => {
        this._editor.setLoopTime(this._steps, this._totalSteps);
      }, time);

      if (this._steps === this._totalSteps) {
        this._steps = 1;
      } else {
        this._steps++;
      }
    }, 1);
  }

  async toggle () {
    Tone.Transport.toggle();
  }

  async compile () {
    try {
      this._editor.setWaiting();
      const editorCode = this._editor.getCode();

      localStorage.setItem('due#editor', editorCode || '');

      if (editorCode) {
        const instructions = this._compiler.exec(editorCode);

        const newInstructions: Array<IInstruction> = this._getNewInstructions(instructions);
        const updateInstructions: Array<IInstruction> = this._getUpdateInstructions(instructions);
        const oldInstructions: Array<IInstruction> = this._getOldInstructions(instructions);

        if (this._app.$proxy) {
          await this._app.$proxy.add(newInstructions);
          await this._app.$proxy.update(updateInstructions);
          await this._app.$proxy.delete(oldInstructions);
        }

        this._lastInstructions = instructions;
        this._editor.ok();
      }
    } catch (e: any) {
      this._editor.setError();
      throw Error(`Error in proxy composer. ${e.message}`);
    }
  }

  _getNewInstructions (instructions: any) {
    const newInstructions: Array<IInstruction> = [];

    for (const key in instructions) {
      if (instructions[key] && this._lastInstructions && !Object.keys(this._lastInstructions).includes(key)) {
        newInstructions.push(instructions[key]);
      }
    }

    return newInstructions;
  }

  _getUpdateInstructions (instructions: any) {
    const updateInstructions: Array<IInstruction> = [];

    for (const key in instructions) {
      if (instructions[key] && this._lastInstructions && Object.keys(this._lastInstructions).includes(key)) {
        if (compareInstructions(instructions[key], this._lastInstructions[key])) {
          updateInstructions.push(instructions[key]);
        }
      }
    }

    return updateInstructions;
  }

  _getOldInstructions (instructions: any) {
    const oldInstructions: Array<IInstruction> = [];

    for (const key in this._lastInstructions) {
      if (this._lastInstructions[key] && instructions && !Object.keys(instructions).includes(key)) {
        oldInstructions.push(this._lastInstructions[key]);
      }
    }

    return oldInstructions;
  }
}
