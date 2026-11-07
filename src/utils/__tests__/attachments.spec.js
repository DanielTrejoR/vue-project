import { describe, it, expect } from 'vitest'
import { mergeAttachments, moveItem } from '../attachments'

const f = id => ({ id })

describe('attachments', () => {
    it('agrega al final sin duplicar', () => {
        expect(mergeAttachments([f(1), f(2)], [f(2), f(3), f(3), f(4)]).map(x => x.id)).toEqual([1, 2, 3, 4])
    })

    it('mueve arriba y abajo', () => {
        expect(moveItem([1, 2, 3], 1, -1)).toEqual([2, 1, 3])
        expect(moveItem([1, 2, 3], 1, 1)).toEqual([1, 3, 2])
    })

    it('no mueve fuera de rango ni muta la original', () => {
        const list = [1, 2, 3]
        expect(moveItem(list, 0, -1)).toEqual([1, 2, 3])
        expect(moveItem(list, 2, 1)).toEqual([1, 2, 3])
        moveItem(list, 0, 1)
        expect(list).toEqual([1, 2, 3])
    })
})
