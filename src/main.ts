import './style.css';

import App from './App';
import Due from './Due';

const app = new App();
const due = new Due(app);
due.linkToApp();

app.$looper.loop();
