import { isDark } from '~/composables/dark'

export function toggleDarkWithViewTransition(event: MouseEvent) {
    if (!document.startViewTransition) {
        isDark.value = !isDark.value
        localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
        return
    }
  const goingDark = !isDark.value
  const x = event.clientX
  const y = event.clientY
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  const transition = document.startViewTransition(() => {
    isDark.value = goingDark
  })

  transition.ready.then(() => {
    const clip = goingDark
      ? `circle(0px at ${x}px ${y}px)`
      : `circle(${r}px at ${x}px ${y}px)`

    const final = goingDark
      ? `circle(${r}px at ${x}px ${y}px)`
      : `circle(0px at ${x}px ${y}px)`

    document.documentElement.animate(
      { clipPath: [clip, final] },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: goingDark
          ? '::view-transition-new(root)'
          : '::view-transition-old(root)'
      }
    )
  })
}
