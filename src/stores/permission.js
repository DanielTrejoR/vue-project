import { defineStore } from 'pinia'
import { asyncRoutes, constantRoutes } from '@/router'
import axiosClient from '~/plugins/axios'

/**
 * Use meta.roles / meta.permissions to determine if the current user has access
 */
function hasPermission(roles, permissions, route) {
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

// Rutas del panel según los roles del usuario (las usan el guard, el menú lateral y el buscador)
export const usePermissionStore = defineStore('permission', {
  state: () => ({
    /** @type {Array<Record<string, any>>} */
    routes: [],
    /** @type {Array<Record<string, any>>} */
    addRoutes: [],
  }),
  getters: {
    // las rutas dinámicas se generan una vez por sesión
    routesReady: state => state.addRoutes.length > 0,
  },
  actions: {
    generateRoutes({ roles, permissions = [] }) {
      const accessedRoutes = roles.includes('Admin')
        ? asyncRoutes
        : filterAsyncRoutes(asyncRoutes, roles, permissions)
      this.addRoutes = accessedRoutes
      this.routes = constantRoutes.concat(accessedRoutes)
      return accessedRoutes
    },
    reset() {
      this.addRoutes = []
      this.routes = []
    },
    getPermissions() {
      return axiosClient.get('/admin/permissions')
    },
  },
})
