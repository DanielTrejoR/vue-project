import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'
import { resetRouter } from '@/router'
import { useSettingsStore } from './settings'
import { usePermissionStore } from './permission'
import { useTagsViewStore } from './tagsView'
import { useTodosStore } from './todos'
import { useDriveStore } from './drive'

// sessionStorage solo recuerda que esta pestaña tenía sesión, para revalidarla con /api/user al recargar
const SESSION_KEY = 'isAuthenticated'

const readSessionFlag = () => {
    try {
        return sessionStorage.getItem(SESSION_KEY) === 'true'
    } catch {
        return false
    }
}

// Sesión del usuario (antes repartida entre los módulos "user" y "auth" de Vuex)
export const useAuthStore = defineStore('auth', {
    state: () => ({
        // lo que devuelven /api/user, login y registro (User::authPayload en el backend)
        /** @type {Record<string, any> | null} */
        user: null,
        authenticated: readSessionFlag(),
    }),
    getters: {
        isAuthenticated: state => state.authenticated,
        roles: state => state.user?.roles ?? [],
        permissions: state => state.user?.permissions ?? [],
        isAdmin() {
            return this.roles.includes('Admin')
        },
        // puede entrar al panel y escribir posts
        canWrite() {
            return this.roles.some(role => ['Admin', 'Writer'].includes(role))
        },
    },
    actions: {
        setAuthenticated(value) {
            this.authenticated = value
            try {
                sessionStorage.setItem(SESSION_KEY, String(value))
            } catch {
                // sin almacenamiento la sesión vale solo hasta recargar
            }
        },
        startSession(user) {
            this.user = user
            this.setAuthenticated(true)
            useSettingsStore().loadFromUser(user.preferences)
        },
        async fetchUser() {
            const { data } = await axiosClient.get('/user')
            if (!data) {
                this.clearSession()
                throw new Error('User verification failed')
            }
            this.startSession(data)
            return data
        },
        async login(credentials) {
            const { data } = await axiosClient.post('/login', credentials)
            this.startSession(data.user)
            return data.user
        },
        async register(form) {
            const { data } = await axiosClient.post('/register', form)
            this.startSession(data.user)
            return data.user
        },
        // "olvidé mi contraseña": el backend responde lo mismo exista o no la cuenta
        async forgotPassword(email) {
            const { data } = await axiosClient.post('/forgot-password', { email })
            return data.message
        },
        // con el token del correo; no inicia sesión, la persona entra después con su contraseña nueva
        async resetPassword(form) {
            const { data } = await axiosClient.post('/reset-password', form)
            return data.message
        },
        // sesión vencida (401): se olvida el usuario; las rutas del panel se rehacen al volver a entrar
        expire() {
            this.user = null
            this.setAuthenticated(false)
        },
        clearSession() {
            this.expire()
            usePermissionStore().reset()
            useTagsViewStore().reset()
            // las tareas son de la cuenta: con otra sesión se vuelven a pedir
            useTodosStore().$reset()
            useDriveStore().clear()
            resetRouter()
        },
        // aunque falle la petición, la sesión local se limpia
        async logout() {
            try {
                await axiosClient.post('/logout')
            } catch {
                // la cookie pudo vencer antes: igual se cierra aquí
            } finally {
                this.clearSession()
            }
        },
        // historial del perfil por cursor (scroll infinito): sin cursor trae la primera tanda
        /** @param {string | null} [cursor] */
        async getActivities(cursor = null) {
            const { data } = await axiosClient.get('/user/activities', { params: { cursor: cursor || undefined } })
            return data
        },
        // cuenta: cada respuesta trae el usuario actualizado y se refleja en toda la app
        async updateProfile(form) {
            const { data } = await axiosClient.put('/user/profile', form)
            this.user = { ...this.user, ...data.user }
            return data.user
        },
        async updateAvatar(file) {
            const body = new FormData()
            body.append('avatar', file)
            const { data } = await axiosClient.post('/user/avatar', body)
            this.user = { ...this.user, ...data.user }
            return data.user
        },
        updatePassword(form) {
            return axiosClient.put('/user/password', form)
        },
    },
})
