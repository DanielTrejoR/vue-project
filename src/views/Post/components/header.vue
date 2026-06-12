<template>
    <div>
        <div v-if="props.post.owner">
            {{ props.post.created_at }} / {{ props.post.owner.name }}
        </div>
        <div class="float-end" v-if="props.post.category">
            <div class="text-capitalize">
                
                <v-chip color="orange" variant="elevated">
                    {{ props.post.category.name }}
                </v-chip>
            </div>

        </div>
    </div>
</template>
<script setup>
import { defineProps } from 'vue'

// Definición de props con Composition API
const props = defineProps({
    post: {
        type: Object,
        required: true
    }
})
</script>