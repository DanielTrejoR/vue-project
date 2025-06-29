import axiosClient from '~/plugins/axios';

const state = () => ({
    user: null,
    roles: [],
    permissions: [],
    authenticated: false
});

const mutations = {
    setAuthenticated(state, value) {
        state.authenticated = value;
    },
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
    async fetchUser({ commit }) {
        try {
        const { data } = await axiosClient.get('/user');

        commit('setUser', data);
        commit('setAuthenticated', true);

        if (data.roles) commit('setRoles', data.roles);
        if (data.permissions) commit('setPermissions', data.permissions);

        return data;
        } catch {
        commit('reset');
        return null;
        }
    },
};

export default {
    namespaced: true,
    state,
    mutations,
    actions
};