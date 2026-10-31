<template>
    <div>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
            <template #append>
                <v-btn variant="text" @click="load">Reintentar</v-btn>
            </template>
        </v-alert>

        <PostList
            :items="items"
            :loading="loading"
            :skeletons="6"
            :empty-title="emptyTitle"
            :empty-text="emptyText"
        />

        <v-pagination
            v-if="lastPage > 1"
            :model-value="page"
            :length="lastPage"
            :total-visible="5"
            class="my-6"
            @update:model-value="goToPage"
        />
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '~/stores/posts'
import PostList from './PostList.vue'

// Listado paginado de posts públicos. La página vive en la URL (?page=), así que recargar,
// compartir el enlace o volver atrás respetan la página en la que estabas.
const props = defineProps({
    // /posts, /categories/{url} o /tags/{url}
    url: { type: String, required: true },
    search: { type: String, default: '' },
    emptyTitle: { type: String, default: 'Todavía no hay publicaciones' },
    emptyText: { type: String, default: '' },
})

// el padre recibe la respuesta completa (p. ej. el nombre de la categoría o etiqueta)
const emit = defineEmits(['loaded'])

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const items = ref([])
const lastPage = ref(1)
const loading = ref(false)
const error = ref('')

const page = computed(() => Math.max(parseInt(route.query.page) || 1, 1))

const load = async () => {
    loading.value = true
    error.value = ''
    try {
        const { data } = await postsStore.getPosts({ url: props.url, page: page.value, search: props.search })
        items.value = data.data
        lastPage.value = data.last_page || 1
        emit('loaded', data)
    } catch {
        items.value = []
        error.value = 'No se pudieron cargar las publicaciones.'
    } finally {
        loading.value = false
    }
}

const goToPage = (value) => {
    router.push({ query: { ...route.query, page: value > 1 ? value : undefined } })
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

watch(() => [props.url, props.search, page.value], load, { immediate: true })
</script>
