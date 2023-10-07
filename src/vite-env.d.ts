/// <reference types="vite/client" />
import { IApp } from '~/src/modules/App/IApp';

export { IProxy } from '~/src/modules/Proxy/IProxy';
export { IEditor } from '~/src/modules/Editor/IEditor';
export { IParser } from '~/src/modules/Parser/IParser';
export { ILexer } from '~/src/modules/Lexer/ILexer';
export { IInterpreter } from '~/src/modules/Interpreter/IInterpreter';
export { ICompiler } from '~/src/modules/Compiler/ICompiler';
export { IDue } from '~/src/modules/Due/IDue';
export { ILogger } from '~/src/modules/App/Logger/ILogger';
export { IStore } from '~/src/modules/App/Store/IStore';
export { IDebugger } from '~/src/modules/App/Debugger/IDebugger';
export { ILooper } from '~/src/modules/App/ILooper';
export { IErrorHandler } from '~/src/modules/App/Error/IErrorHandler';
export { IApp } from '~/src/modules/App/IApp';

export { IInstruction } from '~/src/modules/Compiler/Instruction/IInstruction';
export { IInstrument } from '~/src/modules/Due/Instrument/IInstrument';
export { ISynth } from '~/src/modules/Due/Instrument/Synth/ISynth';
export { ISampler } from '~/src/modules/Due/Instrument/Sampler/ISampler';
export { INote } from '~/src/modules/Due/Note/INote';
export { IEffect } from '~/src/modules/Due/Effect/IEffect';
export { IVolumen } from '~/src/modules/Due/Effect/Volumen/IVolumen';
export { IReverb } from '~/src/modules/Due/Effect/Reverb/IReverb';
export { IChorus } from '~/src/modules/Due/Effect/Chorus/IChorus';
export { IDelay } from '~/src/modules/Due/Effect/Delay/IDelay';

declare global {
  interface Window { App: IApp; }
}
