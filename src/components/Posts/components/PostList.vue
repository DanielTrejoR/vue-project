<template>
    <v-row>
        <!-- mientras carga: esqueletos con la forma de las tarjetas -->
        <template v-if="loading && !items.length">
            <v-col v-for="n in skeletons" :key="`skeleton-${n}`" cols="12" sm="6" lg="4">
                <v-skeleton-loader type="image, article, actions" />
            </v-col>
        </template>

        <v-col v-for="post in items" :key="post.id" cols="12" sm="6" lg="4">
            <PostCard :post="post" />
        </v-col>

        <v-col v-if="!loading && !items.length" cols="12">
            <v-empty-state
                icon="mdi mdi-text-box-search-outline"
                :title="emptyTitle"
                :text="emptyText"
            />
        </v-col>
    </v-row>
</template>

<script setup>
import PostCard from './PostCard.vue'

defineProps({
    items: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    skeletons: { type: Number, default: 3 },
    emptyTitle: { type: String, default: 'Todavía no hay publicaciones' },
    emptyText: { type: String, default: '' },
})
</script>
