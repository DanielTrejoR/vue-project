<template>
  <el-popover
    v-model:visible="open"
    placement="bottom-end"
    :width="340"
    trigger="click"
    popper-class="notifications-popper"
    @show="reload"
  >
    <template #reference>
      <button type="button" class="bell" :aria-label="unreadCount ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'">
        <el-badge :value="unreadCount" :max="99" :hidden="!unreadCount">
          <el-icon :size="20"><Bell /></el-icon>
        </el-badge>
      </button>
    </template>

    <div class="notifications">
      <header class="notifications__header">
        <strong>Notificaciones</strong>
        <el-button text size="small" :disabled="!unreadCount" @click="markAllRead">Marcar todas como leídas</el-button>
      </header>

      <div class="notifications__list">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="notification"
          :class="{ 'notification--unread': !item.read }"
          @click="openItem(item)"
        >
          <el-avatar :size="32" :src="item.actor?.avatar">{{ item.actor?.name?.charAt(0) }}</el-avatar>
          <span class="notification__text">
            <span>{{ item.text }}</span>
            <span v-if="item.excerpt" class="notification__excerpt">«{{ item.excerpt }}»</span>
            <span class="notification__when" :title="fullDate(item.created_at)">{{ fromNow(item.created_at) }}</span>
          </span>
          <span v-if="!item.read" class="notification__dot" aria-label="Sin leer"></span>
        </button>

        <el-skeleton v-if="loading && !items.length" :rows="3" animated />
        <p v-if="error" class="notifications__empty">{{ error }}</p>
        <p v-else-if="done && !items.length" class="notifications__empty">No tienes notificaciones todavía.</p>
        <el-button v-else-if="!done && items.length" text size="small" class="notifications__more" :loading="loading" @click="loadMore">
          Ver anteriores
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { Bell } from '@element-plus/icons-vue'
import { useNotificationsStore } from '~/stores/notifications'
import { useInfiniteList } from '~/composables/useInfiniteList'
import { fromNow, fullDate } from '~/utils/dates'

interface NotificationItem {
  id: string
  kind: string
  text: string
  excerpt: string | null
  actor?: { id: number, name: string, avatar: string }
  link: RouteLocationRaw
  read: boolean
  created_at: string
}

// cada cuánto se revisa si llegó algo nuevo (solo con la pestaña visible)
const POLL_MS = 60_000

const router = useRouter()
const store = useNotificationsStore()
const unreadCount = computed(() => store.unreadCount)

const open = ref(false)
const { items, loading, done, error, loadMore, reset } = useInfiniteList<NotificationItem>(cursor => store.list(cursor))

// al abrir se pide la lista de nuevo para ver lo último
const reload = () => reset()

const openItem = async (item: NotificationItem) => {
  open.value = false
  if (!item.read) {
    item.read = true
    store.markRead(item.id).catch(() => { item.read = false })
  }
  router.push(item.link)
}

const markAllRead = async () => {
  await store.markAllRead()
  items.value.forEach(item => { item.read = true })
}

const refresh = () => {
  if (document.visibilityState === 'visible') store.refreshCount().catch(() => {})
}
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  refresh()
  timer = setInterval(refresh, POLL_MS)
  document.addEventListener('visibilitychange', refresh)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('visibilitychange', refresh)
})
</script>

<style scoped>
.bell {
  display: inline-flex;
  align-items: center;
  padding: 6px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.bell:hover {
  background: var(--ep-fill-color-light);
}

.notifications__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--ep-border-color-lighter);
}

.notifications__list {
  max-height: min(420px, 60vh);
  overflow-y: auto;
  margin: 4px -12px -12px;
  padding: 0 4px 8px;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.notification:hover {
  background: var(--ep-fill-color-light);
}

.notification--unread {
  background: var(--ep-color-primary-light-9);
}

.notification__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.4;
}

.notification__excerpt {
  color: var(--ep-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification__when {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}

.notification__dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--ep-color-primary);
}

.notifications__empty {
  margin: 16px 0 8px;
  text-align: center;
  color: var(--ep-text-color-secondary);
  font-size: 13px;
}

.notifications__more {
  display: flex;
  margin: 4px auto 0;
}
</style>
