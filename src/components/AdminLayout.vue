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
import { useStore } from "vuex";
import { computed } from "vue";
import { useRouter } from "vue-router";
export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    store.dispatch("getUser");
  }
}
</script>