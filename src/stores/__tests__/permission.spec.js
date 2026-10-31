import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { api, routerMock } from './mocks'

vi.mock('~/plugins/axios', () => ({ default: api }))
vi.mock('@/router', () => routerMock)

const { usePermissionStore, filterAsyncRoutes } = await import('../permission')

const names = routes => routes.map(route => route.name)

describe('permission store', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('Writer ve el panel pero no el centro de control', () => {
        expect(names(filterAsyncRoutes(routerMock.asyncRoutes, ['Writer'])))
            .toEqual(['Admin', 'CatchAll'])
    })

    it('un usuario sin rol solo conserva la ruta comodín', () => {
        expect(names(filterAsyncRoutes(routerMock.asyncRoutes, []))).toEqual(['CatchAll'])
    })

    it('filtra por permisos además de roles', () => {
        const routes = [{ path: '/x', name: 'X', meta: { permissions: ['View roles'] } }]
        expect(filterAsyncRoutes(routes, ['Writer'], ['View posts'])).toEqual([])
        expect(names(filterAsyncRoutes(routes, ['Writer'], ['View roles']))).toEqual(['X'])
    })

    it('Admin recibe todas las rutas y el menú incluye las constantes', () => {
        const store = usePermissionStore()
        const added = store.generateRoutes({ roles: ['Admin'] })

        expect(added).toBe(routerMock.asyncRoutes)
        expect(store.routes).toHaveLength(routerMock.constantRoutes.length + routerMock.asyncRoutes.length)
        expect(store.routesReady).toBe(true)

        store.reset()
        expect(store.routesReady).toBe(false)
    })
})
