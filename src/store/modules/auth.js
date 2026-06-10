import axiosClient from '~/plugins/axios';
import router, { resetRouter } from '@/router'

const state = () => ({
    authenticated: false,
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
    },
    setAuthenticated(state, value) {
        state.authenticated = value;
    }
};

const actions = {
    fetchUser({ commit, state, dispatch }) {
        return new Promise((resolve, reject) => {
            axiosClient.get('/user').then((res) => {
                const { data } = res;
                if (!data) {
                    dispatch('user/logout', null, { root: true })
                    throw new Error('User verification failed')
                }
                
                commit('setUser', data);

                if (data.roles) commit('setRoles', data.roles);
                if (data.permissions) commit('setPermissions', data.permissions);
                dispatch('user/setUser', data, {root: true})
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