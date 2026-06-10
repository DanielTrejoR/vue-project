//Este modulo solo es para recibir y modificar temas con roles vease los metodos y clases
import axiosClient from '~/plugins/axios.js'
import { toRaw } from 'vue'
const state = {}

const mutations = {}

const actions = {
    async getRoles({commit}) {
        return new Promise((resolve, reject) => {
            axiosClient.get('/admin/roles').then((res) => {
                resolve(res)
                return res
            }).catch((err) => {
                reject(err)
            });
        })
    },
    async editRole({commit}, role) {
        return new Promise((resolve, reject) => {
            axiosClient.get(`/admin/roles/${role}/edit`).then((res) => {
                resolve(res)
                return res
            }).catch((err) => {
                reject(err)
            });
        })
    },
    async updateRoles({commit}, payload){
        payload.name = payload.role.name;
        payload.display_name = payload.role.display_name;
        
        return new Promise((resolve, reject) => {
            axiosClient.patch(`/admin/roles/${payload.role.id}`, payload).then((res) => {
                resolve(res)
                return res
            }).catch((err) => {
                reject(err)
            });
        })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}