import { vi } from 'vitest'

// axios y el router reales arrastran la app entera (layouts, interceptores): los tests usan dobles
export const api = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
}

export const routerMock = {
    resetRouter: vi.fn(),
    constantRoutes: [{ path: '/' }],
    asyncRoutes: [
        { path: '/admin', name: 'Admin', meta: { roles: ['Admin', 'Writer'] }, children: [
            { path: 'dashboard', meta: { title: 'Dashboard' } },
        ] },
        { path: '/admin/control-center', name: 'ControlCenter', meta: { roles: ['Admin'] } },
        { path: '/:pathMatch(.*)*', name: 'CatchAll', redirect: '/404' },
    ],
}
