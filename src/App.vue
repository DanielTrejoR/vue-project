<template>
  <div id="app">
    <el-config-provider namespace="ep">
      <RouterView />
    </el-config-provider>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex';

const store = useStore();
const isClientAuth = sessionStorage.getItem('isAuthenticated')
onMounted(() => {
  if (isClientAuth) {
    store.dispatch('auth/fetchUser') // revalida con Sanctum
  }
})
</script>