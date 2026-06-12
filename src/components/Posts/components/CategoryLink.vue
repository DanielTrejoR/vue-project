<template>
	<!-- <RouterLink 
    :to="{name: 'category_posts', params: {category: category.url }}"
    > -->
        
		<v-chip v-if="props.category"
		class="ma-2"
		color="pink"
		>
		#{{ props.category.name }}
		</v-chip>
	<!-- </RouterLink> -->
</template>
<script setup>
import { defineProps } from 'vue'

// Definición de props con Composition API
const props = defineProps({
    category: {
        type: Object,
        required: true
    }
})
</script>
