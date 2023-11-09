import { createApp } from "vue";
import router from './router'
// import "~/styles/element/index.scss";

import ElementPlus from "element-plus";
// import all element css, uncommented next line
import "element-plus/dist/index.css";

// or use cdn, uncomment cdn link in `index.html`

import "~/styles/index.scss";
import "uno.css";


// If you want to use ElMessage, import it.
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/notification.scss";
import "element-plus/theme-chalk/src/loading.scss";
import "element-plus/theme-chalk/src/switch.scss";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from "./App.vue";

import { gsap } from "gsap";
    
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Draggable } from "gsap/Draggable";

gsap.registerPlugin(ScrollToPlugin,Draggable);

import VueApexCharts from "vue3-apexcharts";

import 'animate.css';

import store from './store';

// Vuetify
import '@fortawesome/fontawesome-free/css/all.css'
import '@mdi/font/css/materialdesignicons.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { mdi } from 'vuetify/iconsets/mdi'
import { md } from 'vuetify/iconsets/md'
const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'fa',
        aliases,
        sets: {
            fa,
            mdi,
            md,
        },
    },
})

const app = createApp(App);
app.use(ElementPlus);
app.use(VueApexCharts);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router)
app.use(store)
app.use(vuetify)
app.mount("#app");
