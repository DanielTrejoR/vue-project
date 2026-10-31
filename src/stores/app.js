import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

// Estado de la interfaz que no se guarda como preferencia
export const useAppStore = defineStore('app', {
    state: () => ({
        device: 'desktop',
        // en móvil el menú lateral es un drawer
        mobileSidebar: false,
        // panel de configuración (RightPanel): lo abren su botón lateral y "Configuración" del menú de usuario
        settingsPanel: false,
    }),
    getters: {
        isMobile: state => state.device === 'mobile',
    },
    actions: {
        toggleDevice(device) {
            this.device = device
            if (device !== 'mobile') this.mobileSidebar = false
        },
        // botón de menú del header: en móvil abre el drawer, en escritorio colapsa/expande (y se guarda)
        toggleMenu() {
            if (this.isMobile) {
                this.mobileSidebar = !this.mobileSidebar
            } else {
                const settings = useSettingsStore()
                settings.changeSetting('sidebarCollapsed', !settings.sidebarCollapsed)
            }
        },
        setMobileSidebar(open) {
            this.mobileSidebar = open
        },
        setSettingsPanel(open) {
            this.settingsPanel = open
        },
    },
})
