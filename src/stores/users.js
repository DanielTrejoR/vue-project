import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Gestión de cuentas del centro de control (solo Admin)
export const useUsersStore = defineStore('users', {
    actions: {
        async fetchUsers({ page = 1, size = 20, filters = {} } = {}) {
            const { data } = await axiosClient.get('/admin/users', {
                params: { page, per_page: size, ...filters },
            })
            return data
        },
        // roles: nombres de rol (Admin, Writer...); una lista vacía deja la cuenta como lector del blog
        async updateUser(id, { roles, is_active }) {
            const { data } = await axiosClient.put(`/admin/users/${id}`, { roles, is_active })
            return data
        },
    },
})
