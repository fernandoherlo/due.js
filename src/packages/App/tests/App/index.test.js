import { describe, afterEach, it, expect, vi } from 'vitest';
import App from '~/src/packages/App/services/App';

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
  });

  it('Create new instance', () => {
    // Arrange
    const app = new App(true);
    // Activate
    // Assert
    expect(app.$debug).toBeTruthy();
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
    app.$compiler = { exec: vi.fn().mockReturnValue([]) };
    app.$editor = { getCode: vi.fn().mockReturnValue('foo') };
    app.$music = { add: vi.fn(), update: vi.fn(), delete: vi.fn() };
    app.$ui = { setWaiting: vi.fn(), setOk: vi.fn(), setError: vi.fn() };
    // Activate
    await app.compile();
    // Assert
    expect(app.$ui.setWaiting).toHaveBeenCalled();
    expect(app.$editor.getCode).toHaveBeenCalled();
    expect(app.$music.add).toHaveBeenCalled();
    expect(app.$music.update).toHaveBeenCalled();
    expect(app.$music.delete).toHaveBeenCalled();
    expect(app.$ui.setOk).toHaveBeenCalled();
  });

  it('Should throw error on compile if services fail', async () => {
    // Arrange
    const app = new App();
    app.$compiler = {
      exec: vi.fn().mockImplementation(() => {
        throw new Error('foo');
      })
    };
    app.$editor = { getCode: vi.fn().mockReturnValue('foo') };
    app.$music = { add: vi.fn(), update: vi.fn(), delete: vi.fn() };
    app.$ui = { setWaiting: vi.fn(), setOk: vi.fn(), setError: vi.fn() };
    // Activate
    // Assert
    await expect(() => app.compile()).rejects.toThrowError();
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
});
