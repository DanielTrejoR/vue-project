import { defineStore } from 'pinia'
import axiosClient from '~/plugins/axios'

// Drive personal: carpetas y archivos privados del usuario. Lo usan el explorador del admin
// y el selector de adjuntos de los posts.

/** @typedef {{ id: number, name: string, parent_id: number | null, folders_count: number, files_count: number, created_at: string }} Folder */
/** @typedef {{ id: number, original_name: string, name: string, extension: string, mime_type: string, size: number, kind: string, width: number | null, height: number | null, checksum: string, folder_id: number | null, url: string, created_at: string, posts_count?: number, duplicate_of?: number | null }} DriveFile */
/** @typedef {{ uid: number, name: string, progress: number, status: 'uploading' | 'done' | 'error', error: string }} Upload */

const BASE = '/admin/drive'

// el File no es serializable: se guarda aparte (con su carpeta de origen) para poder reintentar
/** @type {Map<number, { file: File, folderId: number | null }>} */
const pending = new Map()
let nextUid = 1
// solo la última carga de la lista manda; las respuestas viejas se ignoran
let seq = 0
// cambia al cerrar sesión: lo que siga en vuelo ya no toca el estado
let generation = 0

// mensaje legible de un error del API: primer error de validación (422), luego `message`, luego el de respaldo
/** @param {any} e @param {string} fallback */
export const apiMessage = (e, fallback) => {
    const errors = e?.response?.data?.errors
    const first = errors && Object.values(errors).flat()[0]
    return first || e?.response?.data?.message || fallback
}

export const useDriveStore = defineStore('drive', {
    state: () => ({
        /** @type {Folder | null} */
        folder: null,
        /** @type {{ id: number, name: string }[]} */
        breadcrumbs: [],
        /** @type {Folder[]} */
        folders: [],
        /** @type {DriveFile[]} */
        files: [],
        query: '',
        loading: false,
        error: '',
        /** @type {Upload[]} */
        uploads: [],
    }),
    actions: {
        /** @param {Record<string, any>} params */
        async fetch(params) {
            const id = ++seq
            this.loading = true
            this.error = ''
            try {
                const { data } = await axiosClient.get(BASE, { params })
                if (id !== seq) return
                this.folder = data.folder
                this.breadcrumbs = data.breadcrumbs
                this.folders = data.folders
                this.files = data.files
            } catch {
                if (id === seq) this.error = 'No se pudo cargar el drive.'
            } finally {
                if (id === seq) this.loading = false
            }
        },

        /** @param {number | null} folderId */
        open(folderId) {
            this.query = ''
            return this.fetch(folderId ? { folder: folderId } : {})
        },

        /** @param {string} q */
        search(q) {
            this.query = q
            return this.fetch({ q })
        },

        /** @param {string} name */
        async createFolder(name) {
            const body = this.folder ? { name, parent_id: this.folder.id } : { name }
            const { data } = await axiosClient.post(`${BASE}/folders`, body)
            this.folders.push(data)
            return data
        },

        /** @param {number} id @param {string} name */
        async renameFolder(id, name) {
            const { data } = await axiosClient.patch(`${BASE}/folders/${id}`, { name })
            const i = this.folders.findIndex(f => f.id === id)
            if (i >= 0) this.folders[i] = data
            return data
        },

        // sale de la lista actual: ya no es hija de esta carpeta
        /** @param {number} id @param {number | null} parentId */
        async moveFolder(id, parentId) {
            const { data } = await axiosClient.patch(`${BASE}/folders/${id}`, { parent_id: parentId })
            this.folders = this.folders.filter(f => f.id !== id)
            return data
        },

        /** @param {number} id */
        async deleteFolder(id) {
            const { data } = await axiosClient.delete(`${BASE}/folders/${id}`)
            this.folders = this.folders.filter(f => f.id !== id)
            return data
        },

        /** @param {File} file */
        upload(file) {
            /** @type {Upload} */
            const entry = { uid: nextUid++, name: file.name, progress: 0, status: 'uploading', error: '' }
            this.uploads.push(entry)
            pending.set(entry.uid, { file, folderId: this.folder?.id ?? null })
            return this.send(entry.uid)
        },

        /** @param {number} uid */
        retryUpload(uid) {
            if (this.uploads.find(u => u.uid === uid)?.status !== 'error') return
            return this.send(uid)
        },

        // quita del listado una subida fallida (y su archivo pendiente)
        /** @param {number} uid */
        dismissUpload(uid) {
            const i = this.uploads.findIndex(u => u.uid === uid)
            if (i < 0 || this.uploads[i].status === 'uploading') return
            this.uploads.splice(i, 1)
            pending.delete(uid)
        },

        // se opera por uid sobre el estado reactivo (no sobre el objeto original)
        /** @param {number} uid */
        async send(uid) {
            const job = pending.get(uid)
            const entry = this.uploads.find(u => u.uid === uid)
            if (!job || !entry) return
            const { file, folderId } = job
            const session = generation
            entry.status = 'uploading'
            entry.progress = 0
            entry.error = ''
            const form = new FormData()
            form.append('file', file)
            if (folderId) form.append('folder_id', String(folderId))
            try {
                const { data } = await axiosClient.post(`${BASE}/files`, form, {
                    onUploadProgress: (/** @type {{ loaded: number, total?: number }} */ e) => {
                        if (session === generation && e.total) entry.progress = Math.round((e.loaded / e.total) * 100)
                    },
                })
                if (session !== generation) return
                entry.progress = 100
                entry.status = 'done'
                pending.delete(uid)
                // solo si sigue en la carpeta donde se subió (y no es una búsqueda)
                if ((this.folder?.id ?? null) === folderId && !this.query) this.files.unshift(data)
                return data
            } catch (e) {
                if (session !== generation) return
                entry.status = 'error'
                entry.error = apiMessage(e, 'No se pudo subir el archivo.')
            }
        },

        // al cerrar sesión: vacía el estado, descarta lo pendiente e ignora lo que siga en vuelo
        clear() {
            generation++
            seq++
            pending.clear()
            this.$reset()
        },

        /** @param {number} id @param {string} name */
        async renameFile(id, name) {
            const { data } = await axiosClient.patch(`${BASE}/files/${id}`, { original_name: name })
            const i = this.files.findIndex(f => f.id === id)
            if (i >= 0) this.files[i] = data
            return data
        },

        /** @param {number} id @param {number | null} folderId */
        async moveFile(id, folderId) {
            const { data } = await axiosClient.patch(`${BASE}/files/${id}`, { folder_id: folderId })
            this.files = this.files.filter(f => f.id !== id)
            return data
        },

        /** @param {number} id */
        async deleteFile(id) {
            await axiosClient.delete(`${BASE}/files/${id}`)
            this.files = this.files.filter(f => f.id !== id)
        },

        /** @returns {Promise<{ id: number, name: string, parent_id: number | null }[]>} */
        async tree() {
            const { data } = await axiosClient.get(`${BASE}/tree`)
            return data
        },
    },
})
