<template>
    <div>
        <h2>COmpnents</h2>
        {{ userName }} - useername
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
console.log(store.getters, 'dasdasdasds')
const userName = computed(() => store.getters['user/name']);

</script>