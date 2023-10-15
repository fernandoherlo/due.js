import '~/src/assets/app.scss';

import App from '~/src/modules/App';
import Due from '~/src/modules/Due';
import CompilerFactory from '~/src/modules/Compiler/factory';
import EditorFactory from '~/src/modules/Editor/factory';

const app = new App();
const compiler = CompilerFactory(app);
const editor = EditorFactory(app);
const due = new Due(app);

app.$compiler = compiler;
app.$editor = editor;
app.$proxy = due;

app.start();
