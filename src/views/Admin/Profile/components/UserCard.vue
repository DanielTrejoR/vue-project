<template>
  <el-card shadow="never" class="user-card">
    <div class="user-card__header">
      <el-avatar :size="96" :src="user.avatar">{{ user.name?.charAt(0) }}</el-avatar>
      <h2 class="user-card__name">{{ user.name }}</h2>
      <div class="user-card__email">{{ user.email }}</div>
      <div v-if="user.roles?.length" class="user-card__roles">
        <el-tag v-for="role in user.roles" :key="role" type="success" effect="plain" round>{{ role }}</el-tag>
      </div>
    </div>

    <el-divider />

    <ul class="user-card__facts">
      <li v-if="user.created_at">
        <el-icon><Calendar /></el-icon>
        <span>Miembro desde {{ memberSince }}</span>
      </li>
      <li>
        <el-icon><Key /></el-icon>
        <!-- Admin no tiene permisos asignados uno a uno: pasa todas las comprobaciones (Gate::before) -->
        <span v-if="user.roles?.includes('Admin')">Acceso total al panel</span>
        <span v-else>{{ user.permissions?.length || 0 }} {{ user.permissions?.length === 1 ? 'permiso' : 'permisos' }}</span>
      </li>
    </ul>

    <div class="user-card__links">
      <el-button text icon="House" @click="router.push({ name: 'UserPosts' })">Mi espacio en el blog</el-button>
      <el-button text icon="Edit" @click="router.replace({ query: { tab: 'account' } })">Editar cuenta</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Calendar, Key } from '@element-plus/icons-vue'

const props = defineProps<{
  // usuario con sesión (User::authPayload en el backend)
  user: Record<string, any>
}>()

const router = useRouter()
const memberSince = computed(() => dayjs(props.user.created_at).locale('es').format('MMMM [de] YYYY'))
</script>

<style scoped>
.user-card {
  margin-bottom: 20px;
}

.user-card__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.user-card__name {
  margin: 8px 0 0;
  font-size: 1.25rem;
}

.user-card__email {
  color: var(--ep-text-color-secondary);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.user-card__roles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
}

.user-card__facts {
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: left;
}

.user-card__facts li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  color: var(--ep-text-color-regular);
  font-size: 14px;
}

.user-card__links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 8px;
}

.user-card__links .ep-button + .ep-button {
  margin-left: 0;
}
</style>
