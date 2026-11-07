<template>
    <v-container class="py-8">
        <header class="mb-6">
            <div class="text-overline text-medium-emphasis">Categoría</div>
            <h1 class="text-h4 font-weight-bold">{{ category?.name || route.params.category }}</h1>
            <p v-if="total !== null" class="text-medium-emphasis">
                {{ total }} {{ total === 1 ? 'publicación' : 'publicaciones' }}
            </p>
        </header>

        <Paginator
            :url="`/categories/${route.params.category}`"
            empty-title="Esta categoría todavía no tiene publicaciones"
            @loaded="onLoaded"
        />
    </v-container>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Paginator from '~/components/Posts/components/Paginator.vue'
import { setPageMeta } from '~/utils/seo'

const route = useRoute()
const category = ref(null)
const total = ref(null)

const onLoaded = data => {
    category.value = data.category
    total.value = data.total
    if (data.category) setPageMeta({ title: data.category.name, description: `Publicaciones de la categoría ${data.category.name}.` })
}

// al pasar de una categoría a otra se limpia el encabezado anterior
watch(() => route.params.category, () => {
    category.value = null
    total.value = null
})
</script>
