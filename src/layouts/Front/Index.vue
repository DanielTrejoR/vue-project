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
                <v-col class="text-center">© 2026 Mi Blog</v-col>
            </v-footer>
        </v-app>
    </div>
</template>
<script setup>
import { AppMain, Navbar } from "./components"
import { onMounted } from 'vue';

onMounted(() => {
  const el = document.querySelector('#navbar-root')
  if (el) el.style.border = '2px solid red'
})

</script>
