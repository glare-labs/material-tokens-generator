import { TonalPalette } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import {
    createPaletteTones,
    DEFAULT_PALETTE_TONES,
    DefaultPaletteTones,
    STANDARD_PALETTE_TONES,
    StandardPaletteTones,
} from './palette'

describe('core/palette', () => {
    describe('Constants & Exports', () => {
        it('exports DEFAULT_PALETTE_TONES (0..100)', () => {
            expect(DEFAULT_PALETTE_TONES).toHaveLength(101)
            expect(DEFAULT_PALETTE_TONES[0]).toBe(0)
            expect(DEFAULT_PALETTE_TONES[100]).toBe(100)
            expect(DefaultPaletteTones).toBe(DEFAULT_PALETTE_TONES)
        })

        it('exports STANDARD_PALETTE_TONES with key tone milestones', () => {
            expect(STANDARD_PALETTE_TONES).toEqual([
                0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
            ])
            expect(StandardPaletteTones).toBe(STANDARD_PALETTE_TONES)
        })
    })

    describe('createPaletteTones', () => {
        const palette = TonalPalette.fromHueAndChroma(240, 40)

        it('generates tones using default STANDARD_PALETTE_TONES when no options provided', () => {
            const getTones = createPaletteTones()
            const entries = getTones(palette)

            expect(Object.keys(entries)).toHaveLength(STANDARD_PALETTE_TONES.length)
            expect(Object.keys(entries).map(Number)).toEqual(STANDARD_PALETTE_TONES)
            expect(Object.values(entries).every((color) => typeof color === 'number' && Number.isInteger(color))).toBe(true)
        })

        it('generates tones for custom specified tones array', () => {
            const customTones = [0, 40, 80, 100]
            const getTones = createPaletteTones({ tones: customTones })
            const entries = getTones(palette)

            expect(Object.keys(entries)).toHaveLength(4)
            expect(Object.keys(entries).map(Number)).toEqual([0, 40, 80, 100])
            expect(entries[0]).toBe(palette.tone(0))
            expect(entries[40]).toBe(palette.tone(40))
            expect(entries[80]).toBe(palette.tone(80))
            expect(entries[100]).toBe(palette.tone(100))
        })

        it('handles Pick<TonalPalette, "tone"> object implementations', () => {
            const mockPalette = {
                tone: (t: number) => 0xff000000 + t,
            }
            const getTones = createPaletteTones({ tones: [10, 50] })
            const entries = getTones(mockPalette)

            expect(entries).toEqual({
                10: 0xff00000a,
                50: 0xff000032,
            })
        })

        it('throws TypeError when palette is invalid or lacks a tone method', () => {
            const getTones = createPaletteTones()
            // @ts-expect-error invalid palette argument
            expect(() => getTones(null)).toThrow(TypeError)
            // @ts-expect-error invalid palette argument
            expect(() => getTones({})).toThrow(/tone method/i)
        })

        it('deduplicates and sorts custom tone lists', () => {
            const getTones = createPaletteTones({ tones: [90, 10, 50, 10, 90, 0] })
            const entries = getTones(palette)

            expect(Object.keys(entries).map(Number)).toEqual([0, 10, 50, 90])
        })
    })
})
