import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Centro de control → Música: canciones y playlists del reproductor (solo Admin)
export const useMusicStore = defineStore('music', {
    actions: {
        async listTracks() {
            const { data } = await axiosClient.get('/admin/music/tracks')
            return data
        },
        /** @param {FormData} form title, artist, duration, audio, cover */
        async uploadTrack(form) {
            const { data } = await axiosClient.post('/admin/music/tracks', form)
            return data
        },
        // multipart: PHP no lee archivos en un PUT, se manda POST con _method=PUT
        /** @param {number} id @param {FormData} form title, artist, cover, remove_cover */
        async updateTrack(id, form) {
            form.append('_method', 'PUT')
            const { data } = await axiosClient.post(`/admin/music/tracks/${id}`, form)
            return data
        },
        /** @param {number} id */
        async deleteTrack(id) {
            const { data } = await axiosClient.delete(`/admin/music/tracks/${id}`)
            return data
        },

        async listPlaylists() {
            const { data } = await axiosClient.get('/admin/music/playlists')
            return data
        },
        /** @param {{ name: string, description?: string | null, is_public: boolean, track_ids: number[] }} playlist */
        async savePlaylist(playlist, id = null) {
            const { data } = id
                ? await axiosClient.put(`/admin/music/playlists/${id}`, playlist)
                : await axiosClient.post('/admin/music/playlists', playlist)
            return data
        },
        /** @param {number} id */
        async deletePlaylist(id) {
            const { data } = await axiosClient.delete(`/admin/music/playlists/${id}`)
            return data
        },
    },
})
