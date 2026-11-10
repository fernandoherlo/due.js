import '~/src/assets/app.scss';

import App from '~/src/packages/App/services/App';
import CompilerFactory from '~/src/packages/Compiler/services/Compiler/factory';
import Editor from '~/src/packages/Editor/services/Editor';
import Music from '~/src/packages/Music/services/Music';
import ValueFactory from '~/src/packages/Music/services/Music/valueFactory';

// TODO: dependency injector https://github.com/typestack/typedi
const app = new App(true);
const valueFactory = new ValueFactory();

app.$music = new Music(app);
app.$compiler = CompilerFactory(app, valueFactory);
app.$editor = new Editor(app);

app.start();
