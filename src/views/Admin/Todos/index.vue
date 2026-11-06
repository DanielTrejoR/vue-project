<template>
<div class="table-wrapper todos-page">
    <div class="posts-header">
        <div>
            <h2>Tareas</h2>
            <p class="muted">
                {{ summary }}
                <span v-if="store.overdueCount" class="todos-overdue">· {{ store.overdueCount }} vencida{{ store.overdueCount === 1 ? '' : 's' }}</span>
            </p>
        </div>
        <div class="posts-header__actions">
            <el-radio-group v-model="filter" size="small">
                <el-radio-button value="pending">Pendientes</el-radio-button>
                <el-radio-button value="done">Hechas</el-radio-button>
                <el-radio-button value="all">Todas</el-radio-button>
            </el-radio-group>
        </div>
    </div>

    <!-- agregar: Enter en el campo y listo; la fecha es opcional -->
    <form class="todos-add" @submit.prevent="add">
        <el-input v-model="draft.title" maxlength="200" placeholder="Agregar una tarea…" clearable aria-label="Nueva tarea" />
        <el-date-picker v-model="draft.due_on" type="date" value-format="YYYY-MM-DD" format="D MMM YYYY" placeholder="Para cuándo" class="todos-add__date" />
        <el-button type="primary" icon="Plus" native-type="submit" :disabled="!draft.title.trim()">Agregar</el-button>
    </form>
    <p v-if="addError" class="todos-error">{{ addError }}</p>

    <el-alert v-if="store.error" :title="store.error" type="error" show-icon :closable="false" class="mb-4">
        <el-button size="small" @click="store.load(true)">Reintentar</el-button>
    </el-alert>

    <div v-loading="store.loading && !store.loaded" class="todos-list">
        <TransitionGroup name="todo" tag="ul">
            <li v-for="todo in visible" :key="todo.id" class="todo-row" :class="{ 'is-done': todo.done }">
                <el-checkbox :model-value="todo.done" :aria-label="todo.done ? 'Marcar como pendiente' : 'Marcar como hecha'" @change="toggle(todo)" />
                <button type="button" class="todo-row__text" @click="openEdit(todo)">
                    <span class="todo-row__title">{{ todo.title }}</span>
                    <span v-if="todo.notes" class="todo-row__notes">{{ todo.notes }}</span>
                </button>
                <el-tag v-if="todo.due_on" size="small" :type="isOverdue(todo) ? 'danger' : 'info'" effect="plain" round>{{ dueLabel(todo.due_on) }}</el-tag>
                <el-button text circle size="small" icon="EditPen" aria-label="Editar" @click="openEdit(todo)" />
                <el-popconfirm title="¿Borrar esta tarea?" confirm-button-text="Borrar" cancel-button-text="Cancelar" confirm-button-type="danger" width="200" @confirm="remove(todo)">
                    <template #reference>
                        <el-button text circle size="small" type="danger" icon="Delete" aria-label="Borrar" />
                    </template>
                </el-popconfirm>
            </li>
        </TransitionGroup>
        <div v-if="store.loaded && !visible.length" class="posts-empty">{{ emptyText }}</div>
    </div>

    <div v-if="store.doneCount && filter !== 'pending'" class="todos-footer">
        <el-popconfirm :title="`¿Borrar las ${store.doneCount} tareas hechas?`" confirm-button-text="Borrar" cancel-button-text="Cancelar" confirm-button-type="danger" width="230" @confirm="clearCompleted">
            <template #reference>
                <el-button text type="danger" :loading="clearing">Borrar hechas ({{ store.doneCount }})</el-button>
            </template>
        </el-popconfirm>
    </div>

    <el-dialog v-model="showEdit" title="Editar tarea" :width="isMobile ? '95%' : '460px'" destroy-on-close>
        <el-form label-position="top" @submit.prevent="saveEdit">
            <el-form-item label="Tarea" :error="editErrors.title">
                <el-input v-model="editForm.title" maxlength="200" />
            </el-form-item>
            <el-form-item label="Notas" :error="editErrors.notes">
                <el-input v-model="editForm.notes" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" maxlength="2000" placeholder="Opcional" />
            </el-form-item>
            <el-form-item label="Para cuándo" :error="editErrors.due_on">
                <el-date-picker v-model="editForm.due_on" type="date" value-format="YYYY-MM-DD" format="D MMM YYYY" placeholder="Sin fecha" class="w-full" />
            </el-form-item>
        </el-form>
        <template #footer>
            <el-button @click="showEdit = false">Cancelar</el-button>
            <el-button type="primary" :loading="saving" @click="saveEdit">Guardar</el-button>
        </template>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>
// el nombre coincide con la ruta: KeepAlive lo usa para conservar la vista (pestañas del admin)
defineOptions({ name: 'TodosIndex' })
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '~/stores/app'
import { useTodosStore, isOverdue } from '~/stores/todos'
import { dueLabel } from '~/utils/dates'

type Todo = ReturnType<typeof useTodosStore>['items'][number]

const appStore = useAppStore()
const store = useTodosStore()
const isMobile = computed(() => appStore.isMobile)

const filter = ref<'pending' | 'done' | 'all'>('pending')
const visible = computed(() => store.sorted.filter(todo => filter.value === 'all' || todo.done === (filter.value === 'done')))
const summary = computed(() => {
    if (!store.items.length) return 'Tu lista personal: solo tú la ves.'
    return `${store.pendingCount} pendiente${store.pendingCount === 1 ? '' : 's'} · ${store.doneCount} hecha${store.doneCount === 1 ? '' : 's'}`
})
const emptyText = computed(() => {
    if (filter.value === 'pending') return store.items.length ? 'No tienes nada pendiente. 🎉' : 'Todavía no hay tareas. Agrega la primera arriba.'
    if (filter.value === 'done') return 'Aún no terminas ninguna.'
    return 'Todavía no hay tareas.'
})

// errores del API en un solo texto (validación o el tope de tareas)
const apiMessage = (error: any, fallback: string) => {
    const errors = error?.response?.data?.errors
    if (errors) return Object.values(errors).flat()[0] as string
    return error?.response?.data?.message || fallback
}

const draft = reactive({ title: '', due_on: null as string | null })
const addError = ref('')
// el campo se vacía al dar Enter para escribir la siguiente sin esperar (si falla, se devuelve lo escrito);
// el botón no se pone en "cargando": deshabilitado, Enter ya no enviaría el formulario
const add = async () => {
    const title = draft.title.trim()
    if (!title) return
    const dueOn = draft.due_on
    draft.title = ''
    draft.due_on = null
    addError.value = ''
    try {
        await store.add({ title, due_on: dueOn || null })
        if (filter.value === 'done') filter.value = 'pending'
    } catch (error) {
        addError.value = apiMessage(error, 'No se pudo agregar la tarea.')
        if (!draft.title) Object.assign(draft, { title, due_on: dueOn })
    }
}

const toggle = (todo: Todo) => {
    store.toggle(todo.id)?.catch(() => ElMessage.error('No se pudo guardar el cambio.'))
}

const remove = async (todo: Todo) => {
    try {
        await store.remove(todo.id)
    } catch {
        ElMessage.error('No se pudo borrar la tarea.')
    }
}

const clearing = ref(false)
const clearCompleted = async () => {
    clearing.value = true
    try {
        ElMessage.success((await store.clearCompleted()).message)
    } catch {
        ElMessage.error('No se pudieron borrar las tareas hechas.')
    } finally {
        clearing.value = false
    }
}

const showEdit = ref(false)
const editingId = ref<number | null>(null)
const editForm = reactive({ title: '', notes: '', due_on: null as string | null })
const editErrors = ref<Record<string, string>>({})
const saving = ref(false)
const openEdit = (todo: Todo) => {
    editingId.value = todo.id
    editForm.title = todo.title
    editForm.notes = todo.notes ?? ''
    editForm.due_on = todo.due_on
    editErrors.value = {}
    showEdit.value = true
}
const saveEdit = async () => {
    if (editingId.value === null) return
    saving.value = true
    editErrors.value = {}
    try {
        await store.update(editingId.value, { title: editForm.title, notes: editForm.notes || null, due_on: editForm.due_on || null })
        showEdit.value = false
    } catch (error: any) {
        const errors = error?.response?.data?.errors
        if (errors) editErrors.value = Object.fromEntries(Object.entries(errors).map(([field, list]) => [field, (list as string[])[0]]))
        else ElMessage.error('No se pudo guardar la tarea.')
    } finally {
        saving.value = false
    }
}

onMounted(() => store.load())
</script>

<style src="../list-page.css"></style>
<style scoped>
/* el título y el resumen van juntos a la izquierda (la app centra el texto por defecto) */
.todos-page .posts-header {
    text-align: left;
}

.muted {
    margin: 4px 0 0;
    color: var(--ep-text-color-secondary);
    font-size: 14px;
}

.todos-overdue {
    color: var(--ep-color-danger);
}

.todos-add {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.todos-add .ep-button + .ep-button {
    margin-left: 0;
}

.todos-add__date {
    flex: 0 0 170px;
}

.todos-add__date:deep(.ep-input__wrapper) {
    width: 100%;
}

.todos-error {
    margin: 0 0 8px;
    color: var(--ep-color-danger);
    font-size: 13px;
}

.todos-list {
    min-height: 80px;
    margin-top: 12px;
}

.todos-list ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.todo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--ep-border-color-lighter);
}

.todo-row:hover {
    background: var(--ep-fill-color-light);
}

.todo-row .ep-button + .ep-button,
.todo-row .ep-button + :deep(.ep-button) {
    margin-left: 0;
}

.todo-row__text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    padding: 4px 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
}

.todo-row__title {
    overflow-wrap: anywhere;
}

.todo-row__notes {
    overflow: hidden;
    color: var(--ep-text-color-secondary);
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.todo-row.is-done .todo-row__title {
    color: var(--ep-text-color-secondary);
    text-decoration: line-through;
}

.todos-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
}

.todo-move,
.todo-enter-active,
.todo-leave-active {
    transition: all 0.2s ease;
}

.todo-enter-from,
.todo-leave-to {
    opacity: 0;
    transform: translateX(-8px);
}

@media (prefers-reduced-motion: reduce) {
    .todo-move,
    .todo-enter-active,
    .todo-leave-active {
        transition: none;
    }
}

@media (max-width: 600px) {
    .todos-add {
        flex-wrap: wrap;
    }

    .todos-add .ep-input {
        flex-basis: 100%;
    }

    .todos-add__date {
        flex: 1;
    }
}
</style>
