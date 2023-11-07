import { createStore } from 'vuex'

const store = createStore({
  state: {
    user: {
      config: {
        collapseSideBar: sessionStorage.getItem('isCollapse') === 'true'
      }
    }
  },
  actions: {
    stateSideBar({commit}, collapse) {
      commit('setConfigSideBar', collapse)
    }
  },
  mutations: {
    setConfigSideBar: (state, collapse) => {
      state.user.config.collapseSideBar = collapse;
      sessionStorage.setItem('isCollapse', collapse)
    },
  },
  getters: {},
})

export default store;