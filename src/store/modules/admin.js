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
  authenticated: sessionStorage.getItem('isAuthenticated') ?? false
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
    setUser: (state, user) => {
        state.admin.data = user;
    },
    SET_NAME(state, user) {
        state.name = user.name
    },
    SET_ROLES: (state, roles) => {
        state.roles = roles
    },
    setAuthenticated(state, value) {
        state.authenticated = value;
    },
}

const actions = {
    async login({commit}, user) {
      return new Promise((resolve, reject) => {
        axiosClient.post('/login', user)
          .then(({data}) => {
            console.log(data)
            if (data.user) {
              commit('setUser', data.user);
              commit('SET_NAME', data.user)
              commit('setAuthenticated', true);
              sessionStorage.setItem('isAuthenticated', true)
            }
            resolve(data)
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
          commit('SET_NAME', '')
          commit('SET_ROLES', [])
          return response.data;
        }).catch((error) => {
          commit('setAuthenticated', false);
          commit('setUser', {});
          commit('SET_NAME', '')
          commit('SET_ROLES', [])
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
        const { roles } = await dispatch('auth/fetchUser')
        resetRouter()

        // generate accessible routes map based on roles
        const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
        // dynamically add accessible routes
        
        router.addRoutes(accessRoutes)

        // reset visited views and cached views
        // dispatch('tagsView/delAllViews', null, { root: true })
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}