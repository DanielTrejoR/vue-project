// Fechas en español para el perfil: "hace 5 minutos" y la fecha completa para el title
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)

export const fromNow = (date?: string | null) => (date ? dayjs(date).locale('es').fromNow() : '')

export const fullDate = (date?: string | null) =>
  date ? dayjs(date).locale('es').format('D [de] MMMM [de] YYYY, HH:mm') : ''

// vencimiento de una tarea (YYYY-MM-DD, sin hora): "Hoy", "Mañana", "Ayer" o "12 nov" (con año si no es este)
export const dueLabel = (date?: string | null) => {
  if (!date) return ''
  const due = dayjs(date).locale('es')
  const days = due.startOf('day').diff(dayjs().startOf('day'), 'day')
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  if (days === -1) return 'Ayer'
  return due.format(due.year() === dayjs().year() ? 'D MMM' : 'D MMM YYYY')
}
