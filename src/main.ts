import './style.scss';

import App from './App';
import Due from './Due';

const app = new App();
const due = new Due(app);
due.linkToApp();

app.$looper.start();
