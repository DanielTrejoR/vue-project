<template>
    <!-- @click.stop: dentro de una tarjeta que ya es enlace, el chip lleva a la categoría y no al post -->
    <v-chip
        v-if="category"
        :to="{ name: 'CategoryPosts', params: { category: category.url } }"
        color="primary"
        variant="tonal"
        :size="size"
        prepend-icon="mdi mdi-folder-outline"
        @click.stop
    >
        {{ category.name }}
    </v-chip>
</template>
<script setup>
defineProps({
    category: {
        type: Object,
        required: true
    },
    size: {
        type: String,
        default: 'default'
    }
})
</script>
