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
                <RouterLink :to="{name: 'Login'}">
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
                <template v-slot:prepend>
                    <v-avatar
                        color="grey-darken-3"
                        :image="comment.user.avatar"
                    ></v-avatar>
                    <v-card-subtitle class="pl-4">{{ comment.user.name }}</v-card-subtitle>
                </template>
                    <v-card-text class="py-2 d-flex flex-column mb-6">
                        {{ comment.comment }}
                    </v-card-text>
            </v-card>
        </div>
        <div v-else>
            <v-card-title>Esta publicacion no tiene comentarios...</v-card-title>
        </div>
    </v-card>
</v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { mapState, useStore } from 'vuex'
import SocialLinks from './components/social-links.vue'
const store = useStore();

const route = useRoute()
const post = ref({})
const user = store.getters['user'] 
const isAuthenticated = store.getters['isAuthenticated'] 
const loading = ref(false);
// URL actual del post
const currentUrl = window.location.origin + route.fullPath
const comment = ref('');
// Descripción opcional
const description = 'Mira este post interesante'

const facebookShareUrl = computed(() =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&t=${encodeURIComponent(description)}`
)

const postComment = () => {
    loading.value = true
    store.dispatch('posts/storeComment', {comment: comment.value, postId: post.value.url})
    .then((res) => {
        post.value.comments.push(res.data)
        loading.value = false
        comment = ref('');

    }).catch((err) => {
        loading.value = false
        
    });
    
}

onMounted(async () => {
  const { data } = await store.dispatch('posts/viewPost', route.params.url)
  post.value = data
})
</script>