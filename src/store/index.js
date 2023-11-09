import { createStore } from 'vuex'

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