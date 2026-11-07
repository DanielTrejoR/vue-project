<template>
<div class="drive">
    <div class="drive-bar">
        <el-breadcrumb separator="/" class="drive-crumbs">
            <el-breadcrumb-item>
                <a href="#" @click.prevent="go(null)">Mi drive</a>
            </el-breadcrumb-item>
            <template v-if="!store.query">
                <el-breadcrumb-item v-for="crumb in store.breadcrumbs" :key="crumb.id">
                    <a href="#" @click.prevent="go(crumb.id)">{{ crumb.name }}</a>
                </el-breadcrumb-item>
                <el-breadcrumb-item v-if="store.folder">{{ store.folder.name }}</el-breadcrumb-item>
            </template>
            <el-breadcrumb-item v-else>Resultados de «{{ store.query }}»</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="drive-bar__actions">
            <el-input v-model="search" :prefix-icon="Search" placeholder="Buscar archivos…" clearable class="drive-search" aria-label="Buscar archivos" />
            <el-button icon="FolderAdd" @click="newFolder">Nueva carpeta</el-button>
            <el-upload multiple :show-file-list="false" :http-request="send" class="drive-upload-btn">
                <el-button type="primary" icon="Upload">Subir</el-button>
            </el-upload>
        </div>
    </div>

    <el-upload drag multiple :show-file-list="false" :http-request="send" class="drive-drop">
        <span class="drive-drop__text">Arrastra archivos aquí o <em>haz clic para subir</em> (máx. 20 MB)</span>
    </el-upload>

    <ul v-if="store.uploads.length" class="drive-uploads">
        <li v-for="up in store.uploads" :key="up.uid" class="drive-uploads__item">
            <span class="drive-uploads__name">{{ up.name }}</span>
            <el-progress v-if="up.status === 'uploading'" :percentage="up.progress" class="drive-uploads__bar" />
            <span v-else-if="up.status === 'done'" class="drive-uploads__ok">Subido</span>
            <span v-else class="drive-uploads__error">{{ up.error }}</span>
            <el-button v-if="up.status === 'error'" size="small" @click="store.retryUpload(up.uid)">Reintentar</el-button>
            <el-button v-if="up.status !== 'uploading'" size="small" text @click="store.dismissUpload(up.uid)">Quitar</el-button>
        </li>
    </ul>

    <el-alert v-if="store.error" :title="store.error" type="error" show-icon :closable="false" class="mb-4">
        <el-button size="small" @click="reload">Reintentar</el-button>
    </el-alert>

    <el-table
        ref="table"
        v-loading="store.loading"
        :data="rows"
        row-key="key"
        class="drive-table"
        @row-dblclick="openRow"
        @selection-change="onSelection"
    >
        <el-table-column v-if="mode === 'select'" type="selection" width="44" reserve-selection :selectable="(row: Row) => !!row.file" />
        <el-table-column label="Nombre" min-width="220">
            <template #default="{ row }">
                <div class="drive-name">
                    <div class="drive-thumb">
                        <img v-if="row.file?.kind === 'image'" :src="row.file.url" :alt="row.file.original_name" loading="lazy">
                        <el-icon v-else :size="22"><component :is="row.folder ? 'Folder' : kindIcon(row.file!.kind)" /></el-icon>
                    </div>
                    <!-- la carpeta es un botón: se abre con teclado, lector de pantalla y toque; el doble clic queda como atajo -->
                    <button v-if="row.folder" type="button" class="drive-name__text drive-name__link" @click.stop="go(row.folder.id)">{{ row.folder.name }}</button>
                    <span v-else class="drive-name__text">{{ row.file!.original_name }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" label="Tipo" width="90">
            <template #default="{ row }">{{ row.folder ? 'Carpeta' : row.file!.extension.toUpperCase() }}</template>
        </el-table-column>
        <el-table-column label="Tamaño" width="100">
            <template #default="{ row }">{{ row.file ? formatBytes(row.file.size) : countFiles(row.folder!.files_count) }}</template>
        </el-table-column>
        <el-table-column v-if="!isMobile" label="Fecha" width="150">
            <template #default="{ row }">
                <span :title="fullDate(created(row))">{{ fromNow(created(row)) }}</span>
            </template>
        </el-table-column>
        <el-table-column v-if="!isMobile" label="Uso" width="110">
            <template #default="{ row }">
                <el-tag v-if="row.file?.posts_count" size="small" type="info" effect="plain">en {{ row.file.posts_count }} post{{ row.file.posts_count === 1 ? '' : 's' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column v-if="mode === 'manage'" label="" width="96" align="right">
            <template #default="{ row }">
                <!-- el doble clic rápido sobre los botones no debe abrir la carpeta -->
                <div class="drive-actions" @dblclick.stop>
                <el-dropdown trigger="click" @command="(cmd: string) => onCommand(cmd, row)">
                    <el-button text circle size="small" icon="MoreFilled" aria-label="Acciones" />
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="rename">Renombrar</el-dropdown-item>
                            <el-dropdown-item command="move">Mover a…</el-dropdown-item>
                            <el-dropdown-item v-if="row.file" command="download">Descargar</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
                <!-- la carpeta pide primero cuánto arrastra (todo su árbol); el archivo confirma en el momento -->
                <el-button v-if="row.folder" text circle size="small" type="danger" icon="Delete" aria-label="Borrar" @click="confirmDeleteFolder(row)" />
                <el-popconfirm v-else :title="deleteTitle(row)" confirm-button-text="Borrar" cancel-button-text="Cancelar" confirm-button-type="danger" width="240" @confirm="remove(row)">
                    <template #reference>
                        <el-button text circle size="small" type="danger" icon="Delete" aria-label="Borrar" />
                    </template>
                </el-popconfirm>
                </div>
            </template>
        </el-table-column>
        <template #empty>{{ store.query ? 'Sin resultados.' : 'Esta carpeta está vacía.' }}</template>
    </el-table>

    <el-image-viewer v-if="viewer" :url-list="[viewer]" teleported @close="viewer = ''" />

    <MoveDialog
        ref="moveDialog"
        v-model="showMove"
        :name="moving ? label(moving) : ''"
        :exclude="moving?.folder?.id ?? null"
        @confirm="doMove"
    />
</div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onActivated, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import MoveDialog from './MoveDialog.vue'
import { useAppStore } from '~/stores/app'
import { useDriveStore, apiMessage } from '~/stores/drive'
import { formatBytes, kindIcon } from '~/utils/files'
import { fromNow, fullDate } from '~/utils/dates'

interface FolderItem { id: number, name: string, parent_id: number | null, folders_count: number, files_count: number, created_at: string }
interface FileItem { id: number, original_name: string, extension: string, kind: string, size: number, url: string, created_at: string, posts_count?: number }
interface Row { key: string, folder?: FolderItem, file?: FileItem }
// las filas que entrega el-table llegan como Record<string, any>
type AnyRow = Record<string, any>

const props = withDefaults(defineProps<{ mode?: 'manage' | 'select', selected?: FileItem[] }>(), { mode: 'manage', selected: () => [] })
const emit = defineEmits<{ 'update:selected': [FileItem[]] }>()

const store = useDriveStore()
const route = useRoute()
const router = useRouter()
const isMobile = computed(() => useAppStore().isMobile)

const table = ref()
const moveDialog = ref<InstanceType<typeof MoveDialog>>()
const viewer = ref('')
const search = ref('')
const showMove = ref(false)
const moving = ref<AnyRow | null>(null)

const rows = computed<Row[]>(() => [
    ...store.folders.map(folder => ({ key: `d${folder.id}`, folder }) as Row),
    ...store.files.map(file => ({ key: `f${file.id}`, file }) as Row),
])

const label = (row: AnyRow) => row.folder?.name ?? row.file!.original_name
const created = (row: AnyRow) => (row.folder ?? row.file)!.created_at

// --- carpeta actual: en manage vive en la URL (?folder=), en select es local ---
const localFolder = ref<number | null>(null)
const folderParam = () => {
    const raw = route.query.folder
    const id = Number(Array.isArray(raw) ? raw[0] : raw)
    return Number.isInteger(id) && id > 0 ? id : null
}
const currentFolder = () => (props.mode === 'manage' ? folderParam() : localFolder.value)

const go = (id: number | null) => {
    search.value = ''
    if (props.mode === 'manage') {
        // mismo destino: la URL no cambia, así que se recarga a mano
        if (id === folderParam()) return store.open(id)
        router.push({ query: id ? { folder: id } : {} })
    } else {
        localFolder.value = id
        store.open(id)
    }
}

const reload = () => (store.query ? store.search(store.query) : store.open(currentFolder()))

// KeepAlive: el componente sigue vivo en otras rutas; solo reacciona en la suya
watch(() => route.query.folder, () => {
    if (props.mode === 'manage' && route.name === 'DriveIndex') {
        search.value = ''
        store.open(folderParam())
    }
})
onMounted(() => store.open(currentFolder()))
// KeepAlive: al volver a la página la URL manda (puede no traer ?folder=) y el store pudo cambiar mientras tanto.
// La primera activación coincide con onMounted: se salta para no pedir dos veces.
let activatedOnce = false
onActivated(() => {
    if (!activatedOnce) {
        activatedOnce = true
        return
    }
    if (props.mode === 'manage') {
        search.value = ''
        store.open(folderParam())
    }
})

// --- buscador con debounce ---
let timer: ReturnType<typeof setTimeout> | undefined
watch(search, value => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        const q = value.trim()
        if (q) store.search(q)
        else if (store.query) store.open(currentFolder())
    }, 300)
})
onBeforeUnmount(() => clearTimeout(timer))

// --- subidas: las terminadas se quitan solas a los 3 s; las fallidas esperan Reintentar o Quitar ---
const dismissTimers = new Map<number, ReturnType<typeof setTimeout>>()
watch(() => store.uploads.map(u => `${u.uid}:${u.status}`), () => {
    for (const up of store.uploads) {
        if (up.status !== 'done' || dismissTimers.has(up.uid)) continue
        dismissTimers.set(up.uid, setTimeout(() => {
            dismissTimers.delete(up.uid)
            store.dismissUpload(up.uid)
        }, 3000))
    }
})
onBeforeUnmount(() => dismissTimers.forEach(clearTimeout))
const send = async (options: UploadRequestOptions) => {
    const result = await store.upload(options.file)
    if (!result) throw new Error('upload failed')
}

// --- selección (solo select): se guardan objetos File y se conserva entre carpetas ---
const onSelection = (list: Row[]) => {
    if (props.mode === 'select') emit('update:selected', list.map(r => r.file!))
}
watch(rows, async () => {
    if (props.mode !== 'select' || !props.selected.length) return
    await nextTick()
    const ids = new Set(props.selected.map(f => f.id))
    for (const row of rows.value) if (row.file && ids.has(row.file.id)) table.value?.toggleRowSelection(row, true)
})

// --- filas ---
const openRow = (row: AnyRow) => {
    if (row.folder) go(row.folder.id)
    else if (row.file?.kind === 'image') viewer.value = row.file.url
}

const countFiles = (n: number) => `${n} archivo${n === 1 ? '' : 's'}`

const deleteTitle = (row: AnyRow) => {
    const n = row.file!.posts_count ?? 0
    return n > 0 ? `¿Borrar «${row.file!.original_name}»? Está en ${n} post${n === 1 ? '' : 's'}.` : `¿Borrar «${row.file!.original_name}»?`
}

// avisa de todo lo que se borra con la carpeta: archivos de todo el árbol y cuántos están en posts
const confirmDeleteFolder = async (row: AnyRow) => {
    const folder = row.folder!
    let summary
    try {
        summary = await store.folderSummary(folder.id)
    } catch (e) {
        return fail(e, 'No se pudo calcular el contenido de la carpeta.')
    }
    const inPosts = summary.files_in_posts
    const detail = summary.files_total === 0
        ? 'La carpeta no tiene archivos.'
        : `Se borrarán ${countFiles(summary.files_total)}${inPosts ? ` (${inPosts === 1 ? 'está' : 'están'} ${inPosts} en posts)` : ''}.`
    try {
        await ElMessageBox.confirm(`${detail} No se puede deshacer.`, `¿Borrar la carpeta «${folder.name}»?`, {
            confirmButtonText: 'Borrar',
            cancelButtonText: 'Cancelar',
            type: 'warning',
            confirmButtonClass: 'el-button--danger',
        })
    } catch {
        return // cancelado
    }
    await remove(row)
}

const fail = (e: unknown, fallback: string) => ElMessage.error(apiMessage(e, fallback))

const remove = async (row: AnyRow) => {
    try {
        if (row.folder) await store.deleteFolder(row.folder.id)
        else await store.deleteFile(row.file!.id)
    } catch (e) {
        fail(e, 'No se pudo borrar.')
    }
}

// prompt que se queda abierto si el API rechaza el nombre (422)
const askName = async (title: string, value: string, action: (name: string) => Promise<unknown>) => {
    try {
        await ElMessageBox.prompt('', title, {
            inputValue: value,
            inputPattern: /\S/,
            inputErrorMessage: 'Escribe un nombre.',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            beforeClose: async (act, instance, done) => {
                if (act !== 'confirm') return done()
                instance.confirmButtonLoading = true
                try {
                    await action(instance.inputValue.trim())
                    done()
                } catch (e) {
                    instance.editorErrorMessage = apiMessage(e, 'No se pudo guardar.')
                } finally {
                    instance.confirmButtonLoading = false
                }
            },
        })
    } catch {
        // cancelado
    }
}

const newFolder = () => askName('Nueva carpeta', '', name => store.createFolder(name))

const onCommand = (cmd: string, row: AnyRow) => {
    if (cmd === 'rename') {
        askName('Renombrar', label(row), name => (row.folder ? store.renameFolder(row.folder.id, name) : store.renameFile(row.file!.id, name)))
    } else if (cmd === 'move') {
        moving.value = row
        showMove.value = true
    } else if (cmd === 'download' && row.file) {
        const a = document.createElement('a')
        // ?download=1: el API fuerza la descarga (si no, imágenes y PDF se abrirían en esta pestaña)
        a.href = `${row.file.url}?download=1`
        a.download = row.file.original_name
        a.click()
    }
}

const doMove = async (target: number | null) => {
    const row = moving.value
    if (!row) return
    moveDialog.value?.setSaving(true)
    try {
        if (row.folder) await store.moveFolder(row.folder.id, target)
        else await store.moveFile(row.file!.id, target)
        showMove.value = false
    } catch (e) {
        fail(e, 'No se pudo mover.')
    } finally {
        moveDialog.value?.setSaving(false)
    }
}
</script>

<style scoped>
.drive {
    text-align: left;
}

.drive-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.drive-name__link {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
}

.drive-name__link:hover {
    text-decoration: underline;
}

.drive-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
}

.drive-bar__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.drive-search {
    width: 220px;
}

.drive-crumbs a {
    color: inherit;
    text-decoration: none;
}

.drive-crumbs a:hover {
    text-decoration: underline;
}

.drive-drop {
    margin-bottom: 12px;
}

.drive-drop :deep(.ep-upload-dragger) {
    padding: 14px;
}

.drive-drop__text {
    color: var(--ep-text-color-secondary);
    font-size: 14px;
}

.drive-drop__text em {
    color: var(--ep-color-primary);
    font-style: normal;
}

.drive-uploads {
    list-style: none;
    margin: 0 0 12px;
    padding: 0;
}

.drive-uploads__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
    font-size: 13px;
}

.drive-uploads__name {
    flex: 0 1 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.drive-uploads__bar {
    flex: 1;
}

.drive-uploads__ok {
    color: var(--ep-color-success);
}

.drive-uploads__error {
    color: var(--ep-color-danger);
}

.drive-name {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.drive-name__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.drive-thumb {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    overflow: hidden;
    border-radius: 4px;
    background: var(--ep-fill-color-light);
    color: var(--ep-text-color-secondary);
}

.drive-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.drive-table :deep(.ep-table__row) {
    user-select: none;
}
</style>
