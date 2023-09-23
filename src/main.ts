import './style.css';
import { setupCounter } from './counter.ts';

import App from './App';
import Due from './Due';

const app = new App();
const due = new Due(app);
due.linkToApp();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Editor</h1>
  <div class="card">
    <button id="counter" type="button"></button>
  </div>
  <div id="editor">
    <div id="editor-progress-bar" style="background-color: aqua; width: 0%; height: 20px;"></div>
    <textarea id="editor-code" rows="20" cols="40" style="font-size: 3.5em;">
sam3#vsco2-glock([A4,C4,D4];5;[12,17])
sam4#vcsl-claves([A6,A2,D3];2;[0.5,1.5]) 
sam2(A4;1;7)
sam1#vsco2-contrabass-susvib([A3,C3,D3];[3, 8];[4,7])                   
    </textarea>
    <!--
    p1(algo).e(x).e(y).v(a) => 1
    n2(foo)
    n3([x,y])
    //seq4([x,y])
    333 f23f2323
    s5(foo)
    ai6([foo, bar])
    c7(tor).e(x)
    m8(g)
    m10(g)
    -->
  </div>
  <div id="debugger"></div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);

app.$looper.loop();
