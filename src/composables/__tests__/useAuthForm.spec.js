import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { api, routerMock } from '~/stores/__tests__/mocks'

vi.mock('~/plugins/axios', () => ({ default: api }))
vi.mock('@/router', () => routerMock)

const { useAuthForm, homeFor, readApiError } = await import('../useAuthForm')

const httpError = (status, data) => Object.assign(new Error(String(status)), { response: { status, data } })

describe('useAuthForm', () => {
    beforeEach(() => {
        sessionStorage.clear()
        setActivePinia(createPinia())
    })

    it('muestra el primer error de cada campo que devuelve Laravel (422)', async () => {
        api.post.mockRejectedValueOnce(httpError(422, {
            message: 'The given data was invalid.',
            errors: { email: ['El correo ya existe.', 'otro'], password: ['Muy corta'] },
        }))
        const form = useAuthForm()

        expect(await form.submit('register')).toBeNull()
        expect(form.fieldErrors.value).toEqual({ email: 'El correo ya existe.', password: 'Muy corta' })
        expect(form.errorMessage.value).toBe('')
        expect(form.loading.value).toBe(false)
    })

    it('avisa del límite de intentos (429)', async () => {
        api.post.mockRejectedValueOnce(httpError(429, {}))
        const form = useAuthForm()
        await form.submit('login')

        expect(form.errorMessage.value).toMatch(/Demasiados intentos/)
    })

    it('sin respuesta del servidor muestra un error de conexión', async () => {
        api.post.mockRejectedValueOnce(new Error('Network Error'))
        const form = useAuthForm()
        await form.submit('login')

        expect(form.errorMessage.value).toBe('No se pudo conectar con el servidor.')
    })

    it('devuelve el usuario al iniciar sesión bien', async () => {
        api.post.mockResolvedValueOnce({ data: { user: { id: 1, roles: ['Admin'] } } })
        const form = useAuthForm()

        expect(await form.submit('login')).toEqual({ id: 1, roles: ['Admin'] })
    })
})

describe('homeFor', () => {
    it('respeta el ?redirect interno', () => {
        expect(homeFor({ roles: [] }, '/posts/hola')).toBe('/posts/hola')
    })

    it('ignora redirects a otros dominios', () => {
        expect(homeFor({ roles: [] }, '//evil.com')).toBe('/')
        expect(homeFor({ roles: [] }, 'https://evil.com')).toBe('/')
    })

    it('manda Admin y Writer al panel y al resto al blog', () => {
        expect(homeFor({ roles: ['Writer'] })).toBe('/admin')
        expect(homeFor({ roles: ['Admin'] })).toBe('/admin')
        expect(homeFor({ roles: [] })).toBe('/')
        expect(homeFor(null)).toBe('/')
    })
})

describe('readApiError', () => {
    it('separa errores por campo, el límite de intentos y los demás', () => {
        expect(readApiError(httpError(422, { errors: { email: ['El enlace no es válido o ya venció. Pide uno nuevo.'] } })))
            .toEqual({ fields: { email: 'El enlace no es válido o ya venció. Pide uno nuevo.' }, message: '' })
        expect(readApiError(httpError(429, {})).message).toBe('Demasiados intentos, espera un minuto antes de volver a intentarlo.')
        expect(readApiError(new Error('Network Error'))).toEqual({ fields: {}, message: 'No se pudo conectar con el servidor.' })
    })
})
