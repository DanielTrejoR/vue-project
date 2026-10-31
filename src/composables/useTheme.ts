import { computed } from 'vue'
import { useSettingsStore } from '~/stores/settings'

export function useTheme() {
  const settingsStore = useSettingsStore()
  const theme = computed(() => settingsStore.theme)
  return { theme }
}
