<template>
  <section class="comments">
    <el-button v-if="!done && items.length" text size="small" :loading="loading" @click="loadMore">
      Ver más comentarios
    </el-button>

    <div v-for="comment in items" :key="comment.id" class="comment">
      <UserAvatar :size="28" :src="comment.user?.avatar" :name="comment.user?.name" />
      <div class="comment__bubble">
        <div class="comment__meta">
          <strong>{{ comment.user?.name }}</strong>
          <span class="comment__when" :title="fullDate(comment.created_at)">{{ fromNow(comment.created_at) }}</span>
        </div>
        <p class="comment__body">{{ comment.body }}</p>
      </div>
      <el-popconfirm
        v-if="canDelete(comment)"
        title="¿Eliminar este comentario?"
        confirm-button-text="Eliminar"
        cancel-button-text="Cancelar"
        confirm-button-type="danger"
        width="220"
        @confirm="remove(comment)"
      >
        <template #reference>
          <el-button text circle size="small" icon="Delete" aria-label="Eliminar comentario" :loading="deletingId === comment.id" />
        </template>
      </el-popconfirm>
    </div>

    <el-skeleton v-if="loading && !items.length" :rows="2" animated />
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false">
      <el-button size="small" @click="loadMore">Reintentar</el-button>
    </el-alert>

    <!-- Enter envía; Shift+Enter hace un salto de línea -->
    <form class="comments__form" @submit.prevent="send">
      <UserAvatar :size="28" :src="auth.user?.avatar" :name="auth.user?.name" />
      <el-input
        v-model="body"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 5 }"
        :maxlength="MAX_BODY"
        placeholder="Escribe un comentario…"
        @keydown.enter.exact.prevent="send"
      />
      <el-button type="primary" native-type="submit" :loading="sending" :disabled="!body.trim()">Enviar</el-button>
    </form>
  </section>
</template>

<script setup lang="ts">
import UserAvatar from '~/components/UserAvatar/UserAvatar.vue'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '~/stores/auth'
import { useStatusesStore } from '~/stores/statuses'
import { useInfiniteList } from '~/composables/useInfiniteList'
import { fromNow, fullDate } from '~/utils/dates'

interface Comment {
  id: number
  user_id: number
  body: string
  created_at: string
  user?: { id: number, name: string, avatar: string }
}

// límite del backend (StatusCommentsController)
const MAX_BODY = 1000

const props = defineProps<{ statusId: number, statusOwnerId: number }>()
// el muro muestra el total en el botón de comentarios
const emit = defineEmits<{ count: [value: number] }>()

const auth = useAuthStore()
const statusesStore = useStatusesStore()

// sin centinela: las tandas siguientes se piden con "Ver más comentarios"
const { items, loading, done, error, loadMore } = useInfiniteList<Comment>(cursor => statusesStore.listComments(props.statusId, cursor))
onMounted(loadMore)

const body = ref('')
const sending = ref(false)

const send = async () => {
  if (!body.value.trim() || sending.value) return
  sending.value = true
  try {
    const { comment, comments_count } = await statusesStore.addComment(props.statusId, body.value.trim())
    // si faltan tandas por cargar, el nuevo aparece al llegar al final
    if (done.value) items.value = [...items.value, comment]
    emit('count', comments_count)
    body.value = ''
  } catch (err: any) {
    const errors = err?.response?.data?.errors
    ElMessage.error(errors ? String(Object.values(errors).flat()[0]) : err?.response?.data?.message || 'No se pudo comentar')
  } finally {
    sending.value = false
  }
}

const deletingId = ref<number | null>(null)
// quien lo escribió, el dueño de la publicación o un Admin
const canDelete = (comment: Comment) =>
  comment.user_id === auth.user?.id || props.statusOwnerId === auth.user?.id || auth.isAdmin

const remove = async (comment: Comment) => {
  deletingId.value = comment.id
  try {
    const { comments_count } = await statusesStore.removeComment(props.statusId, comment.id)
    items.value = items.value.filter(item => item.id !== comment.id)
    emit('count', comments_count)
  } catch {
    ElMessage.error('No se pudo eliminar el comentario')
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.comments {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--ep-border-color-lighter);
}

.comments > .ep-button {
  align-self: flex-start;
}

.comment {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.comment__bubble {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--ep-fill-color-light);
}

.comment__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  font-size: 13px;
}

.comment__when {
  color: var(--ep-text-color-secondary);
  font-size: 12px;
}

.comment__body {
  margin: 2px 0 0;
  white-space: pre-line;
  overflow-wrap: anywhere;
  line-height: 1.5;
}

.comments__form {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
</style>
