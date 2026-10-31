// composables/useThemeTransition.ts
import { useTheme } from 'vuetify'
import { nextTick } from 'vue'
import { useStore } from 'vuex'

export function useRadialThemeToggle() {
  const theme = useTheme()
  const store = useStore();

  // el tema del blog es una preferencia más: useApplyPreferences lo aplica a Vuetify
  const setBlogTheme = async (name: string) => {
    await store.dispatch('settings/changeSetting', { key: 'blogTheme', value: name })
    await nextTick()
  }

  const toggleRadialTheme = async (event?: MouseEvent) => {
    const nextTheme = theme.global.current.value.dark ? 'light' : 'dark';
    if (!document.startViewTransition || !event) {
      await setBlogTheme(nextTheme)
      return
    }

    const x = event.clientX
    const y = event.clientY

    const transition = document.startViewTransition(() => setBlogTheme(nextTheme))

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
    toggleRadialTheme,
  }
}
