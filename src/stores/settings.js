import { defineStore } from 'pinia'
import defaultSettings from '~/settings'
import axiosClient from '~/plugins/axios'
import { useAuthStore } from './auth'

// Preferencias de la interfaz: se guardan en el navegador (localStorage, compartido entre pestañas)
// y, con sesión iniciada, también en el usuario (PUT /api/user/preferences) para cargarlas al hacer login.
export const STORAGE_KEY = 'preferences'

const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

// el modo oscuro del admin antes se guardaba suelto en localStorage 'theme'; se respeta como valor inicial
const legacyDark = () => {
    try {
        const saved = localStorage.getItem('theme')
        return saved ? saved === 'dark' : null
    } catch {
        return null
    }
}

const preferenceDefaults = () => ({
    theme: '#409EFF',             // color principal del admin (Element Plus)
    dark: legacyDark() ?? prefersDark(), // modo oscuro del admin
    blogTheme: prefersDark() ? 'dark' : 'light', // tema de Vuetify del blog
    sidebarCollapsed: false,
    fixedHeader: defaultSettings.fixedHeader,
    sidebarLogo: defaultSettings.sidebarLogo,
    tagsView: defaultSettings.tagsView, // barra de pestañas del admin
})

export const PREFERENCE_KEYS = Object.keys(preferenceDefaults())

// solo claves conocidas y con el mismo tipo que el valor por defecto
export function pickPreferences(source) {
    const defaults = preferenceDefaults()
    return Object.fromEntries(
        Object.entries(source || {}).filter(([key, value]) => key in defaults && typeof value === typeof defaults[key])
    )
}

const readLocal = () => {
    try {
        return pickPreferences(JSON.parse(localStorage.getItem(STORAGE_KEY)))
    } catch {
        return {}
    }
}

const writeLocal = preferences => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {
        // modo privado o almacenamiento lleno: la sesión actual sigue funcionando
    }
}

// tiempo para agrupar cambios seguidos (p. ej. al arrastrar el selector de color) en un solo PUT
export const SAVE_DELAY = 600
let saveTimer = null

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        showSettings: defaultSettings.showSettings,
        ...preferenceDefaults(),
        ...readLocal(),
        // estado del guardado en la cuenta: 'idle' | 'saving' | 'saved' | 'error'
        syncStatus: 'idle',
    }),
    getters: {
        preferences: state => Object.fromEntries(PREFERENCE_KEYS.map(key => [key, state[key]])),
    },
    actions: {
        changeSetting(key, value) {
            if (!(key in this.$state)) return
            this[key] = value
            if (PREFERENCE_KEYS.includes(key)) {
                this.persist()
            }
        },
        // navegador al instante; cuenta del usuario con un pequeño retraso
        persist() {
            writeLocal(this.preferences)

            if (!useAuthStore().isAuthenticated) return

            clearTimeout(saveTimer)
            this.syncStatus = 'saving'
            saveTimer = setTimeout(() => {
                axiosClient.put('/user/preferences', this.preferences)
                    .then(() => { this.syncStatus = 'saved' })
                    .catch(() => { this.syncStatus = 'error' })
            }, SAVE_DELAY)
        },
        // al iniciar sesión o recargar: lo guardado en la cuenta manda; si la cuenta aún no tiene nada, se sube lo local
        loadFromUser(preferences) {
            const saved = pickPreferences(preferences)
            if (Object.keys(saved).length) {
                this.$patch(saved)
                writeLocal({ ...readLocal(), ...saved })
                this.syncStatus = 'saved'
            } else {
                this.persist()
            }
        },
        // cambios hechos en otra pestaña del mismo navegador
        syncFromStorage(raw) {
            try {
                this.$patch(pickPreferences(JSON.parse(raw)))
            } catch {
                // valor corrupto: se ignora
            }
        },
    },
})
