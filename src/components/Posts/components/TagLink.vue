<template>
    <v-chip
    v-for="tag in props.tags"
    :key="tag.id"
        class="ma-2"
        color="pink"
        label
    >
        <v-icon icon="mdi mdi-label" start></v-icon>
        {{ tag.name }}
    </v-chip>
</template>
<script setup>
import { defineProps } from 'vue'

// Definición de props con Composition API
const props = defineProps({
    tags: {
        type: Array,
        required: true
    }
})
</script>