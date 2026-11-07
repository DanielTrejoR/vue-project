import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { api } from './mocks'

vi.mock('~/plugins/axios', () => ({ default: api }))

const { useDriveStore, apiMessage } = await import('../drive')
const { formatBytes, kindIcon } = await import('~/utils/files')

const file = (id, extra = {}) => ({ id, original_name: `f${id}.png`, kind: 'image', folder_id: null, ...extra })
const folder = (id, extra = {}) => ({ id, name: `c${id}`, parent_id: null, ...extra })
const browser = (extra = {}) => ({ data: { folder: null, breadcrumbs: [], folders: [], files: [], ...extra } })
const blob = (name = 'a.png') => new File(['x'], name)

describe('drive store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.resetAllMocks()
    })

    it('open llena carpeta, migas, carpetas y archivos', async () => {
        api.get.mockResolvedValue(browser({
            folder: folder(2, { parent_id: 1 }),
            breadcrumbs: [{ id: 1, name: 'c1' }],
            folders: [folder(3, { parent_id: 2 })],
            files: [file(9, { folder_id: 2 })],
        }))
        const store = useDriveStore()

        await store.open(2)

        expect(api.get).toHaveBeenCalledWith('/admin/drive', { params: { folder: 2 } })
        expect(store.folder.id).toBe(2)
        expect(store.breadcrumbs).toEqual([{ id: 1, name: 'c1' }])
        expect(store.folders).toHaveLength(1)
        expect(store.files.map(f => f.id)).toEqual([9])
        expect(store.query).toBe('')
    })

    it('open(null) pide la raíz sin parámetro de carpeta', async () => {
        api.get.mockResolvedValue(browser())
        await useDriveStore().open(null)
        expect(api.get).toHaveBeenCalledWith('/admin/drive', { params: {} })
    })

    it('search busca en todo el drive', async () => {
        api.get.mockResolvedValue(browser({ files: [file(1)] }))
        const store = useDriveStore()
        await store.search('inf')
        expect(api.get).toHaveBeenCalledWith('/admin/drive', { params: { q: 'inf' } })
        expect(store.query).toBe('inf')
        expect(store.files).toHaveLength(1)
    })

    it('un error al abrir deja el mensaje', async () => {
        api.get.mockRejectedValue(new Error('x'))
        const store = useDriveStore()
        await store.open(null)
        expect(store.error).not.toBe('')
        expect(store.loading).toBe(false)
    })

    it('upload exitoso agrega el archivo y lo marca como hecho', async () => {
        const store = useDriveStore()
        store.folder = folder(2)
        api.post.mockImplementation(async (url, body, config) => {
            config.onUploadProgress({ loaded: 1, total: 2 })
            expect(store.uploads[0].progress).toBe(50)
            return { data: file(5, { folder_id: 2, duplicate_of: null }) }
        })

        await store.upload(blob())

        const [url, body] = api.post.mock.calls[0]
        expect(url).toBe('/admin/drive/files')
        expect(body.get('folder_id')).toBe('2')
        expect(body.get('file')).toBeInstanceOf(File)
        expect(store.uploads[0]).toMatchObject({ status: 'done', progress: 100 })
        expect(store.files.map(f => f.id)).toEqual([5])
    })

    it('no inserta el archivo si ya se cambió de carpeta', async () => {
        const store = useDriveStore()
        store.folder = folder(2)
        api.post.mockImplementation(async () => {
            store.folder = folder(3)
            return { data: file(5, { folder_id: 2 }) }
        })
        await store.upload(blob())
        expect(store.files).toEqual([])
        expect(store.uploads[0].status).toBe('done')
    })

    it('upload con 422 marca error con el mensaje del API y retryUpload lo reintenta', async () => {
        const store = useDriveStore()
        api.post.mockRejectedValueOnce({ response: { status: 422, data: { message: 'x', errors: { file: ['Tipo no permitido.'] } } } })

        await store.upload(blob())

        expect(store.uploads[0]).toMatchObject({ status: 'error', error: 'Tipo no permitido.' })
        expect(store.files).toEqual([])

        api.post.mockResolvedValueOnce({ data: file(7) })
        await store.retryUpload(store.uploads[0].uid)

        expect(api.post).toHaveBeenCalledTimes(2)
        expect(store.uploads).toHaveLength(1)
        expect(store.uploads[0]).toMatchObject({ status: 'done', error: '' })
        expect(store.files.map(f => f.id)).toEqual([7])
    })

    it('moveFile lo quita de la lista actual', async () => {
        const store = useDriveStore()
        store.files = [file(1), file(2)]
        api.patch.mockResolvedValue({ data: file(1, { folder_id: 4 }) })
        await store.moveFile(1, 4)
        expect(api.patch).toHaveBeenCalledWith('/admin/drive/files/1', { folder_id: 4 })
        expect(store.files.map(f => f.id)).toEqual([2])
    })

    it('renameFile actualiza el archivo en su lugar', async () => {
        const store = useDriveStore()
        store.files = [file(1)]
        api.patch.mockResolvedValue({ data: file(1, { original_name: 'nuevo.png' }) })
        await store.renameFile(1, 'nuevo')
        expect(api.patch).toHaveBeenCalledWith('/admin/drive/files/1', { original_name: 'nuevo' })
        expect(store.files[0].original_name).toBe('nuevo.png')
    })

    it('deleteFile lo quita de la lista', async () => {
        const store = useDriveStore()
        store.files = [file(1), file(2)]
        api.delete.mockResolvedValue({ data: {} })
        await store.deleteFile(1)
        expect(store.files.map(f => f.id)).toEqual([2])
    })

    it('createFolder usa la carpeta actual como padre', async () => {
        const store = useDriveStore()
        store.folder = folder(2)
        api.post.mockResolvedValue({ data: folder(8, { parent_id: 2 }) })
        await store.createFolder('Nueva')
        expect(api.post).toHaveBeenCalledWith('/admin/drive/folders', { name: 'Nueva', parent_id: 2 })
        expect(store.folders.map(f => f.id)).toEqual([8])
    })

    it('createFolder no añade la carpeta si ya se navegó a otra', async () => {
        const store = useDriveStore()
        store.folder = folder(2)
        api.post.mockImplementation(async () => {
            store.folder = folder(5)
            return { data: folder(8, { parent_id: 2 }) }
        })
        await store.createFolder('Nueva')
        expect(store.folders).toEqual([])
    })

    it('createFolder no añade la carpeta durante una búsqueda', async () => {
        const store = useDriveStore()
        store.query = 'foto'
        api.post.mockResolvedValue({ data: folder(8) })
        await store.createFolder('Nueva')
        expect(store.folders).toEqual([])
    })

    it('folderSummary pide el resumen de la carpeta', async () => {
        api.get.mockResolvedValue({ data: { files_total: 3, files_in_posts: 1 } })
        expect(await useDriveStore().folderSummary(4)).toEqual({ files_total: 3, files_in_posts: 1 })
        expect(api.get).toHaveBeenCalledWith('/admin/drive/folders/4')
    })

    it('createFolder en la raíz no manda parent_id', async () => {
        const store = useDriveStore()
        api.post.mockResolvedValue({ data: folder(8) })
        await store.createFolder('Nueva')
        expect(api.post).toHaveBeenCalledWith('/admin/drive/folders', { name: 'Nueva' })
    })

    it('renameFolder, moveFolder y deleteFolder actualizan la lista', async () => {
        const store = useDriveStore()
        store.folders = [folder(1), folder(2)]

        api.patch.mockResolvedValueOnce({ data: folder(1, { name: 'otro' }) })
        await store.renameFolder(1, 'otro')
        expect(store.folders[0].name).toBe('otro')

        api.patch.mockResolvedValueOnce({ data: folder(2, { parent_id: 1 }) })
        await store.moveFolder(2, 1)
        expect(api.patch).toHaveBeenLastCalledWith('/admin/drive/folders/2', { parent_id: 1 })
        expect(store.folders.map(f => f.id)).toEqual([1])

        api.delete.mockResolvedValue({ data: { message: 'ok', files_deleted: 3 } })
        const result = await store.deleteFolder(1)
        expect(result.files_deleted).toBe(3)
        expect(store.folders).toEqual([])
    })

    it('tree devuelve el árbol plano', async () => {
        api.get.mockResolvedValue({ data: [{ id: 1, name: 'a', parent_id: null }] })
        expect(await useDriveStore().tree()).toHaveLength(1)
        expect(api.get).toHaveBeenCalledWith('/admin/drive/tree')
    })

    it('una respuesta vieja no pisa a la más reciente y loading dura hasta la última', async () => {
        const store = useDriveStore()
        /** @type {Function[]} */
        const resolvers = []
        api.get.mockImplementation(() => new Promise(r => resolvers.push(r)))

        const a = store.open(1)
        const b = store.open(2)
        resolvers[1](browser({ folder: folder(2) }))
        await b
        expect(store.folder.id).toBe(2)
        expect(store.loading).toBe(false)

        resolvers[0](browser({ folder: folder(1) }))
        await a
        expect(store.folder.id).toBe(2)
    })

    it('loading sigue activo si la respuesta vieja llega antes que la nueva', async () => {
        const store = useDriveStore()
        const resolvers = []
        api.get.mockImplementation(() => new Promise(r => resolvers.push(r)))

        const a = store.open(1)
        const b = store.open(2)
        resolvers[0](browser({ folder: folder(1) }))
        await a
        expect(store.loading).toBe(true)
        expect(store.folder).toBeNull()

        resolvers[1](browser({ folder: folder(2) }))
        await b
        expect(store.loading).toBe(false)
        expect(store.folder.id).toBe(2)
    })

    it('un upload que termina después de clear no toca el estado', async () => {
        const store = useDriveStore()
        let resolve
        api.post.mockReturnValue(new Promise(r => { resolve = r }))
        const pending = store.upload(blob())

        store.clear()
        resolve({ data: file(5) })
        await pending

        expect(store.files).toEqual([])
        expect(store.uploads).toEqual([])
    })

    it('clear descarta los archivos pendientes de reintento', async () => {
        const store = useDriveStore()
        api.post.mockRejectedValue({ response: { data: { message: 'no' } } })
        await store.upload(blob())
        const uid = store.uploads[0].uid
        store.clear()
        store.uploads = [{ uid, name: 'a.png', progress: 0, status: 'error', error: '' }]
        await store.retryUpload(uid)
        expect(api.post).toHaveBeenCalledTimes(1)
    })

    it('retryUpload solo reintenta los que fallaron y vuelve a la carpeta original', async () => {
        const store = useDriveStore()
        store.folder = folder(2)
        api.post.mockRejectedValueOnce({ response: { data: { message: 'no' } } })
        await store.upload(blob())
        const uid = store.uploads[0].uid

        store.folder = folder(3)
        api.post.mockResolvedValueOnce({ data: file(7, { folder_id: 2 }) })
        await store.retryUpload(uid)
        expect(api.post.mock.calls[1][1].get('folder_id')).toBe('2')
        expect(store.files).toEqual([])

        await store.retryUpload(uid)
        expect(api.post).toHaveBeenCalledTimes(2)
    })

    it('dismissUpload quita una subida fallida y su archivo pendiente, pero no una en curso', async () => {
        const store = useDriveStore()
        api.post.mockRejectedValueOnce({ response: { data: { message: 'no' } } })
        await store.upload(blob())
        const uid = store.uploads[0].uid

        store.dismissUpload(uid)
        expect(store.uploads).toEqual([])
        await store.retryUpload(uid)
        expect(api.post).toHaveBeenCalledTimes(1)

        let finish
        api.post.mockReturnValueOnce(new Promise(r => { finish = r }))
        const pendingUpload = store.upload(blob('b.png'))
        store.dismissUpload(store.uploads[0].uid)
        expect(store.uploads).toHaveLength(1)
        finish({ data: file(8) })
        await pendingUpload
    })

    it('apiMessage prefiere el primer error de validación, luego message y luego el respaldo', () => {
        expect(apiMessage({ response: { data: { message: 'x', errors: { name: ['Ya existe.'] } } } }, 'fb')).toBe('Ya existe.')
        expect(apiMessage({ response: { data: { message: 'x' } } }, 'fb')).toBe('x')
        expect(apiMessage(new Error('red'), 'fb')).toBe('fb')
    })

    it('$reset limpia todo', async () => {
        const store = useDriveStore()
        store.files = [file(1)]
        store.query = 'x'
        store.$reset()
        expect(store.files).toEqual([])
        expect(store.query).toBe('')
    })
})

describe('utils/files', () => {
    it('formatBytes', () => {
        expect(formatBytes(0)).toBe('0 B')
        expect(formatBytes(512)).toBe('512 B')
        expect(formatBytes(1536)).toBe('1.5 KB')
        expect(formatBytes(20 * 1024 * 1024)).toBe('20 MB')
    })

    it('kindIcon cae en un ícono por defecto', () => {
        expect(kindIcon('image')).toBe('Picture')
        expect(kindIcon('desconocido')).toBe(kindIcon('other'))
    })
})
