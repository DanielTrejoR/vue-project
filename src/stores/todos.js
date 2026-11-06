import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Lista de tareas personal: la usan el admin (Tareas) y el sitio (Mi espacio) con el mismo estado,
// así que lo hecho en un lado ya se ve en el otro sin volver a pedirlo.

/** @typedef {{ id: number, title: string, notes: string | null, due_on: string | null, done: boolean, completed_at: string | null, created_at: string }} Todo */

// el mismo orden que el API: pendientes primero (las que vencen antes arriba, sin fecha al final),
// luego las hechas de la más reciente a la más vieja
/** @param {Todo} a @param {Todo} b */
export const compareTodos = (a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.done) return (b.completed_at ?? '').localeCompare(a.completed_at ?? '') || b.id - a.id
    if (!a.due_on !== !b.due_on) return a.due_on ? -1 : 1
    return (a.due_on ?? '').localeCompare(b.due_on ?? '') || b.id - a.id
}

// fecha local en YYYY-MM-DD (toISOString daría la de UTC y de noche cambiaría el día)
export const today = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/** @param {Todo} todo */
export const isOverdue = todo => !todo.done && !!todo.due_on && todo.due_on < today()

export const useTodosStore = defineStore('todos', {
    state: () => ({
        /** @type {Todo[]} */
        items: [],
        loaded: false,
        loading: false,
        error: '',
    }),
    getters: {
        sorted: state => [...state.items].sort(compareTodos),
        pendingCount: state => state.items.filter(t => !t.done).length,
        doneCount: state => state.items.filter(t => t.done).length,
        overdueCount: state => state.items.filter(isOverdue).length,
        // para el calendario: las que tienen fecha, por día (YYYY-MM-DD), pendientes primero
        /** @returns {Record<string, Todo[]>} */
        byDay() {
            /** @type {Record<string, Todo[]>} */
            const days = {}
            for (const todo of this.sorted) {
                if (todo.due_on) (days[todo.due_on] ??= []).push(todo)
            }
            return days
        },
        /** @returns {Todo[]} pendientes sin fecha: las que faltan por acomodar en el calendario */
        undated() {
            return this.sorted.filter(t => !t.done && !t.due_on)
        },
    },
    actions: {
        // una vez por sesión; force para el botón de recargar
        async load(force = false) {
            if ((this.loaded && !force) || this.loading) return
            this.loading = true
            this.error = ''
            try {
                const { data } = await axiosClient.get('/todos')
                this.items = data
                this.loaded = true
            } catch {
                this.error = 'No se pudieron cargar tus tareas.'
            } finally {
                this.loading = false
            }
        },

        /** @param {{ title: string, notes?: string | null, due_on?: string | null }} todo */
        async add(todo) {
            const { data } = await axiosClient.post('/todos', todo)
            this.items.push(data)
            return data
        },

        // se ve al instante y, si el API falla, vuelve a como estaba
        /** @param {number} id @param {Partial<Pick<Todo, 'title' | 'notes' | 'due_on' | 'done'>>} changes */
        async update(id, changes) {
            const index = this.items.findIndex(t => t.id === id)
            if (index < 0) return
            const before = this.items[index]
            const optimistic = { ...before, ...changes }
            if ('done' in changes) optimistic.completed_at = changes.done ? (before.completed_at ?? new Date().toISOString()) : null
            this.items[index] = optimistic
            try {
                const { data } = await axiosClient.patch(`/todos/${id}`, changes)
                const current = this.items.findIndex(t => t.id === id)
                if (current >= 0) this.items[current] = data
                return data
            } catch (error) {
                const current = this.items.findIndex(t => t.id === id)
                if (current >= 0) this.items[current] = before
                throw error
            }
        },

        /** @param {number} id */
        toggle(id) {
            const todo = this.items.find(t => t.id === id)
            return todo ? this.update(id, { done: !todo.done }) : undefined
        },

        /** @param {number} id */
        async remove(id) {
            await axiosClient.delete(`/todos/${id}`)
            this.items = this.items.filter(t => t.id !== id)
        },

        async clearCompleted() {
            const { data } = await axiosClient.delete('/todos/completed')
            this.items = this.items.filter(t => !t.done)
            return data
        },
    },
})
