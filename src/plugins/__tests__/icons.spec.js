import { describe, it, expect } from 'vitest'
import { icons, iconName, resolveIcon } from '../icons'

// todas las plantillas: cada "mdi-*" que aparezca tiene que estar registrado
const sources = import.meta.glob('/src/**/*.{vue,ts,js}', { query: '?raw', import: 'default', eager: true })

describe('icons', () => {
    it('resuelve "mdi mdi-*" y "mdi-*" al path SVG', () => {
        expect(iconName('mdi mdi-arrow-left')).toBe('arrow-left')
        expect(resolveIcon('mdi mdi-arrow-left')).toBe(icons['arrow-left'])
        expect(resolveIcon('mdi-plus')).toBe(icons.plus)
        expect(resolveIcon('svg:M0,0')).toBe('svg:M0,0')
    })

    it('todos los íconos usados en src están registrados', () => {
        const used = new Set()
        for (const [file, code] of Object.entries(sources)) {
            if (file.includes('__tests__') || file.endsWith('plugins/icons.ts')) continue
            for (const [, name] of code.matchAll(/\bmdi-([a-z0-9-]+)/g)) used.add(name)
        }

        expect(used.size).toBeGreaterThan(0)
        expect([...used].filter((name) => !icons[name])).toEqual([])
    })
})
