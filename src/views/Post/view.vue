<template>
<v-container>
    <v-card>
        <v-card-subtitle><PostHeader :post="post" /></v-card-subtitle>
        <v-card-text >
            <div v-if="post.photos">
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
                <div class="float-end" v-if="post.tags">
                    <TagLink :tags="post.tags" />
                </div>
            </v-card-actions>
        </v-card-text>
    </v-card>
    <h2>Deja tu comentario</h2>
    <v-card>
        <v-card-title>Caja de comentarios</v-card-title>
    </v-card>
</v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { mapState, useStore } from 'vuex'
import Tags from './components/tags.vue'
import Header from './components/header.vue'
import SocialLinks from './components/social-links.vue'
const store = useStore();

const route = useRoute()
const post = ref({})

// URL actual del post
const currentUrl = window.location.origin + route.fullPath

// Descripción opcional
const description = 'Mira este post interesante'

const facebookShareUrl = computed(() =>
  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&t=${encodeURIComponent(description)}`
)

onMounted(async () => {
  const { data } = await store.dispatch('posts/viewPost', route.params.url)
  post.value = data
})
</script>