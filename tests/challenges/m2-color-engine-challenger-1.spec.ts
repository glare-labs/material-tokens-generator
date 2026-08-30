import { describe, expect, it } from 'vitest'
import {
    formatColorMix,
    formatDisplayP3,
    formatHex,
    formatRgb,
    resolveColorFormatter,
} from '../../src/formatters/color-format'
import { toCSS } from '../../src/serializers/css.serializer'
import { createTheme } from '../../src/core/theme'
import { MaterialVariant } from '../../src'

describe('Challenger 1 Empirical Verification: Modern CSS Color Formatting Engine', () => {

    // =========================================================================
    // 1. Display P3 Matrix Calculations & IEEE-754 Boundary Mathematics
    // =========================================================================
    describe('1. Display P3 Matrix Calculations, Gamut Boundaries & Precision', () => {
        it('verifies exact Display P3 coordinates for extreme primaries, black, white, and secondaries', () => {
            const expectedColors: Record<string, { argb: number; expected: string }> = {
                'Pure Red (#FF0000)': {
                    argb: 0xffff0000,
                    expected: 'color(display-p3 0.9175 0.2003 0.1386)',
                },
                'Pure Green (#00FF00)': {
                    argb: 0xff00ff00,
                    expected: 'color(display-p3 0.4584 0.9853 0.2983)',
                },
                'Pure Blue (#0000FF)': {
                    argb: 0xff0000ff,
                    expected: 'color(display-p3 0 0 0.9596)',
                },
                'Pure Black (#000000)': {
                    argb: 0xff000000,
                    expected: 'color(display-p3 0 0 0)',
                },
                'Pure White (#FFFFFF)': {
                    argb: 0xffffffff,
                    expected: 'color(display-p3 1 1 1)',
                },
                'Pure Yellow (#FFFF00)': {
                    argb: 0xffffff00,
                    expected: 'color(display-p3 1 1 0.3309)',
                },
                'Pure Cyan (#00FFFF)': {
                    argb: 0xff00ffff,
                    expected: 'color(display-p3 0.4584 0.9853 0.9925)',
                },
                'Pure Magenta (#FF00FF)': {
                    argb: 0xffff00ff,
                    expected: 'color(display-p3 0.9175 0.2003 0.9675)',
                },
            }

            for (const [name, { argb, expected }] of Object.entries(expectedColors)) {
                const actual = formatDisplayP3(argb)
                expect(actual, `Failed for ${name}`).toBe(expected)
            }
        })

        it('strictly bounds coordinates to [0, 1] across all boundary cross-product combinations (6x6x6x7)', () => {
            const channelValues = [0, 1, 127, 128, 254, 255]
            const alphaValues = [0, 1, 51, 128, 204, 254, 255]

            const p3Pattern = /^color\(display-p3 (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1)( \/ (0|0\.\d{1,4}|1))?\)$/

            let totalChecked = 0
            for (const a of alphaValues) {
                for (const r of channelValues) {
                    for (const g of channelValues) {
                        for (const b of channelValues) {
                            const argb = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0
                            const formatted = formatDisplayP3(argb)

                            expect(formatted).toMatch(p3Pattern)
                            totalChecked++

                            // Parse floats and verify numerical bounds
                            const match = formatted.match(/color\(display-p3 ([0-9.]+) ([0-9.]+) ([0-9.]+)(?: \/ ([0-9.]+))?\)/)
                            expect(match).not.toBeNull()
                            if (match) {
                                const [, rStr, gStr, bStr, aStr] = match
                                const rF = parseFloat(rStr)
                                const gF = parseFloat(gStr)
                                const bF = parseFloat(bStr)

                                expect(rF).toBeGreaterThanOrEqual(0)
                                expect(rF).toBeLessThanOrEqual(1)
                                expect(gF).toBeGreaterThanOrEqual(0)
                                expect(gF).toBeLessThanOrEqual(1)
                                expect(bF).toBeGreaterThanOrEqual(0)
                                expect(bF).toBeLessThanOrEqual(1)

                                if (aStr !== undefined) {
                                    const aF = parseFloat(aStr)
                                    expect(aF).toBeGreaterThanOrEqual(0)
                                    expect(aF).toBeLessThanOrEqual(1)
                                }
                            }
                        }
                    }
                }
            }
            expect(totalChecked).toBe(6 * 6 * 6 * 7) // 1512 combinations
        })

        it('verifies exact 4-decimal place precision and trailing zero stripping', () => {
            // Check that 0.5000 -> 0.5, 0.2000 -> 0.2, 1.0000 -> 1, 0.0000 -> 0
            const p3 = formatDisplayP3(0xff000000)
            expect(p3).toBe('color(display-p3 0 0 0)')

            const p3White = formatDisplayP3(0xffffffff)
            expect(p3White).toBe('color(display-p3 1 1 1)')

            // Check that non-zero decimals never exceed 4 places
            const p3Mid = formatDisplayP3(0xff3a8bcd)
            const match = p3Mid.match(/color\(display-p3 ([0-9.]+) ([0-9.]+) ([0-9.]+)\)/)
            expect(match).not.toBeNull()
            if (match) {
                const [, rStr, gStr, bStr] = match
                for (const part of [rStr, gStr, bStr]) {
                    const decimals = part.split('.')[1]
                    if (decimals) {
                        expect(decimals.length).toBeLessThanOrEqual(4)
                    }
                }
            }
        })
    })

    // =========================================================================
    // 2. Modern RGB / RGBA Space-Separated Syntax Across Alpha Spectrum
    // =========================================================================
    describe('2. Modern RGB/RGBA Space-Separated Formatting & Alpha Spectrum', () => {
        it('emits CSS Color 4 rgb(r g b) syntax without commas for opaque colors', () => {
            expect(formatRgb(0xff000000)).toBe('rgb(0 0 0)')
            expect(formatRgb(0xffffffff)).toBe('rgb(255 255 255)')
            expect(formatRgb(0xffff0000)).toBe('rgb(255 0 0)')
            expect(formatRgb(0xff00ff00)).toBe('rgb(0 255 0)')
            expect(formatRgb(0xff0000ff)).toBe('rgb(0 0 255)')
            expect(formatRgb(0xffabcdef)).toBe('rgb(171 205 239)')
        })

        it('emits modern slash-separated alpha rgb(r g b / a) for transparent colors', () => {
            expect(formatRgb(0x00000000)).toBe('rgb(0 0 0 / 0)')
            expect(formatRgb(0x80ffffff)).toBe('rgb(255 255 255 / 0.502)')
            expect(formatRgb(0x33ff0000)).toBe('rgb(255 0 0 / 0.2)')
            expect(formatRgb(0x6600ff00)).toBe('rgb(0 255 0 / 0.4)')
            expect(formatRgb(0x990000ff)).toBe('rgb(0 0 255 / 0.6)')
            expect(formatRgb(0xcc000000)).toBe('rgb(0 0 0 / 0.8)')
            expect(formatRgb(0x01000000)).toBe('rgb(0 0 0 / 0.0039)')
            expect(formatRgb(0xfe000000)).toBe('rgb(0 0 0 / 0.9961)')
        })

        it('correctly maps all 256 alpha values without NaN, Infinity, or formatting anomalies', () => {
            for (let a = 0; a <= 255; a++) {
                const argb = ((a << 24) | 0x112233) >>> 0
                const rgb = formatRgb(argb)
                if (a === 255) {
                    expect(rgb).toBe('rgb(17 34 51)')
                } else {
                    const expectedAlpha = Number((a / 255).toFixed(4))
                    expect(rgb).toBe(`rgb(17 34 51 / ${expectedAlpha})`)
                }
            }
        })
    })

    // =========================================================================
    // 3. Color-Mix Interpolation Syntax
    // =========================================================================
    describe('3. CSS Color-Mix Interpolation Syntax & Space Selection', () => {
        it('generates standard color-mix syntax in srgb space', () => {
            expect(formatColorMix(0xff123456, 'srgb')).toBe('color-mix(in srgb, #123456 100%, transparent)')
            expect(formatColorMix(0x80123456, 'srgb')).toBe('color-mix(in srgb, #12345680 100%, transparent)')
        })

        it('generates standard color-mix syntax in display-p3 space', () => {
            expect(formatColorMix(0xff123456, 'display-p3')).toBe('color-mix(in display-p3, #123456 100%, transparent)')
            expect(formatColorMix(0x80123456, 'display-p3')).toBe('color-mix(in display-p3, #12345680 100%, transparent)')
        })

        it('defaults to srgb space when space argument is omitted', () => {
            expect(formatColorMix(0xff6750a4)).toBe('color-mix(in srgb, #6750a4 100%, transparent)')
        })
    })

    // =========================================================================
    // 4. Custom Formatter Callback Error Resilience & Non-Standard Returns
    // =========================================================================
    describe('4. Custom Formatter Callback Resilience & Resolution', () => {
        it('resolves built-in strings (hex, rgb, rgba, display-p3, color-mix) and functions', () => {
            expect(resolveColorFormatter('hex')(0xffffffff)).toBe('#ffffff')
            expect(resolveColorFormatter('rgb')(0xffffffff)).toBe('rgb(255 255 255)')
            expect(resolveColorFormatter('rgba')(0xffffffff)).toBe('rgb(255 255 255)')
            expect(resolveColorFormatter('display-p3')(0xffffffff)).toBe('color(display-p3 1 1 1)')
            expect(resolveColorFormatter('color-mix', 'srgb')(0xffffffff)).toBe('color-mix(in srgb, #ffffff 100%, transparent)')
            expect(resolveColorFormatter('color-mix', 'display-p3')(0xffffffff)).toBe('color-mix(in display-p3, #ffffff 100%, transparent)')

            const customFn = (argb: number) => `custom(${argb})`
            expect(resolveColorFormatter(customFn)(0xff112233)).toBe('custom(4279312947)')
        })

        it('handles custom formatter returning atypical strings (CSS calc, hsl, lch, oklab, data-uri)', () => {
            const calcFormatter = (argb: number) => `calc(var(--base) + ${argb & 0xff}px)`
            const css = toCSS({ format: calcFormatter, includePalettes: false })(createTheme()('#6750A4'))
            expect(css).toContain('--md-sys-color-primary: light-dark(calc(var(--base) + ')

            const oklabFormatter = () => 'oklab(0.6 0.1 -0.1)'
            const oklabCss = toCSS({ format: oklabFormatter, includePalettes: false })(createTheme()('#6750A4'))
            expect(oklabCss).toContain('--md-sys-color-primary: light-dark(oklab(0.6 0.1 -0.1), oklab(0.6 0.1 -0.1));')
        })

        it('propagates custom formatter runtime errors to caller cleanly', () => {
            const throwingFormatter = () => {
                throw new RangeError('Custom formatter out of bounds error')
            }
            const serializer = toCSS({ format: throwingFormatter })
            const theme = createTheme()('#6750A4')

            expect(() => serializer(theme)).toThrow(RangeError)
            expect(() => serializer(theme)).toThrow('Custom formatter out of bounds error')
        })
    })

    // =========================================================================
    // 5. High-Throughput Fuzzing & Stress (50,000 Samples)
    // =========================================================================
    describe('5. High-Throughput Fuzzing & Performance Benchmark', () => {
        it('fuzzes 50,000 pseudo-random ARGB colors across all formatters without error or NaN', { timeout: 20000 }, () => {
            const hexRegex = /^#([0-9a-f]{6}|[0-9a-f]{8})$/
            const rgbRegex = /^rgb\(\d{1,3} \d{1,3} \d{1,3}( \/ (0|0\.\d{1,4}|1))?\)$/
            const p3Regex = /^color\(display-p3 (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1)( \/ (0|0\.\d{1,4}|1))?\)$/
            const mixRegex = /^color-mix\(in (srgb|display-p3), #[0-9a-f]{6,8} 100%, transparent\)$/

            const count = 50000
            let seed = 987654321

            const nextUint32 = () => {
                seed = (Math.imul(1664525, seed) + 1013904223) >>> 0
                return seed
            }

            for (let i = 0; i < count; i++) {
                const argb = nextUint32()

                const hex = formatHex(argb)
                expect(hex).toMatch(hexRegex)

                const rgb = formatRgb(argb)
                expect(rgb).toMatch(rgbRegex)

                const p3 = formatDisplayP3(argb)
                expect(p3).toMatch(p3Regex)

                const mixS = formatColorMix(argb, 'srgb')
                expect(mixS).toMatch(mixRegex)

                const mixP = formatColorMix(argb, 'display-p3')
                expect(mixP).toMatch(mixRegex)
            }
        })
    })
})
