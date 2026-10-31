<template>
    <div class="d-flex flex-wrap ga-2">
        <!-- @click.stop: dentro de una tarjeta que ya es enlace, el chip lleva a la etiqueta y no al post -->
        <v-chip
            v-for="tag in tags"
            :key="tag.id"
            :to="{ name: 'TagsPosts', params: { tag: tag.url } }"
            variant="outlined"
            :size="size"
            label
            @click.stop
        >
            #{{ tag.name }}
        </v-chip>
    </div>
</template>
<script setup>
defineProps({
    tags: {
        type: Array,
        required: true
    },
    size: {
        type: String,
        default: 'small'
    }
})
</script>
