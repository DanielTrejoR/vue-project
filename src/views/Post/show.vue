<template>
<v-container>
    <v-card>
        <v-card-subtitle><PostHeader :post="post" /></v-card-subtitle>
        <v-card-text >
            <div v-if="post.photos && post.photos.length > 0">
                <img v-if="post.photos?.length < 2" :src="post.photos[0].full_url" class="mb-4" />
                <CarouselComponent v-else-if="post.photos.length > 1" :photos="post.photos" />
            </div>
            <div v-html="post.body"></div>
            <!-- Iframe embebido -->
             <div v-if="post.iframe" class="mt-4">
                <div v-html="post.iframe"></div>
            </div>
            <div v-if="post.title">
                <SocialLinks :title="post.title" :current-url="currentUrl" />
            </div>
            <v-card-actions class="">
                <div class="float-end" v-if="post.tags && post.tags.length > 0">
                    <TagLink :tags="post.tags" />
                </div>
            </v-card-actions>
        </v-card-text>
    </v-card>
    <div class="d-flex align-end flex-column">
        <span class="pb-2 mt-2">
            {{ userRating ? 'Tu puntuación' : 'Puntua este post' }}
        </span>
        <!-- sin medias estrellas: el backend solo acepta enteros del 1 al 5 -->
        <v-rating
            v-model="userRating"
            hover
            :length="5"
            :size="32"
            active-color="primary"
            @update:model-value="setRating"
        />
        <span class="text-caption" v-if="ratingsCount">
            Promedio {{ ratingsAverage }} / 5 · {{ ratingsCount }} {{ ratingsCount === 1 ? 'voto' : 'votos' }}
        </span>
        <span class="text-caption" v-else>Aún nadie lo ha puntuado</span>
    </div>
    <h2 class="pt-5 mt-5">Deja tu comentario</h2>
    <v-card v-if="user">
        <div v-if="user.is_active && isAuthenticated">
            <v-card-title>Caja de comentarios</v-card-title>
            <v-card-text>
                <div class="d-flex flex-column">
                    <v-textarea v-model="comment" bg-color="background" color="secondary" clearable label="Comentario"></v-textarea>
                </div>
            </v-card-text>
            <v-card-actions class="float-end">
                <v-btn append-icon="$vuetify" class="float-end" @click="postComment" :loading="loading">
                    Enviar
                </v-btn>
            </v-card-actions>
        </div>
    </v-card>
    <v-card v-else>
        <v-card-title>Inicia sesion/Registrate para dejar un comentario </v-card-title>
        <v-card-text>
            <div class="d-flex justify-space-evenly pt-3 mt-5">
                <RouterLink :to="{name: 'Login'}">
                    <v-btn prepend-icon="mdi mdi-login" color="secondary" variant="tonal">
                        Iniciar sesion
                    </v-btn>
                </RouterLink>
                <RouterLink :to="{name: 'Register'}">
                    <v-btn prepend-icon="fa fa-plus" color="secondary" variant="tonal">
                        Registrarse
                    </v-btn>
                </RouterLink>
            </div>
        </v-card-text>
    </v-card>
    <v-card class="pt-3 mt-5 mt-lg-5">
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
                    <v-avatar
                        color="grey-darken-3"
                        :image="item.user.avatar"
                    ></v-avatar>
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
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { usePostsStore } from '~/stores/posts'
import SocialLinks from './components/social-links.vue'
import { openAuthDialog } from '@/composables/Front/useAuthDialog'
const auth = useAuthStore()
const postsStore = usePostsStore()

const route = useRoute()
const post = ref({})
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
})
</script>
<style scoped>
.comment-text {
    white-space: pre-line;
    overflow-wrap: anywhere;
}
</style>
