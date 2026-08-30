import { Hct } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import {
    calculateContrastRatio,
    getLuminance,
    normalizeToneList,
    parseColor,
    parseSourceColor,
} from './color'

describe('utils/color', () => {
    describe('parseSourceColor / parseColor', () => {
        it('returns Hct instance unchanged when passed an Hct object', () => {
            const hct = Hct.fromInt(0xff6750a4)
            expect(parseSourceColor(hct)).toBe(hct)
            expect(parseColor(hct)).toBe(hct)
        })

        it('parses valid 32-bit ARGB integers', () => {
            const parsed = parseSourceColor(0xff6750a4)
            expect(parsed.toInt()).toBe(0xff6750a4)
        })

        it('parses 6-digit hex strings (#rrggbb)', () => {
            const parsed = parseSourceColor('#6750A4')
            expect(parsed.toInt()).toBe(0xff6750a4)
        })

        it('parses 3-digit hex strings (#rgb)', () => {
            const parsed = parseSourceColor('#f00')
            expect(parsed.toInt()).toBe(0xffff0000)
        })

        it('parses 8-digit hex strings (#rrggbbaa)', () => {
            const parsed = parseSourceColor('#ff000080')
            expect((parsed.toInt() >>> 24) & 0xff).toBe(0x80)
        })

        it('throws TypeError on invalid inputs', () => {
            // @ts-expect-error invalid input
            expect(() => parseSourceColor(null)).toThrow(TypeError)
            // @ts-expect-error invalid input
            expect(() => parseSourceColor(undefined)).toThrow(TypeError)
            expect(() => parseSourceColor('')).toThrow(/empty/i)
            expect(() => parseSourceColor('#invalid')).toThrow(/invalid hex/i)
            expect(() => parseSourceColor(NaN)).toThrow(/valid 32-bit integer/i)
            expect(() => parseSourceColor(1.5)).toThrow(/valid 32-bit integer/i)
        })
    })

    describe('normalizeToneList', () => {
        it('returns standard tones by default', () => {
            const tones = normalizeToneList()
            expect(tones).toEqual([
                0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
            ])
        })

        it('sorts and deduplicates custom tone list', () => {
            const normalized = normalizeToneList([100, 0, 50, 0, 50, 20])
            expect(normalized).toEqual([0, 20, 50, 100])
        })

        it('throws TypeError when array is empty', () => {
            expect(() => normalizeToneList([])).toThrow(/cannot be empty/i)
        })

        it('throws TypeError when tone is out of range or not an integer', () => {
            expect(() => normalizeToneList([-1])).toThrow(/between 0 and 100/i)
            expect(() => normalizeToneList([101])).toThrow(/between 0 and 100/i)
            expect(() => normalizeToneList([50.5])).toThrow(/integers between 0 and 100/i)
        })
    })

    describe('getLuminance & calculateContrastRatio', () => {
        it('calculates luminance for black and white', () => {
            const blackLum = getLuminance(0xff000000)
            const whiteLum = getLuminance(0xffffffff)

            expect(blackLum).toBeCloseTo(0, 3)
            expect(whiteLum).toBeCloseTo(1, 3)
        })

        it('calculates WCAG contrast ratio correctly (21:1 for black and white)', () => {
            const ratio = calculateContrastRatio(0xffffffff, 0xff000000)
            expect(ratio).toBeCloseTo(21, 0)
        })

        it('contrast ratio between same colors is 1:1', () => {
            const ratio = calculateContrastRatio(0xff6750a4, 0xff6750a4)
            expect(ratio).toBeCloseTo(1, 1)
        })
    })
})
