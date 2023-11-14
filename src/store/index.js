import { createStore } from 'vuex'
import axiosClient from '../axios'

const store = createStore({
  state: {
    user: {
      config: {
        collapseSideBar: sessionStorage.getItem('isCollapse') === 'true',
        darkMode: sessionStorage.getItem('dark_theme') === 'dark' ? "dark" : "light"
      }
    }
  },
  actions: {
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

    }
  },
  getters: {},
})

export default store;