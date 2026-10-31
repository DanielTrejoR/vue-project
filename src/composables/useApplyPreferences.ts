// Aplica las preferencias del store (settings) a la página: modo oscuro y color del admin,
// tema de Vuetify del blog, y las mantiene sincronizadas con otras pestañas.
import { watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useTheme } from 'vuetify'
import { isDark } from './useRadialThemeToggle'
import { STORAGE_KEY } from '~/store/modules/settings'

const mix = (hex: string, base: string, weight: number) => {
  const channel = (color: string, i: number) => parseInt(color.slice(1 + i * 2, 3 + i * 2), 16)
  return '#' + [0, 1, 2]
    .map(i => Math.round(channel(hex, i) * (1 - weight) + channel(base, i) * weight).toString(16).padStart(2, '0'))
    .join('')
}

// Element Plus (namespace "ep") deriva sus tonos de estas variables; en oscuro mezcla con su fondo
function applyPrimaryColor(color: string, dark: boolean) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return
  const root = document.documentElement.style
  const light = dark ? '#141414' : '#ffffff'
  root.setProperty('--ep-color-primary', color)
  for (const level of [3, 5, 7, 8, 9]) {
    root.setProperty(`--ep-color-primary-light-${level}`, mix(color, light, level / 10))
  }
  root.setProperty('--ep-color-primary-dark-2', mix(color, dark ? '#ffffff' : '#000000', 0.2))
}

export function useApplyPreferences() {
  const store = useStore()
  const vuetifyTheme = useTheme()

  watch(
    () => store.state.settings.dark,
    dark => {
      isDark.value = dark
      document.documentElement.classList.toggle('dark', dark)
    },
    { immediate: true }
  )

  watch(
    () => [store.state.settings.theme, store.state.settings.dark] as const,
    ([color, dark]) => applyPrimaryColor(color, dark),
    { immediate: true }
  )

  watch(
    () => store.state.settings.blogTheme,
    name => {
      if (name in vuetifyTheme.themes.value) {
        vuetifyTheme.global.name.value = name
      }
    },
    { immediate: true }
  )

  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      store.dispatch('settings/syncFromStorage', event.newValue)
    }
  }
  onMounted(() => window.addEventListener('storage', onStorage))
  onBeforeUnmount(() => window.removeEventListener('storage', onStorage))
}
