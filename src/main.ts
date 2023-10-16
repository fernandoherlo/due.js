import '~/src/assets/app.scss';

import App from '~/src/modules/App';
import Music from '~/src/modules/Music';
import CompilerFactory from '~/src/modules/Compiler/factory';
import Editor from '~/src/modules/Editor/';

const app = new App();
const compiler = CompilerFactory(app);
const editor = new Editor(app);
const music = new Music(app);

app.$compiler = compiler;
app.$editor = editor;
app.$music = music;

app.start();
