import '~/src/assets/app.scss';

import App from '~/src/packages/App/services/App';
import CompilerFactory from '~/src/packages/Compiler/services/Compiler/factory';
import Editor from '~/src/packages/Editor/services/Editor';
import Music from '~/src/packages/Music/services/Music';

// TODO: dependency injector https://github.com/typestack/typedi
const app = new App(true);

app.$compiler = CompilerFactory(app);
app.$editor = new Editor(app);
app.$music = new Music(app);

app.start();
