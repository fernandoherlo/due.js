/// <reference types="vite/client" />
import { IApp } from './App/IApp';

export { IProxy } from './Proxy/IProxy';
export { IEditor } from './Editor/IEditor';
export { IParser } from './Parser/IParser';
export { ILexer } from './Lexer/ILexer';
export { IInterpreter } from './Interpreter/IInterpreter';
export { ICompiler } from './Compiler/ICompiler';
export { IDue } from './Due/IDue';
export { ILogger } from './App/Logger/ILogger';
export { IStore } from './App/Store/IStore';
export { IDebugger } from './App/Debugger/IDebugger';
export { ILooper } from './App/ILooper';
export { IErrorHandler } from './App/Error/IErrorHandler';
export { IApp } from './App/IApp';

export { IInstruction } from './Compiler/Instruction/IInstruction';
export { IInstrument } from './Due/Instrument/IInstrument';
export { ISynth } from './Due/Instrument/Synth/ISynth';
export { ISampler } from './Due/Instrument/Sampler/ISampler';
export { INote } from './Due/Note/INote';
export { IEffect } from './Due/Effect/IEffect';
export { IVolumen } from './Due/Effect/Volumen/IVolumen';
export { IReverb } from './Due/Effect/Reverb/IReverb';
export { IChorus } from './Due/Effect/Chorus/IChorus';
export { IDelay } from './Due/Effect/Delay/IDelay';

declare global {
  interface Window { App: IApp; }
}
