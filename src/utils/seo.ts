// Metadatos de cada página del blog (descripción, URL canónica y etiquetas og/twitter).
// Google ejecuta JavaScript y los lee; las redes sociales no, por eso compartir usa /share/posts del backend.
import { ref } from 'vue'
import defaultSettings from '@/settings'

const SITE_NAME = defaultSettings.title

// título de la página actual para las migas del front; guarda la ruta para no mostrar el de la página anterior
export const pageTitle = ref<{ path: string; title: string } | null>(null)
export const DEFAULT_DESCRIPTION = 'Ideas, experimentos y cosas que siempre quise hacer, publicadas a medida que salen.'

interface PageMeta {
  title?: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
}

// origen del backend (VITE_API_BASE_URL sin el /api final): ahí viven /sitemap.xml y /share
export const backendOrigin = () => String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

export const sharePostUrl = (url: string) => `${backendOrigin()}/share/posts/${encodeURIComponent(url)}`

const setTag = (selector: string, create: () => HTMLElement, attribute: string, value: string | null | undefined) => {
  let element = document.head.querySelector<HTMLElement>(selector)
  if (!value) {
    element?.remove()
    return
  }
  if (!element) {
    element = create()
    document.head.appendChild(element)
  }
  element.setAttribute(attribute, value)
}

const meta = (key: 'name' | 'property', name: string, content?: string | null) =>
  setTag(`meta[${key}="${name}"]`, () => {
    const element = document.createElement('meta')
    element.setAttribute(key, name)
    return element
  }, 'content', content)

export function setPageMeta({ title, description = DEFAULT_DESCRIPTION, image = null, type = 'website' }: PageMeta = {}) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME
  // sin query ni hash: la misma página con filtros no cuenta como otra
  const url = window.location.origin + window.location.pathname

  document.title = fullTitle
  pageTitle.value = title ? { path: window.location.pathname, title } : null
  meta('name', 'description', description)
  setTag('link[rel="canonical"]', () => {
    const link = document.createElement('link')
    link.rel = 'canonical'
    return link
  }, 'href', url)

  meta('property', 'og:site_name', SITE_NAME)
  meta('property', 'og:type', type)
  meta('property', 'og:title', title || SITE_NAME)
  meta('property', 'og:description', description)
  meta('property', 'og:url', url)
  meta('property', 'og:image', image)
  meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
}
