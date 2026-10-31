import { describe, it, expect, beforeEach } from 'vitest'
import { setPageMeta, sharePostUrl, backendOrigin, DEFAULT_DESCRIPTION } from '../seo'

const content = selector => document.head.querySelector(selector)?.getAttribute('content')

describe('seo', () => {
    beforeEach(() => {
        document.head.innerHTML = ''
        window.history.replaceState(null, '', '/posts/mi-post?ref=x#comentarios')
    })

    it('pone título, descripción, canónica y etiquetas og de un post', () => {
        setPageMeta({ title: 'Mi post', description: 'Resumen', image: 'http://img/a.jpg', type: 'article' })

        expect(document.title).toBe('Mi post - Vue Project Daniel')
        expect(content('meta[name="description"]')).toBe('Resumen')
        // sin query ni hash
        expect(document.head.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(`${window.location.origin}/posts/mi-post`)
        expect(content('meta[property="og:type"]')).toBe('article')
        expect(content('meta[property="og:image"]')).toBe('http://img/a.jpg')
        expect(content('meta[name="twitter:card"]')).toBe('summary_large_image')
    })

    it('al pasar a una página sin imagen quita la anterior y no duplica etiquetas', () => {
        setPageMeta({ title: 'Con foto', image: 'http://img/a.jpg' })
        setPageMeta({ title: 'Blog' })

        expect(document.head.querySelector('meta[property="og:image"]')).toBeNull()
        expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
        expect(content('meta[name="description"]')).toBe(DEFAULT_DESCRIPTION)
        expect(content('meta[name="twitter:card"]')).toBe('summary')
    })

    it('arma la URL para compartir en el backend, sin /api', () => {
        expect(backendOrigin()).not.toMatch(/\/api$/)
        expect(sharePostUrl('mi post')).toBe(`${backendOrigin()}/share/posts/mi%20post`)
    })
})
