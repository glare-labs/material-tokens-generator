import { describe, expect, it } from 'vitest'
import {
    DEFAULT_PALETTE_TONES,
    DefaultPaletteTones,
    STANDARD_PALETTE_TONES,
    SchemePaletteNameArray,
    StandardPaletteTones,
} from './palette.types'

describe('types/palette.types', () => {
    describe('SchemePaletteNameArray', () => {
        it('contains all 6 standard Material palette family names', () => {
            expect(SchemePaletteNameArray).toEqual([
                'primaryPalette',
                'secondaryPalette',
                'tertiaryPalette',
                'errorPalette',
                'neutralPalette',
                'neutralVariantPalette',
            ])
        })
    })

    describe('Tone Constants', () => {
        it('StandardPaletteTones contains standard 16 milestone tones', () => {
            expect(StandardPaletteTones).toEqual([
                0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
            ])
            expect(STANDARD_PALETTE_TONES).toBe(StandardPaletteTones)
        })

        it('DefaultPaletteTones contains 101 integer tones (0..100)', () => {
            expect(DefaultPaletteTones).toHaveLength(101)
            expect(DefaultPaletteTones[0]).toBe(0)
            expect(DefaultPaletteTones[100]).toBe(100)
            expect(DEFAULT_PALETTE_TONES).toBe(DefaultPaletteTones)
        })
    })
})
