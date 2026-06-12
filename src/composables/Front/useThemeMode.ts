// src/composables/useThemeMode.js
import { computed } from 'vue'
import { useTheme } from 'vuetify'

export function useThemeMode() {
  const theme = useTheme()

  // Computed reactivo que devuelve el nombre del tema actual
  const currentTheme = computed(() => theme.global.name.value)

  // Computed que devuelve un label más amigable
  const themeLabel = computed(() =>
    theme.global.name.value === 'dark' ? 'light' : 'dark'
  )

  // Toggle para cambiar entre dark/light
  const toggleTheme = () => {
    theme.global.name.value =
      theme.global.name.value === 'dark' ? 'light' : 'dark'
  }

  return { currentTheme, themeLabel, toggleTheme }
}
