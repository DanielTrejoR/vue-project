import { asyncRoutes, constantRoutes } from '@/router'
import axiosClient from '~/plugins/axios.js'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, permissions, route) {
  // if (route.meta && route.meta.roles) {
  //   return roles.some(role => route.meta.roles.includes(role))
  // } else {
  //   return true
  // }
  if (route.meta) {
    if (route.meta.roles && !roles.some(role => route.meta.roles.includes(role))) {
      return false
    }
    if (route.meta.permissions && !permissions.some(p => route.meta.permissions.includes(p))) {
      return false
    }
  }
  return true
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles, permissions = []) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, permissions, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles, permissions)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  RESET_ROUTES: (state) => {
    state.addRoutes = []
    state.routes = []
  }
}

const actions = {
  generateRoutes({ commit }, { roles, permissions }) {
    return new Promise(resolve => {
      let accessedRoutes;
      if (roles.includes('Admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles, permissions)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  getPermissions({commit}){
    return new Promise((resolve, reject) => {
      axiosClient.get('/admin/permissions').then((res) => {
        resolve(res);
        return res;
      }).catch((err) => {
        return err
      });
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
