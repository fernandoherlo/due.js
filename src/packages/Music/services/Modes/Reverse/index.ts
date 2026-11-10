import type { IInstruction, Playback } from '~/src/types';
import Mode from '../index';

const MAX_PROBABILITY = 127;

export default class Reverse extends Mode {
  private readonly probability = Reverse.parse(this.action);

  static parse (action: IInstruction): number {
    const raw = String(action.value.value).trim();
    const probability = raw ? Number(raw) : Number.NaN;
    if (!(probability >= 0 && probability <= MAX_PROBABILITY)) {
      throw Error('Reverse probability must be a number between 0 and 127.');
    }
    return probability;
  }

  playback (): Playback {
    const reversed = this.probability === MAX_PROBABILITY ||
      (this.probability > 0 && Math.random() < this.probability / MAX_PROBABILITY);
    return (buffer, duration) => reversed ? this.reverseFragment(buffer, duration) : buffer;
  }

  private reverseFragment (buffer: AudioBuffer, duration: number): AudioBuffer {
    const length = Math.max(1, Math.min(buffer.length, Math.ceil(duration * buffer.sampleRate)));
    const reversed = this.context.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      reversed.copyToChannel(buffer.getChannelData(channel).slice(0, length).reverse(), channel);
    }
    return reversed;
  }
}
