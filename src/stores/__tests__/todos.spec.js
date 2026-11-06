import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { api } from './mocks'

vi.mock('~/plugins/axios', () => ({ default: api }))

const { useTodosStore, compareTodos, isOverdue, today } = await import('../todos')

const todo = (id, extra = {}) => ({ id, title: `t${id}`, notes: null, due_on: null, done: false, completed_at: null, created_at: '', ...extra })

describe('todos store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.resetAllMocks()
    })

    it('ordena pendientes por fecha (sin fecha al final) y luego las hechas, la más reciente arriba', () => {
        const list = [
            todo(1, { done: true, completed_at: '2026-11-01T10:00:00Z' }),
            todo(2),
            todo(3, { due_on: '2026-12-01' }),
            todo(4, { done: true, completed_at: '2026-11-05T10:00:00Z' }),
            todo(5, { due_on: '2026-11-07' }),
            todo(6),
        ]
        expect(list.sort(compareTodos).map(t => t.id)).toEqual([5, 3, 6, 2, 4, 1])
    })

    it('una tarea vencida es la pendiente con fecha anterior a hoy', () => {
        expect(isOverdue(todo(1, { due_on: '2000-01-01' }))).toBe(true)
        expect(isOverdue(todo(1, { due_on: today() }))).toBe(false)
        expect(isOverdue(todo(1, { due_on: '2000-01-01', done: true }))).toBe(false)
    })

    it('carga una sola vez salvo que se fuerce', async () => {
        api.get.mockResolvedValue({ data: [todo(1)] })
        const store = useTodosStore()

        await store.load()
        await store.load()
        expect(api.get).toHaveBeenCalledTimes(1)

        await store.load(true)
        expect(api.get).toHaveBeenCalledTimes(2)
    })

    it('marcar como hecha se ve al instante y se deshace si el API falla', async () => {
        const store = useTodosStore()
        store.items = [todo(1)]
        let reject
        api.patch.mockReturnValue(new Promise((_, r) => { reject = r }))

        const pending = store.toggle(1)
        expect(store.items[0].done).toBe(true)
        expect(store.items[0].completed_at).not.toBeNull()
        expect(store.pendingCount).toBe(0)

        reject(new Error('sin red'))
        await expect(pending).rejects.toThrow()
        expect(store.items[0].done).toBe(false)
        expect(store.items[0].completed_at).toBeNull()
    })

    it('limpiar hechas deja solo las pendientes', async () => {
        const store = useTodosStore()
        store.items = [todo(1, { done: true }), todo(2), todo(3, { done: true })]
        api.delete.mockResolvedValue({ data: { count: 2 } })

        await store.clearCompleted()
        expect(api.delete).toHaveBeenCalledWith('/todos/completed')
        expect(store.items.map(t => t.id)).toEqual([2])
    })
})
