<template>
  <div :class="classObj" class="navbar-root">
    
    <div v-if="device==='mobile'&& sidebar.opened" class="drawer-bg" @click="handleClickOutside" /> 
    <!-- <div :class="{hasTagsView:needTagsView}"> -->
    <el-container>
      <el-aside width="200px" class="app-wrapper">
        <Sidebar class="sidebar-container" />
      </el-aside>
      <el-container>
        <el-header class="app-wrapper"><Navbar /></el-header>
        <el-main><AppMain ></AppMain></el-main>
        <RightPanel v-if="showSettings">
          <Settings />
        </RightPanel> 
      </el-container>
    </el-container>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { mapState, useStore } from 'vuex'
import {AppMain, Settings, Navbar} from "./components"
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

onMounted(() => {
  console.log('Admin mounted')
  const el = document.querySelector('#navbar-root')
  if (el) el.style.border = '2px solid red'
})

onUnmounted(() => {
  console.log('Admin unmounted')
})
</script>
<style lang="scss" scoped>
@use "@/styles/mixin.scss"  as *;
@use "@/styles/variables.scss";

.app-wrapper :deep(.ep-switch) {
    --ep-switch-on-color: var(--ep-color-primary);
    --ep-switch-off-color: var(--ep-border-color);
}
.app-wrapper :deep(.dark-icon) {
    border-radius: 50%;
    color: #cfd3dc;
    background-color: #141414;
}

.app-wrapper :deep(.light-icon) {
    color: #606266;
}

.app-wrapper :deep(.ep-switch__core) {
    --ep-switch-on-color: var(--bg-color-mute);
    --ep-switch-off-color: var(--bg-color-mute);
    --ep-switch-border-color: var(--border-color);
}

.app-wrapper :deep(.ep-header),
.app-wrapper :deep(.ep-aside) {
  transition: none !important;
}

.app-wrapper :deep(.ep-switch__core .ep-switch__action) {
    width: 14px;
    height: 14px;
}

.fade-icon-enter-active,
.fade-icon-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-icon-enter-from,
.fade-icon-leave-to {
  opacity: 0;
  transform: scale(0.6) rotate(-90deg);
}

</style> 