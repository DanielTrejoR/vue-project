<template>
<div class="app-container">
    <div v-if="user">
        <el-row :gutter="20">
            <el-col :span="6" :xs="24">
                <user-card :user="user" />
            </el-col>
        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="Activity" name="activity">
                <activity />
              </el-tab-pane>
              <el-tab-pane label="Timeline" name="timeline">
                <timeline />
              </el-tab-pane>
              <el-tab-pane label="Account" name="account">
                <account :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
        <!-- <el-card class="profile-card">
        <div class="profile-header">
            <el-avatar
            :src="user.avatar || ''"
            size="large"
            class="profile-avatar"
            />
            <div class="profile-info">
            <h2>{{ user.name }}</h2>
            <p>{{ user.email }}</p>
            <el-tag type="success" v-if="user.is_active">Activo</el-tag>
            <el-tag type="danger" v-else>Inactivo</el-tag>
            </div>
        </div>

        <el-divider />

        <div class="profile-actions">
            <el-button type="primary" @click="editProfile">Editar perfil</el-button>
            <el-button type="danger" @click="logout">Cerrar sesión</el-button>
        </div>
        </el-card> -->
        </el-row>
    </div>
</div>
</template>

<script setup>
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import UserCard from './components/UserCard.vue'
const store = useStore()
const router = useRouter()

const user = store.getters['user'].user

const editProfile = () => {
  router.push('/settings') // o tu ruta de edición
}

const logout = async () => {
  await store.dispatch('auth/logout')
  router.push('/login')
}
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.profile-card {
  width: 500px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  border: 2px solid #409EFF;
}

.profile-info h2 {
  margin: 0;
}

.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
