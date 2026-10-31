import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Campana del admin: avisos de likes y comentarios sobre lo tuyo
export const useNotificationsStore = defineStore('notifications', {
    state: () => ({
        unreadCount: 0,
    }),
    actions: {
        async refreshCount() {
            const { data } = await axiosClient.get('/notifications/unread-count')
            this.unreadCount = data.unread_count
        },
        /** @param {string | null} [cursor] */
        async list(cursor = null) {
            const { data } = await axiosClient.get('/notifications', { params: { cursor: cursor || undefined } })
            this.unreadCount = data.unread_count
            return data
        },
        /** @param {string} id */
        async markRead(id) {
            const { data } = await axiosClient.post(`/notifications/${id}/read`)
            this.unreadCount = data.unread_count
        },
        async markAllRead() {
            const { data } = await axiosClient.post('/notifications/read-all')
            this.unreadCount = data.unread_count
        },
    },
})
