import { defineStore } from 'pinia'

// Pestañas del admin (tags-view): una por página visitada, como las del navegador.
// Se guardan en sessionStorage para que sobrevivan a una recarga de esta pestaña del navegador.
const STORAGE_KEY = 'tagsView'

// "Inicio" siempre está y no se puede cerrar
const AFFIX = { name: 'Dashboard', path: '/admin/dashboard', fullPath: '/admin/dashboard', title: 'Inicio', affix: true }

/** @typedef {{ name: string, path: string, fullPath: string, title: string, affix?: boolean }} TagView */

const readSaved = () => {
    try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
        return Array.isArray(saved) ? saved.filter(view => view?.path && view.name !== AFFIX.name) : []
    } catch {
        return []
    }
}

// solo páginas del panel; los formularios (crear/editar post) se marcan con meta.noTag
export const isTaggable = route =>
    route.path.startsWith('/admin') && !!route.name && !route.meta?.noTag && !route.meta?.hidden

export const useTagsViewStore = defineStore('tagsView', {
    state: () => ({
        /** @type {TagView[]} */
        visitedViews: [AFFIX, ...readSaved()],
        // nombres de las vistas que KeepAlive conserva (coinciden con el name del componente)
        /** @type {string[]} */
        cachedViews: [],
    }),
    actions: {
        persist() {
            try {
                sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.visitedViews.filter(view => !view.affix)))
            } catch {
                // sin almacenamiento las pestañas duran hasta recargar
            }
        },
        addView(route) {
            if (!isTaggable(route)) return
            const view = {
                name: String(route.name),
                path: route.path,
                fullPath: route.fullPath,
                title: route.meta?.title || String(route.name),
            }
            const existing = this.visitedViews.find(v => v.path === view.path)
            if (existing) {
                // misma página con otra query (?tab=...): se actualiza el destino de la pestaña
                existing.fullPath = view.fullPath
            } else {
                this.visitedViews.push(view)
            }
            if (!route.meta?.noCache && !this.cachedViews.includes(view.name)) {
                this.cachedViews.push(view.name)
            }
            this.persist()
        },
        delView(view) {
            if (view.affix) return
            this.visitedViews = this.visitedViews.filter(v => v.path !== view.path)
            this.delCachedView(view)
            this.persist()
        },
        delCachedView(view) {
            this.cachedViews = this.cachedViews.filter(name => name !== view.name)
        },
        delOthersViews(view) {
            this.visitedViews = this.visitedViews.filter(v => v.affix || v.path === view.path)
            this.cachedViews = this.cachedViews.filter(name => name === view.name)
            this.persist()
        },
        delAllViews() {
            this.visitedViews = this.visitedViews.filter(v => v.affix)
            this.cachedViews = []
            this.persist()
        },
        // al cerrar sesión: el siguiente usuario empieza solo con Inicio
        reset() {
            this.visitedViews = [AFFIX]
            this.cachedViews = []
            this.persist()
        },
    },
})
