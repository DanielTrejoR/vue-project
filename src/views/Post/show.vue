<template>
<v-container class="py-8 post-page">
    <v-btn :to="{ name: 'Posts' }" variant="text" prepend-icon="mdi mdi-arrow-left" class="mb-4 px-0">Blog</v-btn>

    <v-skeleton-loader v-if="!post.id" type="heading, paragraph, image, paragraph" />

    <article v-else>
        <header class="mb-6">
            <div class="d-flex flex-wrap align-center ga-2 mb-3">
                <CategoryLink v-if="post.category" :category="post.category" size="small" />
                <span class="text-body-2 text-medium-emphasis">
                    {{ post.published_at || 'Borrador' }}<template v-if="post.owner"> · por {{ post.owner.name }}</template>
                </span>
            </div>
            <h1 class="text-h4 text-md-h3 font-weight-bold post-title">{{ post.title }}</h1>
            <p v-if="post.excerpt" class="text-h6 font-weight-regular text-medium-emphasis mt-3">{{ post.excerpt }}</p>
        </header>

        <div v-if="gallery.length" class="mb-6 rounded-lg overflow-hidden">
            <v-img v-if="gallery.length === 1" :src="gallery[0].full_url" max-height="520" cover />
            <CarouselComponent v-else :photos="gallery" />
        </div>

        <!-- el cuerpo llega purificado por el backend (Purifier) -->
        <div class="post-body" v-html="post.body"></div>

        <p v-if="post.iframe" class="mt-4 text-body-2">
            Contenido relacionado:
            <a :href="post.iframe" target="_blank" rel="noopener noreferrer">{{ post.iframe }}</a>
        </p>

        <PostAttachments :files="attachments" />

        <v-divider class="my-6" />

        <div class="d-flex flex-wrap align-center justify-space-between ga-4">
            <TagLink v-if="post.tags?.length" :tags="post.tags" />
            <SocialLinks :title="post.title" :current-url="currentUrl" :share-url="sharePostUrl(post.url)" />
        </div>
    </article>

    <v-card v-if="post.id" variant="tonal" class="my-8 pa-4 d-flex flex-wrap align-center justify-space-between ga-4">
        <div>
            <div class="text-subtitle-1 font-weight-bold">{{ userRating ? 'Tu puntuación' : '¿Qué te pareció?' }}</div>
            <div class="text-caption" v-if="ratingsCount">
                Promedio {{ ratingsAverage }} / 5 · {{ ratingsCount }} {{ ratingsCount === 1 ? 'voto' : 'votos' }}
            </div>
            <div class="text-caption" v-else>Aún nadie lo ha puntuado</div>
        </div>
        <!-- sin medias estrellas: el backend solo acepta enteros del 1 al 5 -->
        <v-rating
            v-model="userRating"
            hover
            :length="5"
            :size="32"
            active-color="amber"
            @update:model-value="setRating"
        />
    </v-card>

    <h2 v-if="post.id" class="text-h5 font-weight-bold mb-3">Deja tu comentario</h2>
    <v-card v-if="post.id && isAuthenticated && user?.is_active" class="mb-6">
        <v-card-text>
            <v-textarea
                v-model="comment"
                label="Escribe tu comentario"
                variant="outlined"
                rows="3"
                auto-grow
                counter="500"
                maxlength="500"
                hide-details="auto"
            />
        </v-card-text>
        <v-card-actions class="justify-end px-4 pb-4">
            <v-btn color="primary" variant="flat" append-icon="mdi mdi-send" :disabled="!comment?.trim()" :loading="loading" @click="postComment">
                Enviar
            </v-btn>
        </v-card-actions>
    </v-card>
    <v-alert v-else-if="post.id && isAuthenticated" type="info" variant="tonal" class="mb-6">
        Tu cuenta está desactivada, así que no puedes comentar.
    </v-alert>
    <v-card v-else-if="post.id" variant="tonal" class="mb-6 pa-4">
        <div class="mb-3">Inicia sesión o crea una cuenta para dejar un comentario.</div>
        <div class="d-flex flex-wrap ga-2">
            <v-btn :to="{ name: 'Login', query: { redirect: route.fullPath } }" prepend-icon="mdi mdi-login" color="primary" variant="flat">
                Iniciar sesión
            </v-btn>
            <v-btn :to="{ name: 'Register', query: { redirect: route.fullPath } }" prepend-icon="mdi mdi-account-plus" variant="outlined">
                Crear cuenta
            </v-btn>
        </div>
    </v-card>
    <v-card v-if="post.id" class="mt-2">
        <div v-if="post.comments?.length">
            <v-card-title>Comentarios ({{ post.comments.length }}):</v-card-title>
            <v-card
                v-for="item in post.comments" :key="item.id"
                variant="tonal" class="mt-5">
                <template v-slot:append>
                    <span class="text-caption">{{ item.created_at }}</span>
                    <template v-if="canManage(item)">
                        <v-btn
                            icon="mdi mdi-pencil"
                            size="small"
                            variant="text"
                            aria-label="Editar comentario"
                            @click="startEdit(item)"
                        />
                        <v-btn
                            icon="mdi mdi-delete"
                            size="small"
                            variant="text"
                            color="error"
                            aria-label="Eliminar comentario"
                            :loading="deletingId === item.id"
                            @click="removeComment(item)"
                        />
                    </template>
                </template>
                <template v-slot:prepend>
                    <FrontUserAvatar :src="item.user.avatar" :name="item.user.name" />
                    <v-card-subtitle class="pl-4">{{ item.user.name }}</v-card-subtitle>
                </template>
                <v-card-text v-if="editingId === item.id" class="pt-2">
                    <v-textarea v-model="editingText" rows="2" auto-grow label="Editar comentario" hide-details />
                    <div class="d-flex justify-end ga-2 mt-2">
                        <v-btn variant="text" @click="cancelEdit">Cancelar</v-btn>
                        <v-btn color="primary" :loading="savingEdit" :disabled="!editingText.trim()" @click="saveEdit(item)">
                            Guardar
                        </v-btn>
                    </div>
                </v-card-text>
                <v-card-text v-else class="py-2 comment-text">
                    {{ item.comment }}
                </v-card-text>
            </v-card>
        </div>
        <div v-else>
            <v-card-title>Esta publicacion no tiene comentarios...</v-card-title>
        </div>
    </v-card>
    <v-dialog v-model="confirmDelete" max-width="400">
        <v-card>
            <v-card-title>¿Eliminar este comentario?</v-card-title>
            <v-card-text>
                «{{ commentToDelete?.comment }}»
                <div class="text-caption mt-2">Esta acción no se puede deshacer.</div>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="confirmDelete = false">Cancelar</v-btn>
                <v-btn color="error" variant="flat" @click="deleteConfirmed">Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-snackbar v-model="feedback.show" :color="feedback.color" timeout="3000">
        {{ feedback.text }}
    </v-snackbar>
</v-container>
</template>

<script setup>
import FrontUserAvatar from '~/components/UserAvatar/FrontUserAvatar.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { usePostsStore } from '~/stores/posts'
import SocialLinks from './components/social-links.vue'
import PostAttachments from './components/PostAttachments.vue'
import { setPageMeta, sharePostUrl } from '~/utils/seo'
import { openAuthDialog } from '@/composables/Front/useAuthDialog'
const auth = useAuthStore()
const postsStore = usePostsStore()

const route = useRoute()
const post = ref({})
// fotos del post + imágenes del drive adjuntas; el resto de adjuntos va en la lista de descargas
const postFiles = computed(() => post.value.files ?? [])
const gallery = computed(() => [
    ...(post.value.photos ?? []),
    ...postFiles.value.filter((f) => f.kind === 'image').map((f) => ({ id: f.id, full_url: f.url })),
])
const attachments = computed(() => postFiles.value.filter((f) => f.kind !== 'image'))
// computed para que se actualicen cuando fetchUser termina o cambia la sesión
const user = computed(() => auth.user)
const isAuthenticated = computed(() => auth.isAuthenticated)
const loading = ref(false);
// URL actual del post
const currentUrl = window.location.origin + route.fullPath
const comment = ref('');

const feedback = ref({ show: false, text: '', color: 'success' })
const notify = (text, color = 'success') => {
    feedback.value = { show: true, text, color }
}
const errorText = (err, fallback) =>
    err?.response?.data?.message || fallback

const postComment = () => {
    loading.value = true
    postsStore.storeComment({comment: comment.value, postId: post.value.url})
    .then((res) => {
        // el backend los devuelve del más nuevo al más viejo
        post.value.comments.unshift(res.data)
        comment.value = ''
        notify('Comentario publicado')
    }).catch((err) => {
        if (err?.response?.status === 401) {
            openAuthDialog()
        } else {
            notify(errorText(err, 'No se pudo publicar el comentario'), 'error')
        }
    }).finally(() => {
        loading.value = false
    });
}

// editar y borrar: el autor o un Admin (el backend lo vuelve a comprobar con CommentPolicy)
const canManage = (item) => isAuthenticated.value && user.value
    && (item.user_id === user.value.id || (user.value.roles || []).includes('Admin'))

const editingId = ref(null)
const editingText = ref('')
const savingEdit = ref(false)
const deletingId = ref(null)

const startEdit = (item) => {
    editingId.value = item.id
    editingText.value = item.comment
}
const cancelEdit = () => {
    editingId.value = null
    editingText.value = ''
}
const saveEdit = (item) => {
    savingEdit.value = true
    postsStore.updateComment({ postId: post.value.url, commentId: item.id, comment: editingText.value })
    .then((res) => {
        Object.assign(item, res.data)
        cancelEdit()
        notify('Comentario actualizado')
    }).catch((err) => {
        notify(errorText(err, 'No se pudo actualizar el comentario'), 'error')
    }).finally(() => {
        savingEdit.value = false
    })
}
// confirmación con un diálogo propio: window.confirm no se muestra en algunos navegadores
// embebidos y se cancela solo, así que el borrado nunca se enviaba
const commentToDelete = ref(null)
const confirmDelete = computed({
    get: () => commentToDelete.value !== null,
    set: open => { if (!open) commentToDelete.value = null },
})
const removeComment = (item) => {
    commentToDelete.value = item
}
const deleteConfirmed = () => {
    const item = commentToDelete.value
    commentToDelete.value = null
    deletingId.value = item.id
    postsStore.deleteComment({ postId: post.value.url, commentId: item.id })
    .then(() => {
        post.value.comments = post.value.comments.filter(c => c.id !== item.id)
        notify('Comentario eliminado')
    }).catch((err) => {
        notify(errorText(err, 'No se pudo eliminar el comentario'), 'error')
    }).finally(() => {
        deletingId.value = null
    })
}

const userRating = ref(0)
const ratingsCount = computed(() => post.value.ratings_count || 0)
const ratingsAverage = computed(() => Number(post.value.ratings_avg_rating || 0).toFixed(1))

const setRating = (rating) => {
  if (!rating || rating === post.value.my_rating) return
  postsStore.storeRating({rating, postId: post.value.url})
  .then((res) => {
    Object.assign(post.value, res.data)
    notify('¡Gracias por puntuar!')
  }).catch((err) => {
    // vuelve a la puntuación que ya tenía (o a ninguna)
    userRating.value = post.value.my_rating || 0
    if (err?.response?.status === 401) {
        openAuthDialog()
    } else {
        notify(errorText(err, 'No se pudo guardar tu puntuación'), 'error')
    }
  });
}


onMounted(async () => {
  const { data } = await postsStore.viewPost(route.params.url)
  post.value = data
  userRating.value = data.my_rating || 0
  setPageMeta({
    title: data.title,
    description: data.excerpt || undefined,
    image: gallery.value[0]?.full_url,
    type: 'article',
  })
})
</script>
<style scoped>
.post-page {
    max-width: 860px;
}

.post-title {
    line-height: 1.15;
    overflow-wrap: anywhere;
}

/* tipografía del cuerpo (HTML del editor) */
.post-body {
    font-size: 1.1rem;
    line-height: 1.75;
    overflow-wrap: anywhere;
}

.post-body :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

.post-body :deep(h2),
.post-body :deep(h3) {
    margin: 1.5em 0 0.5em;
    line-height: 1.3;
}

.post-body :deep(p),
.post-body :deep(ul),
.post-body :deep(ol),
.post-body :deep(blockquote) {
    margin-bottom: 1em;
}

.post-body :deep(ul),
.post-body :deep(ol) {
    padding-left: 1.5em;
}

.post-body :deep(blockquote) {
    border-left: 4px solid rgb(var(--v-theme-primary));
    padding-left: 1em;
    opacity: 0.85;
}

.post-body :deep(pre) {
    overflow-x: auto;
    padding: 1em;
    border-radius: 8px;
    background: rgba(127, 127, 127, 0.12);
}

.post-body :deep(table) {
    border-collapse: collapse;
    width: 100%;
    display: block;
    overflow-x: auto;
}

.post-body :deep(td),
.post-body :deep(th) {
    border: 1px solid rgba(127, 127, 127, 0.3);
    padding: 6px 10px;
}

.comment-text {
    white-space: pre-line;
    overflow-wrap: anywhere;
}
</style>
