<template>
    <!-- en el inicio no hace falta: ya estás en la raíz -->
    <v-container v-if="items.length > 1" class="pt-4 pb-0">
        <v-breadcrumbs :items="items" density="compact" class="front-breadcrumbs pa-0 text-body-2">
            <template #prepend>
                <v-icon icon="mdi mdi-home-outline" size="small" class="me-1 text-medium-emphasis" />
            </template>
            <template #divider>
                <v-icon icon="mdi mdi-chevron-right" size="small" />
            </template>
        </v-breadcrumbs>
    </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { pageTitle } from '~/utils/seo'

interface Crumb {
    title: string
    to?: { name: string }
    disabled?: boolean
}

const route = useRoute()

// el título que puso la vista con setPageMeta (post, categoría, etiqueta), solo si es de esta página
const currentTitle = computed(() => (pageTitle.value?.path === route.path ? pageTitle.value.title : null))

const items = computed<Crumb[]>(() => {
    const home: Crumb = { title: 'Inicio', to: { name: 'Index' } }
    const blog: Crumb = { title: 'Blog', to: { name: 'Posts' } }
    const current = (title: string): Crumb => ({ title, disabled: true })

    switch (route.name) {
        case 'Index':
            return [home]
        case 'Posts':
            return [home, current('Blog')]
        case 'ViewPost':
            return [home, blog, current(currentTitle.value || 'Publicación')]
        case 'CategoryPosts':
            return [home, blog, current(currentTitle.value || String(route.params.category))]
        case 'TagsPosts':
            return [home, blog, current(currentTitle.value || `#${route.params.tag}`)]
        default:
            return route.meta.title ? [home, current(String(route.meta.title))] : [home]
    }
})
</script>

<style scoped>
/* un título largo de post se corta con "…" en vez de romper la barra en el celular */
.front-breadcrumbs :deep(.v-breadcrumbs-item:last-child) {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: block;
}
</style>
