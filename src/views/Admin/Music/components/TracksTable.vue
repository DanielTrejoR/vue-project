<template>
<div>
    <div class="posts-header">
        <p class="muted">Las canciones se suben una vez y se agregan a las playlists que quieras.</p>
        <div class="posts-header__actions">
            <el-button :loading="loading" @click="load">Recargar</el-button>
            <el-button type="primary" icon="Upload" @click="openForm()">Subir canción</el-button>
        </div>
    </div>

    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" class="mb-4" />

    <el-table v-loading="loading" :data="tracks" style="width: 100%">
        <el-table-column label="Canción" min-width="240">
            <template #default="{ row }">
                <div class="track-cell">
                    <img v-if="row.cover_url" :src="row.cover_url" alt="" class="track-cell__cover" />
                    <span v-else class="track-cell__cover track-cell__cover--empty"><el-icon><Headset /></el-icon></span>
                    <div class="track-cell__text">
                        <strong>{{ row.title }}</strong>
                        <span class="muted">{{ row.artist || 'Sin artista' }}</span>
                    </div>
                </div>
            </template>
        </el-table-column>
        <el-table-column label="Duración" min-width="90" align="center">
            <template #default="{ row }">{{ formatTime(row.duration ?? 0) }}</template>
        </el-table-column>
        <el-table-column label="Playlists" prop="playlists_count" min-width="90" align="center" />
        <el-table-column :fixed="isMobile ? false : 'right'" label="Acciones" min-width="290">
            <template #default="{ row }">
                <el-button size="small" :icon="previewId === row.id ? 'VideoPause' : 'VideoPlay'" @click="togglePreview(row)">
                    {{ previewId === row.id ? 'Parar' : 'Escuchar' }}
                </el-button>
                <el-button size="small" icon="EditPen" @click="openForm(row)">Editar</el-button>
                <el-popconfirm
                    :title="row.playlists_count ? `¿Borrar «${row.title}»? Se quitará de ${row.playlists_count} playlist(s).` : `¿Borrar «${row.title}»?`"
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
            <div class="posts-empty">Todavía no subiste ninguna canción.</div>
        </template>
    </el-table>

    <el-dialog v-model="showForm" :title="editing ? `Editar «${editing.title}»` : 'Subir canción'" :width="isMobile ? '95%' : '460px'" destroy-on-close @closed="audioFile = null">
        <el-form label-position="top" @submit.prevent="save">
            <el-form-item v-if="!editing" label="Audio" :error="errors.audio">
                <el-upload drag :auto-upload="false" :show-file-list="false" accept="audio/*" :on-change="pickAudio" class="audio-upload">
                    <el-icon class="upload-icon"><UploadFilled /></el-icon>
                    <div v-if="audioFile">{{ audioFile.name }} · {{ formatTime(duration) }}</div>
                    <div v-else>Arrastra el archivo o <em>haz clic</em> · MP3, OGG, WAV, M4A o FLAC, hasta 30 MB</div>
                </el-upload>
            </el-form-item>
            <el-form-item label="Título" :error="errors.title">
                <el-input v-model="form.title" maxlength="120" />
            </el-form-item>
            <el-form-item label="Artista" :error="errors.artist">
                <el-input v-model="form.artist" maxlength="120" placeholder="Opcional" />
            </el-form-item>
            <el-form-item label="Portada" :error="errors.cover">
                <div class="cover-field">
                    <img v-if="coverPreview" :src="coverPreview" alt="" class="cover-field__image" />
                    <el-upload :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="pickCover">
                        <el-button icon="Picture">{{ coverPreview ? 'Cambiar' : 'Elegir imagen' }}</el-button>
                    </el-upload>
                    <el-button v-if="coverPreview" text @click="clearCover">Quitar</el-button>
                </div>
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showForm = false">Cancelar</el-button>
            <el-button type="primary" :loading="saving" :disabled="!editing && !audioFile" @click="save">{{ editing ? 'Guardar' : 'Subir' }}</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onDeactivated, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, type UploadFile } from 'element-plus'
import { Headset, UploadFilled } from '@element-plus/icons-vue'
import { useAppStore } from '~/stores/app'
import { useMusicStore } from '~/stores/music'
import { usePlayerStore } from '~/stores/player'
import { formatTime } from '~/components/MusicPlayer/format-time'

type Track = Record<string, any>

const appStore = useAppStore()
const store = useMusicStore()
const player = usePlayerStore()
const isMobile = computed(() => appStore.isMobile)

const tracks = ref<Track[]>([])
const loading = ref(false)
const loadError = ref('')
const busyId = ref<number | null>(null)

const load = async () => {
    loading.value = true
    loadError.value = ''
    try {
        tracks.value = await store.listTracks()
    } catch {
        loadError.value = 'No se pudo cargar la lista.'
    } finally {
        loading.value = false
    }
}

// escuchar aquí no toca el reproductor del sitio (se pausa mientras tanto, y al revés)
const preview = new Audio()
const previewId = ref<number | null>(null)
preview.addEventListener('ended', () => { previewId.value = null })
const stopPreview = () => {
    preview.pause()
    previewId.value = null
}
watch(() => player.playing, playing => { if (playing) stopPreview() })
const togglePreview = (track: Track) => {
    if (previewId.value === track.id) return stopPreview()
    player.pause()
    preview.src = track.audio_url
    preview.play().then(() => { previewId.value = track.id }).catch(() => ElMessage.error('No se pudo reproducir'))
}
// la vista se conserva al cambiar de pestaña del admin (KeepAlive): sin esto la vista previa seguiría sonando
onDeactivated(stopPreview)
onBeforeUnmount(stopPreview)

// subir y editar comparten el diálogo; el audio no se cambia al editar
const showForm = ref(false)
const editing = ref<Track | null>(null)
const form = reactive({ title: '', artist: '' })
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const audioFile = ref<File | null>(null)
const duration = ref(0)
const coverFile = ref<File | null>(null)
const coverPreview = ref<string | null>(null)
const removeCover = ref(false)

const openForm = (track: Track | null = null) => {
    editing.value = track
    form.title = track?.title ?? ''
    form.artist = track?.artist ?? ''
    errors.value = {}
    audioFile.value = null
    duration.value = 0
    coverFile.value = null
    coverPreview.value = track?.cover_url ?? null
    removeCover.value = false
    showForm.value = true
}

// el título sale del nombre del archivo y la duración se mide aquí, antes de subirla
const pickAudio = (upload: UploadFile) => {
    const file = upload.raw
    if (!file) return
    audioFile.value = file
    if (!form.title) form.title = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
    const probe = new Audio(URL.createObjectURL(file))
    probe.addEventListener('loadedmetadata', () => {
        duration.value = Math.round(probe.duration) || 0
        URL.revokeObjectURL(probe.src)
    }, { once: true })
}

const pickCover = (upload: UploadFile) => {
    if (!upload.raw) return
    coverFile.value = upload.raw
    coverPreview.value = URL.createObjectURL(upload.raw)
    removeCover.value = false
}

const clearCover = () => {
    coverFile.value = null
    coverPreview.value = null
    removeCover.value = true
}

const save = async () => {
    saving.value = true
    errors.value = {}
    const body = new FormData()
    body.append('title', form.title)
    body.append('artist', form.artist)
    if (coverFile.value) body.append('cover', coverFile.value)
    try {
        let message: string
        if (editing.value) {
            if (removeCover.value) body.append('remove_cover', '1')
            message = (await store.updateTrack(editing.value.id, body)).message
        } else {
            body.append('audio', audioFile.value!)
            if (duration.value) body.append('duration', String(duration.value))
            message = (await store.uploadTrack(body)).message
        }
        ElMessage.success(message)
        showForm.value = false
        await load()
        player.refresh()
    } catch (error: any) {
        const fieldErrors = error?.response?.data?.errors
        if (fieldErrors) {
            errors.value = Object.fromEntries(Object.entries(fieldErrors).map(([field, list]) => [field, (list as string[])[0]]))
        } else {
            ElMessage.error(error?.response?.status === 413 ? 'El archivo es demasiado grande para el servidor.' : 'No se pudo guardar la canción')
        }
    } finally {
        saving.value = false
    }
}

const remove = async (track: Track) => {
    busyId.value = track.id
    try {
        const { message } = await store.deleteTrack(track.id)
        ElMessage.success(message)
        await load()
        player.refresh()
    } catch {
        ElMessage.error('No se pudo borrar la canción')
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

.track-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.track-cell__cover {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
}

.track-cell__cover--empty {
    display: grid;
    place-items: center;
    background: var(--ep-fill-color-light);
    color: var(--ep-text-color-secondary);
}

.track-cell__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.track-cell__text .muted {
    font-size: 13px;
}

.upload-icon {
    margin-bottom: 8px;
    color: var(--ep-text-color-secondary);
    font-size: 40px;
}

.cover-field {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cover-field__image {
    width: 56px;
    height: 56px;
    border-radius: 8px;
    object-fit: cover;
}

.audio-upload {
    width: 100%;
}

.audio-upload :deep(.ep-upload-dragger) {
    padding: 20px;
}
</style>
