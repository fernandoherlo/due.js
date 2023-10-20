import '~/src/assets/app.scss';

import App from '~/src/packages/App/services/App';
import Music from '~/src/packages/Music/services/Music';
import CompilerFactory from '~/src/packages/Compiler/services/Compiler/factory';
import Editor from '~/src/packages/Editor/services/Editor';

// TODO: dependency injector https://github.com/typestack/typedi

const app = new App();

const compiler = CompilerFactory(app);
const editor = new Editor(app);
const music = new Music(app);

app.$compiler = compiler;
app.$editor = editor;
app.$music = music;
app.start();
