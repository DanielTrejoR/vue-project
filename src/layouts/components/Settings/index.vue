<template>
    <div class="drawer-container">
    <div>
      <h3 class="drawer-title">Page style setting</h3>

      <div class="drawer-item">
        <span>Theme Color</span>
        <ThemePicker style="float: right;height: 26px;margin: -3px 8px 0 0;" @change="themeChange" />
      </div>

      <div class="drawer-item">
        <span>Open Tags-View</span>
        <!-- <el-switch v-model="tagsView" class="drawer-switch" /> -->
      </div>

      <div class="drawer-item">
        <span>Fixed Header</span>
        <el-switch v-model="fixedHeader" class="drawer-switch" />
      </div>

      <div class="drawer-item">
        <span>Sidebar Logo</span>
        <el-switch v-model="sidebarLogo" class="drawer-switch" />
      </div>
      <div class="drawer-item">
        <span>Dark mode</span>
        <el-switch
            class="darker-switch drawer-switch"
            v-model="isDark"
            :active-action-icon="Moon"
            :inactive-action-icon="Sunny"
            style="--ep-switch-on-color: #2C2C2C; --ep-switch-off-color: #F2F2F2"
        />
      </div>

    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
    name: 'Settings'
});
import { isDark } from "~/composables";
import { Sunny, Moon } from '@element-plus/icons-vue'
import { ref, computed } from 'vue';
import { mapState, useStore } from 'vuex'
const store = useStore();

const fixedHeader = computed({
  get() {
    return store.state.settings.fixedHeader
  },
  set(val: string) {
    return store.dispatch('settings/changeSetting', {
            key: 'fixedHeader',
            value: val
        })
  }
});

const sidebarLogo = computed({
    get() {
    return store.state.settings.sidebarLogo
    },
    set(val) {
    store.dispatch('settings/changeSetting', {
        key: 'sidebarLogo',
        value: val
    })
    }
})

function themeChange(val:string) {
    store.dispatch('settings/changeSetting', {
        key: 'theme',
        value: val
      })
}
</script>
<style lang="scss" scoped>
.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: rgba(0, 0, 0, .85);
    font-size: 14px;
    line-height: 22px;
  }

  .drawer-item {
    color: rgba(0, 0, 0, .65);
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-switch {
    float: right
  }
}

:deep(.darker-switch.ep-switch.is-checked .ep-switch__core .ep-switch__action) {
    left: calc(100% - 17px);
    border-radius: 50%;
    color: #cfd3dc !important;
    background-color: #141414 !important;
}
:deep(.darker-switch.ep-switch .ep-switch__core .ep-switch__action) {
    
    color: #606266;
}
</style>
