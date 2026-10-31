import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { api, routerMock } from './mocks'

vi.mock('~/plugins/axios', () => ({ default: api }))
vi.mock('@/router', () => routerMock)

const { useSettingsStore, pickPreferences, STORAGE_KEY, SAVE_DELAY } = await import('../settings')
const { useAuthStore } = await import('../auth')

describe('settings store', () => {
    beforeEach(() => {
        localStorage.clear()
        sessionStorage.clear()
        setActivePinia(createPinia())
        vi.useFakeTimers()
        api.put.mockResolvedValue({ data: {} })
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('pickPreferences ignora claves desconocidas y tipos incorrectos', () => {
        expect(pickPreferences({ dark: true, theme: 3, isAdmin: true, sidebarLogo: false }))
            .toEqual({ dark: true, sidebarLogo: false })
        expect(pickPreferences(null)).toEqual({})
    })

    it('sin sesión guarda solo en el navegador', () => {
        const settings = useSettingsStore()
        settings.changeSetting('blogTheme', 'greenNature')

        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).blogTheme).toBe('greenNature')
        vi.advanceTimersByTime(SAVE_DELAY)
        expect(api.put).not.toHaveBeenCalled()
    })

    it('con sesión agrupa cambios seguidos en un solo PUT a la cuenta', async () => {
        useAuthStore().setAuthenticated(true)
        const settings = useSettingsStore()

        settings.changeSetting('theme', '#111111')
        settings.changeSetting('theme', '#222222')
        settings.changeSetting('dark', true)
        expect(settings.syncStatus).toBe('saving')

        vi.advanceTimersByTime(SAVE_DELAY)
        await Promise.resolve()

        expect(api.put).toHaveBeenCalledTimes(1)
        expect(api.put).toHaveBeenCalledWith('/user/preferences', expect.objectContaining({ theme: '#222222', dark: true }))
        expect(settings.syncStatus).toBe('saved')
    })

    it('al iniciar sesión aplica lo guardado en la cuenta', () => {
        const settings = useSettingsStore()
        settings.loadFromUser({ theme: '#11a983', blogTheme: 'darkPurple', desconocida: 1 })

        expect(settings.theme).toBe('#11a983')
        expect(settings.blogTheme).toBe('darkPurple')
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).theme).toBe('#11a983')
    })

    it('si la cuenta no tiene preferencias sube las del navegador', () => {
        useAuthStore().setAuthenticated(true)
        const settings = useSettingsStore()
        settings.changeSetting('sidebarLogo', true)
        vi.advanceTimersByTime(SAVE_DELAY)
        api.put.mockClear()

        settings.loadFromUser(null)
        vi.advanceTimersByTime(SAVE_DELAY)

        expect(api.put).toHaveBeenCalledWith('/user/preferences', expect.objectContaining({ sidebarLogo: true }))
    })

    it('aplica cambios hechos en otra pestaña e ignora valores corruptos', () => {
        const settings = useSettingsStore()
        settings.syncFromStorage(JSON.stringify({ dark: true, theme: 'no-es-color', blogTheme: 'dark' }))
        expect(settings.dark).toBe(true)
        expect(settings.blogTheme).toBe('dark')

        expect(() => settings.syncFromStorage('{roto')).not.toThrow()
    })
})
