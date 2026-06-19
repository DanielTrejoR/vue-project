import { createApp } from "vue";
import router from './router'
// import "~/styles/element/index.scss";

import ElementPlus from "element-plus";
// import all element css, uncommented next line
// import "element-plus/dist/index.css";
// or use cdn, uncomment cdn link in `index.html`

import "~/styles/index.scss";
import "uno.css";


// If you want to use ElMessage, import it.
import 'element-plus/dist/index.css'
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/notification.scss";
import "element-plus/theme-chalk/src/loading.scss";
import "element-plus/theme-chalk/src/switch.scss";
import 'element-plus/theme-chalk/dark/css-vars.css'
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
//themes array

//end themes array
const savedDark = sessionStorage.getItem('dark_theme') === 'true'
const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            fa,
            mdi,
            md,
        },
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1867C0',
                    secondary: '#90CAF9',
                    background: '#FFFFFF',
                    surface: '#FAFAFA',
                    error: '#D32F2F',
                    success: '#388E3C',
                    info: '#0288D1',
                    warning: '#FBC02D',
                },
            },
            dark: {
                colors: {
                    primary: '#212121',   // Turquesa (acentos secundarios)
                    secondary: '#121212',     // Morado claro (acentos)
                    background: '#2C2C2C',  // Gris oscuro en lugar de negro puro
                    surface: '#1E1E1E',     // Superficie más oscura para cards
                    error: '#CF6679',       // Rojo suave
                    success: '#66BB6A',     // Verde balanceado
                    info: '#29B6F6',        // Azul claro
                    warning: '#FFCA28',     // Amarillo cálido
                },
            },
            redWhite: {
                colors: {
                    primary: '#E53935',
                    secondary: '#FFCDD2',
                    background: '#FFFFFF',
                    surface: '#FAFAFA',
                    error: '#D32F2F',
                    success: '#388E3C',
                    info: '#0288D1',
                    warning: '#FBC02D',
                },
            },
            greenNature: {
                colors: {
                primary: '#43A047',
                secondary: '#A5D6A7',
                background: '#FAFAFA',
                surface: '#E8F5E9',
                error: '#C62828',
                success: '#2E7D32',
                info: '#039BE5',
                warning: '#F9A825',
                },
            },
            darkPurple: {
                colors: {
                    primary: '#6A1B9A',
                    secondary: '#AB47BC',
                    background: '#121212',
                    surface: '#1E1E1E',
                    error: '#EF5350',
                    success: '#66BB6A',
                    info: '#29B6F6',
                    warning: '#FFCA28',
                },
            },
            blueCorporate: {
                colors: {
                    primary: '#1976D2',   // Azul clásico
                    secondary: '#90CAF9', // Azul claro para acentos
                    background: '#121212', // Negro profundo
                    surface: '#1E1E1E',    // Superficie oscura
                    error: '#E53935',
                    success: '#43A047',
                    info: '#29B6F6',
                    warning: '#FFCA28',
                },
            },
            orangeEnergy: {
                colors: {
                primary: '#FB8C00',
                secondary: '#FFE0B2',
                background: '#212121',
                surface: '#2C2C2C',
                error: '#E53935',
                success: '#43A047',
                info: '#1E88E5',
                warning: '#FDD835',
                },
            },
            turquoiseModern: {
                colors: {
                primary: '#009688',
                secondary: '#80CBC4',
                background: '#FFFFFF',
                surface: '#F0F0F0',
                error: '#E53935',
                success: '#43A047',
                info: '#1E88E5',
                warning: '#FDD835',
                },
            },
        }
    }
})
store.commit('user/setDarkMode', savedDark)

import './permission' // permission control
import SvgIcon from '~/components/SvgIcon/index.vue' 
import { registerSvgIcons } from '@/utils/register-icons'
registerSvgIcons()
//Mitt
import mitt from 'mitt';
const emitter = mitt();
const app = createApp(App);

app.config.globalProperties.emitter = emitter;

app.use(ElementPlus);
app.use(VueApexCharts);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
app.provide('emitter', emitter);
app.use(router)
app.use(store)
app.use(vuetify)
app.component('SvgIcon',SvgIcon)
app.mount("#app");
