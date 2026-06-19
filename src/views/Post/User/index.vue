<template>
    <div>
        <div v-if="isAuth">
            <h1>Mis posts</h1>
        </div>
       <div v-else class="pt-5 mx-auto mt-10 d-flex align-center">
            <v-card
                class="mx-auto"
                prepend-icon="$vuetify"
                subtitle="The #1 Vue UI Library"
                width="400"
                color="surface"
            >
                <template v-slot:title>
                <span class="font-weight-black">Welcome a mi  Sitio</span>
                </template>

                <v-card-text class="bg-surface-light pt-4 d-flex flex-column">
                    <div class="d-flex">
                        Para ver este contenido debes registrarte o iniciar sesion
                    </div>
                    
                    <div class="d-flex justify-space-between pt-3 mt-5">
                        <RouterLink :to="{name: 'Login'}">
                            <v-btn prepend-icon="mdi mdi-login" variant="outlined">
                                Iniciar sesion
                            </v-btn>
                        </RouterLink>
                        <RouterLink :to="{name: 'Login'}">
                            <v-btn prepend-icon="fa fa-plus" variant="outlined">
                                Registrarse
                            </v-btn>
                        </RouterLink>
                    </div>
                </v-card-text>
            </v-card>
       </div>
    </div>
</template>
<script setup>
import { useRadialThemeToggle } from '@/composables/Front/useRadialThemeToggle'
import { mapState, useStore } from 'vuex'
import { ref } from 'vue'
import { useTheme } from 'vuetify'
const store = useStore();
const isAuth = store.getters['isAuthenticated']
</script>