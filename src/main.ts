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

const app = createApp(App);
app.use(ElementPlus);
app.use(VueApexCharts);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.use(router)
app.mount("#app");
