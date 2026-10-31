/** 215 → "3:35" (minutos:segundos) */
export const formatTime = (seconds: number) => {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
