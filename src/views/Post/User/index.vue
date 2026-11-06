<template>
    <v-container class="py-8">
        <!-- sin sesión -->
        <v-card v-if="!auth.isAuthenticated" class="mx-auto text-center pa-6" max-width="480" variant="tonal">
            <v-icon icon="mdi mdi-account-lock-outline" size="48" class="mb-2" />
            <v-card-title class="text-h5">Tu espacio en el sitio</v-card-title>
            <v-card-text>
                Inicia sesión o crea una cuenta para llevar tu lista de tareas y ver tus publicaciones y los comentarios que has dejado.
            </v-card-text>
            <v-card-actions class="justify-center flex-wrap ga-2">
                <v-btn :to="{ name: 'Login', query: { redirect: '/my-posts' } }" color="primary" variant="flat" prepend-icon="mdi mdi-login">
                    Iniciar sesión
                </v-btn>
                <v-btn :to="{ name: 'Register' }" variant="outlined" prepend-icon="mdi mdi-account-plus">
                    Crear cuenta
                </v-btn>
            </v-card-actions>
        </v-card>

        <template v-else>
            <header class="mb-6">
                <h1 class="text-h4 font-weight-bold mb-1">Hola, {{ auth.user?.name || 'de nuevo' }}</h1>
                <p class="text-medium-emphasis">Tus tareas, lo que has publicado y lo que has comentado en el sitio.</p>
            </header>

            <TodoList class="mb-10" />

            <!-- publicaciones propias: solo Admin y Writer pueden escribir -->
            <section v-if="auth.canWrite" class="mb-10">
                <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
                    <h2 class="text-h6 font-weight-bold">Mis publicaciones</h2>
                    <v-btn to="/admin/posts/create" color="primary" variant="flat" prepend-icon="mdi mdi-plus">Nuevo post</v-btn>
                </div>

                <v-skeleton-loader v-if="postsLoading" type="list-item-two-line@3" />
                <v-alert v-else-if="postsError" type="error" variant="tonal">{{ postsError }}</v-alert>
                <v-card v-else-if="!myPosts.length" variant="tonal" class="pa-6 text-center">
                    Todavía no has escrito nada. ¡Anímate con el primero!
                </v-card>
                <v-list v-else lines="two" class="rounded-lg" border>
                    <v-list-item
                        v-for="post in myPosts"
                        :key="post.id"
                        :title="post.title"
                        :subtitle="post.published_at ? `Publicado el ${post.published_at}` : 'Sin fecha de publicación'"
                    >
                        <template #prepend>
                            <v-chip
                                :color="post.status === 'published' ? 'success' : 'grey'"
                                size="small"
                                variant="tonal"
                                class="mr-3 status-chip"
                            >
                                {{ post.status === 'published' ? 'Publicado' : 'Borrador' }}
                            </v-chip>
                        </template>
                        <template #append>
                            <v-btn
                                v-if="post.status === 'published'"
                                :to="{ name: 'ViewPost', params: { url: post.url } }"
                                icon="mdi mdi-eye-outline"
                                variant="text"
                                size="small"
                                aria-label="Ver en el blog"
                            />
                            <v-btn
                                :to="`/admin/posts/edit/${post.url}`"
                                icon="mdi mdi-pencil-outline"
                                variant="text"
                                size="small"
                                aria-label="Editar"
                            />
                        </template>
                    </v-list-item>
                </v-list>
                <div v-if="postsTotal > myPosts.length" class="text-right mt-2">
                    <v-btn to="/admin/posts/index" variant="text" append-icon="mdi mdi-arrow-right">
                        Ver las {{ postsTotal }} en el panel
                    </v-btn>
                </div>
            </section>

            <section>
                <h2 class="text-h6 font-weight-bold mb-3">Mis comentarios</h2>
                <v-skeleton-loader v-if="commentsLoading && !comments.length" type="list-item-three-line@2" />
                <v-alert v-else-if="commentsError" type="error" variant="tonal">{{ commentsError }}</v-alert>
                <v-card v-else-if="!comments.length" variant="tonal" class="pa-6 text-center">
                    Aún no has comentado ningún post.
                    <div class="mt-3"><v-btn :to="{ name: 'Posts' }" variant="text">Ir al blog</v-btn></div>
                </v-card>
                <template v-else>
                    <v-card v-for="item in comments" :key="item.id" variant="outlined" class="mb-3">
                        <v-card-text>
                            <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-2 text-caption text-medium-emphasis">
                                <span>
                                    En
                                    <RouterLink
                                        v-if="item.post"
                                        :to="{ name: 'ViewPost', params: { url: item.post.url } }"
                                        class="text-primary font-weight-medium"
                                    >{{ item.post.title }}</RouterLink>
                                    <span v-else>un post que ya no existe</span>
                                </span>
                                <span>{{ item.created_at }}</span>
                            </div>
                            <p class="comment-text">{{ item.comment }}</p>
                        </v-card-text>
                    </v-card>
                    <div v-if="commentsPage < commentsLastPage" class="text-center">
                        <v-btn variant="tonal" :loading="commentsLoading" @click="loadComments(commentsPage + 1)">Cargar más</v-btn>
                    </div>
                </template>
            </section>
        </template>
    </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import TodoList from './components/TodoList.vue'
import { usePostsStore } from '~/stores/posts'

const auth = useAuthStore()
const postsStore = usePostsStore()

// publicaciones propias (endpoint del panel: solo devuelve las del usuario)
const myPosts = ref([])
const postsTotal = ref(0)
const postsLoading = ref(false)
const postsError = ref('')

const loadMyPosts = async () => {
    postsLoading.value = true
    postsError.value = ''
    try {
        const data = await postsStore.fetchPosts({ page: 1, size: 10, filters: {} })
        myPosts.value = data.data
        postsTotal.value = data.total
    } catch {
        postsError.value = 'No se pudieron cargar tus publicaciones.'
    } finally {
        postsLoading.value = false
    }
}

const comments = ref([])
const commentsPage = ref(1)
const commentsLastPage = ref(1)
const commentsLoading = ref(false)
const commentsError = ref('')

// "Cargar más" agrega la página siguiente debajo de las anteriores
const loadComments = async (page = 1) => {
    commentsLoading.value = true
    commentsError.value = ''
    try {
        const { data } = await postsStore.getMyComments(page)
        comments.value = page === 1 ? data.data : [...comments.value, ...data.data]
        commentsPage.value = data.current_page
        commentsLastPage.value = data.last_page
    } catch {
        commentsError.value = 'No se pudieron cargar tus comentarios.'
    } finally {
        commentsLoading.value = false
    }
}

// el usuario puede llegar aquí antes de que termine fetchUser (al recargar) o iniciar sesión en el diálogo
watch(() => [auth.isAuthenticated, auth.canWrite], ([logged, canWrite]) => {
    if (!logged) return
    loadComments(1)
    if (canWrite) loadMyPosts()
}, { immediate: true })
</script>

<style scoped>
.comment-text {
    white-space: pre-line;
    overflow-wrap: anywhere;
}

.status-chip {
    min-width: 88px;
    justify-content: center;
}
</style>
