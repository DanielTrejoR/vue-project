<template>
    <Paginator :url="`/tags/${props.tag}`" 
        component-name="PostList"></Paginator>   
</template>
<script setup>

const props = defineProps({
    tag: {
        type: String,
        required: true,
    }
})
</script>