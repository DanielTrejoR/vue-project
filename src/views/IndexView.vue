<template>
    <div>
        <PostsLists />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { mapState, useStore } from 'vuex'
import PostsLists from './Post/index.vue'
const store = useStore();
const device = computed(() => store.state.app.device);

const drawer = ref(false)
</script>
