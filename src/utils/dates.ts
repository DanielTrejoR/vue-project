// Fechas en español para el perfil: "hace 5 minutos" y la fecha completa para el title
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/es'

dayjs.extend(relativeTime)

export const fromNow = (date?: string | null) => (date ? dayjs(date).locale('es').fromNow() : '')

export const fullDate = (date?: string | null) =>
  date ? dayjs(date).locale('es').format('D [de] MMMM [de] YYYY, HH:mm') : ''
