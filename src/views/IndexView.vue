<template>
    <div>
        <!-- presentación del sitio -->
        <section class="hero bg-primary">
            <v-container class="py-12 py-md-16">
                <div class="hero__content">
                    <div class="text-overline mb-2">{{ siteTitle }}</div>
                    <h1 class="text-h3 text-md-h2 font-weight-bold mb-4">Un rincón para lo que se me vaya ocurriendo</h1>
                    <p class="text-body-1 text-md-h6 font-weight-regular mb-8 hero__lead">
                        Ideas, experimentos y cosas que siempre quise hacer. Aquí las voy publicando a medida que salen.
                    </p>
                    <div class="d-flex flex-wrap ga-3">
                        <v-btn :to="{ name: 'Posts' }" size="large" color="surface" variant="flat" append-icon="mdi mdi-arrow-right">
                            Ver el blog
                        </v-btn>
                        <v-btn v-if="!auth.isAuthenticated" :to="{ name: 'Register' }" size="large" variant="outlined">
                            Crear cuenta
                        </v-btn>
                    </div>
                </div>
            </v-container>
        </section>

        <v-container class="py-10">
            <section class="mb-12">
                <div class="d-flex align-end justify-space-between flex-wrap ga-2 mb-4">
                    <h2 class="text-h5 font-weight-bold">Lo más reciente</h2>
                    <v-btn :to="{ name: 'Posts' }" variant="text" append-icon="mdi mdi-arrow-right">Ver todo</v-btn>
                </div>
                <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
                <PostList v-else :items="latest" :loading="loading" empty-title="Todavía no hay publicaciones" />
            </section>

            <section v-if="categories.length || tags.length" class="mb-6">
                <h2 class="text-h5 font-weight-bold mb-4">Explora</h2>
                <v-row>
                    <v-col v-if="categories.length" cols="12" md="6">
                        <v-card variant="tonal" class="h-100">
                            <v-card-title>Categorías</v-card-title>
                            <v-list density="comfortable" bg-color="transparent">
                                <v-list-item
                                    v-for="category in categories"
                                    :key="category.id"
                                    :to="{ name: 'CategoryPosts', params: { category: category.url } }"
                                    prepend-icon="mdi mdi-folder-outline"
                                    :title="category.name"
                                >
                                    <template #append>
                                        <v-chip size="small" variant="text">{{ category.posts_count }}</v-chip>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-col>
                    <v-col v-if="tags.length" cols="12" md="6">
                        <v-card variant="tonal" class="h-100">
                            <v-card-title>Etiquetas</v-card-title>
                            <v-card-text>
                                <TagLink :tags="tags" size="default" />
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </section>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import defaultSettings from '~/settings'
import { useAuthStore } from '~/stores/auth'
import { usePostsStore } from '~/stores/posts'
import PostList from '~/components/Posts/components/PostList.vue'
import TagLink from '~/components/Posts/components/TagLink.vue'

const siteTitle = defaultSettings.title
const auth = useAuthStore()
const postsStore = usePostsStore()

const latest = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
    // las tres peticiones en paralelo; si categorías o etiquetas fallan, la portada se muestra igual
    const [posts, cats, tagList] = await Promise.allSettled([
        postsStore.getPosts({ url: '/posts', page: 1 }),
        postsStore.getCategories(),
        postsStore.getTags(),
    ])
    if (posts.status === 'fulfilled') {
        latest.value = posts.value.data.data.slice(0, 3)
    } else {
        error.value = 'No se pudieron cargar las publicaciones.'
    }
    if (cats.status === 'fulfilled') categories.value = cats.value.data
    if (tagList.status === 'fulfilled') tags.value = tagList.value.data
    loading.value = false
})
</script>

<style scoped>
.hero__content {
    max-width: 720px;
}

.hero__lead {
    opacity: 0.9;
}
</style>
