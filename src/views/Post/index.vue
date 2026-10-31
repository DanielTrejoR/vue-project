<template>
    <v-container class="py-8">
        <header class="mb-6">
            <h1 class="text-h4 font-weight-bold mb-1">Blog</h1>
            <p class="text-medium-emphasis">Todo lo que he ido publicando, de lo más nuevo a lo más viejo.</p>
        </header>

        <v-row class="mb-2" align="center">
            <v-col cols="12" md="5">
                <!-- la búsqueda vive en la URL (?q=) para poder compartirla o volver a ella -->
                <v-text-field
                    v-model="searchInput"
                    prepend-inner-icon="mdi mdi-magnify"
                    label="Buscar en el blog"
                    variant="outlined"
                    density="comfortable"
                    clearable
                    hide-details
                    @click:clear="searchInput = ''"
                />
            </v-col>
            <v-col cols="12" md="7">
                <div v-if="categories.length" class="d-flex flex-wrap ga-2">
                    <v-chip
                        v-for="category in categories"
                        :key="category.id"
                        :to="{ name: 'CategoryPosts', params: { category: category.url } }"
                        variant="tonal"
                        color="primary"
                    >
                        {{ category.name }}
                        <span class="ml-1 text-medium-emphasis">{{ category.posts_count }}</span>
                    </v-chip>
                </div>
            </v-col>
        </v-row>

        <Paginator
            url="/posts"
            :search="search"
            :empty-title="search ? `Nada coincide con «${search}»` : 'Todavía no hay publicaciones'"
            :empty-text="search ? 'Prueba con otras palabras.' : ''"
        />
    </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsStore } from '~/stores/posts'
import Paginator from '~/components/Posts/components/Paginator.vue'

const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const search = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const searchInput = ref(search.value)

// espera a que dejes de escribir antes de buscar; una búsqueda nueva empieza en la página 1
let searchTimer = null
watch(searchInput, value => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        const q = (value || '').trim()
        if (q === search.value) return
        router.replace({ query: { ...route.query, q: q || undefined, page: undefined } })
    }, 400)
})
watch(search, value => { if (value !== (searchInput.value || '').trim()) searchInput.value = value })

const categories = ref([])
onMounted(async () => {
    try {
        categories.value = (await postsStore.getCategories()).data
    } catch {
        // sin categorías el blog funciona igual
    }
})
</script>
