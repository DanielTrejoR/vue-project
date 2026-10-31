<template>
  <!-- si la foto no carga, el-avatar muestra el slot -->
  <el-avatar :size="size" :src="src || defaultAvatar" :alt="name">
    <img :src="defaultAvatar" alt="" />
  </el-avatar>
</template>

<script setup lang="ts">
import defaultAvatar from '~/assets/default-avatar.svg'

// avatar del panel (Element Plus): sin foto o con la foto rota muestra el genérico
withDefaults(defineProps<{
  src?: string | null
  name?: string
  size?: number | 'large' | 'default' | 'small'
}>(), { size: 'default' })
</script>
