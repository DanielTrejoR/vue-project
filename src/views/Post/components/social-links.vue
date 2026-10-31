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
    }
})
const items = computed(() => [
  { icon: 'fa:fab fa-facebook', id: 1, name: 'Facebook', link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.currentUrl)}` },
  { icon: 'fa:fab fa-x-twitter', id: 2, name: 'X (Twitter)', link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(props.currentUrl)}&text=${encodeURIComponent(props.title)}` },
  { icon: 'fa:fab fa-pinterest', id: 3, name: 'Pinterest', link: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(props.currentUrl)}&description=${encodeURIComponent(props.title)}` }, // Instagram no tiene sharer directo
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
