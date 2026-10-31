<template>
  <div id="app">
    <el-config-provider namespace="ep">
      <RouterView />
    </el-config-provider>
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApplyPreferences } from '~/composables/useApplyPreferences'

const auth = useAuthStore()
useApplyPreferences()
onMounted(() => {
  if (auth.isAuthenticated) {
    // revalida con Sanctum; si la sesión venció, el interceptor de axios la marca como cerrada
    auth.fetchUser().catch(() => {})
  }
})
</script>

<style>
html {
  view-transition-name: root;
}

</style>