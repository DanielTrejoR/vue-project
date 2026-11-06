import { createApp } from "vue";
import router from './router'
// import "~/styles/element/index.scss";

// Element Plus no se registra completo: unplugin-vue-components importa cada componente
// (y su estilo con el namespace "ep") donde se usa; ver vite.config.mts

import "~/styles/index.scss";
import "uno.css";


// Estilos de los servicios que se llaman desde código (ElMessage, ElNotification, v-loading...)
import "element-plus/theme-chalk/src/message.scss";
import "element-plus/theme-chalk/src/notification.scss";
import "element-plus/theme-chalk/src/message-box.scss";
import "element-plus/theme-chalk/src/loading.scss";
import "element-plus/theme-chalk/src/switch.scss";
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from "./App.vue";

// fechas en español en toda la app; con esto la semana empieza en lunes
// (el calendario y los selectores de fecha de Element Plus leen el idioma global de dayjs)
import dayjs from 'dayjs'
import 'dayjs/locale/es'
dayjs.locale('es')

import { pinia } from './stores';

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
// textos de Vuetify en español para los componentes que lo piden con <v-locale-provider locale="es"> (el calendario)
import { en, es } from 'vuetify/locale'
// componentes y directivas: los importa vite-plugin-vuetify por archivo (vite.config.mts)

// íconos de Material Design como SVG, solo los que se usan (src/plugins/icons.ts)
import { aliases, mdi } from '~/plugins/icons'
//themes array

//end themes array
const vuetify = createVuetify({
    locale: {
        locale: 'en',
        messages: { en, es },
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
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

import './permission' // permission control
import SvgIcon from '~/components/SvgIcon/index.vue' 
import { registerSvgIcons } from '@/utils/register-icons'
registerSvgIcons()
//Mitt
import mitt from 'mitt';
const emitter = mitt();
const app = createApp(App);

app.config.globalProperties.emitter = emitter;

app.provide('emitter', emitter);
app.use(router)
app.use(pinia)
app.use(vuetify)
app.component('SvgIcon',SvgIcon)
app.mount("#app");
