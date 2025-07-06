import axiosClient from '~/plugins/axios';
import router, { resetRouter } from '@/router'

const state = () => ({
    user: null,
    roles: [],
    permissions: [],
});

const mutations = {
    setUser(state, user) {
        state.user = user;
    },
    setRoles(state, roles) {
        state.roles = roles;
    },
    setPermissions(state, permissions) {
        state.permissions = permissions;
    },
    reset(state) {
        state.authenticated = false;
        state.user = null;
        state.roles = [];
        state.permissions = [];
    }
};

const actions = {
    fetchUser({ commit, state }) {
        return new Promise((resolve, reject) => {
            axiosClient.get('/user').then((res) => {
                const { data } = res;
                if(!data){
                    store.dispatch('admin/logout')
                    reject('User verification failed');
                }
                
                commit('setUser', data);

                if (data.roles) commit('setRoles', data.roles);
                if (data.permissions) commit('setPermissions', data.permissions);
                resolve(data)
            }).catch(error => {
                reject(error)
            })
        })
    }
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};