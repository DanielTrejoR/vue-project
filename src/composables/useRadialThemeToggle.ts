import { ref, nextTick } from 'vue'
import { pinia } from '~/stores'
import { useSettingsStore } from '~/stores/settings'

// Lo mantiene al día useApplyPreferences a partir de settings.dark (lo leen las gráficas)
export const isDark = ref(false)

async function setDark(value: boolean) {
  useSettingsStore(pinia).changeSetting('dark', value)
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

  // a claro: la vista nueva crece desde el botón. A oscuro, a la inversa: la vista clara se encoge
  // hasta el botón; para eso tiene que quedar encima de la nueva (ver theme-transition-shrink en index.scss)
  const root = document.documentElement
  root.classList.toggle('theme-transition-shrink', next)

  const transition = document.startViewTransition(() => setDark(next))
  let animation: Animation | undefined
  //Maiga de la transicion
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${r}px at ${x}px ${y}px)`
    ]

    animation = root.animate(
      {
        clipPath: next ? clipPath.reverse() : clipPath
      },
      {
        // mismos valores que element-plus.org
        duration: 400,
        easing: 'ease-in',
        // sin forwards, al terminar el recorte volvía a "none" un cuadro antes de cerrar la transición
        // y la vista clara reaparecía completa encima: era el parpadeo al pasar a oscuro
        fill: 'forwards',
        pseudoElement: next ? '::view-transition-old(root)' : '::view-transition-new(root)'
      }
    )
  })
  transition.finished.finally(() => {
    // con fill: 'forwards' la animación seguiría aplicándose a la siguiente transición
    animation?.cancel()
    root.classList.remove('theme-transition-shrink')
  })
}

export function useRadialThemeToggle() {
  return {
    isDark,
    toggleRadialTheme,
  }
}
