<template>
    <v-app-bar flat color="primary" class="px-1 px-sm-2">
      <!-- móvil: los enlaces pasan a un menú lateral -->
      <v-app-bar-nav-icon class="d-md-none" aria-label="Abrir menú" @click="navDrawer = !navDrawer" />

      <RouterLink :to="{ name: 'Index' }" class="brand">
        <span class="brand__mark">{{ siteTitle.charAt(0) }}</span>
        <span class="brand__title d-none d-sm-inline">{{ siteTitle }}</span>
      </RouterLink>

      <nav class="d-none d-md-flex ml-4">
        <v-btn
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          :exact="link.exact"
          :active="isActive(link)"
          variant="text"
          class="nav-link"
        >{{ link.title }}</v-btn>
      </nav>

      <v-spacer />

      <template #append>
        <PlayerIndicator />

        <v-btn
          v-if="!isAuthenticated"
          :to="{ name: 'Login' }"
          variant="outlined"
          class="d-none d-sm-flex mr-2"
          prepend-icon="mdi mdi-login"
        >Entrar</v-btn>

        <v-menu v-else min-width="260" max-width="92vw" location="bottom end" rounded>
          <template #activator="{ props }">
            <v-btn icon v-bind="props" aria-label="Menú de usuario">
              <FrontUserAvatar size="36" :src="user?.avatar" :name="user?.name" />
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="text-center">
              <FrontUserAvatar size="56" :src="user?.avatar" :name="user?.name" class="mb-2" />
              <div class="text-subtitle-1 font-weight-bold">{{ user?.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ user?.email }}</div>
            </v-card-text>
            <v-divider />
            <v-list density="compact" nav>
              <v-list-item :to="{ name: 'UserPosts' }" prepend-icon="mdi mdi-account-outline" title="Mi espacio" />
              <template v-if="canWrite">
                <v-list-item to="/admin/posts/create" prepend-icon="mdi mdi-plus" title="Nuevo post" />
                <v-list-item to="/admin/dashboard" prepend-icon="mdi mdi-view-dashboard-outline" title="Panel de administración" />
              </template>
              <v-list-item prepend-icon="mdi mdi-logout" title="Cerrar sesión" @click="logout" />
            </v-list>
          </v-card>
        </v-menu>

        <v-btn
          :icon="isDarkTheme ? 'mdi mdi-weather-night' : 'mdi mdi-weather-sunny'"
          id="mode-switcher"
          :aria-label="isDarkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          @click="toggleRadialTheme($event)"
        />
        <v-btn icon="mdi mdi-palette-outline" aria-label="Elegir tema" @click.stop="drawer = !drawer" />
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary location="right" :width="350">
      <ConfigMenu title="Configuracion" />
    </v-navigation-drawer>

    <v-navigation-drawer v-model="navDrawer" temporary location="left" :width="260">
      <v-list nav>
        <v-list-item
          v-for="link in links"
          :key="link.name"
          :to="{ name: link.name }"
          :exact="link.exact"
          :active="isActive(link)"
          :prepend-icon="link.icon"
          :title="link.title"
          @click="navDrawer = false"
        />
        <v-divider class="my-2" />
        <v-list-item v-if="!isAuthenticated" :to="{ name: 'Login' }" prepend-icon="mdi mdi-login" title="Entrar" @click="navDrawer = false" />
        <v-list-item v-if="!isAuthenticated" :to="{ name: 'Register' }" prepend-icon="mdi mdi-account-plus" title="Crear cuenta" @click="navDrawer = false" />
        <v-list-item v-if="canWrite" to="/admin/posts/create" prepend-icon="mdi mdi-plus" title="Nuevo post" @click="navDrawer = false" />
      </v-list>
    </v-navigation-drawer>
</template>
<script setup>
import PlayerIndicator from './PlayerIndicator.vue'
import FrontUserAvatar from '~/components/UserAvatar/FrontUserAvatar.vue'
import { useRadialThemeToggle } from '@/composables/Front/useRadialThemeToggle'
import { useAuthStore } from '~/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import defaultSettings from '~/settings'

const siteTitle = defaultSettings.title
const auth = useAuthStore()
const theme = useTheme()
const router = useRouter()
const route = useRoute()
const drawer = ref(false)
const navDrawer = ref(false)
const { toggleRadialTheme } = useRadialThemeToggle()

const links = [
  { name: 'Index', title: 'Inicio', icon: 'mdi mdi-home-outline', exact: true },
  { name: 'Posts', title: 'Blog', icon: 'mdi mdi-newspaper-variant-outline', exact: false },
  { name: 'UserPosts', title: 'Mi espacio', icon: 'mdi mdi-account-outline', exact: true },
]

// categoría, etiqueta y post no cuelgan de /blog en el router, pero son parte del blog
const blogRoutes = ['Posts', 'CategoryPosts', 'TagsPosts', 'ViewPost']
const isActive = link => link.name === 'Posts' ? blogRoutes.includes(route.name) : route.name === link.name

// computed para reflejar el login/logout sin recargar
const user = computed(() => auth.user)
const isAuthenticated = computed(() => auth.isAuthenticated)
const canWrite = computed(() => auth.canWrite)
// el ícono sigue al tema actual de Vuetify (los temas de colores también pueden ser oscuros)
const isDarkTheme = computed(() => theme.global.current.value.dark)

const logout = async () => {
  await auth.logout()
  router.push({ name: 'Index' })
}
</script>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
  font-weight: 700;
  margin-left: 4px;
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
}

.nav-link {
  text-transform: none;
  letter-spacing: normal;
  font-weight: 500;
}

/* la sección actual queda marcada con un subrayado */
.nav-link.v-btn--active {
  box-shadow: inset 0 -2px 0 currentColor;
}
</style>
