<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="flex main-container">
      <BaseSide />
      <el-main>
          <RouterView :key="$route.path" v-slot="{ Component }" >
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
      </el-main>
    </div>
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

 /* fade-transform */
.fade-transform-leave-active,
.fade-transform-enter-active {
    transition: all .5s;
  }
  
.fade-transform-enter {
    opacity: 0;
    transform: translateX(-30px);
}
  
.fade-transform-leave-to {
    opacity: 0;
    transform: translateX(30);
}
</style>
