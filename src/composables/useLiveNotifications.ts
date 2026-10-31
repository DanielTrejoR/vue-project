import { onBeforeUnmount, watch } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '~/stores/auth'

// Un aviso como lo devuelve GET /notifications (y el WebSocket, con el contador además)
export interface NotificationItem {
  id: string
  kind: string
  text: string
  excerpt: string | null
  actor?: { id: number, name: string, avatar: string | null }
  link: RouteLocationRaw
  status_id?: number
  read: boolean
  created_at: string
}

export type LiveNotification = NotificationItem & { unread_count: number }

/**
 * Escucha los avisos en tiempo real del usuario con sesión mientras el componente esté montado,
 * y vuelve a suscribirse si cambia la sesión (entrar o salir desde el diálogo del blog).
 * Echo y pusher-js se descargan solo cuando hay sesión: las visitas anónimas no los necesitan.
 */
export function useLiveNotifications(onNotification: (item: LiveNotification) => void, onReconnect: () => void = () => {}) {
  const auth = useAuthStore()
  let stop = () => {}
  let mounted = true

  const listen = async (userId?: number) => {
    stop()
    stop = () => {}
    if (!userId) return

    const { listenToNotifications } = await import('~/plugins/echo')
    // mientras se descargaba, el componente pudo desmontarse o la sesión cambiar
    if (!mounted || auth.user?.id !== userId) return
    stop = listenToNotifications<LiveNotification>(userId, onNotification, onReconnect)
  }

  watch(() => auth.user?.id as number | undefined, listen, { immediate: true })
  onBeforeUnmount(() => {
    mounted = false
    stop()
  })
}
