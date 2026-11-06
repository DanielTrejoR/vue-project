<template>
<section aria-labelledby="todos-title">
    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
        <div>
            <h2 id="todos-title" class="text-h6 font-weight-bold">Mis tareas</h2>
            <p class="text-body-2 text-medium-emphasis">
                {{ summary }}
                <span v-if="store.overdueCount" class="text-error">· {{ store.overdueCount }} vencida{{ store.overdueCount === 1 ? '' : 's' }}</span>
            </p>
        </div>
        <div class="d-flex align-center flex-wrap ga-2">
            <v-btn-toggle v-model="filter" mandatory density="compact" variant="outlined" divided rounded="lg">
                <v-btn value="pending" size="small">Pendientes</v-btn>
                <v-btn value="done" size="small">Hechas</v-btn>
                <v-btn value="all" size="small">Todas</v-btn>
            </v-btn-toggle>
            <v-btn variant="tonal" size="small" prepend-icon="mdi mdi-calendar-month-outline" @click="showCalendar = true">Calendario</v-btn>
        </div>
    </div>

    <!-- se monta al abrirlo: el calendario (vuetify/labs) no pesa en Mi espacio hasta que se usa -->
    <TodoCalendar v-if="calendarUsed" v-model="showCalendar" />

    <!-- agregar: Enter en el campo y listo; la fecha es opcional -->
    <v-form class="todos-add mb-2" @submit.prevent="add">
        <v-text-field
            v-model="draft.title"
            placeholder="Agregar una tarea…"
            aria-label="Nueva tarea"
            prepend-inner-icon="mdi mdi-plus"
            maxlength="200"
            density="comfortable"
            variant="outlined"
            hide-details
           
            class="todos-add__title"
        />
        <v-text-field
            v-model="draft.due_on"
            type="date"
            label="Para cuándo"
            density="comfortable"
            variant="outlined"
            hide-details
           
            class="todos-add__date"
        />
        <v-btn type="submit" color="primary" variant="flat" size="large" :disabled="!draft.title.trim()">Agregar</v-btn>
    </v-form>
    <p v-if="addError" class="text-error text-body-2 mb-2">{{ addError }}</p>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-3">
        {{ store.error }}
        <template #append>
            <v-btn variant="text" size="small" @click="store.load(true)">Reintentar</v-btn>
        </template>
    </v-alert>

    <v-skeleton-loader v-if="store.loading && !store.loaded" type="list-item@3" />
    <v-card v-else-if="store.loaded && !visible.length" variant="tonal" class="pa-6 text-center">
        <v-icon icon="mdi mdi-checkbox-marked-circle-outline" size="36" class="mb-2 text-medium-emphasis" />
        <div>{{ emptyText }}</div>
    </v-card>
    <v-list v-else-if="visible.length" class="rounded-lg py-0" border>
        <TransitionGroup name="todo">
            <v-list-item v-for="todo in visible" :key="todo.id" class="todo-item" :class="{ 'is-done': todo.done }" @click="openEdit(todo)">
                <template #prepend>
                    <!-- sin color="primary": en el tema Dark el primario casi no se distingue del fondo -->
                    <v-checkbox-btn
                        :model-value="todo.done"
                        :aria-label="todo.done ? 'Marcar como pendiente' : 'Marcar como hecha'"
                        @click.stop
                        @update:model-value="toggle(todo)"
                    />
                </template>
                <v-list-item-title class="todo-item__title">{{ todo.title }}</v-list-item-title>
                <v-list-item-subtitle v-if="todo.notes">{{ todo.notes }}</v-list-item-subtitle>
                <template #append>
                    <v-chip
                        v-if="todo.due_on"
                        size="small"
                        variant="tonal"
                        :color="isOverdue(todo) ? 'error' : undefined"
                        prepend-icon="mdi mdi-calendar-outline"
                        class="mr-1"
                    >{{ dueLabel(todo.due_on) }}</v-chip>
                    <v-menu location="bottom end">
                        <template #activator="{ props }">
                            <v-btn v-bind="props" icon="mdi mdi-delete-outline" variant="text" size="small" aria-label="Borrar" @click.stop />
                        </template>
                        <v-card class="pa-3" max-width="220">
                            <div class="text-body-2 mb-2">¿Borrar esta tarea?</div>
                            <v-btn color="error" variant="flat" size="small" block @click="remove(todo)">Borrar</v-btn>
                        </v-card>
                    </v-menu>
                </template>
            </v-list-item>
        </TransitionGroup>
    </v-list>

    <div v-if="store.doneCount && filter !== 'pending'" class="text-right mt-2">
        <v-btn variant="text" color="error" size="small" :loading="clearing" @click="clearCompleted">Borrar hechas ({{ store.doneCount }})</v-btn>
    </div>

    <v-dialog v-model="showEdit" max-width="460">
        <v-card title="Editar tarea">
            <v-form @submit.prevent="saveEdit">
                <v-card-text class="d-flex flex-column ga-3">
                    <v-text-field v-model="editForm.title" label="Tarea" maxlength="200" variant="outlined" :error-messages="editErrors.title" autofocus />
                    <v-textarea v-model="editForm.notes" label="Notas" placeholder="Opcional" maxlength="2000" rows="3" auto-grow variant="outlined" :error-messages="editErrors.notes" />
                    <v-text-field v-model="editForm.due_on" type="date" label="Para cuándo" variant="outlined" :error-messages="editErrors.due_on" clearable />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="showEdit = false">Cancelar</v-btn>
                    <v-btn type="submit" color="primary" variant="flat" :loading="saving">Guardar</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="bottom">{{ snackbar.text }}</v-snackbar>
</section>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue'
import { useTodosStore, isOverdue } from '~/stores/todos'
import { dueLabel } from '~/utils/dates'

type Todo = ReturnType<typeof useTodosStore>['items'][number]

const store = useTodosStore()

const TodoCalendar = defineAsyncComponent(() => import('./TodoCalendar.vue'))
const showCalendar = ref(false)
const calendarUsed = ref(false)
watch(showCalendar, value => { if (value) calendarUsed.value = true })

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

const snackbar = reactive({ show: false, text: '', color: 'error' })
const notify = (text: string, color = 'error') => Object.assign(snackbar, { show: true, text, color })

// errores del API en un solo texto (validación o el tope de tareas)
const apiMessage = (error: any, fallback: string) => {
    const errors = error?.response?.data?.errors
    if (errors) return Object.values(errors).flat()[0] as string
    return error?.response?.data?.message || fallback
}

const draft = reactive({ title: '', due_on: '' })
const addError = ref('')
// el campo se vacía al dar Enter para escribir la siguiente sin esperar (si falla, se devuelve lo escrito);
// el botón no se pone en "cargando": deshabilitado, Enter ya no enviaría el formulario
const add = async () => {
    const title = draft.title.trim()
    if (!title) return
    const dueOn = draft.due_on
    draft.title = ''
    draft.due_on = ''
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
    store.toggle(todo.id)?.catch(() => notify('No se pudo guardar el cambio.'))
}

const remove = async (todo: Todo) => {
    try {
        await store.remove(todo.id)
    } catch {
        notify('No se pudo borrar la tarea.')
    }
}

const clearing = ref(false)
const clearCompleted = async () => {
    clearing.value = true
    try {
        notify((await store.clearCompleted()).message, 'success')
    } catch {
        notify('No se pudieron borrar las tareas hechas.')
    } finally {
        clearing.value = false
    }
}

const showEdit = ref(false)
const editingId = ref<number | null>(null)
const editForm = reactive({ title: '', notes: '', due_on: '' as string | null })
const editErrors = ref<Record<string, string>>({})
const saving = ref(false)
const openEdit = (todo: Todo) => {
    editingId.value = todo.id
    editForm.title = todo.title
    editForm.notes = todo.notes ?? ''
    editForm.due_on = todo.due_on ?? ''
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
        else notify('No se pudo guardar la tarea.')
    } finally {
        saving.value = false
    }
}

onMounted(() => store.load())
</script>

<style scoped>
.todos-add {
    display: flex;
    gap: 8px;
    align-items: center;
}

.todos-add__title {
    flex: 1;
}

.todos-add__date {
    flex: 0 0 180px;
}

.todo-item__title {
    white-space: normal;
    overflow-wrap: anywhere;
}

.todo-item + .todo-item {
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.todo-item.is-done .todo-item__title {
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    text-decoration: line-through;
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

    .todos-add__title {
        flex-basis: 100%;
    }

    .todos-add__date {
        flex: 1;
    }
}
</style>
