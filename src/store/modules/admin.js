import router, { resetRouter } from '@/router'
import axiosClient from '~/plugins/axios.js'
const state = {
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  user: {
    config: {
    collapseSideBar: sessionStorage.getItem('isCollapse') === 'true',
    darkMode: sessionStorage.getItem('dark_theme') === 'dark' ? "dark" : "light"
    },
    data: {},
  },
  admin: {
        config: {
        collapseSideBar: sessionStorage.getItem('isCollapse') === 'true',
        darkMode: sessionStorage.getItem('dark_theme') === 'dark' ? "dark" : "light"
        },
        data: {},
  },
  permissions: [],
  role: sessionStorage.getItem('roleUser') ?? null,
  authenticated: sessionStorage.getItem('authUser') ?? false,
}

const mutations = {
    setConfigSideBar: (state, collapse) => {
        state.user.config.collapseSideBar = collapse;
        sessionStorage.setItem('isCollapse', collapse)
    },
    setDarkMode: (state, isDark) => {
        state.user.config.darkMode = isDark
        sessionStorage.setItem('dark_theme', isDark)
    },
    setUser: (state, user, role) => {
        state.admin.data = user;
    },
    SET_NAME(state, user) {
        state.name = user.name
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles
    }
}

const actions = {
    async login({commit}, user) {
      return new Promise((resolve, reject) => {
        axiosClient.post('/login', user)
          .then(({data}) => {
            if (data.user) {
              commit('setUser', data.user, data.role);
              commit('SET_NAME', data.user)
              commit('SET_ROLES', data.role)
  
            }
            resolve()
          }).catch(err => {
            reject(err)
          })
      })
    },
    async logout({commit}) {
      return await axiosClient.post('/logout')
        .then((response) => {
          commit('setAuthenticated', false);
          commit('setUser', {});
          sessionStorage.removeItem('authUser');
          sessionStorage.removeItem('roleUser');
          commit('SET_NAME', '')
          commit('SET_ROLES', [])
          return response.data;
        }).catch((error) => {
          commit('setAuthenticated', true);
          return error;
        });
    },
    async fetchUserData({ commit }) {
        return await axiosClient.get('/user').then((response) => {
          commit('setUser', response.data.user);
          commit('setAuthenticated', true);
          sessionStorage.setItem('authUser', true);

          return response.data;
        }).catch((error) => {
          commit('setAuthenticated', false);
          return error;
        });
    },
    //config
    stateSideBar({commit}, collapse) {
      commit('setConfigSideBar', collapse)
    },
    toggleDarkMode({commit}, isDark) {
      commit('setDarkMode', isDark)
    },
    async getPosts({commit}, data) {
      return await axiosClient.get(`${data.url}?page=${data.page}`)
      .then((result) => {
        return result 
      }).catch((err) => {
        return err;
      });
    },
    async createPost({commit}, title){
      return await axiosClient.post('/admin/posts', title)
      .then((result) => {
        return result 
      }).catch((err) => {
        return err;
      });
    },
    async changeRoles({ commit, dispatch }, role) {
        const token = role + '-token'

        commit('SET_TOKEN', token)
        setToken(token)

        const { roles } = await dispatch('getInfo')

        resetRouter()

        // generate accessible routes map based on roles
        const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
        // dynamically add accessible routes
        router.addRoutes(accessRoutes)

        // reset visited views and cached views
        dispatch('tagsView/delAllViews', null, { root: true })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}