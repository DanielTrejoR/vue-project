<template>
    <Paginator :url="`/categories/${route.params.category}`" 
        component-name="PostList"></Paginator>   
</template>
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const props = defineProps({
    // category: {
    //     type: String,
    //     required: true,
    // }
})
</script>
