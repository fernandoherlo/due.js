import { IApp, ILogger, IStore, IErrorHandler, IDebugger, IMusic, ICompiler, IEditor, IInstruction } from '~/src/vite-env';
import Logger from './Logger';
import Store from './Store';
import ErrorHandler from './Error/handler';
import Debugger from './Debugger';

// TODO: move
import * as Tone from 'tone';
import { WebMidi } from 'webmidi';
import { compareInstructions } from '~/src/modules/Compiler/Instruction/compare';

export default class App implements IApp {
  $debug: boolean;
  $logger: ILogger;
  $store: IStore;
  $error: IErrorHandler;
  $debugger: IDebugger;

  $compiler: ICompiler | undefined;
  $editor: IEditor | undefined;
  $music: IMusic | undefined;

  $valueFactory: any | undefined;
  $variables: any = {};
  $variablesLive: any = {};
  $variablesLiveMap: any = {};

  // TODO: move
  _steps: number;
  _totalSteps: number;
  _lastInstructions: any;

  constructor (debug: boolean = true, debuggerHtmlId: string = 'debugger') {
    this.$debug = debug;

    this.$logger = new Logger(this);
    this.$store = new Store(this);
    this.$error = new ErrorHandler(this);
    this.$debugger = new Debugger(this, debuggerHtmlId);

    this._steps = 1;
    this._totalSteps = 4;
    this._lastInstructions = {};
  }

  async start () {
    if (!this.$editor || !this.$compiler) {
      throw Error('No editor or compiler.');
    }

    await WebMidi.enable();

    this.$editor.create();

    Tone.Transport.scheduleRepeat(async (time) => {
      if (!this.$compiler || !this.$editor) {
        throw new Error('Compiler or editor are undefined.');
      }
      Tone.Draw.schedule(() => {
        if (this.$editor) {
          this.$editor.setLoopTime(this._steps, this._totalSteps);
        }
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
    if (!this.$editor || !this.$compiler) {
      throw Error('No editor or compiler.');
    }

    try {
      this.$editor.setWaiting();
      const editorCode = this.$editor.getCode();

      if (editorCode) {
        localStorage.setItem('due#editor', editorCode || '');
        const instructions = this.$compiler.exec(editorCode);

        const newInstructions: Array<IInstruction> = this._getNewInstructions(instructions);
        const updateInstructions: Array<IInstruction> = this._getUpdateInstructions(instructions);
        const oldInstructions: Array<IInstruction> = this._getOldInstructions(instructions);

        if (this.$music) {
          await this.$music.add(newInstructions);
          await this.$music.update(updateInstructions);
          await this.$music.delete(oldInstructions);
        }

        this._lastInstructions = instructions;
        this.$editor.ok();
      }
    } catch (e: any) {
      this.$editor.setError();
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
