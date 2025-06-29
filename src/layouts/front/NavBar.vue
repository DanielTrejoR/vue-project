<template>
    <v-app-bar
      flat
      height="72"
    >
      
      <v-avatar
        class="mx-2"
        color="surface-variant"
        size="32"
        variant="flat"
      ></v-avatar>
      <RouterLink :to="{name: 'Index'}">
        <v-btn
          class="me-2"
          color="grey"
          height="40"
          variant="flat"
          width="80"
        >
          Inicio 
        </v-btn>
      </RouterLink>

      <v-btn
        class="me-2"
        color="grey"
        height="40"
        variant="flat"
      >Mis Posts</v-btn>
      <RouterLink :to="{name: 'Posts'}">
        <v-btn
          class="me-2"
          color="grey"
          height="40"
          variant="flat"
        >Ultimos Posts</v-btn>
      </RouterLink>


      <v-spacer></v-spacer>
      <template v-slot:append>
          
          <v-btn
            class="me-2"
            color="grey"
            height="40"
            variant="flat"
          >Login / Sign up</v-btn>
          <v-btn
            class="me-2"
            color="grey"
            height="40"
            variant="flat"
          >Crear Nuevo Post</v-btn>
          <v-menu
            min-width="500px"
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
                <v-avatar
                  color="brown"
                  size="large"
                >
                  <span class="text-h5">Joe</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-card>
              <v-card-text>
                <div class="mx-auto text-center">
                  <v-avatar
                    color="brown"
                  >
                    <span class="text-h5">Joe</span>
                  </v-avatar>
                  <h3>Joe</h3>
                  <p class="text-caption mt-1">
                    Joe@me.com
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
                  >
                    Disconnect
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
          <v-btn
            class=""
              icon id="mode-switcher"
              @click="toggleTheme"
          >   
              <v-icon :color="($vuetify.theme.global.name === 'dark') ? 'primary' : 'primary lighten-4'">
              mdi {{ ($vuetify.theme.global.name === 'dark') ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
              </v-icon>
          </v-btn>
          <v-btn @click.stop="drawer = !drawer" icon="mdi mdi-cog"></v-btn>
        </template>
    </v-app-bar>
    <v-navigation-drawer
        v-model="drawer"
        temporary
        location="right"
      >
        
        <ConfigMenu title="Configuracion"></ConfigMenu>
      </v-navigation-drawer>
</template>
<script>
import store from '~/store/index.js'

export default {
    data: () => ({
      drawer: null,
      ex11: false
    }),
    methods: {
        toggleTheme() {
            const dark = this.$vuetify.theme.global.name = this.$vuetify.theme.global.current.dark ? 'light' : 'dark'
            store.dispatch('base/toggleDarkMode', dark)
        }
    },
    mounted() {
        // if(store.state.base.user_admin.config.darkMode){
        //     this.$vuetify.theme.global.name = store.state.base.user_admin.config.darkMode
        // }
    }
}
</script>