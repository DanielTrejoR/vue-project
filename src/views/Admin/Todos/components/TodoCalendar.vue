<template>
<div class="todo-cal">
    <!-- tareas pendientes sin fecha: se arrastran a un día; soltar aquí una del calendario le quita la fecha -->
    <aside
        class="todo-cal__side"
        :class="{ 'is-over': overDay === 'none' }"
        @dragover.prevent="overDay = 'none'"
        @dragleave="overDay = null"
        @drop.prevent="drop(null)"
    >
        <h3>Sin fecha <span class="muted">({{ store.undated.length }})</span></h3>
        <p class="muted">Arrástralas a un día, o haz clic en un día para asignarlas.</p>
        <ul>
            <li
                v-for="todo in store.undated"
                :key="todo.id"
                class="todo-chip"
                :class="{ 'is-dragging': draggingId === todo.id }"
                draggable="true"
                @dragstart="startDrag($event, todo.id)"
                @dragend="endDrag"
            >{{ todo.title }}</li>
        </ul>
        <p v-if="!store.undated.length" class="muted">Todas tienen fecha.</p>
    </aside>

    <!-- el locale en español también hace que la semana empiece en lunes -->
    <el-config-provider namespace="ep" :locale="es">
        <el-calendar v-model="month" class="todo-cal__grid">
            <template #date-cell="{ data }">
                <div
                    class="todo-cal__day"
                    :class="{ 'is-over': overDay === data.day, 'is-today': data.day === todayKey }"
                    @dragover.prevent="overDay = data.day"
                    @drop.prevent="drop(data.day)"
                    @click="openDay = data.day"
                >
                    <span class="todo-cal__num">{{ Number(data.day.slice(-2)) }}</span>
                    <button
                        v-for="todo in (store.byDay[data.day] ?? []).slice(0, MAX_PER_DAY)"
                        :key="todo.id"
                        type="button"
                        class="todo-chip"
                        :class="{ 'is-done': todo.done, 'is-overdue': isOverdue(todo), 'is-dragging': draggingId === todo.id }"
                        :title="todo.title"
                        draggable="true"
                        @dragstart="startDrag($event, todo.id)"
                        @dragend="endDrag"
                        @click.stop="openDay = data.day"
                    >{{ todo.title }}</button>
                    <span v-if="(store.byDay[data.day]?.length ?? 0) > MAX_PER_DAY" class="todo-cal__more">
                        +{{ store.byDay[data.day].length - MAX_PER_DAY }} más
                    </span>
                </div>
            </template>
        </el-calendar>
    </el-config-provider>

    <el-dialog :model-value="!!openDay" :title="openDayTitle" :width="isMobile ? '95%' : '460px'" class="todo-day" @update:model-value="openDay = null">
        <form class="todo-day__add" @submit.prevent="addHere">
            <el-input v-model="newTitle" maxlength="200" placeholder="Agregar una tarea en este día…" aria-label="Nueva tarea en este día" />
            <el-button type="primary" icon="Plus" native-type="submit" :disabled="!newTitle.trim()">Agregar</el-button>
        </form>
        <el-select
            v-if="store.undated.length"
            :model-value="null"
            filterable
            placeholder="Pasar aquí una tarea sin fecha"
            class="w-full mb-3"
            @change="(id: number) => openDay && moveTo(id, openDay)"
        >
            <el-option v-for="todo in store.undated" :key="todo.id" :label="todo.title" :value="todo.id" />
        </el-select>

        <ul v-if="openDayTodos.length" class="todo-day__list">
            <li v-for="todo in openDayTodos" :key="todo.id" :class="{ 'is-done': todo.done }">
                <el-checkbox :model-value="todo.done" :aria-label="todo.done ? 'Marcar como pendiente' : 'Marcar como hecha'" @change="toggle(todo.id)" />
                <span class="todo-day__title">{{ todo.title }}</span>
                <el-button text size="small" @click="moveTo(todo.id, null)">Quitar fecha</el-button>
            </li>
        </ul>
        <p v-else class="muted">Nada para este día.</p>
    </el-dialog>
</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import es from 'element-plus/es/locale/lang/es'
import { useAppStore } from '~/stores/app'
import { isOverdue, today } from '~/stores/todos'
import { useTodoCalendar } from '~/composables/useTodoCalendar'

// en cada día se ven unas cuantas; el resto, en el panel del día
const MAX_PER_DAY = 3

const appStore = useAppStore()
const isMobile = computed(() => appStore.isMobile)
const todayKey = today()
const month = ref(new Date())

const { store, draggingId, overDay, startDrag, endDrag, moveTo, drop, openDay, openDayTodos, openDayTitle, addOnDay } =
    useTodoCalendar(message => ElMessage.error(message))

const toggle = (id: number) => {
    store.toggle(id)?.catch(() => ElMessage.error('No se pudo guardar el cambio.'))
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
.todo-cal {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 16px;
    align-items: start;
    text-align: left;
}

.muted {
    margin: 0;
    color: var(--ep-text-color-secondary);
    font-size: 13px;
    font-weight: normal;
}

.todo-cal__side {
    position: sticky;
    top: 8px;
    max-height: calc(100vh - 140px);
    padding: 12px;
    overflow-y: auto;
    border: 1px dashed var(--ep-border-color);
    border-radius: 8px;
}

.todo-cal__side.is-over {
    border-color: var(--ep-color-primary);
    background: var(--ep-color-primary-light-9);
}

.todo-cal__side h3 {
    margin: 0 0 4px;
    font-size: 15px;
}

.todo-cal__side ul {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
}

/* el calendario ocupa el alto de la pantalla: cada semana se reparte lo que queda */
.todo-cal__grid :deep(.ep-calendar__body) {
    padding: 4px 12px 12px;
}

.todo-cal__grid :deep(.ep-calendar-table .ep-calendar-day) {
    height: max(92px, calc((100vh - 290px) / 6));
    padding: 0;
}

.todo-cal__grid :deep(.ep-calendar-table thead th) {
    text-transform: capitalize;
}

.todo-cal__day {
    display: flex;
    flex-direction: column;
    gap: 3px;
    height: 100%;
    padding: 4px 6px;
    overflow: hidden;
}

.todo-cal__day.is-over {
    outline: 2px dashed var(--ep-color-primary);
    outline-offset: -2px;
    background: var(--ep-color-primary-light-9);
}

.todo-cal__num {
    font-size: 13px;
}

.todo-cal__day.is-today .todo-cal__num {
    color: var(--ep-color-primary);
    font-weight: 700;
}

.todo-chip {
    display: block;
    width: 100%;
    padding: 2px 6px;
    overflow: hidden;
    border: 0;
    border-left: 3px solid var(--ep-color-primary);
    border-radius: 4px;
    background: var(--ep-fill-color-light);
    color: var(--ep-text-color-primary);
    font: inherit;
    font-size: 12px;
    line-height: 1.5;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: grab;
}

.todo-chip.is-overdue {
    border-left-color: var(--ep-color-danger);
    color: var(--ep-color-danger);
}

.todo-chip.is-done {
    border-left-color: var(--ep-border-color);
    color: var(--ep-text-color-secondary);
    text-decoration: line-through;
}

.todo-chip.is-dragging {
    opacity: 0.4;
}

.todo-cal__more {
    color: var(--ep-text-color-secondary);
    font-size: 12px;
}

.todo-day__add {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
}

.todo-day__list {
    margin: 0;
    padding: 0;
    list-style: none;
}

.todo-day__list li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
    border-bottom: 1px solid var(--ep-border-color-lighter);
}

.todo-day__title {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
}

.todo-day__list li.is-done .todo-day__title {
    color: var(--ep-text-color-secondary);
    text-decoration: line-through;
}

@media (max-width: 900px) {
    .todo-cal {
        grid-template-columns: 1fr;
    }

    .todo-cal__side {
        position: static;
        max-height: 220px;
    }

    .todo-cal__side ul {
        flex-flow: row wrap;
    }

    .todo-cal__side .todo-chip {
        width: auto;
        max-width: 100%;
    }
}
</style>
