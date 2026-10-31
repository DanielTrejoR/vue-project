<template>
  <v-avatar :size="size">
    <!-- <img> simple: v-img no muestra su slot #error cuando la foto da 404 -->
    <img :src="failed || !src ? defaultAvatar : src" :alt="name" class="front-avatar__img" @error="failed = true" />
  </v-avatar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import defaultAvatar from '~/assets/default-avatar.svg'

// avatar del blog (Vuetify): sin foto o con la foto rota muestra el genérico
const props = withDefaults(defineProps<{
  src?: string | null
  name?: string
  size?: number | string
}>(), { size: 40 })

const failed = ref(false)
// una foto nueva (p. ej. tras cambiarla en el perfil) merece otro intento
watch(() => props.src, () => { failed.value = false })
</script>

<style scoped>
.front-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
