import './style.css';

import App from './App';
import Due from './Due';

const app = new App();
const due = new Due(app);
due.linkToApp();

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="editor">
    <div id="editor-progress-bar" class="progress-bar"></div>
<textarea id="editor-code" class="editor">
sam3#glock([A4,C4,D4];5;[9-17])
sam4#guitar([A6,A2,D3];2;[11,16])   
sam2(A4;1;7)
sam1#bass([A3,C3,D3];[3-8];[4,7])                                        
</textarea>
  </div>
  <div id="debugger"></div>
`;

app.$looper.loop();
