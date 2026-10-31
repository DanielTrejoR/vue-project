import axios from "axios";
import router from "../router";
import Cookies from 'js-cookie';
import store from '@/store'
const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL) {
  if (import.meta.env.DEV) {
    console.warn(
      '%c⚠️ VITE_API_BASE_URL no está definido. Verifica tu archivo .env',
      'color: orange; font-weight: bold;'
    );
  }
}

const axiosClient = axios.create({
    baseURL,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
})

axiosClient.defaults.withCredentials = true;
axiosClient.defaults.withXSRFToken = true;
// Sanctum solo necesita pedir la cookie CSRF cuando aún no existe (o expiró, ver el 419 abajo)
axiosClient.interceptors.request.use(async (config) => {
    if ((config.method || '').toLowerCase() !== 'get') {
        if (!Cookies.get('XSRF-TOKEN')) {
            await axiosClient.get('/csrf-cookie')
        }

        config.headers['X-XSRF-TOKEN'] = Cookies.get('XSRF-TOKEN')
    }
    return config
})
axiosClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response) {
      const { config } = error
      if (error.response.status === 419 && !config._csrfRetried) {
        // token CSRF vencido: se renueva y se reintenta una sola vez
        config._csrfRetried = true
        await axiosClient.get('/csrf-cookie')
        return axiosClient(config)
      }
      if (error.response.status === 401) {
        // Limpia el store si lo usas
        store.commit('user/setAuthenticated', false)
        store.commit('auth/setAuthenticated', false)
        store.commit('user/setUser', {})
        
        // Redirige al login
        // router.push({ name: 'Login' })
      } else if (error.response.status === 404 && (config.method || '').toLowerCase() === 'get') {
        // solo cuando falta lo que se intenta ver; un 404 al borrar/editar lo maneja quien llama
        router.push({ name: 'NotFound' })
      }
    }
    return Promise.reject(error)
  }
)

// axiosClient.interceptors.response.use(response => {
//     return response;
// }, error => {
//     if (error.response.status === 401) {
//         router.push({name: 'Login'})
//     } else if (error.response.status === 404) {
//         router.push({name: 'NotFound'})
//     }
//     return error;
// })
export const useAxios = () => axiosClient;
export default axiosClient;
