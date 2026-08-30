import { describe, expect, it } from 'vitest'
import {
    formatColorMix,
    formatDisplayP3,
    formatHex,
    formatRgb,
    resolveColorFormatter,
} from './color-format'

describe('formatters/color-format', () => {
    const red = 0xffff0000
    const green = 0xff00ff00
    const blue = 0xff0000ff
    const white = 0xffffffff
    const black = 0xff000000
    const translucentBlue = 0x800000ff // alpha = 128 (0.502)

    describe('formatHex', () => {
        it('formats opaque colors as #rrggbb', () => {
            expect(formatHex(red)).toBe('#ff0000')
            expect(formatHex(green)).toBe('#00ff00')
            expect(formatHex(blue)).toBe('#0000ff')
            expect(formatHex(white)).toBe('#ffffff')
            expect(formatHex(black)).toBe('#000000')
        })

        it('formats non-opaque colors with alpha channel as #rrggbbaa', () => {
            expect(formatHex(translucentBlue)).toBe('#0000ff80')
        })
    })

    describe('formatRgb', () => {
        it('formats opaque colors into rgb(r g b)', () => {
            expect(formatRgb(red)).toBe('rgb(255 0 0)')
            expect(formatRgb(green)).toBe('rgb(0 255 0)')
            expect(formatRgb(blue)).toBe('rgb(0 0 255)')
            expect(formatRgb(white)).toBe('rgb(255 255 255)')
            expect(formatRgb(black)).toBe('rgb(0 0 0)')
        })

        it('formats non-opaque colors into rgb(r g b / alpha)', () => {
            expect(formatRgb(translucentBlue)).toBe('rgb(0 0 255 / 0.502)')
        })
    })

    describe('formatDisplayP3', () => {
        it('formats opaque colors into color(display-p3 r g b)', () => {
            const p3Red = formatDisplayP3(red)
            expect(p3Red.startsWith('color(display-p3 ')).toBe(true)
            expect(p3Red.endsWith(')')).toBe(true)

            // P3 coordinates should be bounded [0, 1]
            const match = p3Red.match(/color\(display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
            expect(match).not.toBeNull()
            const [_, r, g, b] = match!
            expect(Number(r)).toBeGreaterThanOrEqual(0)
            expect(Number(r)).toBeLessThanOrEqual(1)
            expect(Number(g)).toBeGreaterThanOrEqual(0)
            expect(Number(g)).toBeLessThanOrEqual(1)
            expect(Number(b)).toBeGreaterThanOrEqual(0)
            expect(Number(b)).toBeLessThanOrEqual(1)
        })

        it('formats black and white correctly in P3', () => {
            expect(formatDisplayP3(black)).toBe('color(display-p3 0 0 0)')
            expect(formatDisplayP3(white)).toBe('color(display-p3 1 1 1)')
        })

        it('formats non-opaque colors with alpha in P3', () => {
            const result = formatDisplayP3(translucentBlue)
            expect(result).toBe('color(display-p3 0 0 0.9596 / 0.502)')
        })
    })

    describe('formatColorMix', () => {
        it('formats colors with default in srgb interpolation space', () => {
            expect(formatColorMix(red)).toBe('color-mix(in srgb, #ff0000 100%, transparent)')
        })

        it('formats colors with display-p3 interpolation space', () => {
            expect(formatColorMix(blue, 'display-p3')).toBe('color-mix(in display-p3, #0000ff 100%, transparent)')
        })
    })

    describe('resolveColorFormatter', () => {
        it('resolves standard format names', () => {
            expect(resolveColorFormatter('hex')(red)).toBe('#ff0000')
            expect(resolveColorFormatter('rgb')(red)).toBe('rgb(255 0 0)')
            expect(resolveColorFormatter('rgba')(red)).toBe('rgb(255 0 0)')
            expect(resolveColorFormatter('display-p3')(black)).toBe('color(display-p3 0 0 0)')
            expect(resolveColorFormatter('color-mix')(red)).toBe('color-mix(in srgb, #ff0000 100%, transparent)')
        })

        it('supports custom formatter function passing through', () => {
            const customFormatter = (argb: number) => `custom-color(${argb.toString(16)})`
            const resolved = resolveColorFormatter(customFormatter)
            expect(resolved(0xff112233)).toBe('custom-color(ff112233)')
        })
    })
})
