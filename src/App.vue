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
import { useApplyPreferences } from '~/composables/useApplyPreferences'

const store = useStore();
useApplyPreferences()
const isClientAuth = sessionStorage.getItem('isAuthenticated') === 'true'
onMounted(() => {
  if (isClientAuth) {
    store.dispatch('auth/fetchUser') // revalida con Sanctum
  }
})
</script>

<style>
html {
  view-transition-name: root;
}

</style>