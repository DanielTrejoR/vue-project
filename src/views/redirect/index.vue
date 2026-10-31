<template>
  <div></div>
</template>

<script setup>
// "Recargar" de una pestaña del admin: se entra a /redirect/<ruta> y de inmediato se vuelve a la ruta,
// así el componente se crea de nuevo (la versión anterior usaba render(h) de Vue 2 y fallaba en Vue 3)
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const path = Array.isArray(route.params.path) ? route.params.path.join('/') : route.params.path
router.replace({ path: `/${path}`, query: route.query })
</script>
