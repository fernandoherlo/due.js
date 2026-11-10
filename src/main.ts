import '~/src/assets/app.scss';

import App from '~/src/packages/App/services/App';
import Compiler from '~/src/packages/Compiler/services/Compiler';
import Editor from '~/src/packages/Editor/services/Editor';
import Music from '~/src/packages/Music/services/Music';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

const app = new App(true);
const valueFactory = new ValueFactory();

app.$music = new Music(app);
app.$compiler = new Compiler(app, valueFactory);
app.$editor = new Editor(app);

app.start();
