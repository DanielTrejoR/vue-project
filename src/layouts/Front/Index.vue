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
// el tema guardado (navegador o cuenta) lo aplica useApplyPreferences desde App.vue

</script>
