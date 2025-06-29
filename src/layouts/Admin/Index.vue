<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&& sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <!-- <sidebar class="sidebar-container" /> -->
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <!-- <navbar />
        <tags-view v-if="needTagsView" /> -->
      </div>
      <!-- <app-main /> -->
      <RightPanel v-if="showSettings">
        <Settings />
      </RightPanel>
      <!-- <right-panel v-if="showSettings">
        <settings />
      </right-panel> -->
    </div>
  </div>
  <!-- <div>
    <el-container class="flex main-container">
        <BaseSide />
      <el-container class="">
        <el-header><BaseHeader /></el-header>
        <el-main :style="mainStyle">
          <RouterView v-slot="{ Component, route }" >
            <KeepAlive>
                <component :is="Component" :key="route.path"></component>
            </KeepAlive>
          </RouterView>
        </el-main>
      </el-container>
    </el-container>
  </div> -->
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { mapState, useStore } from 'vuex'
import Settings from '../components/Settings/index.vue';
const store = useStore();
const handleClickOutside = (() => {
  console.log('clikeo')
  store.dispatch('app/closeSidebar', {withOutAnimation: false})
})

const sidebar = computed(() => store.state.app.sidebar);
const device = computed(() => store.state.app.device);
const showSettings = computed(() => store.state.settings.showSettings);
const needTagsView = computed(() => store.state.settings.tagsView);
const fixedHeader = computed(() => store.state.settings.fixedHeader);

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}));
// import { computed, ref, inject, onMounted } from 'vue';
// import { useRouter } from 'vue-router';
// import store from '~/store';

// const router = useRouter();
// const emitter = inject('emitter');

// const isCollapseAside = ref(false);

// const mainStyle = computed(() => ({
//   marginRight: isCollapseAside.value ? '64px' : '200px',
//   transition: 'margin-right 0.3s ease'
// }));

// emitter.on('collapseAside', ({ collapse }) => {
//   isCollapseAside.value = collapse;
// })

// onMounted(async () => {
  
// });
</script>

<style lang="scss" scoped>
@use "@/styles/mixin.scss"  as *;
@use "@/styles/variables.scss";

.app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{variables.$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
/* .ep-aside,
.ep-header,
.ep-main {
  transition: background-color 0.4s ease-in-out, color 0.4s ease-in-out;
} */
</style> 