<script setup lang="ts">

</script>

<template>
  <div>
    <BaseHeader />
    <div class="flex main-container">
      <BaseSide />
      <el-main>
        <RouterView v-slot="{ Component, route }" >
          <component :is="Component" :key="route.path"></component>
        </RouterView>
      </el-main>
    </div>
  </div>
</template>
<script>
import store from '~/store';
import { computed } from "vue";
import { useRouter } from "vue-router";
export default {
  setup() {
    const router = useRouter();

    try {
    store.dispatch('base/fetchUserData').then(() => {
      console.log('geting user data');
      
      store.commit('base/setAuthenticated', true);
      
    }).catch(() => {
      store.commit('base/setAuthenticated', false);
      
    });
  } catch (error) {
      store.commit('base/setAuthenticated', false);
  }
  }
}
</script>