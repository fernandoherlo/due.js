import '~/src/assets/app.scss';

import App from '~/src/modules/App';
import Due from '~/src/modules/Due';

const app = new App();
const due = new Due(app);
due.linkToApp();

app.$looper.start();
