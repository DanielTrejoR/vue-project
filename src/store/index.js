import { createStore } from 'vuex'
import axiosClient from '~/axios.js'

const baseStore = {
  namespaced: true,
  state: {
    user: {
      config: {
        collapseSideBar: sessionStorage.getItem('isCollapse') === 'true',
        darkMode: sessionStorage.getItem('dark_theme') === 'dark' ? "dark" : "light"
      },
      data: {},
    },
    user_admin: {
      config: {
        collapseSideBar: sessionStorage.getItem('isCollapse') === 'true',
        darkMode: sessionStorage.getItem('dark_theme') === 'dark' ? "dark" : "light"
      },
      data: {},
    },
    role: sessionStorage.getItem('roleUser') ?? null,
    authenticated: sessionStorage.getItem('authUser') ?? false,
  },
  actions: {
    async login({commit}, user) {
      return await axiosClient.post('/login', user)
        .then(({data}) => {
          if (data.user) {
            console.log(data);
            
            sessionStorage.setItem('authUser', true);
            commit('setAuthenticated', true);
            commit('setUser', data.user, data.role);
            sessionStorage.setItem('roleUser', data.role);
            commit('setRole', data.role)

          }
          return data;
        })
    },
    async logout({commit}) {
      return await axiosClient.post('/logout')
        .then((response) => {
          commit('setAuthenticated', false);
          commit('setUser', {});
          sessionStorage.removeItem('authUser');
          sessionStorage.removeItem('roleUser');
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
    }
  },
  mutations: {
    setConfigSideBar: (state, collapse) => {
      state.user.config.collapseSideBar = collapse;
      sessionStorage.setItem('isCollapse', collapse)
    },
    setDarkMode: (state, isDark) => {
      state.user.config.darkMode = isDark
      sessionStorage.setItem('dark_theme', isDark)
    },
    setUser: (state, user, role) => {
      if(role === 'admin' || user.is_super_admin) {
        state.user_admin.data = user;
        state.role = sessionStorage.getItem('roleUser') ?? null;
      }else{
        state.user.data = user;
      }
    },
    setAuthenticated(state, status) {
      state.authenticated = status;
    },
    setRole(state, role) {
      state.role = role;
    },
  },
  getters: {},
}

const adminStore = {
  namespaced: true,
  state: {},
  actions: {
      async fetchPosts({commit}, data) {
          return await axiosClient.get('/admin/posts')
          .then((result) => {
              return result 
          }).catch((err) => {
              return err;
          });
      },
  },
  mutations: {},
  getters: {},
}

const store = createStore({
    modules: {
        base: baseStore,
        admin: adminStore
    }
});

export default store;