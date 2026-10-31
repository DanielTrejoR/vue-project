import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { api, routerMock } from './mocks'

vi.mock('~/plugins/axios', () => ({ default: api }))
vi.mock('@/router', () => routerMock)

const { useAuthStore } = await import('../auth')
const { usePermissionStore } = await import('../permission')
const { useSettingsStore } = await import('../settings')

const writer = { id: 2, name: 'Luis', roles: ['Writer'], permissions: ['View posts'], preferences: { theme: '#13c2c2' } }

describe('auth store', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        setActivePinia(createPinia())
        api.put.mockResolvedValue({ data: {} })
    })

    it('login guarda el usuario, sus roles y aplica sus preferencias', async () => {
        api.post.mockResolvedValueOnce({ data: { user: writer } })
        const auth = useAuthStore()

        await auth.login({ email: 'luis@email.com', password: 'secreto' })

        expect(auth.isAuthenticated).toBe(true)
        expect(sessionStorage.getItem('isAuthenticated')).toBe('true')
        expect(auth.roles).toEqual(['Writer'])
        expect(auth.canWrite).toBe(true)
        expect(auth.isAdmin).toBe(false)
        expect(useSettingsStore().theme).toBe('#13c2c2')
    })

    it('un usuario sin rol no puede escribir', async () => {
        api.get.mockResolvedValueOnce({ data: { id: 3, roles: [], permissions: [] } })
        const auth = useAuthStore()
        await auth.fetchUser()

        expect(auth.canWrite).toBe(false)
    })

    it('logout limpia la sesión y las rutas aunque falle la petición', async () => {
        api.post.mockResolvedValueOnce({ data: { user: writer } })
        const auth = useAuthStore()
        await auth.login({})
        usePermissionStore().generateRoutes({ roles: ['Writer'] })

        api.post.mockRejectedValueOnce(new Error('419'))
        await auth.logout()

        expect(auth.user).toBeNull()
        expect(auth.isAuthenticated).toBe(false)
        expect(usePermissionStore().routesReady).toBe(false)
        expect(routerMock.resetRouter).toHaveBeenCalled()
    })

    it('expire (401) olvida al usuario sin tocar las rutas', async () => {
        api.post.mockResolvedValueOnce({ data: { user: writer } })
        const auth = useAuthStore()
        await auth.login({})
        usePermissionStore().generateRoutes({ roles: ['Writer'] })

        auth.expire()

        expect(auth.isAuthenticated).toBe(false)
        expect(usePermissionStore().routesReady).toBe(true)
    })

    it('olvidé mi contraseña y restablecerla no inician sesión', async () => {
        const auth = useAuthStore()
        api.post.mockResolvedValueOnce({ data: { message: 'Si el correo está registrado, te enviamos un enlace…' } })
        expect(await auth.forgotPassword('ana@email.com')).toMatch('te enviamos un enlace')
        expect(api.post).toHaveBeenLastCalledWith('/forgot-password', { email: 'ana@email.com' })

        const form = { token: 't', email: 'ana@email.com', password: 'nueva-123', password_confirmation: 'nueva-123' }
        api.post.mockResolvedValueOnce({ data: { message: 'Tu contraseña se cambió.' } })
        expect(await auth.resetPassword(form)).toBe('Tu contraseña se cambió.')
        expect(api.post).toHaveBeenLastCalledWith('/reset-password', form)

        expect(auth.isAuthenticated).toBe(false)
    })
})
