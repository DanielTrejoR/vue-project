import Cookies from 'js-cookie'

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  // en móvil el menú lateral es un drawer; esto no se guarda como preferencia
  mobileSidebar: false,
  // panel de configuración (RightPanel): lo abren su botón lateral y "Configuración" del menú de usuario
  settingsPanel: false,
  size: Cookies.get('size') || 'medium'
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
    if (device !== 'mobile') state.mobileSidebar = false
  },
  SET_MOBILE_SIDEBAR: (state, open) => {
    state.mobileSidebar = open
  },
  SET_SETTINGS_PANEL: (state, open) => {
    state.settingsPanel = open
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  // botón de menú del header: en móvil abre el drawer, en escritorio colapsa/expande (y se guarda)
  toggleMenu({ state, commit, dispatch, rootState }) {
    if (state.device === 'mobile') {
      commit('SET_MOBILE_SIDEBAR', !state.mobileSidebar)
    } else {
      dispatch('settings/changeSetting', { key: 'sidebarCollapsed', value: !rootState.settings.sidebarCollapsed }, { root: true })
    }
  },
  setMobileSidebar({ commit }, open) {
    commit('SET_MOBILE_SIDEBAR', open)
  },
  setSettingsPanel({ commit }, open) {
    commit('SET_SETTINGS_PANEL', open)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}