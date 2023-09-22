import * as Tone from 'tone';

export function setupCounter (element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener('click', async () => {
    setCounter(counter + 1);
    await Tone.start();
  });
  setCounter(0);
}
