// Tamaño legible: 1536 -> '1.5 KB'
export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes < 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** i
  // sin decimales para bytes y para valores enteros ('20 MB')
  return `${Number.isInteger(value) || i === 0 ? value : value.toFixed(1)} ${units[i]}`
}

// Nombre del ícono de Element Plus por tipo de archivo (registrados en layouts/Admin/element-icons.ts)
const icons: Record<string, string> = {
  image: 'Picture',
  video: 'VideoCamera',
  audio: 'Headset',
  pdf: 'Document',
  document: 'Document',
  archive: 'Box',
  other: 'Files',
}

export const kindIcon = (kind: string): string => icons[kind] ?? icons.other
