<template>
  <div :class="classObj" class="navbar-root admin-layout">
    <el-container class="admin-shell">
      <!-- escritorio: menú fijo a la izquierda (ancho según la preferencia de colapsado) -->
      <el-aside v-if="!isMobile" :width="collapsed ? '64px' : '210px'" class="app-wrapper admin-aside">
        <Sidebar />
      </el-aside>
      <!-- móvil: el mismo menú en un drawer que abre el botón del header -->
      <el-drawer
        v-else
        v-model="mobileSidebar"
        direction="ltr"
        size="260px"
        :with-header="false"
        class="admin-mobile-menu"
      >
        <Sidebar />
      </el-drawer>
      <el-container class="admin-content">
        <el-header class="app-wrapper admin-header" :class="{ 'is-fixed': fixedHeader }"><Navbar /></el-header>
        <el-main class="admin-main"><AppMain ></AppMain></el-main>
        <RightPanel v-if="showSettings">
          <Settings />
        </RightPanel> 
      </el-container>
    </el-container>
  </div>
</template>
<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import {AppMain, Settings, Navbar} from "./components"
const store = useStore();
const route = useRoute();

// por debajo de 992px el menú pasa a drawer
const desktopQuery = window.matchMedia('(min-width: 992px)')
const updateDevice = () => store.dispatch('app/toggleDevice', desktopQuery.matches ? 'desktop' : 'mobile')
updateDevice()
desktopQuery.addEventListener('change', updateDevice)
onBeforeUnmount(() => desktopQuery.removeEventListener('change', updateDevice))

const isMobile = computed(() => store.state.app.device === 'mobile');
const collapsed = computed(() => store.state.settings.sidebarCollapsed);
const showSettings = computed(() => store.state.settings.showSettings);
const fixedHeader = computed(() => store.state.settings.fixedHeader);

const mobileSidebar = computed({
  get: () => store.state.app.mobileSidebar,
  set: open => store.dispatch('app/setMobileSidebar', open),
});

// al elegir una sección desde el drawer, se cierra
watch(() => route.fullPath, () => {
  if (isMobile.value) mobileSidebar.value = false
})

const classObj = computed(() => ({
  hideSidebar: collapsed.value,
  openSidebar: !collapsed.value,
  mobile: isMobile.value
}));

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

.admin-shell {
  min-height: 100vh;
}

.admin-aside {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  border-right: 1px solid var(--ep-border-color-light);
  background: var(--ep-bg-color);
  transition: width 0.25s ease;
}

.admin-content {
  min-width: 0;
}

.admin-header {
  height: auto;
  padding: 0;
  background: var(--ep-bg-color);

  &.is-fixed {
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: var(--ep-box-shadow-lighter);
  }
}

.admin-main {
  min-width: 0;
  overflow-x: hidden;
}

@media (max-width: 767px) {
  .admin-main {
    padding: 12px;
  }
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