import { ref, nextTick } from 'vue'
import store from '~/store'

// Lo mantiene al día useApplyPreferences a partir de store.state.settings.dark (lo leen las gráficas)
export const isDark = ref(false)

async function setDark(value: boolean) {
  await store.dispatch('settings/changeSetting', { key: 'dark', value })
  // espera a que useApplyPreferences cambie la clase "dark" antes de capturar la vista nueva
  await nextTick()
}

export function toggleRadialTheme(event: MouseEvent) {
  const next = !isDark.value
  const supportsViewTransitions = 'startViewTransition' in document

  if (!supportsViewTransitions) {
    setDark(next)
    return
  }
  const x = event.clientX
  const y = event.clientY
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => setDark(next))
  //Maiga de la transicion
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${r}px at ${x}px ${y}px)`
    ]

    document.documentElement.animate(
      {
        clipPath: next ? clipPath.reverse() : clipPath
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: next ? '::view-transition-old(root)' : '::view-transition-new(root)'
      }
    )
  })
}

export function useRadialThemeToggle() {
  return {
    isDark,
    toggleRadialTheme,
  }
}
