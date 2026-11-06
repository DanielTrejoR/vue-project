<template>
<v-dialog v-model="open" fullscreen transition="dialog-bottom-transition">
    <v-card class="todo-cal" rounded="0">
        <v-toolbar density="comfortable" color="surface" border="b">
            <v-btn icon="mdi mdi-close" aria-label="Cerrar calendario" @click="open = false" />
            <v-toolbar-title>Calendario de tareas</v-toolbar-title>
        </v-toolbar>

        <div class="todo-cal__body">
            <!-- pendientes sin fecha: se arrastran a un día; soltar aquí una del calendario le quita la fecha -->
            <aside
                class="todo-cal__side"
                :class="{ 'is-over': overDay === 'none' }"
                @dragover.prevent="overDay = 'none'"
                @dragleave="overDay = null"
                @drop.prevent="drop(null)"
            >
                <h3 class="text-subtitle-1 font-weight-bold">Sin fecha <span class="text-medium-emphasis">({{ store.undated.length }})</span></h3>
                <p class="text-body-2 text-medium-emphasis mb-3">Arrástralas a un día, o toca un día para asignarlas.</p>
                <div class="d-flex flex-column ga-2">
                    <div
                        v-for="todo in store.undated"
                        :key="todo.id"
                        class="todo-cal__item"
                        :class="{ 'is-dragging': draggingId === todo.id }"
                        draggable="true"
                        @dragstart="startDrag($event, todo.id)"
                        @dragend="endDrag"
                    >{{ todo.title }}</div>
                </div>
                <p v-if="!store.undated.length" class="text-body-2 text-medium-emphasis">Todas tienen fecha.</p>
            </aside>

            <!--
                VCalendar es de vuetify/labs y en esta versión trae dos fallas: el slot del día no llega a las celdas
                (se usan sus chips y los eventos con sufijo :day / :event para el clic y para arrastrar) y, con la semana
                en lunes, los nombres de los días salen corridos uno (se dibuja el encabezado aquí).
            -->
            <v-locale-provider locale="es">
                <v-calendar
                    v-model="month"
                    :events="events"
                    :first-day-of-week="1"
                    hide-week-number
                    hide-day-header
                    class="todo-cal__grid"
                    @click:day="(_: Event, { day }: any) => (openDay = toDay(day.date))"
                    @dragover:day="onDragOver"
                    @dragleave:day="onDragLeave"
                    @drop:day="onDrop"
                    @mousedown:event="(e: MouseEvent) => ((e.currentTarget as HTMLElement).draggable = true)"
                    @dragstart:event="(e: DragEvent, { event }: any) => startDrag(e, event.todoId)"
                    @dragend:event="endDrag"
                >
                    <template #header="{ clickPrev, clickNext, clickToday }">
                        <div class="d-flex align-center ga-2 mb-2">
                            <v-btn variant="outlined" size="small" @click="clickToday">Hoy</v-btn>
                            <v-btn icon="mdi mdi-chevron-left" variant="text" size="small" aria-label="Mes anterior" @click="clickPrev" />
                            <v-btn icon="mdi mdi-chevron-right" variant="text" size="small" aria-label="Mes siguiente" @click="clickNext" />
                            <h2 class="text-h6">{{ monthTitle }}</h2>
                        </div>
                        <div class="todo-cal__weekdays" aria-hidden="true">
                            <span v-for="name in WEEKDAYS" :key="name">{{ name }}</span>
                        </div>
                    </template>
                </v-calendar>
            </v-locale-provider>
        </div>
    </v-card>

    <v-dialog :model-value="!!openDay" max-width="460" @update:model-value="openDay = null">
        <v-card :title="openDayTitle">
            <v-card-text class="pt-2">
                <v-form class="d-flex ga-2 mb-3" @submit.prevent="addHere">
                    <v-text-field v-model="newTitle" placeholder="Agregar una tarea en este día…" aria-label="Nueva tarea en este día" maxlength="200" density="compact" variant="outlined" hide-details />
                    <v-btn type="submit" color="primary" variant="flat" :disabled="!newTitle.trim()">Agregar</v-btn>
                </v-form>
                <v-select
                    v-if="store.undated.length"
                    :model-value="null"
                    :items="store.undated"
                    item-title="title"
                    item-value="id"
                    label="Pasar aquí una tarea sin fecha"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="mb-3"
                    @update:model-value="assignHere"
                />
                <v-list v-if="openDayTodos.length" density="compact" class="py-0">
                    <v-list-item v-for="todo in openDayTodos" :key="todo.id" :class="{ 'is-done': todo.done }">
                        <template #prepend>
                            <v-checkbox-btn :model-value="todo.done" :aria-label="todo.done ? 'Marcar como pendiente' : 'Marcar como hecha'" @update:model-value="toggle(todo.id)" />
                        </template>
                        <v-list-item-title class="todo-day__title">{{ todo.title }}</v-list-item-title>
                        <template #append>
                            <v-btn variant="text" size="small" @click="moveTo(todo.id, null)">Quitar fecha</v-btn>
                        </template>
                    </v-list-item>
                </v-list>
                <p v-else class="text-medium-emphasis">Nada para este día.</p>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" color="error" timeout="3000">{{ snackbar.text }}</v-snackbar>
</v-dialog>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { VCalendar } from 'vuetify/labs/VCalendar'
import dayjs from 'dayjs'
import { isOverdue } from '~/stores/todos'
import { useTodoCalendar, toDay } from '~/composables/useTodoCalendar'

const open = defineModel<boolean>({ default: false })

const snackbar = reactive({ show: false, text: '' })
const { store, draggingId, overDay, startDrag, endDrag, moveTo, drop, openDay, openDayTodos, openDayTitle, addOnDay } =
    useTodoCalendar(text => Object.assign(snackbar, { show: true, text }))

const month = ref([new Date()])
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const monthTitle = computed(() => {
    const text = dayjs(month.value[0]).locale('es').format('MMMM YYYY')
    return text.charAt(0).toUpperCase() + text.slice(1)
})

// cada tarea con fecha es un evento de ese día; el punto de color dice cómo va
const events = computed(() => Object.entries(store.byDay).flatMap(([day, todos]) => todos.map(todo => {
    const [year, monthIndex, date] = day.split('-').map(Number)
    const start = new Date(year, monthIndex - 1, date)
    return {
        todoId: todo.id,
        title: todo.done ? `✓ ${todo.title}` : todo.title,
        start,
        end: start,
        color: todo.done ? 'grey' : isOverdue(todo) ? 'error' : 'info',
    }
})))

// la celda resaltada mientras se arrastra encima (el calendario no deja ponerle clase a una celda)
const onDragOver = (e: DragEvent, { day }: any) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).classList.add('is-over')
    overDay.value = toDay(day.date)
}
const onDragLeave = (e: DragEvent) => (e.currentTarget as HTMLElement).classList.remove('is-over')
const onDrop = (e: DragEvent, { day }: any) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).classList.remove('is-over')
    drop(toDay(day.date))
}

const toggle = (id: number) => {
    store.toggle(id)?.catch(() => Object.assign(snackbar, { show: true, text: 'No se pudo guardar el cambio.' }))
}

const assignHere = (id: number | null) => {
    if (id !== null && openDay.value) moveTo(id, openDay.value)
}

const newTitle = ref('')
const addHere = async () => {
    if (!openDay.value) return
    const title = newTitle.value
    newTitle.value = ''
    if (!(await addOnDay(title, openDay.value)) && !newTitle.value) newTitle.value = title
}
</script>

<style scoped>
.todo-cal__body {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 16px;
    padding: 16px;
    align-items: start;
}

.todo-cal__side {
    position: sticky;
    top: 16px;
    max-height: calc(100vh - 100px);
    padding: 12px;
    overflow-y: auto;
    border: 1px dashed rgba(var(--v-border-color), 0.4);
    border-radius: 8px;
}

.todo-cal__side.is-over {
    border-color: rgb(var(--v-theme-info));
    background: rgba(var(--v-theme-info), 0.08);
}

.todo-cal__item {
    padding: 4px 8px;
    border-left: 3px solid rgb(var(--v-theme-info));
    border-radius: 4px;
    background: rgba(var(--v-theme-on-surface), 0.06);
    font-size: 14px;
    overflow-wrap: anywhere;
    cursor: grab;
}

.todo-cal__item.is-dragging {
    opacity: 0.4;
}

/* el mes ocupa el alto de la pantalla; si un día tiene muchas, se desplaza dentro de la celda */
.todo-cal__grid :deep(.v-calendar-month__day) {
    min-height: max(96px, calc((100vh - 230px) / 6));
    cursor: pointer;
}

.todo-cal__grid :deep(.v-calendar-month__day.is-over) {
    outline: 2px dashed rgb(var(--v-theme-info));
    outline-offset: -2px;
    background: rgba(var(--v-theme-info), 0.08);
}

.todo-cal__grid :deep(.v-calendar-weekly__day-content) {
    max-height: calc((100vh - 290px) / 6);
    overflow-x: hidden;
    overflow-y: auto;
}

.todo-cal__weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 4px 0;
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    font-size: 13px;
    text-align: center;
}

.todo-cal__grid :deep(.v-calendar-weekly__day-events-container .v-chip) {
    max-width: 100%;
    cursor: grab;
}

.todo-cal__grid :deep(.v-calendar-weekly__day-events-container .v-chip__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.todo-day__title {
    white-space: normal;
    overflow-wrap: anywhere;
}

.is-done .todo-day__title {
    color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
    text-decoration: line-through;
}

@media (max-width: 900px) {
    .todo-cal__body {
        grid-template-columns: 1fr;
        padding: 8px;
    }

    .todo-cal__side {
        position: static;
        max-height: 200px;
    }
}
</style>
