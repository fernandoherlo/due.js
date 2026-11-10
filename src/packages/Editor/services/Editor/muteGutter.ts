import { StateEffect } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { EditorView, GutterMarker, gutter } from '@codemirror/view';
import type { Command } from '@codemirror/view';
import { getTrackKey } from '~/src/packages/Editor/services/Editor/trackKey';
import type { IApp } from '~/src/types';

const refreshMute = StateEffect.define<null>();

class MuteMarker extends GutterMarker {
  private readonly muted: boolean;

  constructor (muted: boolean) {
    super();
    this.muted = muted;
  }

  eq (other: GutterMarker): boolean {
    return other instanceof MuteMarker && other.muted === this.muted;
  }

  toDOM (): Node {
    const marker = document.createElement('span');
    marker.className = this.muted ? 'cm-mute-marker cm-muted' : 'cm-mute-marker';
    marker.textContent = this.muted ? 'M' : '●';
    marker.title = this.muted ? 'Unmute (Cmd/Ctrl+Shift+M)' : 'Mute (Cmd/Ctrl+Shift+M)';
    return marker;
  }
}

function toggle (app: IApp, view: EditorView, keys: string[]): void {
  if (!app.$music || !keys.length) return;
  keys.forEach(key => app.$music!.toggleMute(key));
  view.dispatch({ effects: refreshMute.of(null) });
}

export function muteGutter (app: IApp): Extension {
  return gutter({
    class: 'cm-mute-gutter',
    lineMarker (view, line) {
      const key = getTrackKey(view.state.doc.lineAt(line.from).text);
      return key ? new MuteMarker(!!app.$music?.isMuted(key)) : null;
    },
    lineMarkerChange: update => update.transactions.some(transaction => transaction.effects.some(effect => effect.is(refreshMute))),
    domEventHandlers: {
      mousedown (view, line) {
        const key = getTrackKey(view.state.doc.lineAt(line.from).text);
        if (!key) return false;
        toggle(app, view, [key]);
        return true;
      }
    }
  });
}

export function toggleMuteSelection (app: IApp): Command {
  return (view) => {
    const { doc, selection } = view.state;
    const keys = new Set<string>();
    for (const range of selection.ranges) {
      for (let number = doc.lineAt(range.from).number; number <= doc.lineAt(range.to).number; number++) {
        const key = getTrackKey(doc.line(number).text);
        if (key) keys.add(key);
      }
    }
    toggle(app, view, [...keys]);
    return true;
  };
}
