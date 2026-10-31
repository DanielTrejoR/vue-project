<template>
<div class="app-container">
    <div v-if="user">
        <el-row :gutter="20">
            <el-col :span="6" :xs="24">
                <user-card :user="user" />
            </el-col>
        <el-col :span="18" :xs="24">
          <el-card>
            <!-- la pestaña vive en la URL (?tab=) para poder volver a ella -->
            <el-tabs v-model="activeTab">
              <el-tab-pane lazy label="Actividad" name="activity">
                <activity v-if="activeTab === 'activity'" />
              </el-tab-pane>
              <el-tab-pane lazy label="Historial" name="timeline">
                <time-line v-if="activeTab === 'timeline'" />
              </el-tab-pane>
              <el-tab-pane lazy label="Cuenta" name="account">
                <account v-if="activeTab === 'account'" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
        </el-row>
    </div>
</div>
</template>

<script setup>
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'ProfileIndex' })
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import UserCard from './components/UserCard.vue'
import TimeLine from './components/TimeLine.vue'
import Account from './components/Account.vue'
import Activity from './components/Activity.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

// computed: refleja al instante los cambios de nombre o foto hechos en la pestaña Cuenta
const user = computed(() => auth.user)

const tabs = ['activity', 'timeline', 'account']
const activeTab = computed({
  get: () => (tabs.includes(route.query.tab) ? route.query.tab : 'activity'),
  set: tab => router.replace({ query: { ...route.query, tab: tab === 'activity' ? undefined : tab } }),
})
</script>
