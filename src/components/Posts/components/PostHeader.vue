<template>
	<!-- en móvil fecha, título y categoría van apilados; desde sm en una fila -->
	<v-row
        align="start"
        no-gutters
        class="post-header"
    >
        <v-col cols="12" sm="3" order="1">
            <v-card-subtitle class="pt-4 px-0 px-sm-4 d-flex justify-start" v-if="post.owner">
                {{ post.published_date }} / {{ post.owner.name }}
            </v-card-subtitle>
        </v-col>
        <v-col cols="12" sm="6" order="3" order-sm="2">
            <h1 class="pt-2 pt-sm-3 pb-3 text-h5 text-sm-h4 post-header__title" v-text="post.title"></h1>
        </v-col>
        
        <v-col cols="12" sm="3" order="2" order-sm="3" class="d-flex justify-start justify-sm-end pt-2 pt-sm-3" v-if="post.category">
            <CategoryLink :category="post.category" />
        </v-col>
        
        <v-col cols="12">
            <v-divider class="pt-1 border-opacity-50"></v-divider>
        </v-col>
	</v-row>
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
<style scoped>
.post-header__title {
    overflow-wrap: anywhere;
    white-space: normal;
}
</style>
