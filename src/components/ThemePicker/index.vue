<template>
    <el-color-picker
        v-model="theme"
        :predefine="['#409EFF', '#1890ff', '#304156','#212121','#11a983', '#13c2c2', '#6959CD', '#f5222d']"
        class="theme-picker"
        popper-class="theme-picker-dropdown"
    />
</template>
<script setup lang="ts">
// El color se aplica con variables CSS de Element Plus (useApplyPreferences); antes se descargaba
// el CSS de Element Plus desde unpkg y se reescribía, lo que no funcionaba con el namespace "ep".
import { computed } from 'vue';
import { useStore } from 'vuex'

const store = useStore();

const emit = defineEmits<{
    (e: 'change', val: string): void;
}>();

const theme = computed({
    get: () => store.state.settings.theme,
    set: (val: string | null) => {
        if (!val) return
        emit('change', val)
    },
})
</script>
<style>
    .theme-picker-dropdown {
      z-index: 99999 !important;
    }

    .theme-picker .ep-color-picker__trigger {
      height: 26px !important;
      width: 26px !important;
      padding: 2px;
      border: 1px solid #ddd;
    }

    .theme-picker-dropdown .ep-color-dropdown__link-btn {
      display: none;
    }
</style>
