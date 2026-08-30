import { TonalPalette } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import {
    createPaletteTones,
    DEFAULT_PALETTE_TONES,
    DefaultPaletteTones,
    STANDARD_PALETTE_TONES,
    StandardPaletteTones,
} from '../../src/index'

describe('createPaletteTones Core Unit Tests', () => {
    const palette = TonalPalette.fromHueAndChroma(280, 60)

    it('generates 16 standard tones by default', () => {
        const getTones = createPaletteTones()
        const entries = getTones(palette)

        expect(Object.keys(entries)).toHaveLength(16)
        expect(Object.keys(entries).map(Number)).toEqual([
            0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
        ])
        for (const [toneStr, color] of Object.entries(entries)) {
            expect(color).toBe(palette.tone(Number(toneStr)))
        }
    })

    it('generates custom tones and sorts/deduplicates them', () => {
        const getTones = createPaletteTones({ tones: [90, 10, 50, 10, 90, 0] })
        const entries = getTones(palette)

        expect(Object.keys(entries)).toHaveLength(4)
        expect(Object.keys(entries).map(Number)).toEqual([0, 10, 50, 90])
    })

    it('throws TypeError for empty tones array', () => {
        expect(() => createPaletteTones({ tones: [] })(palette)).toThrow(TypeError)
    })

    it('throws TypeError for out of range or non-integer tones', () => {
        expect(() => createPaletteTones({ tones: [-1] })(palette)).toThrow(TypeError)
        expect(() => createPaletteTones({ tones: [101] })(palette)).toThrow(TypeError)
        expect(() => createPaletteTones({ tones: [45.5] })(palette)).toThrow(TypeError)
        expect(() => createPaletteTones({ tones: [NaN] })(palette)).toThrow(TypeError)
        expect(() => createPaletteTones({ tones: [Infinity] })(palette)).toThrow(TypeError)
    })

    it('throws TypeError for null, undefined, or invalid palette object', () => {
        // @ts-expect-error - testing invalid palette
        expect(() => createPaletteTones()(null)).toThrow(TypeError)
        // @ts-expect-error - testing invalid palette
        expect(() => createPaletteTones()({})).toThrow(TypeError)
    })

    it('exports standard tone constants matching references', () => {
        expect(STANDARD_PALETTE_TONES).toEqual(StandardPaletteTones)
        expect(STANDARD_PALETTE_TONES).toHaveLength(16)
        expect(DEFAULT_PALETTE_TONES).toEqual(DefaultPaletteTones)
        expect(DEFAULT_PALETTE_TONES).toHaveLength(101)
    })
})
