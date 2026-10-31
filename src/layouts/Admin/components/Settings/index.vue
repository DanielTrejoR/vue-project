<template>
    <div class="drawer-container">
    <div>
      <h3 class="drawer-title">Configuración</h3>

      <div class="drawer-item">
        <span>Color principal</span>
        <ThemePicker class="drawer-switch" @change="value => change('theme', value)" />
      </div>

      <div class="drawer-item">
        <span>Modo oscuro</span>
        <el-switch :model-value="settings.dark" class="drawer-switch" @change="value => change('dark', value)" />
      </div>

      <div class="drawer-item">
        <span>Menú lateral colapsado</span>
        <el-switch
          :model-value="settings.sidebarCollapsed"
          :disabled="isMobile"
          class="drawer-switch"
          @change="value => change('sidebarCollapsed', value)"
        />
      </div>

      <div class="drawer-item">
        <span>Header fijo</span>
        <el-switch :model-value="settings.fixedHeader" class="drawer-switch" @change="value => change('fixedHeader', value)" />
      </div>

      <div class="drawer-item">
        <span>Logo en el menú</span>
        <el-switch :model-value="settings.sidebarLogo" class="drawer-switch" @change="value => change('sidebarLogo', value)" />
      </div>

      <p class="drawer-note">{{ syncText }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
    name: 'Settings'
});

import { computed } from 'vue';
import { useStore } from 'vuex'
const store = useStore();

const settings = computed(() => store.state.settings)
const isMobile = computed(() => store.state.app.device === 'mobile')

// cada cambio se aplica al momento y se guarda en el navegador y, con sesión, en la cuenta
const change = (key: string, value: unknown) => {
  store.dispatch('settings/changeSetting', { key, value })
}

const syncText = computed(() => {
  if (!store.getters.isAuthenticated) return 'Guardado en este navegador.'
  return {
    saving: 'Guardando en tu cuenta…',
    error: 'No se pudo guardar en tu cuenta; se mantiene en este navegador.',
  }[settings.value.syncStatus as string] || 'Guardado en tu cuenta: se aplica al iniciar sesión.'
})
</script>
<style lang="scss" scoped>
.drawer-container {
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;

  .drawer-title {
    margin-bottom: 12px;
    color: var(--ep-text-color-primary);
    font-size: 16px;
    line-height: 22px;
  }

  .drawer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--ep-text-color-regular);
    font-size: 14px;
    padding: 12px 0;
  }

  .drawer-note {
    margin-top: 16px;
    color: var(--ep-text-color-secondary);
    font-size: 12px;
  }
}
</style>
