<template>
  <div :class="classObj" class="app-wrapper">
    <el-tooltip content="Cambiar de tema" placement="bottom">
      <el-button 
        circle 
        @click="toggleRadialTheme"
        class="theme-toggle"
      ><transition name="fade-icon" mode="out-in">
          <el-icon :key="isDark">
            <component :is="isDark ? Sunny : Moon" />
          </el-icon>
        </transition>
      </el-button>
    </el-tooltip>
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
import { computed, onMounted, ref } from 'vue';
import { mapState, useStore } from 'vuex'
import Settings from '../components/Settings/index.vue';
import { Moon, Sunny} from '@element-plus/icons-vue'
import { useRadialThemeToggle } from '~/composables/useRadialThemeToggle'
const { isDark, toggleRadialTheme } = useRadialThemeToggle()
const store = useStore();

const handleClickOutside = (() => {
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
</script>
<style lang="scss" scoped>
@use "@/styles/mixin.scss"  as *;
@use "@/styles/variables.scss";
.fade-icon-enter-active,
.fade-icon-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-icon-enter-from,
.fade-icon-leave-to {
  opacity: 0;
  transform: scale(0.6) rotate(-90deg);
}

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
.ep-aside,
.ep-header,
.ep-main {
  transition: background-color 0.4s ease-in-out, color 0.4s ease-in-out;
} 
</style> 