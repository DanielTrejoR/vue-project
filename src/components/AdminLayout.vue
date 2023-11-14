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
