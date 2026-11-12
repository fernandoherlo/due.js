import { describe, afterEach, it, expect, vi } from 'vitest';
import App from '~/src/packages/App/services/App';
import Ui from '~/src/packages/App/services/Ui';

describe('App', () => {
  global.window = {
    onerror: vi.fn()
  };
  global.localStorage = {
    setItem: vi.fn(),
    getItem: vi.fn()
  };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('Create new instance', () => {
    // Arrange
    const app = new App(true);
    // Activate
    // Assert
    expect(app.__debugEnabled).toBeTruthy();
  });

  it('Should throw error on start if not has services', async () => {
    // Arrange
    const app = new App();
    // Activate
    // Assert
    await expect(() => app.start()).rejects.toThrowError();
  });

  it('Should start the App', async () => {
    // Arrange
    const app = new App();
    app.$editor = { create: vi.fn() };
    app.$music = { start: vi.fn() };
    app.$ui = { start: vi.fn() };
    // Activate
    await app.start();
    // Assert
    expect(app.$editor.create).toHaveBeenCalled();
    expect(app.$music.start).toHaveBeenCalled();
    expect(app.$ui.start).toHaveBeenCalled();
  });

  it('shows the MIDI warning without replacing the compilation status', () => {
    const status = { hidden: true, textContent: '', title: '', setAttribute: vi.fn() };
    vi.stubGlobal('document', { querySelector: vi.fn().mockReturnValue(status) });
    const ui = new Ui({});

    ui.setMidiUnavailable('Permission denied');

    expect(document.querySelector).toHaveBeenCalledWith('#midi-status');
    expect(status.hidden).toBe(false);
    expect(status.textContent).toBe('MIDI off');
    expect(status.title).toBe('Permission denied');
    expect(status.setAttribute).toHaveBeenCalledWith('aria-label', 'MIDI unavailable: Permission denied');
  });

  it('forwards active pattern steps to the editor', () => {
    const editor = {
      setActivePatternStep: vi.fn(),
      clearActivePatternStep: vi.fn(),
      clearActivePatternSteps: vi.fn()
    };
    const ui = new Ui({ $editor: editor });

    ui.updatePatternStep('sam1', 1);
    ui.clearPatternStep('sam1');
    ui.clearActiveSteps();

    expect(editor.setActivePatternStep).toHaveBeenCalledWith('sam1', 1);
    expect(editor.clearActivePatternStep).toHaveBeenCalledWith('sam1');
    expect(editor.clearActivePatternSteps).toHaveBeenCalledOnce();
  });

  it('Should throw error on compile if not has services', async () => {
    // Arrange
    const app = new App();
    // Activate
    // Assert
    await expect(() => app.compile()).rejects.toThrowError();
  });

  it('Should compile the code', async () => {
    // Arrange
    const app = new App();
    const plan = { instructions: {}, variables: {}, addedInstructions: [], updatedInstructions: [], deletedInstructions: [] };
    app.$compiler = { prepare: vi.fn().mockReturnValue(plan), commit: vi.fn() };
    app.$editor = { getCode: vi.fn().mockReturnValue('foo'), setPatternSource: vi.fn() };
    app.$music = { validate: vi.fn(), add: vi.fn(), update: vi.fn(), delete: vi.fn() };
    app.$ui = { setWaiting: vi.fn(), setOk: vi.fn(), setError: vi.fn() };
    // Activate
    await app.compile();
    // Assert
    expect(app.$ui.setWaiting).toHaveBeenCalled();
    expect(app.$editor.getCode).toHaveBeenCalled();
    expect(app.$compiler.prepare).toHaveBeenCalledWith('foo');
    expect(app.$music.validate).toHaveBeenCalledWith([]);
    expect(app.$music.add).toHaveBeenCalled();
    expect(app.$music.update).toHaveBeenCalled();
    expect(app.$music.delete).toHaveBeenCalled();
    expect(app.$compiler.commit).toHaveBeenCalledWith(plan);
    expect(app.$editor.setPatternSource).toHaveBeenCalledWith('foo');
    expect(app.$ui.setOk).toHaveBeenCalled();
  });

  it('Should preserve apply errors without committing the compiled plan', async () => {
    const app = new App();
    const failure = new Error('audio failed');
    const plan = { instructions: {}, variables: {}, addedInstructions: [{}], updatedInstructions: [], deletedInstructions: [] };
    app.$compiler = { prepare: vi.fn().mockReturnValue(plan), commit: vi.fn() };
    app.$editor = { getCode: vi.fn().mockReturnValue('foo'), setPatternSource: vi.fn() };
    app.$music = {
      validate: vi.fn(),
      add: vi.fn().mockRejectedValue(failure),
      update: vi.fn(),
      delete: vi.fn()
    };
    app.$ui = { setWaiting: vi.fn(), setError: vi.fn(), setOk: vi.fn() };

    await expect(app.compile()).rejects.toBe(failure);

    expect(app.$music.add).toHaveBeenCalledWith(plan.addedInstructions);
    expect(app.$compiler.commit).not.toHaveBeenCalled();
    expect(app.$ui.setError).toHaveBeenCalled();
  });

  it('Should validate commands before applying a compiled plan', async () => {
    const app = new App();
    const plan = { instructions: {}, variables: {}, addedInstructions: [{ name: 'unknown', actions: [] }], updatedInstructions: [], deletedInstructions: [] };
    app.$compiler = { prepare: vi.fn().mockReturnValue(plan), commit: vi.fn() };
    app.$editor = { getCode: vi.fn().mockReturnValue('unknown1(value)'), setPatternSource: vi.fn() };
    app.$music = {
      validate: vi.fn(() => { throw new Error('Unsupported command "unknown".'); }),
      add: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };
    app.$ui = { setWaiting: vi.fn(), setError: vi.fn(), setOk: vi.fn() };

    await expect(app.compile()).rejects.toThrowError();

    expect(app.$music.validate).toHaveBeenCalledWith(plan.addedInstructions);
    expect(app.$music.add).not.toHaveBeenCalled();
    expect(app.$compiler.commit).not.toHaveBeenCalled();
  });

  it('Should compile empty code to clear the active program', async () => {
    const app = new App();
    const plan = { instructions: {}, variables: {}, addedInstructions: [], updatedInstructions: [], deletedInstructions: [{}] };
    app.$compiler = { prepare: vi.fn().mockReturnValue(plan), commit: vi.fn() };
    app.$editor = { getCode: vi.fn().mockReturnValue(''), setPatternSource: vi.fn() };
    app.$music = { validate: vi.fn(), add: vi.fn(), update: vi.fn(), delete: vi.fn() };
    app.$ui = { setWaiting: vi.fn(), setOk: vi.fn() };

    await app.compile();

    expect(app.$compiler.prepare).toHaveBeenCalledWith('');
    expect(app.$music.delete).toHaveBeenCalledWith(plan.deletedInstructions);
    expect(app.$compiler.commit).toHaveBeenCalledWith(plan);
  });

  it('Should serialize concurrent compile requests', async () => {
    const app = new App();
    const plan = { instructions: {}, variables: {}, addedInstructions: [], updatedInstructions: [], deletedInstructions: [] };
    let resolveAdd;
    let markPrepared;
    let markSecondAdd;
    let addCalls = 0;
    const firstPrepared = new Promise(resolve => { markPrepared = resolve; });
    const secondAddStarted = new Promise(resolve => { markSecondAdd = resolve; });
    app.$compiler = {
      prepare: vi.fn().mockImplementation(() => {
        markPrepared();
        return plan;
      }),
      commit: vi.fn()
    };
    app.$editor = { getCode: vi.fn().mockReturnValue('foo'), setPatternSource: vi.fn() };
    app.$music = {
      validate: vi.fn(),
      add: vi.fn(() => {
        addCalls++;
        if (addCalls === 1) {
          return new Promise(resolve => { resolveAdd = resolve; });
        }
        markSecondAdd();
        return Promise.resolve();
      }),
      update: vi.fn(),
      delete: vi.fn()
    };
    app.$ui = { setWaiting: vi.fn(), setOk: vi.fn() };

    const firstCompilation = app.compile();
    const secondCompilation = app.compile();
    await firstPrepared;

    expect(app.$compiler.prepare).toHaveBeenCalledTimes(1);

    resolveAdd();
    await secondAddStarted;
    await Promise.all([firstCompilation, secondCompilation]);

    expect(app.$compiler.prepare).toHaveBeenCalledTimes(2);
  });

  it('Should preserve the original error when compiler preparation fails', async () => {
    // Arrange
    const app = new App();
    const failure = new Error('foo');
    app.$compiler = {
      prepare: vi.fn().mockImplementation(() => {
        throw failure;
      }),
      commit: vi.fn()
    };
    app.$editor = { getCode: vi.fn().mockReturnValue('foo'), setPatternSource: vi.fn() };
    app.$music = { validate: vi.fn(), add: vi.fn(), update: vi.fn(), delete: vi.fn() };
    app.$ui = { setWaiting: vi.fn(), setOk: vi.fn(), setError: vi.fn() };
    // Activate
    // Assert
    await expect(app.compile()).rejects.toBe(failure);
    expect(app.$ui.setError).toHaveBeenCalled();
  });

  it('Should save in local storage', () => {
    // Arrange
    const app = new App();
    // Activate
    app.saveInLocalStorage('foo', 'bar');
    // Assert
    expect(global.localStorage.setItem).toHaveBeenCalledWith('foo', 'bar');
  });

  it('Should get from local storage', () => {
    // Arrange
    const app = new App();
    // Activate
    app.getFromLocalStorage('foo');
    // Assert
    expect(global.localStorage.getItem).toHaveBeenCalledWith('foo');
  });

  it('keeps new errors visible after a previous success timeout', () => {
    vi.useFakeTimers();
    const progressBar = {
      className: '',
      style: { width: '0%' },
      classList: { add: className => { progressBar.className = className; } }
    };
    vi.stubGlobal('document', { getElementById: () => progressBar });
    vi.stubGlobal('window', { setTimeout });
    const ui = new Ui({});

    ui.setOk();
    ui.setError();
    vi.advanceTimersByTime(300);

    expect(progressBar.className).toBe('error');
    expect(progressBar.style.width).toBe('100%');
  });
});
