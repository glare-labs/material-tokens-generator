import { Hct } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import {
    calculateContrastRatio,
    getLuminance,
    normalizeToneList,
    parseSourceColor,
} from '../../src/index'

describe('Color Utilities Unit Tests', () => {
    describe('parseSourceColor', () => {
        it('returns same instance when Hct is provided', () => {
            const hct = Hct.from(120, 50, 40)
            expect(parseSourceColor(hct)).toBe(hct)
        })

        it('parses valid 32-bit integer ARGB', () => {
            const hct = parseSourceColor(0xff6750a4)
            expect(hct.toInt()).toBe(0xff6750a4)
        })

        it('parses standard 6-digit hex string with or without #', () => {
            const hctWithHash = parseSourceColor('#6750a4')
            const hctWithoutHash = parseSourceColor('6750a4')
            expect(hctWithHash.toInt()).toBe(0xff6750a4)
            expect(hctWithoutHash.toInt()).toBe(0xff6750a4)
        })

        it('parses 3-digit hex string #RGB', () => {
            const hct = parseSourceColor('#abc')
            expect(hct.toInt()).toBe(parseSourceColor('#aabbcc').toInt())
        })

        it('parses 8-digit hex string #RRGGBBAA', () => {
            const hct = parseSourceColor('#6750a4ff')
            expect(hct.toInt()).toBe(0xff6750a4)
        })

        it('throws TypeError for invalid color inputs', () => {
            expect(() => parseSourceColor('')).toThrow(TypeError)
            expect(() => parseSourceColor('xyz123')).toThrow(TypeError)
            // @ts-expect-error - testing invalid
            expect(() => parseSourceColor({})).toThrow(TypeError)
        })
    })

    describe('normalizeToneList', () => {
        it('returns default tones when tones argument is undefined', () => {
            const result = normalizeToneList(undefined)
            expect(result).toHaveLength(16)
        })

        it('deduplicates and sorts custom tones in ascending order', () => {
            expect(normalizeToneList([50, 20, 50, 0, 100, 20])).toEqual([0, 20, 50, 100])
        })
    })

    describe('getLuminance & calculateContrastRatio', () => {
        it('calculates 0 luminance for pure black 0xff000000 and 1.0 for pure white 0xffffffff', () => {
            expect(getLuminance(0xff000000)).toBe(0)
            expect(getLuminance(0xffffffff)).toBeCloseTo(1.0, 4)
        })

        it('calculates 21:1 contrast ratio between white and black', () => {
            const contrast = calculateContrastRatio(0xffffffff, 0xff000000)
            expect(contrast).toBeCloseTo(21.0, 1)
        })

        it('calculates correct contrast ratio symmetrically', () => {
            const contrast1 = calculateContrastRatio(0xffffffff, 0xff6750a4)
            const contrast2 = calculateContrastRatio(0xff6750a4, 0xffffffff)
            expect(contrast1).toEqual(contrast2)
            expect(contrast1).toBeGreaterThan(1.0)
        })
    })
})
