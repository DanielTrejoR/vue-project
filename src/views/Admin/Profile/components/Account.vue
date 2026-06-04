<template>
  <el-form>
    <el-form-item label="Name">
      <el-input v-model.trim="user.name" />
    </el-form-item>
    <el-form-item label="Email">
      <el-input v-model.trim="user.email" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :color="theme" @click="submit">Update</el-button>
    </el-form-item>
  </el-form>
</template>
<script setup>
import { ref, defineProps, computed } from 'vue';
import { useTheme } from '@/composables/useTheme'
const { theme } = useTheme()
const props = defineProps({
    user: {
        type: Object,
        required: true
    },
})

const submit = () => {
      ElMessage({
        message: 'User information has been updated successfully',
        type: 'success',
        duration: 5 * 1000
      })
    }
</script>
