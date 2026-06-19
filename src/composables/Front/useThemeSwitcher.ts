import { useTheme } from 'vuetify'

export function useThemeSwitcher() {
  const theme = useTheme()

  const setTheme = (name: string) => {
    theme.global.name.value = name
    sessionStorage.setItem('app_theme', name)
  }

  const initTheme = () => {
    const saved = sessionStorage.getItem('app_theme')
    if (saved) theme.global.name.value = saved
  }

  return { setTheme, initTheme }
}