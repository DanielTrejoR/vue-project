// Lógica pura de la lista de adjuntos de un post (sin dependencias de Vue)

// Agrega los nuevos al final, sin repetir ids ya adjuntos ni repetidos entre los nuevos
export const mergeAttachments = <T extends { id: number }>(current: T[], incoming: T[]): T[] => {
  const ids = new Set(current.map((f) => f.id))
  const added = incoming.filter((f) => !ids.has(f.id) && ids.add(f.id))
  return [...current, ...added]
}

// Mueve el elemento `index` una posición (delta -1 sube, 1 baja); fuera de rango devuelve la lista igual
export const moveItem = <T>(list: T[], index: number, delta: -1 | 1): T[] => {
  const target = index + delta
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return list
  const copy = [...list]
  ;[copy[index], copy[target]] = [copy[target], copy[index]]
  return copy
}
