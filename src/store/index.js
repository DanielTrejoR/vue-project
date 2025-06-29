import { createStore } from 'vuex'
import getters from './getters'

const files = import.meta.glob('./modules/*.js', { eager: true });

// you do not need `import app from './modules/app'`
// it will auto require all vuex module from modules file
const modules = {};
for (const [path, mod] of Object.entries(files)) {
  const name = path.replace(/^\.\/modules\/(.*)\.js$/, '$1');
  modules[name] = mod.default;
}
console.log('Módulos cargados:', Object.keys(modules));


const store = createStore({
    modules,
    getters
});

export default store;