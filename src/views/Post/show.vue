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
            Puntua este post
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
        <div v-if="post.comments">
            <v-card-title>Comentarios <span v-if="post.comments">({{post.comments.length}})</span>:</v-card-title>
            <v-card
                v-for="comment in post.comments" :key="comment.id"
                :loading="loading" variant="tonal" class="mt-5">
                <template v-slot:append>
                    {{ comment.created_at }}
                </template>
                <template v-slot:prepend>
                    <v-avatar
                        color="grey-darken-3"
                        :image="comment.user.avatar"
                    ></v-avatar>
                    <v-card-subtitle class="pl-4">{{ comment.user.name }}</v-card-subtitle>
                    
                </template>
                    <v-card-text class="py-2 d-flex flex-column mb-6 float-left ml-15">
                        {{ comment.comment }}
                    </v-card-text>
            </v-card>
        </div>
        <div v-else>
            <v-card-title>Esta publicacion no tiene comentarios...</v-card-title>
        </div>
    </v-card>
    <v-snackbar v-model="feedback.show" :color="feedback.color" timeout="3000">
        {{ feedback.text }}
    </v-snackbar>
</v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import SocialLinks from './components/social-links.vue'
import { openAuthDialog } from '@/composables/Front/useAuthDialog'
const store = useStore();

const route = useRoute()
const post = ref({})
// computed para que se actualicen cuando fetchUser termina o cambia la sesión
const user = computed(() => store.getters['user'])
const isAuthenticated = computed(() => store.getters['isAuthenticated'])
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
    store.dispatch('posts/storeComment', {comment: comment.value, postId: post.value.url})
    .then((res) => {
        post.value.comments.push(res.data)
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

const userRating = ref(0)

const setRating = (rating) => {
  if (!rating) return
  store.dispatch('posts/storeRating', {rating, postId: post.value.url})
  .then(() => {
    notify('¡Gracias por puntuar!')
  }).catch((err) => {
    userRating.value = 0
    if (err?.response?.status === 401) {
        openAuthDialog()
    } else {
        notify(errorText(err, 'No se pudo guardar tu puntuación'), 'error')
    }
  });
}


onMounted(async () => {
  const { data } = await store.dispatch('posts/viewPost', route.params.url)
  post.value = data
})
</script>