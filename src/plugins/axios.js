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
axiosClient.interceptors.request.use(async (config) => {
    console.log('➡️ Request URL:', import.meta.env.VITE_API_BASE_URL);

    if ((config.method || '').toLowerCase() !== 'get') {
        await axiosClient.get('/csrf-cookie').then()

        config.headers['X-XSRF-TOKEN'] = Cookies.get('XSRF-TOKEN')
    }
    return config
})
axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        // Limpia el store si lo usas
        store.commit('setAuthenticated', false)
        store.commit('setUser', {})

        // Redirige al login
        router.push({ name: 'Login' })  
      } else if (error.response.status === 404) {
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
