import { computed } from 'vue'
import { useStore } from 'vuex'

export function useTheme() {
  const store = useStore()
  const theme = computed(() => store.state.settings?.theme || '#1890ff')
  return { theme }
}
