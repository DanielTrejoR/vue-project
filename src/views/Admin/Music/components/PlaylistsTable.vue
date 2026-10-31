<template>
<div>
    <div class="posts-header">
        <p class="muted">Las playlists visibles con al menos una canción aparecen en el reproductor del sitio.</p>
        <div class="posts-header__actions">
            <el-button :loading="loading" @click="load">Recargar</el-button>
            <el-button type="primary" icon="Plus" @click="openForm()">Nueva playlist</el-button>
        </div>
    </div>

    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" class="mb-4" />

    <el-table v-loading="loading" :data="playlists" style="width: 100%">
        <el-table-column label="Playlist" min-width="220">
            <template #default="{ row }">
                <div class="playlist-cell">
                    <strong>{{ row.name }}</strong>
                    <span v-if="row.description" class="muted">{{ row.description }}</span>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="Estado" min-width="100">
            <template #default="{ row }">
                <el-tag :type="row.is_public ? 'success' : 'info'" size="small">{{ row.is_public ? 'Visible' : 'Oculta' }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="Canciones" min-width="120" align="center">
            <template #default="{ row }">{{ row.tracks_count }} · {{ formatTime(row.duration) }}</template>
        </el-table-column>
        <el-table-column :fixed="isMobile ? false : 'right'" label="Acciones" min-width="200">
            <template #default="{ row }">
                <el-button size="small" icon="EditPen" @click="openForm(row)">Editar</el-button>
                <el-popconfirm
                    :title="`¿Borrar «${row.name}»? Las canciones se quedan.`"
                    confirm-button-text="Borrar"
                    cancel-button-text="Cancelar"
                    confirm-button-type="danger"
                    width="250"
                    @confirm="remove(row)"
                >
                    <template #reference>
                        <el-button size="small" type="danger" plain icon="Delete" :loading="busyId === row.id">Borrar</el-button>
                    </template>
                </el-popconfirm>
            </template>
        </el-table-column>
        <template #empty>
            <div class="posts-empty">Todavía no hay playlists.</div>
        </template>
    </el-table>

    <el-dialog v-model="showForm" :title="editing ? `Editar «${editing.name}»` : 'Nueva playlist'" :width="isMobile ? '95%' : '520px'" destroy-on-close>
        <el-form label-position="top" @submit.prevent="save">
            <el-form-item label="Nombre" :error="errors.name">
                <el-input v-model="form.name" maxlength="80" />
            </el-form-item>
            <el-form-item label="Descripción" :error="errors.description">
                <el-input v-model="form.description" maxlength="255" placeholder="Opcional" />
            </el-form-item>
            <el-form-item>
                <el-switch v-model="form.is_public" active-text="Visible en el reproductor" inactive-text="Oculta" />
            </el-form-item>
            <el-form-item :label="`Canciones (${form.track_ids.length})`" :error="errors.track_ids">
                <el-select
                    :model-value="null"
                    filterable
                    placeholder="Agregar una canción"
                    class="w-full"
                    :no-data-text="tracks.length ? 'Ya están todas' : 'Sube canciones en la otra pestaña'"
                    @change="add"
                >
                    <el-option v-for="track in available" :key="track.id" :label="trackLabel(track)" :value="track.id" />
                </el-select>
                <ol v-if="form.track_ids.length" class="playlist-order">
                    <li v-for="(id, i) in form.track_ids" :key="id">
                        <span class="playlist-order__title">{{ trackLabel(trackById(id)) }}</span>
                        <el-button text circle size="small" :icon="ArrowUp" :disabled="i === 0" aria-label="Subir" @click="move(i, -1)" />
                        <el-button text circle size="small" :icon="ArrowDown" :disabled="i === form.track_ids.length - 1" aria-label="Bajar" @click="move(i, 1)" />
                        <el-button text circle size="small" :icon="Close" aria-label="Quitar" @click="form.track_ids.splice(i, 1)" />
                    </li>
                </ol>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showForm = false">Cancelar</el-button>
            <el-button type="primary" :loading="saving" @click="save">Guardar</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, ArrowUp, Close } from '@element-plus/icons-vue'
import { useAppStore } from '~/stores/app'
import { useMusicStore } from '~/stores/music'
import { usePlayerStore } from '~/stores/player'
import { formatTime } from '~/components/MusicPlayer/format-time'

type Item = Record<string, any>

const appStore = useAppStore()
const store = useMusicStore()
const player = usePlayerStore()
const isMobile = computed(() => appStore.isMobile)

const playlists = ref<Item[]>([])
const tracks = ref<Item[]>([])
const loading = ref(false)
const loadError = ref('')
const busyId = ref<number | null>(null)

const load = async () => {
    loading.value = true
    loadError.value = ''
    try {
        [playlists.value, tracks.value] = await Promise.all([store.listPlaylists(), store.listTracks()])
    } catch {
        loadError.value = 'No se pudo cargar la lista.'
    } finally {
        loading.value = false
    }
}

const trackById = (id: number) => tracks.value.find(track => track.id === id)
const trackLabel = (track?: Item) => (track ? (track.artist ? `${track.title} · ${track.artist}` : track.title) : 'Canción borrada')

const showForm = ref(false)
const editing = ref<Item | null>(null)
const form = reactive({ name: '', description: '', is_public: true, track_ids: [] as number[] })
const errors = ref<Record<string, string>>({})
const saving = ref(false)

const available = computed(() => tracks.value.filter(track => !form.track_ids.includes(track.id)))

const openForm = (playlist: Item | null = null) => {
    editing.value = playlist
    form.name = playlist?.name ?? ''
    form.description = playlist?.description ?? ''
    form.is_public = playlist?.is_public ?? true
    form.track_ids = [...(playlist?.track_ids ?? [])]
    errors.value = {}
    showForm.value = true
}

const add = (id: number) => form.track_ids.push(id)
const move = (i: number, step: number) => {
    const [id] = form.track_ids.splice(i, 1)
    form.track_ids.splice(i + step, 0, id)
}

const save = async () => {
    saving.value = true
    errors.value = {}
    try {
        const { message } = await store.savePlaylist({ ...form }, editing.value?.id ?? null)
        ElMessage.success(message)
        showForm.value = false
        await load()
        player.refresh()
    } catch (error: any) {
        const fieldErrors = error?.response?.data?.errors
        if (!fieldErrors) return ElMessage.error('No se pudo guardar la playlist')
        // track_ids.0, track_ids.1… se muestran juntos bajo la lista
        errors.value = Object.entries(fieldErrors).reduce((all, [field, list]) => {
            all[field.startsWith('track_ids') ? 'track_ids' : field] = (list as string[])[0]
            return all
        }, {} as Record<string, string>)
    } finally {
        saving.value = false
    }
}

const remove = async (playlist: Item) => {
    busyId.value = playlist.id
    try {
        const { message } = await store.deletePlaylist(playlist.id)
        ElMessage.success(message)
        await load()
        player.refresh()
    } catch {
        ElMessage.error('No se pudo borrar la playlist')
    } finally {
        busyId.value = null
    }
}

onMounted(load)
</script>

<style src="../../list-page.css"></style>
<style scoped>
.muted {
    margin: 0;
    color: var(--ep-text-color-secondary);
    font-size: 14px;
}

.playlist-cell {
    display: flex;
    flex-direction: column;
}

.playlist-cell .muted {
    font-size: 13px;
}

.playlist-order {
    width: 100%;
    max-height: 260px;
    margin: 8px 0 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
    counter-reset: track;
}

.playlist-order li {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 4px 2px 8px;
    border-radius: 6px;
    counter-increment: track;
}

.playlist-order li:hover {
    background: var(--ep-fill-color-light);
}

.playlist-order li::before {
    content: counter(track) '.';
    min-width: 22px;
    color: var(--ep-text-color-secondary);
    font-size: 13px;
}

.playlist-order__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.playlist-order .ep-button + .ep-button {
    margin-left: 0;
}
</style>
