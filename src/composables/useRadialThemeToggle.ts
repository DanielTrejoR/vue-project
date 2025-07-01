import { ref, onMounted } from 'vue'

export const isDark = ref(false)

function applyTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

export function toggleRadialTheme(event: MouseEvent) {
  const supportsViewTransitions = 'startViewTransition' in document

  if (!supportsViewTransitions) {
    isDark.value = !isDark.value
    applyTheme()
    return
  }

  const x = event.clientX
  const y = event.clientY
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => {
    isDark.value = !isDark.value
    applyTheme()
  })
  //Maiga de la transicion
  transition.ready.then(() => {
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${r}px at ${x}px ${y}px)`
    ]
    
    document.documentElement.animate(
      {
        clipPath: isDark.value ? clipPath.reverse() : clipPath
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: isDark.value ? '::view-transition-old(root)' : '::view-transition-new(root)'
      }
    )
  })
}

export function useRadialThemeToggle() {
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    console.log(savedTheme)
    isDark.value = savedTheme
      ? savedTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches

    applyTheme()
  })

  return {
    isDark,
    toggleRadialTheme,
  }
}