<template>
    <v-app-bar
      flat
      class="px-2"
      color="primary"
    >
      <!-- móvil: los enlaces pasan a un menú lateral -->
      <v-app-bar-nav-icon class="d-md-none" aria-label="Abrir menú" @click="navDrawer = !navDrawer" />

      <div class="d-none d-md-flex">
      <RouterLink :to="{name: 'Index'}">
        <v-btn
          color="primary"
          class="me-2"
          height="40"
          variant="flat"
          width="80"
        >
          Inicio 
        </v-btn>
      </RouterLink>

      <RouterLink :to="{name: 'UserPosts'}">
        <v-btn
          color="primary"
          class="me-2"
          height="40"
          variant="flat"
        >Mis Posts</v-btn>
      </RouterLink>
      <RouterLink :to="{name: 'Posts'}">
        <v-btn
          class="me-2"
          height="40"
          variant="flat"
          color="primary"
        >Ultimos Posts</v-btn>
      </RouterLink>
      </div>

      <v-spacer></v-spacer>
      <template v-slot:append>
          <div class="d-none d-sm-flex">
            <v-btn
              v-if="!isAuthenticated"
              :to="{ name: 'Login' }"
              class="me-2"
              color="primary"
              height="40"
              variant="flat"
            >Login / Sign up</v-btn>
            <!-- path y no name: la ruta solo existe si el usuario tiene rol de admin/escritor -->
            <v-btn
              v-else-if="canWrite"
              to="/admin/posts/create"
              class="me-2"
              color="primary"
              height="40"
              variant="flat"
            >Crear Nuevo Post</v-btn>
          </div>
          <v-menu
            min-width="280px"
            max-width="92vw"
            rounded
            location="bottom"
            transition="slide-x-transition"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                class="pe-1"
                v-bind="props"
              >
                <v-avatar v-if="user"
                  color="brown"
                  size="large"
                  :image="user.avatar"
                >
                </v-avatar>
                <v-avatar v-else
                  color="brown"
                  size="large"
                >
                Guest
                </v-avatar>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <div class="mx-auto text-center" v-if="user">
                  <v-avatar
                    color="brown"
                    :image="user.avatar"
                  >
                  </v-avatar>
                  <h3>{{ user.name }}</h3>
                  <p class="text-caption mt-1">
                    {{ user.email }}
                  </p>
                  <v-divider class="my-3"></v-divider>
                  <v-btn
                    rounded
                    variant="text"
                  >
                    Edit Account
                  </v-btn>
                  <v-divider class="my-3"></v-divider>
                  <v-btn
                    rounded
                    variant="text"
                    @click="logout"
                  >
                    Disconnect
                  </v-btn>
                </div>
                <div v-else>
                    <v-btn
                      rounded
                      variant="text"
                      :to="{ name: 'Login' }"
                    >
                      Login
                    </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-btn
            class=""
            :icon="themeIcon"
            id="mode-switcher"
            @click="toggleRadialTheme($event)"
          >
          </v-btn>
          <v-btn @click.stop="drawer = !drawer" icon="mdi mdi-cog"></v-btn>
        </template>
    </v-app-bar>
    <v-navigation-drawer
        v-model="drawer"
        temporary
        color="primary"
        location="right"
        :width="350"
      >
        
        <ConfigMenu title="Configuracion"></ConfigMenu>
      </v-navigation-drawer>

      <v-navigation-drawer v-model="navDrawer" temporary location="left" :width="260">
        <v-list nav>
          <v-list-item :to="{ name: 'Index' }" prepend-icon="mdi mdi-home" title="Inicio" @click="navDrawer = false" />
          <v-list-item :to="{ name: 'UserPosts' }" prepend-icon="mdi mdi-account-edit" title="Mis Posts" @click="navDrawer = false" />
          <v-list-item :to="{ name: 'Posts' }" prepend-icon="mdi mdi-newspaper" title="Ultimos Posts" @click="navDrawer = false" />
          <v-divider class="my-2" />
          <v-list-item v-if="!isAuthenticated" :to="{ name: 'Login' }" prepend-icon="mdi mdi-login" title="Login / Sign up" @click="navDrawer = false" />
          <v-list-item v-else-if="canWrite" to="/admin/posts/create" prepend-icon="mdi mdi-plus" title="Crear Nuevo Post" @click="navDrawer = false" />
        </v-list>
      </v-navigation-drawer>
</template>
<script setup>
import { useRadialThemeToggle } from '@/composables/Front/useRadialThemeToggle'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { ref, watch, computed } from 'vue'
import { useTheme } from 'vuetify'

const auth = useAuthStore()
const theme = useTheme()
const drawer = ref(null)
const navDrawer = ref(false)
const ex11 = ref(false)
const { toggleRadialTheme } = useRadialThemeToggle()
const router = useRouter()
// computed para reflejar el login/logout sin recargar
const user = computed(() => auth.user)
const isAuthenticated = computed(() => auth.isAuthenticated)
const canWrite = computed(() => auth.canWrite)

const logout = async () => {
  await auth.logout()
  router.push({ name: 'Index' })
}

const themeIcon = ref('mdi mdi-weather-sunny')
// Guardamos el último tema claro y oscuro
const lastLight = ref('light')
const lastDark = ref('dark')


// Función para calcular luminosidad
const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace('#', ''), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

const getIconByBackground = (bg) => {
  const { r, g, b } = hexToRgb(bg)
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255
  return luminance < 0.5 ? 'mdi mdi-weather-night' : 'mdi mdi-weather-sunny'
}


// Watcher: actualiza icono y guarda último tema claro/oscuro
watch(
  () => theme.global.name.value,
  (newTheme) => {
    const bg = theme.global.current.value.colors.background || '#FFFFFF'
    themeIcon.value = getIconByBackground(bg)

    if (themeIcon.value === 'mdi mdi-weather-sunny') {
      lastLight.value = newTheme
    } else {
      lastDark.value = newTheme
    }
  },
  { immediate: true }
)

// Acción del botón: alternar entre último claro ↔ último oscuro
const toggleTheme = () => {
  if (themeIcon.value === 'mdi mdi-weather-sunny') {
    theme.global.name.value = lastDark.value
  } else {
    theme.global.name.value = lastLight.value
  }
}

</script>