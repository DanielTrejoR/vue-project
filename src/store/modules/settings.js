import defaultSettings from '~/settings'

const getThemeColor = () => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue('--theme-color')
    .trim() || '#1890ff'; // fallback si no está definida
};
const { showSettings, tagsView, fixedHeader, sidebarLogo } = defaultSettings

const state = {
    theme: getThemeColor(),
    showSettings: showSettings,
    tagsView: tagsView,
    fixedHeader: fixedHeader,
    sidebarLogo: sidebarLogo
}

const mutations = {
    CHANGE_SETTING: (state, { key, value }) => {
        // eslint-disable-next-line no-prototype-builtins
        if (state.hasOwnProperty(key)) {
        state[key] = value
        }
    }
}

const actions = {
    changeSetting({ commit }, data) {
        commit('CHANGE_SETTING', data)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}