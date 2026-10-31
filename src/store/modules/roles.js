//Este modulo solo es para recibir y modificar temas con roles vease los metodos y clases
import axiosClient from '~/plugins/axios.js'
import { toRaw } from 'vue'
const state = {}

const mutations = {}

const actions = {
    getRoles() {
        return axiosClient.get('/admin/roles')
    },
    editRole({commit}, role) {
        return axiosClient.get(`/admin/roles/${role}/edit`)
    },
    updateRoles({commit}, payload) {
        payload.name = payload.role.name;
        payload.display_name = payload.role.display_name;

        return axiosClient.patch(`/admin/roles/${payload.role.id}`, payload)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}