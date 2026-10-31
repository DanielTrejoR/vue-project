<template>
    <div>
        <h2>COmpnents</h2>
        {{ userName }} - useername
    </div>
</template>
<script setup lang="ts">
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'about' })
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const userName = computed(() => auth.user?.name);

</script>