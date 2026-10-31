<template>
<div class="d-flex align-center flex-wrap ga-1">
    <span class="text-caption text-medium-emphasis mr-1">Compartir</span>
    <v-btn
        v-for="item in items"
        :key="item.id"
        :href="item.link"
        target="_blank"
        rel="noopener noreferrer"
        :icon="item.icon"
        :aria-label="`Compartir en ${item.name}`"
        :title="item.name"
        variant="tonal"
        size="small"
    />
    <v-btn
        :icon="copied ? 'mdi mdi-check' : 'mdi mdi-link-variant'"
        :aria-label="copied ? 'Enlace copiado' : 'Copiar enlace'"
        :title="copied ? 'Enlace copiado' : 'Copiar enlace'"
        variant="tonal"
        size="small"
        @click="copyLink"
    />
</div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    currentUrl: {
        type: String,
        required: true
    },
    // página del backend con las etiquetas og para la vista previa de las redes; si no viene, se comparte currentUrl
    shareUrl: {
        type: String,
        default: ''
    }
})
const shared = computed(() => encodeURIComponent(props.shareUrl || props.currentUrl))
// MDI no tiene el logo nuevo de X: va como trazo SVG (simple-icons, dominio público)
const X_LOGO = 'svg:M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z'

const items = computed(() => [
  { icon: 'mdi mdi-facebook', id: 1, name: 'Facebook', link: `https://www.facebook.com/sharer/sharer.php?u=${shared.value}` },
  { icon: X_LOGO, id: 2, name: 'X (Twitter)', link: `https://twitter.com/intent/tweet?url=${shared.value}&text=${encodeURIComponent(props.title)}` },
  { icon: 'mdi mdi-pinterest', id: 3, name: 'Pinterest', link: `https://pinterest.com/pin/create/button/?url=${shared.value}&description=${encodeURIComponent(props.title)}` }, // Instagram no tiene sharer directo
])

const copied = ref(false)
const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(props.currentUrl)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    } catch {
        // sin permiso de portapapeles: el usuario puede copiar la URL del navegador
    }
}
</script>
