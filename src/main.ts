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
n1(C4)
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
