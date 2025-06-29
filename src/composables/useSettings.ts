// ~/composables/useSettings.ts
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export function useSettings() {
  const store = useStore();

  const getThemeColor = () =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-color')
      .trim() || '#1890ff';

  const theme = ref(getThemeColor());

  const changeTheme = (color: string) => {
    document.documentElement.style.setProperty('--theme-color', color);
    theme.value = color;
  };

  const setting = (key: string) => computed(() => store.state.settings?.[key]);

  const updateSetting = (key: string, value: any) => {
    store.dispatch('settings/changeSetting', { key, value });
  };

  return {
    theme,
    changeTheme,
    showSettings: setting('showSettings'),
    tagsView: setting('tagsView'),
    fixedHeader: setting('fixedHeader'),
    sidebarLogo: setting('sidebarLogo'),
    updateSetting
  };
}

// <script setup lang="ts">
// import { useSettings } from '~/composables/useSettings';

// const {
//   theme,
//   changeTheme,
//   showSettings,
//   tagsView,
//   updateSetting
// } = useSettings();
// </script>

// <template>
//   <div>
//     <p>Color actual del tema: <span :style="{ color: theme }">{{ theme }}</span></p>
//     <el-button @click="changeTheme('#e91e63')">Cambiar a Rosa</el-button>
//     <el-switch v-model="tagsView" @change="val => updateSetting('tagsView', val)" />
//   </div>
// </template>