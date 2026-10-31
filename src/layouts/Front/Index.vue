<template>
    <div class="navbar-root">
        <v-app>
            <!-- Navbar -->
                <Navbar />
            <!-- Fin Navbar -->
            <v-main>
                <AppMain />
            </v-main>
            <ShowAuthDialog v-model="showAuthDialog" />
            <!-- Footer -->
            <v-footer app color="primary" dark>
                <v-col class="text-center">© 2026 Mi Blog</v-col>
            </v-footer>
        </v-app>
    </div>
</template>
<script setup>
import { AppMain, Navbar } from "./components"
import ShowAuthDialog from "./components/ShowAuthDialog.vue"
import { showAuthDialog } from '@/composables/Front/useAuthDialog'
import { onMounted, ref } from 'vue';
import { useTheme } from 'vuetify'


const theme = useTheme()
// 'app_theme' lo guardan el selector de temas (ConfigMenu) y el botón claro/oscuro
const loadInitTheme = () => {
  const savedTheme = sessionStorage.getItem('app_theme')
  if (savedTheme && savedTheme in theme.themes.value) {
    theme.global.name.value = savedTheme
  } else {
    // fallback al sistema
    theme.global.name.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
}

onMounted(() => {
  loadInitTheme()
})

</script>
