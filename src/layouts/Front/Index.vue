<template>
    <div class="navbar-root front-root">
        <v-app>
            <Navbar />
            <v-main>
                <AppMain />
            </v-main>
            <ShowAuthDialog v-model="showAuthDialog" />
            <LiveNotifications />
            <!-- footer al final de la página (antes era fijo y tapaba el contenido al hacer scroll) -->
            <v-footer color="primary" class="flex-grow-0">
                <v-container class="d-flex flex-wrap align-center justify-space-between ga-3 py-4">
                    <span>© {{ year }} {{ siteTitle }} · un rincón para lo que se me vaya ocurriendo</span>
                    <div class="d-flex ga-1">
                        <v-btn :to="{ name: 'Posts' }" variant="text" size="small">Blog</v-btn>
                        <v-btn :to="{ name: 'UserPosts' }" variant="text" size="small">Mi espacio</v-btn>
                        <v-btn v-if="auth.canWrite" to="/admin/dashboard" variant="text" size="small">Panel</v-btn>
                    </div>
                </v-container>
            </v-footer>
        </v-app>
    </div>
</template>
<script setup>
import { AppMain, Navbar } from "./components"
import ShowAuthDialog from "./components/ShowAuthDialog.vue"
import LiveNotifications from "./components/LiveNotifications.vue"
import { showAuthDialog } from '@/composables/Front/useAuthDialog'
import { useAuthStore } from '~/stores/auth'
import defaultSettings from '~/settings'
// el tema guardado (navegador o cuenta) lo aplica useApplyPreferences desde App.vue

const auth = useAuthStore()
const siteTitle = defaultSettings.title
const year = new Date().getFullYear()
</script>

<style>
/* AppMain del admin centra el texto de todo #app; el blog se lee alineado a la izquierda */
.front-root {
    text-align: left;
}
</style>
