/// <reference types="vite/client" />
import { IApp } from '~/src/packages/App/types/IApp';

export { ILogger } from '~/src/packages/App/types/ILogger';
export { IStore } from '~/src/packages/App/types/IStore';
export { IErrorHandler } from '~/src/packages/App/types/IErrorHandler';
export { IDebugger } from '~/src/packages/App/types/IDebugger';
export { IUi } from '~/src/packages/App/types/IUi';
export { IApp } from '~/src/packages/App/types/IApp';

export { IEditor } from '~/src/packages/Editor/types/IEditor';

export { IParser } from '~/src/packages/Compiler/types/IParser';
export { ILexer } from '~/src/packages/Compiler/types/ILexer';
export { IInterpreter } from '~/src/packages/Compiler/types/IInterpreter';
export { ICompiler } from '~/src/packages/Compiler/types/ICompiler';
export { IInstruction } from '~/src/packages/Compiler/types/IInstruction';

export { IMusic } from '~/src/packages/Music/types/IMusic';
export { IInstrument } from '~/src/packages/Music/types/IInstrument';
export { ISynth } from '~/src/packages/Music/types/ISynth';
export { ISampler } from '~/src/packages/Music/types/ISampler';
export { IMidiSampler } from '~/src/packages/Music/types/IMidiSampler';
export { IMidiOut } from '~/src/packages/Music/types/IMidiOut';
export { IMidiIn } from '~/src/packages/Music/types/IMidiIn';
export { IMagenta } from '~/src/packages/Music/types/IMagenta';
export { INote } from '~/src/packages/Music/types/INote';
export { IEffect } from '~/src/packages/Music/types/IEffect';
export { IVolumen } from '~/src/packages/Music/types/IVolumen';
export { IReverb } from '~/src/packages/Music/types/IReverb';
export { IChorus } from '~/src/packages/Music/types/IChorus';
export { IDelay } from '~/src/packages/Music/types/IDelay';
export { IValueFactory } from '~/src/packages/Music/types/IValueFactory';
export { IVariableLive } from '~/src/packages/Music/types/IVariableLive';

declare global {
  interface Window { App: IApp; }
}
