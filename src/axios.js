import axios from "axios";
import router from "./router";
import Cookies from 'js-cookie';



const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
    },
})

axiosClient.defaults.withCredentials = true;
axiosClient.defaults.withXSRFToken = true;
axiosClient.interceptors.request.use(async (config) => {
    if ((config.method.toString()).toLowerCase() !== 'get') {
        await axiosClient.get('/csrf-cookie').then()

        config.headers['X-XSRF-TOKEN'] = Cookies.get('XSRF-TOKEN')
    }
    
    return config
})

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

export default axiosClient;
