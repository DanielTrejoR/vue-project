<template>
    <div class="navbar-root">
        <v-app>
            <!-- Navbar -->
                <Navbar />
            <!-- Fin Navbar -->
            <v-main>
                <AppMain />
            </v-main>
            <!-- Footer -->
            <v-footer app color="primary" dark>
                <v-col class="text-center">© 2026 Mi Blog {{savedTheme }}</v-col>
            </v-footer>
        </v-app>
    </div>
</template>
<script setup>
import { AppMain, Navbar } from "./components"
import { onMounted } from 'vue';
import { useTheme } from 'vuetify'
const theme = useTheme()
const savedTheme = sessionStorage.getItem('dark_theme')
const loadInitTheme = () => {
    if (savedTheme) {
    theme.global.name.value = savedTheme
  } else {
    // fallback al sistema
    theme.global.name.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'light'
      : 'dark'
  }
}
onMounted(() => {
  const el = document.querySelector('#navbar-root')
  if (el) el.style.border = '2px solid red';
  loadInitTheme
})

</script>
