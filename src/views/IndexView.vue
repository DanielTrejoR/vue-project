<template>
    <div>
        <PostsLists />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useAppStore } from '~/stores/app'
import PostsLists from './Post/index.vue'
const appStore = useAppStore()
const device = computed(() => appStore.device);

const drawer = ref(false)
</script>
