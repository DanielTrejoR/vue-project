// Lista con scroll infinito por cursor: carga la primera tanda y, cuando el elemento "centinela"
// (al final de la lista) entra en pantalla, pide la siguiente hasta que el backend no devuelva cursor.
import { ref, shallowRef, onBeforeUnmount, watch } from 'vue'

export interface CursorPage<T> {
  data: T[]
  next_cursor: string | null
}

export function useInfiniteList<T>(fetchPage: (cursor: string | null) => Promise<CursorPage<T>>) {
  const items = ref<T[]>([]) as { value: T[] }
  const cursor = ref<string | null>(null)
  const loading = ref(false)
  const done = ref(false)
  const error = ref('')
  const sentinel = shallowRef<HTMLElement | null>(null)

  const loadMore = async () => {
    if (loading.value || done.value) return
    loading.value = true
    error.value = ''
    try {
      const page = await fetchPage(cursor.value)
      items.value = [...items.value, ...page.data]
      cursor.value = page.next_cursor
      done.value = !page.next_cursor
    } catch {
      error.value = 'No se pudo cargar. Inténtalo de nuevo.'
    } finally {
      loading.value = false
    }
    // si la tanda no llenó la pantalla, el centinela sigue visible: se pide otra
    if (!done.value && !error.value && isSentinelVisible()) loadMore()
  }

  const reset = () => {
    items.value = []
    cursor.value = null
    done.value = false
    error.value = ''
    return loadMore()
  }

  const isSentinelVisible = () => {
    const el = sentinel.value
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.top < window.innerHeight + 200 && rect.bottom > -200
  }

  // 200px de margen: la siguiente tanda empieza a cargar un poco antes de llegar al final
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) loadMore()
  }, { rootMargin: '200px' })

  watch(sentinel, (el, previous) => {
    if (previous) observer.unobserve(previous)
    if (el) observer.observe(el)
  })

  onBeforeUnmount(() => observer.disconnect())

  return { items, loading, done, error, sentinel, loadMore, reset }
}
