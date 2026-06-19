// composables/useThemeTransition.ts
import { useTheme } from 'vuetify'
import { isDark } from '../dark'
import { nextTick } from 'vue'
import { mapState, useStore } from 'vuex'

export function useRadialThemeToggle() {
  const theme = useTheme()
  const store = useStore();

  const toggleRadialTheme = async (event?: MouseEvent) => {
    const isDark = theme.global.current.value.dark
    const nextTheme = isDark ? 'light' : 'dark';
    sessionStorage.setItem('dark_theme', nextTheme)
    store.dispatch('user/toggleDarkMode', isDark)
    console.log(nextTheme);
    if (!document.startViewTransition || !event) {
      theme.global.name.value = nextTheme
      return
    }

    const x = event.clientX
    const y = event.clientY

    const transition = document.startViewTransition(() => {
      theme.global.name.value = nextTheme
    })

    await transition.ready
    await new Promise(resolve =>
      requestAnimationFrame(resolve)
    )
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 600,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    )
  }

  return {
    isDark,
    toggleRadialTheme,
  }
}