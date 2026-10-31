import defaultSettings from '~/settings'
import axiosClient from '~/plugins/axios'

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

const currentPreferences = state => Object.fromEntries(PREFERENCE_KEYS.map(key => [key, state[key]]))

let saveTimer = null

const state = {
    showSettings: defaultSettings.showSettings,
    tagsView: defaultSettings.tagsView,
    ...preferenceDefaults(),
    ...readLocal(),
    // estado del guardado en la cuenta: 'idle' | 'saving' | 'saved' | 'error'
    syncStatus: 'idle',
}

const mutations = {
    CHANGE_SETTING: (state, { key, value }) => {
        // eslint-disable-next-line no-prototype-builtins
        if (state.hasOwnProperty(key)) {
            state[key] = value
        }
    },
    SET_PREFERENCES: (state, preferences) => {
        Object.assign(state, pickPreferences(preferences))
    },
    SET_SYNC_STATUS: (state, status) => {
        state.syncStatus = status
    },
}

const actions = {
    changeSetting({ commit, dispatch }, data) {
        commit('CHANGE_SETTING', data)
        if (PREFERENCE_KEYS.includes(data.key)) {
            dispatch('persist')
        }
    },
    // navegador al instante; cuenta del usuario agrupando cambios seguidos (p. ej. al arrastrar el color)
    persist({ state, commit, rootGetters }) {
        const preferences = currentPreferences(state)
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
        } catch {
            // modo privado o almacenamiento lleno: la sesión actual sigue funcionando
        }

        if (!rootGetters.isAuthenticated) return

        clearTimeout(saveTimer)
        commit('SET_SYNC_STATUS', 'saving')
        saveTimer = setTimeout(() => {
            axiosClient.put('/user/preferences', preferences)
                .then(() => commit('SET_SYNC_STATUS', 'saved'))
                .catch(() => commit('SET_SYNC_STATUS', 'error'))
        }, 600)
    },
    // al iniciar sesión o recargar: lo guardado en la cuenta manda; si la cuenta aún no tiene nada, se sube lo local
    loadFromUser({ commit, dispatch }, preferences) {
        const saved = pickPreferences(preferences)
        if (Object.keys(saved).length) {
            commit('SET_PREFERENCES', saved)
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readLocal(), ...saved }))
            } catch {
                // sin almacenamiento local se aplican igual
            }
            commit('SET_SYNC_STATUS', 'saved')
        } else {
            dispatch('persist')
        }
    },
    // cambios hechos en otra pestaña del mismo navegador
    syncFromStorage({ commit }, raw) {
        try {
            commit('SET_PREFERENCES', JSON.parse(raw))
        } catch {
            // valor corrupto: se ignora
        }
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
}
