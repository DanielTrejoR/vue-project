<template>
    <v-container>
    <v-list-item title="Personaliza el sitio" subtitle="Configuracion"></v-list-item>
      <h3 class="mb-4">Selecciona un tema</h3>
      <div class="d-flex flex-wrap ga-4">
        <v-avatar
            v-for="theme in themes"
            :key="theme.name"
            size="56"
            :style="avatarStyle(theme)"
            class="cursor-pointer"
            @click="selectTheme(theme.name)"
        />
      </div>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useThemeSwitcher } from '@/composables/Front/useThemeSwitcher'

const { setTheme, initTheme } = useThemeSwitcher()
const drawer = ref(true)
const selectedTheme = ref('light')

// Definimos los temas con sus colores
const themes = [
    { name: 'light', label: 'Light', primary: '#1867C0', background: '#FFFFFF' },
    { name: 'dark', label: 'Dark', primary: '#121212', background: '#212121' },
    { name: 'darkPurple', label: 'Morado Oscuro', primary: '#6A1B9A', background: '#121212' },
    { name: 'redWhite', label: 'Rojo/Blanco', primary: '#E53935', background: '#FFFFFF' },
    { name: 'blueCorporate', label: 'Azul Corporativo', primary: '#1976D2', background: '#121212' },
    { name: 'greenNature', label: 'Verde Natural', primary: '#43A047', background: '#FAFAFA' },
    { name: 'orangeEnergy', label: 'Naranja Energético', primary: '#FB8C00', background: '#212121' },
    { name: 'turquoiseModern', label: 'Turquesa Moderno', primary: '#009688', background: '#FFFFFF' },
]

const avatarStyle = (theme) => {
  const isActive = selectedTheme.value === theme.name
  return {
    background: `linear-gradient(135deg, ${theme.primary} 50%, ${theme.background} 50%)`,
    borderRadius: '50%',
    cursor: 'pointer',
    border: `3px solid ${isActive ? 'gold' : '#ccc'}`,
  }
}

const selectTheme = (name) => {
  selectedTheme.value = name
  setTheme(name)
}

initTheme()
</script>
