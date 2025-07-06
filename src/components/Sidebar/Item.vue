<template>
  <span class="item-wrapper">
    <el-icon v-if="isElementIcon">
      <component :is="props.icon" class="sub-el-icon" />
    </el-icon>
    <SvgIcon v-else :iconClass="props.icon || ''" class="sub-el-icon" />
    <span v-if="props.title" class="item-title">{{ props.title }}</span>
  </span>
</template>

<script setup lang="ts">
import SvgIcon from '~/components/SvgIcon/index.vue'
import { computed } from 'vue'
import * as ElementIcons from '@element-plus/icons-vue'
interface Props {
  icon?: string
  title?: string
}

const props = defineProps<Props>()

// Detecta si el icono es un componente de Element Plus
const isElementIcon = computed(() => {
   return Boolean(ElementIcons[props.icon as keyof typeof ElementIcons])
})
</script>


<style scoped lang="scss">
.item-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
  font-size: 16px;
}

.item-title {
  font-weight: 500;
  font-size: 14px;
}
</style>
