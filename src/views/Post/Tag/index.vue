<template>
    <v-container class="py-8">
        <v-btn :to="{ name: 'Posts' }" variant="text" prepend-icon="mdi mdi-arrow-left" class="mb-2 px-0">Blog</v-btn>
        <header class="mb-6">
            <div class="text-overline text-medium-emphasis">Etiqueta</div>
            <h1 class="text-h4 font-weight-bold">#{{ tagInfo?.name || props.tag }}</h1>
            <p v-if="total !== null" class="text-medium-emphasis">
                {{ total }} {{ total === 1 ? 'publicación' : 'publicaciones' }}
            </p>
        </header>

        <Paginator
            :url="`/tags/${props.tag}`"
            empty-title="Esta etiqueta todavía no tiene publicaciones"
            @loaded="onLoaded"
        />
    </v-container>
</template>
<script setup>
import { ref, watch } from 'vue'
import Paginator from '~/components/Posts/components/Paginator.vue'

const props = defineProps({
    tag: {
        type: String,
        required: true,
    }
})

const tagInfo = ref(null)
const total = ref(null)

const onLoaded = data => {
    tagInfo.value = data.tag
    total.value = data.total
    if (data.tag) document.title = `#${data.tag.name} - Vue Project Daniel`
}

// al pasar de una etiqueta a otra se limpia el encabezado anterior
watch(() => props.tag, () => {
    tagInfo.value = null
    total.value = null
})
</script>
