import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Publicaciones de la pestaña Actividad del perfil (texto, imágenes o ambos) y sus likes
export const useStatusesStore = defineStore('statuses', {
    actions: {
        // por cursor para el scroll infinito; sin userId trae las propias
        /** @param {{ cursor?: string | null, userId?: number | null }} [options] */
        async list({ cursor = null, userId = null } = {}) {
            const { data } = await axiosClient.get('/statuses', {
                params: { cursor: cursor || undefined, user: userId || undefined },
            })
            return data
        },
        /** @param {{ body?: string, images?: File[] }} payload */
        async create({ body, images = [] }) {
            const form = new FormData()
            if (body) form.append('body', body)
            images.forEach(file => form.append('images[]', file))
            const { data } = await axiosClient.post('/statuses', form)
            return data
        },
        remove(id) {
            return axiosClient.delete(`/statuses/${id}`)
        },
        async toggleLike(id) {
            const { data } = await axiosClient.post(`/statuses/${id}/like`)
            return data
        },
    },
})
