import { describe, it, expect } from 'vitest'
import { elementIcons } from '../element-icons'

const sources = import.meta.glob('/src/**/*.{vue,ts,js}', { query: '?raw', import: 'default', eager: true })

describe('elementIcons', () => {
    it('registra todos los íconos que el panel usa por nombre', () => {
        const used = new Set()
        for (const [file, code] of Object.entries(sources)) {
            if (file.includes('__tests__')) continue
            // icon="Plus" en los botones y icon: 'House' en las rutas (sin ":" delante: los que son variables no cuentan)
            for (const [, name] of code.matchAll(/(?<![:\w-])icon(?:="|:\s*['"])([A-Z]\w+)['"]/g)) used.add(name)
        }

        expect(used.size).toBeGreaterThan(0)
        expect([...used].filter((name) => !elementIcons[name])).toEqual([])
    })
})
