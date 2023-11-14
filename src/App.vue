<template>
  <el-config-provider namespace="ep">
        <RouterView v-slot="{ Component, route }" >
          <!-- <Transition 
            enter-active-class="animate__animated animate__fadeIn"
            leave-active-class="animate__animated animate__fadeOut"
            > -->
              <component :is="Component" :key="route.path"></component>
            <!-- </Transition> -->
        </RouterView>
  </el-config-provider>
</template>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 3px);
}
</style>