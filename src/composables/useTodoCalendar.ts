// Lo que comparten los calendarios de tareas del admin (Element Plus) y de Mi espacio (Vuetify):
// arrastrar una tarea a un día (o a "Sin fecha"), el día abierto y agregar tareas en ese día.
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { useTodosStore } from '~/stores/todos'

export function useTodoCalendar(onError: (message: string) => void) {
  const store = useTodosStore()

  // --- arrastrar y soltar (solo con mouse; en el celular se usa el panel del día) ---
  const draggingId = ref<number | null>(null)
  // día sobre el que se está arrastrando, para resaltarlo; 'none' = el panel "Sin fecha"
  const overDay = ref<string | null>(null)

  const startDrag = (event: DragEvent, id: number) => {
    draggingId.value = id
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(id))
    }
  }
  const endDrag = () => {
    draggingId.value = null
    overDay.value = null
  }

  /** @param day YYYY-MM-DD o null para quitarle la fecha */
  const moveTo = (id: number, day: string | null) => {
    const todo = store.items.find(t => t.id === id)
    if (!todo || todo.due_on === day) return
    store.update(id, { due_on: day })?.catch(() => onError('No se pudo cambiar la fecha.'))
  }
  const drop = (day: string | null) => {
    if (draggingId.value !== null) moveTo(draggingId.value, day)
    endDrag()
  }

  // --- panel del día ---
  const openDay = ref<string | null>(null)
  const openDayTodos = computed(() => (openDay.value ? store.byDay[openDay.value] ?? [] : []))
  const openDayTitle = computed(() => (openDay.value ? dayTitle(openDay.value) : ''))

  const addOnDay = async (title: string, day: string) => {
    if (!title.trim()) return false
    try {
      await store.add({ title: title.trim(), due_on: day })
      return true
    } catch (error: any) {
      const errors = error?.response?.data?.errors
      onError(errors ? (Object.values(errors).flat()[0] as string) : error?.response?.data?.message || 'No se pudo agregar la tarea.')
      return false
    }
  }

  return { store, draggingId, overDay, startDrag, endDrag, moveTo, drop, openDay, openDayTodos, openDayTitle, addOnDay }
}

// "Viernes 7 de noviembre" (con año si no es este)
export const dayTitle = (day: string) => {
  const date = dayjs(day).locale('es')
  const text = date.format(date.year() === dayjs().year() ? 'dddd D [de] MMMM' : 'dddd D [de] MMMM [de] YYYY')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Date → YYYY-MM-DD con la fecha local (toISOString daría la de UTC)
export const toDay = (date: Date) => dayjs(date).format('YYYY-MM-DD')
