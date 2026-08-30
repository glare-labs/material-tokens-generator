import { describe, expect, it } from 'vitest'
import { MaterialContrastLevel, MaterialVariant } from './material.types'

describe('types/material.types', () => {
    describe('MaterialVariant', () => {
        it('exports numerical enum values for variants', () => {
            expect(MaterialVariant.Monochrome).toBe(0)
            expect(MaterialVariant.Neutral).toBe(1)
            expect(MaterialVariant.TonalSpot).toBe(2)
            expect(MaterialVariant.Vibrant).toBe(3)
            expect(MaterialVariant.Expressive).toBe(4)
            expect(MaterialVariant.Fidelity).toBe(5)
            expect(MaterialVariant.Content).toBe(6)
            expect(MaterialVariant.Rainbow).toBe(7)
            expect(MaterialVariant.FruitSalad).toBe(8)
        })
    })

    describe('MaterialContrastLevel', () => {
        it('exports numerical values for contrast levels', () => {
            expect(MaterialContrastLevel.Reduced).toBe(-1.0)
            expect(MaterialContrastLevel.Default).toBe(0.0)
            expect(MaterialContrastLevel.Medium).toBe(0.5)
            expect(MaterialContrastLevel.High).toBe(1.0)
        })
    })
})
