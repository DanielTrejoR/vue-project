<template>
  <div class="activity">
    <!-- nueva publicación: texto, imágenes o ambos -->
    <el-card shadow="never" class="composer">
      <div class="composer__row">
        <UserAvatar :size="40" :src="auth.user?.avatar" :name="auth.user?.name" />
        <el-input
          v-model="body"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 8 }"
          :maxlength="MAX_BODY"
          show-word-limit
          placeholder="¿Qué se te ocurrió hoy?"
          @keydown.ctrl.enter="publish"
          @keydown.meta.enter="publish"
        />
      </div>

      <div v-if="previews.length" class="composer__previews">
        <div v-for="(preview, index) in previews" :key="preview.url" class="composer__preview">
          <img :src="preview.url" :alt="preview.file.name" />
          <el-button class="composer__remove" circle size="small" icon="Close" aria-label="Quitar imagen" @click="removeImage(index)" />
        </div>
      </div>

      <div class="composer__actions">
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          hidden
          @change="onFilesSelected"
        />
        <el-button
          icon="Picture"
          :disabled="previews.length >= MAX_IMAGES"
          @click="fileInput?.click()"
        >
          Imágenes {{ previews.length ? `(${previews.length}/${MAX_IMAGES})` : '' }}
        </el-button>
        <el-button type="primary" :loading="publishing" :disabled="!canPublish" @click="publish">Publicar</el-button>
      </div>
    </el-card>

    <!-- muro -->
    <el-card v-for="status in items" :key="status.id" shadow="never" class="status">
      <header class="status__header">
        <UserAvatar :size="40" :src="status.user?.avatar" :name="status.user?.name" />
        <div class="status__who">
          <strong>{{ status.user?.name }}</strong>
          <span class="status__when" :title="fullDate(status.created_at)">{{ fromNow(status.created_at) }}</span>
        </div>
        <el-popconfirm
          v-if="canDelete(status)"
          title="¿Eliminar esta publicación?"
          confirm-button-text="Eliminar"
          cancel-button-text="Cancelar"
          confirm-button-type="danger"
          width="220"
          @confirm="removeStatus(status)"
        >
          <template #reference>
            <el-button text circle icon="Delete" aria-label="Eliminar publicación" :loading="deletingId === status.id" />
          </template>
        </el-popconfirm>
      </header>

      <p v-if="status.body" class="status__body">{{ status.body }}</p>

      <div v-if="status.image_urls?.length" class="status__images" :class="`status__images--${Math.min(status.image_urls.length, 4)}`">
        <el-image
          v-for="(url, index) in status.image_urls"
          :key="url"
          :src="url"
          :preview-src-list="status.image_urls"
          :initial-index="index"
          preview-teleported
          fit="cover"
          loading="lazy"
          class="status__image"
        />
      </div>

      <footer class="status__actions">
        <el-button
          text
          :type="status.liked ? 'danger' : undefined"
          :aria-pressed="status.liked"
          :aria-label="status.liked ? 'Quitar me gusta' : 'Me gusta'"
          @click="toggleLike(status)"
        >
          <span class="like-icon">{{ status.liked ? '♥' : '♡' }}</span>
          {{ status.likes_count }} me gusta
        </el-button>
        <el-button text icon="ChatDotRound" :aria-expanded="openComments.has(status.id)" @click="toggleComments(status.id)">
          {{ status.comments_count }} {{ status.comments_count === 1 ? 'comentario' : 'comentarios' }}
        </el-button>
      </footer>

      <StatusComments
        v-if="openComments.has(status.id)"
        :status-id="status.id"
        :status-owner-id="status.user_id"
        @count="value => (status.comments_count = value)"
      />
    </el-card>

    <el-skeleton v-if="loading" :rows="4" animated />

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false">
      <el-button size="small" @click="loadMore">Reintentar</el-button>
    </el-alert>

    <el-empty v-if="done && !items.length" description="Todavía no has publicado nada. ¡Comparte algo arriba!" />
    <p v-else-if="done" class="activity__end">No hay más publicaciones</p>

    <!-- al entrar en pantalla pide la siguiente tanda -->
    <div ref="sentinel" class="activity__sentinel"></div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '~/components/UserAvatar/UserAvatar.vue'
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '~/stores/auth'
import { useStatusesStore } from '~/stores/statuses'
import { useInfiniteList } from '~/composables/useInfiniteList'
import { fromNow, fullDate } from '~/utils/dates'
import StatusComments from './StatusComments.vue'

interface Status {
  id: number
  user_id: number
  body: string | null
  image_urls: string[]
  likes_count: number
  comments_count: number
  liked: boolean
  created_at: string
  user?: { id: number, name: string, avatar: string }
}

// límites del backend (StatusesController)
const MAX_BODY = 2000
const MAX_IMAGES = 4
const MAX_IMAGE_MB = 4

const auth = useAuthStore()
const statusesStore = useStatusesStore()

const { items, loading, done, error, sentinel, loadMore } = useInfiniteList<Status>(cursor => statusesStore.list({ cursor }))
onMounted(loadMore)

// ---- nueva publicación
const body = ref('')
const previews = ref<{ file: File, url: string }[]>([])
const fileInput = ref<HTMLInputElement>()
const publishing = ref(false)
const canPublish = computed(() => !publishing.value && (body.value.trim().length > 0 || previews.value.length > 0))

const onFilesSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])
  input.value = ''
  const room = MAX_IMAGES - previews.value.length
  if (files.length > room) ElMessage.warning(`Puedes subir hasta ${MAX_IMAGES} imágenes por publicación`)
  files.slice(0, room).forEach(file => {
    if (file.size / 1024 / 1024 > MAX_IMAGE_MB) {
      ElMessage.error(`«${file.name}» pesa más de ${MAX_IMAGE_MB} MB`)
      return
    }
    previews.value.push({ file, url: URL.createObjectURL(file) })
  })
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(previews.value[index].url)
  previews.value.splice(index, 1)
}

const clearComposer = () => {
  previews.value.forEach(preview => URL.revokeObjectURL(preview.url))
  previews.value = []
  body.value = ''
}
onBeforeUnmount(clearComposer)

const publish = async () => {
  if (!canPublish.value) return
  publishing.value = true
  try {
    const status = await statusesStore.create({
      body: body.value.trim(),
      images: previews.value.map(preview => preview.file),
    })
    // la nueva va arriba del muro sin recargar la lista
    items.value = [status, ...items.value]
    clearComposer()
  } catch (err: any) {
    const errors = err?.response?.data?.errors
    ElMessage.error(errors ? String(Object.values(errors).flat()[0]) : 'No se pudo publicar')
  } finally {
    publishing.value = false
  }
}

// ---- likes (se ve al instante y se corrige si el servidor falla)
const toggleLike = async (status: Status) => {
  const before = { liked: status.liked, likes_count: status.likes_count }
  status.liked = !status.liked
  status.likes_count += status.liked ? 1 : -1
  try {
    Object.assign(status, await statusesStore.toggleLike(status.id))
  } catch {
    Object.assign(status, before)
    ElMessage.error('No se pudo registrar el me gusta')
  }
}

// ---- comentarios: se cargan al abrirlos
const openComments = ref(new Set<number>())
const toggleComments = (id: number) => {
  const open = new Set(openComments.value)
  if (open.has(id)) open.delete(id)
  else open.add(id)
  openComments.value = open
}

// ---- borrar
const deletingId = ref<number | null>(null)
const canDelete = (status: Status) => status.user_id === auth.user?.id || auth.isAdmin

const removeStatus = async (status: Status) => {
  deletingId.value = status.id
  try {
    await statusesStore.remove(status.id)
    items.value = items.value.filter(item => item.id !== status.id)
    ElMessage.success('Publicación eliminada')
  } catch {
    ElMessage.error('No se pudo eliminar la publicación')
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.activity {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.composer__row {
  display: flex;
  gap: 12px;
}

.composer__previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
  margin: 12px 0 0 52px;
}

.composer__preview {
  position: relative;
  aspect-ratio: 1;
}

.composer__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.composer__remove {
  position: absolute;
  top: 4px;
  right: 4px;
}

.composer__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.status__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status__who {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.status__when {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}

.status__body {
  margin: 12px 0 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
  line-height: 1.6;
}

/* 1 imagen grande; 2-4 en cuadrícula de dos columnas */
.status__images {
  display: grid;
  gap: 4px;
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.status__images--2,
.status__images--3,
.status__images--4 {
  grid-template-columns: 1fr 1fr;
}

.status__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  display: block;
}

.status__images--1 .status__image {
  aspect-ratio: 16 / 9;
  max-height: 420px;
}

/* con 3 imágenes la primera ocupa toda la fila */
.status__images--3 .status__image:first-child {
  grid-column: span 2;
  aspect-ratio: 16 / 9;
}

.status__actions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}

.status__actions .ep-button + .ep-button {
  margin-left: 0;
}

.like-icon {
  margin-right: 6px;
  font-size: 16px;
}

.activity__end {
  margin: 0;
  text-align: center;
  color: var(--ep-text-color-secondary);
  font-size: 13px;
}

.activity__sentinel {
  height: 1px;
}
</style>
