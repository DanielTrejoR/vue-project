<template>
    <v-card class="post-card h-100 d-flex flex-column" :to="{ name: 'ViewPost', params: { url: post.url } }" hover>
        <!-- portada: la primera foto del post; sin fotos, un bloque con la inicial del título -->
        <v-img
            v-if="cover"
            :src="cover"
            aspect-ratio="16/9"
            cover
            class="post-card__cover"
        />
        <div v-else class="post-card__cover post-card__cover--empty bg-primary">
            <span>{{ post.title?.charAt(0) }}</span>
        </div>

        <v-card-item>
            <div class="d-flex flex-wrap align-center ga-2 mb-2">
                <CategoryLink v-if="post.category" :category="post.category" size="small" />
                <span class="text-caption text-medium-emphasis">
                    {{ post.published_date }}<template v-if="post.owner"> · {{ post.owner.name }}</template>
                </span>
            </div>
            <v-card-title class="post-card__title px-0">{{ post.title }}</v-card-title>
        </v-card-item>

        <v-card-text class="flex-grow-1">
            <p class="post-card__excerpt">{{ post.excerpt || 'Sin resumen' }}</p>
            <TagLink v-if="post.tags?.length" :tags="post.tags" size="x-small" class="mt-3" />
        </v-card-text>

        <v-card-actions class="px-4 pb-3 text-medium-emphasis text-caption">
            <span class="d-flex align-center ga-1" :title="`${post.comments_count || 0} comentarios`">
                <v-icon icon="mdi mdi-comment-outline" size="16" />{{ post.comments_count || 0 }}
            </span>
            <span v-if="rating" class="d-flex align-center ga-1 ml-3" :title="`Promedio ${rating} de 5`">
                <v-icon icon="mdi mdi-star" size="16" color="amber" />{{ rating }}
            </span>
            <v-spacer />
            <span class="text-primary font-weight-medium">Leer más</span>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { computed } from 'vue'
import CategoryLink from './CategoryLink.vue'
import TagLink from './TagLink.vue'

const props = defineProps({
    // un post de los listados públicos (incluye category, tags, owner, photos y conteos)
    post: { type: Object, required: true },
})

const cover = computed(() => props.post.photos?.[0]?.full_url)
const rating = computed(() => {
    const value = Number(props.post.ratings_avg_rating)
    return value ? value.toFixed(1) : null
})
</script>

<style scoped>
.post-card__cover {
    aspect-ratio: 16 / 9;
    flex: none;
}

.post-card__cover--empty {
    display: grid;
    place-items: center;
    font-size: 3rem;
    font-weight: 700;
    opacity: 0.85;
}

.post-card__title {
    white-space: normal;
    line-height: 1.3;
    overflow-wrap: anywhere;
}

/* tres líneas como máximo para que las tarjetas tengan alturas parecidas */
.post-card__excerpt {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
