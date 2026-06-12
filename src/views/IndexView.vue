<template>
<div>

</div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { mapState, useStore } from 'vuex'

const store = useStore();
const device = computed(() => store.state.app.device);

const drawer = ref(false)
</script>
