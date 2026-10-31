import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Categorías y etiquetas del centro de control. kind: 'categories' | 'tags' (mismas rutas en el backend)
export const useTaxonomiesStore = defineStore('taxonomies', {
    actions: {
        async list(kind) {
            const { data } = await axiosClient.get(`/admin/${kind}`)
            return data
        },
        async create(kind, name) {
            const { data } = await axiosClient.post(`/admin/${kind}`, { name })
            return data
        },
        async rename(kind, id, name) {
            const { data } = await axiosClient.put(`/admin/${kind}/${id}`, { name })
            return data
        },
        // moveTo: categoría que recibe los posts de la que se borra (las etiquetas no lo necesitan)
        /** @param {string} kind @param {number} id @param {number | null} [moveTo] */
        async remove(kind, id, moveTo = null) {
            const { data } = await axiosClient.delete(`/admin/${kind}/${id}`, {
                data: moveTo ? { move_to: moveTo } : {},
            })
            return data
        },
    },
})
