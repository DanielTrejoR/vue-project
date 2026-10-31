<template>
  <!-- avisos en tiempo real mientras se navega por el blog (likes y comentarios sobre lo tuyo) -->
  <div class="live-toasts" aria-live="polite">
    <transition-group name="live-toast">
      <v-card
        v-for="toast in toasts"
        :key="toast.id"
        class="live-toast"
        elevation="8"
        rounded="lg"
        @click="openToast(toast)"
        @mouseenter="pause(toast.id)"
        @mouseleave="resume(toast.id)"
      >
        <div class="d-flex align-start ga-3 pa-3">
          <FrontUserAvatar :src="toast.actor?.avatar" :name="toast.actor?.name" :size="40" />
          <div class="live-toast__body">
            <div class="text-body-2 font-weight-medium">{{ toast.text }}</div>
            <div v-if="toast.excerpt" class="text-caption text-medium-emphasis text-truncate">«{{ toast.excerpt }}»</div>
            <div class="text-caption text-primary font-weight-medium mt-1">Ver</div>
          </div>
          <v-btn
            icon="mdi mdi-close"
            size="x-small"
            variant="text"
            density="comfortable"
            aria-label="Cerrar aviso"
            @click.stop="dismiss(toast.id)"
          />
        </div>
      </v-card>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import FrontUserAvatar from '~/components/UserAvatar/FrontUserAvatar.vue'
import { useNotificationsStore } from '~/stores/notifications'
import { useLiveNotifications, type LiveNotification, type NotificationItem } from '~/composables/useLiveNotifications'

const DURATION_MS = 6000
// si llegan muchos seguidos, se quitan los más viejos
const MAX_TOASTS = 3

const router = useRouter()
const store = useNotificationsStore()
const toasts = ref<NotificationItem[]>([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

const dismiss = (id: string) => {
  clearTimeout(timers.get(id))
  timers.delete(id)
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}

const resume = (id: string) => timers.set(id, setTimeout(() => dismiss(id), DURATION_MS))
// con el mouse encima no desaparece: da tiempo a leerlo
const pause = (id: string) => clearTimeout(timers.get(id))

useLiveNotifications(({ unread_count, ...item }: LiveNotification) => {
  store.unreadCount = unread_count
  // un like repetido llega con otro id; se reemplaza el anterior del mismo origen
  toasts.value
    .filter(old => old.kind === 'status_liked' && old.status_id === item.status_id && old.actor?.id === item.actor?.id)
    .forEach(old => dismiss(old.id))
  toasts.value = [item, ...toasts.value]
  toasts.value.slice(MAX_TOASTS).forEach(old => dismiss(old.id))
  resume(item.id)
})

const openToast = async (toast: NotificationItem) => {
  dismiss(toast.id)
  store.markRead(toast.id).catch(() => {})
  // los avisos de la Actividad llevan al panel, cuyas rutas aún no existen si solo se ha visto el blog.
  // import() y no estático: permission.ts importa el router, que a su vez importa este layout
  const { ensureAccessRoutes } = await import('~/permission')
  await ensureAccessRoutes().catch(() => false)
  router.push(toast.link)
}

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<style scoped>
.live-toasts {
  position: fixed;
  top: 72px;
  right: 16px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}

.live-toast {
  pointer-events: auto;
}

.live-toast__body {
  flex: 1;
  min-width: 0;
}

.live-toast-enter-active,
.live-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.live-toast-enter-from,
.live-toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
