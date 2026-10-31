import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Llamadas a la API de roles del centro de control
export const useRolesStore = defineStore('roles', {
    actions: {
        getRoles() {
            return axiosClient.get('/admin/roles')
        },
        editRole(role) {
            return axiosClient.get(`/admin/roles/${role}/edit`)
        },
        updateRoles(payload) {
            return axiosClient.patch(`/admin/roles/${payload.role.id}`, {
                ...payload,
                name: payload.role.name,
                display_name: payload.role.display_name,
            })
        },
    },
})
