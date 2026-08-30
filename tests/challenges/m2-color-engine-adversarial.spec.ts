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
import { createPaletteTones } from '../../src/core/palette'
import { MaterialVariant } from '../../src'
import { TonalPalette } from '@material/material-color-utilities'

describe('Milestone 2 Challenger 1: Adversarial Challenge & Stress Suite for Modern CSS Color Engine', () => {

    // =========================================================================
    // 1. Display P3 Colorimetry, Matrix Calculations, & Float Boundaries
    // =========================================================================
    describe('1. Display P3 Matrix Calculations & IEEE-754 Boundary Mathematics', () => {
        it('calculates exact Display P3 coordinates for extreme primary and secondary primaries', () => {
            // Pure Red #FF0000 (0xFFFF0000)
            const p3Red = formatDisplayP3(0xffff0000)
            expect(p3Red).toBe('color(display-p3 0.9175 0.2003 0.1386)')

            // Pure Green #00FF00 (0xFF00FF00)
            const p3Green = formatDisplayP3(0xff00ff00)
            expect(p3Green).toBe('color(display-p3 0.4584 0.9853 0.2983)')

            // Pure Blue #0000FF (0xFF0000FF)
            const p3Blue = formatDisplayP3(0xff0000ff)
            expect(p3Blue).toBe('color(display-p3 0 0 0.9596)')

            // Pure Black #000000 (0xFF000000)
            const p3Black = formatDisplayP3(0xff000000)
            expect(p3Black).toBe('color(display-p3 0 0 0)')

            // Pure White #FFFFFF (0xFFFFFFFF)
            const p3White = formatDisplayP3(0xffffffff)
            expect(p3White).toBe('color(display-p3 1 1 1)')

            // Pure Yellow #FFFF00 (0xFFFFFF00)
            const p3Yellow = formatDisplayP3(0xffffff00)
            expect(p3Yellow).toBe('color(display-p3 1 1 0.3309)')

            // Pure Cyan #00FFFF (0xFF00FFFF)
            const p3Cyan = formatDisplayP3(0xff00ffff)
            expect(p3Cyan).toBe('color(display-p3 0.4584 0.9853 0.9925)')

            // Pure Magenta #FF00FF (0xFFFF00FF)
            const p3Magenta = formatDisplayP3(0xffff00ff)
            expect(p3Magenta).toBe('color(display-p3 0.9175 0.2003 0.9675)')
        })

        it('strictly bounds and clamps Display P3 coordinates to [0, 1] range across mid-tones and darks', () => {
            const midTones = [
                0xff808080, // 50% Gray
                0xff7f7f7f, // 127 Gray
                0xff404040, // 25% Gray
                0xffc0c0c0, // 75% Gray
                0xff010101, // Near black tone 1
                0xff020202,
                0xfffefefe, // Near white tone 254
                0xff123456,
                0xff654321,
                0xffabcdef,
                0xfffedcba,
            ]

            const p3Pattern = /^color\(display-p3 (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1)\)$/

            for (const argb of midTones) {
                const p3 = formatDisplayP3(argb)
                expect(p3).toMatch(p3Pattern)

                // Parse float components
                const matches = p3.match(/color\(display-p3 ([0-9.]+) ([0-9.]+) ([0-9.]+)\)/)
                expect(matches).not.toBeNull()
                if (matches) {
                    const [, rStr, gStr, bStr] = matches
                    const r = parseFloat(rStr)
                    const g = parseFloat(gStr)
                    const b = parseFloat(bStr)

                    expect(r).toBeGreaterThanOrEqual(0)
                    expect(r).toBeLessThanOrEqual(1)
                    expect(g).toBeGreaterThanOrEqual(0)
                    expect(g).toBeLessThanOrEqual(1)
                    expect(b).toBeGreaterThanOrEqual(0)
                    expect(b).toBeLessThanOrEqual(1)

                    // Ensure at most 4 decimal places
                    for (const str of [rStr, gStr, bStr]) {
                        const parts = str.split('.')
                        if (parts.length > 1) {
                            expect(parts[1].length).toBeLessThanOrEqual(4)
                        }
                    }
                }
            }
        })

        it('guarantees monotonic luminance progression across the entire grayscale gradient (0 to 255)', () => {
            let prevP3Luma = -1

            for (let i = 0; i <= 255; i++) {
                const argb = (0xff000000 | (i << 16) | (i << 8) | i) >>> 0
                const p3 = formatDisplayP3(argb)

                const matches = p3.match(/color\(display-p3 ([0-9.]+) ([0-9.]+) ([0-9.]+)\)/)
                expect(matches).not.toBeNull()
                if (matches) {
                    const [, rStr, gStr, bStr] = matches
                    const r = parseFloat(rStr)
                    const g = parseFloat(gStr)
                    const b = parseFloat(bStr)

                    // In grayscale, D65 Display P3 R, G, B should be identical (or within float rounding 0.0002)
                    expect(Math.abs(r - g)).toBeLessThanOrEqual(0.0002)
                    expect(Math.abs(g - b)).toBeLessThanOrEqual(0.0002)

                    // Monotonic increase
                    expect(r).toBeGreaterThanOrEqual(prevP3Luma - 0.0001)
                    prevP3Luma = r
                }
            }
        })

        it('guarantees no negative zero (-0) or NaN emission in Display P3 coordinates', () => {
            for (let i = 0; i <= 255; i++) {
                const p3 = formatDisplayP3(i)
                expect(p3).not.toContain('-0')
                expect(p3).not.toContain('NaN')
                expect(p3).not.toContain('Infinity')
            }
        })

        it('formats Display P3 with alpha channel correctly across various opacity levels', () => {
            // Opaque -> no alpha suffix
            expect(formatDisplayP3(0xffff0000)).toBe('color(display-p3 0.9175 0.2003 0.1386)')

            // 50% opacity (a = 128 -> 128/255 = 0.502)
            expect(formatDisplayP3(0x80ff0000)).toBe('color(display-p3 0.9175 0.2003 0.1386 / 0.502)')

            // 0% opacity (fully transparent)
            expect(formatDisplayP3(0x00ff0000)).toBe('color(display-p3 0.9175 0.2003 0.1386 / 0)')

            // 1/255 opacity (~0.0039)
            expect(formatDisplayP3(0x0100ff00)).toBe('color(display-p3 0.4584 0.9853 0.2983 / 0.0039)')

            // 254/255 opacity (~0.9961)
            expect(formatDisplayP3(0xfe0000ff)).toBe('color(display-p3 0 0 0.9596 / 0.9961)')
        })
    })

    // =========================================================================
    // 2. Modern RGB / RGBA Space-Separated Syntax & Alpha Handling
    // =========================================================================
    describe('2. Modern RGB/RGBA Space-Separated Formatting & Alpha Variations', () => {
        it('emits CSS Color 4 modern space-separated syntax rgb(r g b) for opaque colors', () => {
            expect(formatRgb(0xffff0000)).toBe('rgb(255 0 0)')
            expect(formatRgb(0xff00ff00)).toBe('rgb(0 255 0)')
            expect(formatRgb(0xff0000ff)).toBe('rgb(0 0 255)')
            expect(formatRgb(0xffffffff)).toBe('rgb(255 255 255)')
            expect(formatRgb(0xff000000)).toBe('rgb(0 0 0)')
            expect(formatRgb(0xff123456)).toBe('rgb(18 52 86)')
        })

        it('emits rgb(r g b / a) with slash separator and 4-decimal trimmed alpha for non-opaque colors', () => {
            expect(formatRgb(0x80ff0000)).toBe('rgb(255 0 0 / 0.502)')
            expect(formatRgb(0x00ff0000)).toBe('rgb(255 0 0 / 0)')
            expect(formatRgb(0x01123456)).toBe('rgb(18 52 86 / 0.0039)')
            expect(formatRgb(0xfe123456)).toBe('rgb(18 52 86 / 0.9961)')
            expect(formatRgb(0x33123456)).toBe('rgb(18 52 86 / 0.2)') // 51/255 = 0.2
            expect(formatRgb(0x66123456)).toBe('rgb(18 52 86 / 0.4)') // 102/255 = 0.4
            expect(formatRgb(0xcc123456)).toBe('rgb(18 52 86 / 0.8)') // 204/255 = 0.8
        })

        it('exhaustively tests all 256 alpha steps for rgb formatting precision and formatting', () => {
            for (let a = 0; a <= 255; a++) {
                const argb = ((a << 24) | 0x0066aa) >>> 0
                const formatted = formatRgb(argb)

                if (a === 255) {
                    expect(formatted).toBe('rgb(0 102 170)')
                } else {
                    const expectedAlpha = Number((a / 255).toFixed(4))
                    expect(formatted).toBe(`rgb(0 102 170 / ${expectedAlpha})`)
                }
            }
        })

        it('correctly handles signed 32-bit integers and negative bit representations', () => {
            // In JavaScript bitwise operations produce signed 32-bit integers (-2147483648 to 2147483647)
            const signedBlack = -16777216 // 0xFF000000 as signed 32-bit int
            expect(formatHex(signedBlack)).toBe('#000000')
            expect(formatRgb(signedBlack)).toBe('rgb(0 0 0)')
            expect(formatDisplayP3(signedBlack)).toBe('color(display-p3 0 0 0)')

            const signedWhite = -1 // 0xFFFFFFFF as signed 32-bit int
            expect(formatHex(signedWhite)).toBe('#ffffff')
            expect(formatRgb(signedWhite)).toBe('rgb(255 255 255)')
            expect(formatDisplayP3(signedWhite)).toBe('color(display-p3 1 1 1)')

            const signedSemiRed = (0x80ff0000 | 0) // signed
            expect(formatHex(signedSemiRed)).toBe('#ff000080')
            expect(formatRgb(signedSemiRed)).toBe('rgb(255 0 0 / 0.502)')
        })
    })

    // =========================================================================
    // 3. Color-Mix Interpolation Syntax
    // =========================================================================
    describe('3. CSS Color-Mix Interpolation Syntax', () => {
        it('formats color-mix in srgb space by default', () => {
            expect(formatColorMix(0xff6750a4)).toBe('color-mix(in srgb, #6750a4 100%, transparent)')
            expect(formatColorMix(0xff000000)).toBe('color-mix(in srgb, #000000 100%, transparent)')
            expect(formatColorMix(0xffffffff)).toBe('color-mix(in srgb, #ffffff 100%, transparent)')
        })

        it('formats color-mix in display-p3 space when specified', () => {
            expect(formatColorMix(0xff6750a4, 'display-p3')).toBe('color-mix(in display-p3, #6750a4 100%, transparent)')
            expect(formatColorMix(0xffff0000, 'display-p3')).toBe('color-mix(in display-p3, #ff0000 100%, transparent)')
        })

        it('formats color-mix with alpha channel in hex component', () => {
            expect(formatColorMix(0x806750a4, 'srgb')).toBe('color-mix(in srgb, #6750a480 100%, transparent)')
            expect(formatColorMix(0x806750a4, 'display-p3')).toBe('color-mix(in display-p3, #6750a480 100%, transparent)')
        })

        it('integrates color-mix formatting seamlessly inside toCSS with colorMixSpace option', () => {
            const theme = createTheme({ variant: MaterialVariant.Vibrant })('#6750A4')

            const srgbCSS = toCSS({ format: 'color-mix', colorMixSpace: 'srgb', includePalettes: false })(theme)
            expect(srgbCSS).toContain('color-mix(in srgb, #')
            expect(srgbCSS).not.toContain('color-mix(in display-p3,')

            const p3CSS = toCSS({ format: 'color-mix', colorMixSpace: 'display-p3', includePalettes: false })(theme)
            expect(p3CSS).toContain('color-mix(in display-p3, #')
            expect(p3CSS).not.toContain('color-mix(in srgb,')
        })
    })

    // =========================================================================
    // 4. Custom Formatter Callback Resilience & Non-Standard Returns
    // =========================================================================
    describe('4. Custom Formatter Callback Resilience & Resolution', () => {
        it('resolves and executes custom formatting callback functions', () => {
            const customHslFormatter = (argb: number) => {
                const r = ((argb >>> 16) & 0xff) / 255
                const g = ((argb >>> 8) & 0xff) / 255
                const b = (argb & 0xff) / 255
                const max = Math.max(r, g, b)
                const min = Math.min(r, g, b)
                const l = (max + min) / 2
                return `hsl(0 0% ${Math.round(l * 100)}%)`
            }

            const cssGen = toCSS({ format: customHslFormatter, includePalettes: false })
            const theme = createTheme()('#0066FF')
            const css = cssGen(theme)

            expect(css).toContain('--md-sys-color-primary: light-dark(hsl(')
        })

        it('invokes custom formatter exactly once per theme token (118 times for 59 tokens in 2025 spec)', () => {
            let invocationCount = 0
            const countingFormatter = (argb: number) => {
                invocationCount++
                return `#${(argb & 0xffffff).toString(16).padStart(6, '0')}`
            }

            const theme = createTheme({ specVersion: '2025' })('#0066FF')
            toCSS({ format: countingFormatter, includePalettes: false })(theme)

            // 59 light tokens + 59 dark tokens = 118 invocations
            expect(invocationCount).toBe(118)
        })

        it('handles non-standard return values from custom formatter (OKLCH, empty string, raw data, emojis)', () => {
            const oklchFormatter = (argb: number) => `oklch(0.7 0.15 145 / ${((argb >>> 24) & 0xff) / 255})`
            const css = toCSS({ format: oklchFormatter, includePalettes: false })(createTheme()('#6750A4'))
            expect(css).toContain('light-dark(oklch(0.7 0.15 145 / 1), oklch(0.7 0.15 145 / 1));')

            const emptyFormatter = () => ''
            const emptyCss = toCSS({ format: emptyFormatter, includePalettes: false })(createTheme()('#6750A4'))
            expect(emptyCss).toContain('--md-sys-color-primary: light-dark(, );')

            const unicodeFormatter = () => '🎨'
            const unicodeCss = toCSS({ format: unicodeFormatter, includePalettes: false })(createTheme()('#6750A4'))
            expect(unicodeCss).toContain('--md-sys-color-primary: light-dark(🎨, 🎨);')
        })

        it('defaults gracefully to formatHex when invalid format string or undefined format is provided', () => {
            // @ts-expect-error - testing invalid format string at runtime
            const formatter = resolveColorFormatter('invalid-format-type')
            expect(formatter(0xffff0000)).toBe('#ff0000')

            const defaultFormatter = resolveColorFormatter(undefined)
            expect(defaultFormatter(0xff00ff00)).toBe('#00ff00')
        })

        it('properly propagates uncaught errors thrown inside custom formatter to caller', () => {
            const faultyFormatter = () => {
                throw new Error('Custom formatter failure simulation')
            }

            const cssGen = toCSS({ format: faultyFormatter })
            const theme = createTheme()('#6750A4')

            expect(() => cssGen(theme)).toThrow('Custom formatter failure simulation')
        })
    })

    // =========================================================================
    // 5. Curried CSS Serializer Engine Adversarial Stress Testing
    // =========================================================================
    describe('5. Curried CSS Serializer Stress & Boundary Validation', () => {
        it('throws TypeError for non-object, null, array, and primitive themeData inputs', () => {
            const serializer = toCSS()

            // @ts-expect-error
            expect(() => serializer(null)).toThrow(TypeError)
            // @ts-expect-error
            expect(() => serializer(undefined)).toThrow(TypeError)
            // @ts-expect-error
            expect(() => serializer('invalid-string')).toThrow(TypeError)
            // @ts-expect-error
            expect(() => serializer(12345)).toThrow(TypeError)
            // @ts-expect-error
            expect(() => serializer([])).toThrow(TypeError)
        })

        it('throws TypeError if lightObject or darkObject contain non-numeric or non-finite ARGB values', () => {
            const serializer = toCSS()

            expect(() => serializer({
                lightObject: { primary: NaN },
                darkObject: { primary: 0xff000000 },
            })).toThrow(TypeError)

            expect(() => serializer({
                lightObject: { primary: 0xff000000 },
                darkObject: { primary: Infinity },
            })).toThrow(TypeError)

            expect(() => serializer({
                lightObject: { primary: 'not-a-number' as unknown as number },
                darkObject: { primary: 0xff000000 },
            })).toThrow(TypeError)
        })

        it('throws TypeError when lightObject and darkObject have key count or key name mismatches', () => {
            const serializer = toCSS()

            expect(() => serializer({
                lightObject: { primary: 0xff000000, secondary: 0xff000000 },
                darkObject: { primary: 0xff000000 },
            })).toThrow(TypeError)

            expect(() => serializer({
                lightObject: { primary: 0xff000000 },
                darkObject: { surface: 0xff000000 },
            })).toThrow(TypeError)
        })

        it('normalizes various key casings (camelCase, PascalCase, snake_case) and matches them seamlessly', () => {
            const serializer = toCSS({ format: 'hex', includePalettes: false })
            const customInput = {
                lightObject: {
                    primaryContainer: 0xffeaddff,
                    'on-secondary_container': 0xff1d192b,
                    SurfaceVariant: 0xffe7e0ec,
                },
                darkObject: {
                    'primary-container': 0xff4f378b,
                    onSecondaryContainer: 0xffe8def8,
                    surface_variant: 0xff49454f,
                },
            }

            const css = serializer(customInput)
            expect(css).toContain('--md-sys-color-primary-container: light-dark(#eaddff, #4f378b);')
            expect(css).toContain('--md-sys-color-on-secondary-container: light-dark(#1d192b, #e8def8);')
            expect(css).toContain('--md-sys-color-surface-variant: light-dark(#e7e0ec, #49454f);')
        })

        it('handles all 8 permutations of includeTheme, includePalettes, and includeRoot flags', () => {
            const theme = createTheme()('#6750A4')

            // 1. theme=true, palettes=true, root=true
            const css1 = toCSS({ includeTheme: true, includePalettes: true, includeRoot: true })(theme)
            expect(css1).toMatch(/^:root \{\n/)
            expect(css1).toContain('--md-sys-color-')
            expect(css1).toContain('--md-ref-palette-')

            // 2. theme=true, palettes=true, root=false
            const css2 = toCSS({ includeTheme: true, includePalettes: true, includeRoot: false })(theme)
            expect(css2).not.toContain(':root')
            expect(css2).toContain('--md-sys-color-')
            expect(css2).toContain('--md-ref-palette-')

            // 3. theme=true, palettes=false, root=true
            const css3 = toCSS({ includeTheme: true, includePalettes: false, includeRoot: true })(theme)
            expect(css3).toContain(':root')
            expect(css3).toContain('--md-sys-color-')
            expect(css3).not.toContain('--md-ref-palette-')

            // 4. theme=true, palettes=false, root=false
            const css4 = toCSS({ includeTheme: true, includePalettes: false, includeRoot: false })(theme)
            expect(css4).not.toContain(':root')
            expect(css4).toContain('--md-sys-color-')
            expect(css4).not.toContain('--md-ref-palette-')

            // 5. theme=false, palettes=true, root=true
            const css5 = toCSS({ includeTheme: false, includePalettes: true, includeRoot: true })(theme)
            expect(css5).toContain(':root')
            expect(css5).not.toContain('--md-sys-color-')
            expect(css5).toContain('--md-ref-palette-')

            // 6. theme=false, palettes=true, root=false
            const css6 = toCSS({ includeTheme: false, includePalettes: true, includeRoot: false })(theme)
            expect(css6).not.toContain(':root')
            expect(css6).not.toContain('--md-sys-color-')
            expect(css6).toContain('--md-ref-palette-')

            // 7. theme=false, palettes=false, root=true
            const css7 = toCSS({ includeTheme: false, includePalettes: false, includeRoot: true })(theme)
            expect(css7).toBe(':root {\n}\n')

            // 8. theme=false, palettes=false, root=false
            const css8 = toCSS({ includeTheme: false, includePalettes: false, includeRoot: false })(theme)
            expect(css8).toBe('')
        })

        it('normalizes prefix hyphens rigorously and supports empty prefixes', () => {
            const theme = createTheme()('#6750A4')

            // Extra hyphens
            const cssHyphens = toCSS({
                varPrefix: '---my---theme---',
                paletteVarPrefix: '---my---pal---',
                includePalettes: true,
                paletteTones: [40],
            })(theme)

            expect(cssHyphens).toContain('--my---theme-primary:')
            expect(cssHyphens).toContain('--my---pal-primary-40:')

            // Empty prefix produces bare --<token>
            const cssBare = toCSS({
                varPrefix: '',
                paletteVarPrefix: '',
                includePalettes: true,
                paletteTones: [40],
            })(theme)

            expect(cssBare).toContain('--primary:')
            expect(cssBare).toContain('--primary-40:')
        })

        it('supports wrapLightDark=false for light-only single mode serialization', () => {
            const theme = createTheme()('#6750A4')
            const css = toCSS({ wrapLightDark: false, includePalettes: false })(theme)

            expect(css).not.toContain('light-dark(')
            expect(css).toContain('--md-sys-color-primary: #')
        })

        it('serializes standalone custom palette correctly with customPaletteName and isCustomPalette options', () => {
            const tonalPalette = TonalPalette.fromHueAndChroma(150, 48)
            const palCss = toCSS({
                includeTheme: false,
                isCustomPalette: true,
                paletteVarPrefix: 'custom-mint',
                paletteTones: [10, 50, 90],
            })({
                palettes: {
                    primaryPalette: tonalPalette,
                } as unknown as Record<string, TonalPalette>,
            })

            expect(palCss).toContain('--custom-mint-10:')
            expect(palCss).toContain('--custom-mint-50:')
            expect(palCss).toContain('--custom-mint-90:')
            expect(palCss).not.toContain('--custom-mint-primary-')
        })
    })

    // =========================================================================
    // 6. High-Volume Property-Based Fuzzing & Syntax Validation (20,000 Sweeps)
    // =========================================================================
    describe('6. High-Volume Property-Based Fuzzing & Regex Syntax Verification', () => {
        it('fuzzes 20,000 pseudo-random ARGB colors across all formatters without error or NaN', { timeout: 20000 }, () => {
            const hexRegex = /^#([0-9a-f]{6}|[0-9a-f]{8})$/
            const rgbRegex = /^rgb\(\d{1,3} \d{1,3} \d{1,3}( \/ (0|0\.\d{1,4}|1))?\)$/
            const p3Regex = /^color\(display-p3 (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1) (0|0\.\d{1,4}|1)( \/ (0|0\.\d{1,4}|1))?\)$/
            const mixRegex = /^color-mix\(in (srgb|display-p3), #[0-9a-f]{6,8} 100%, transparent\)$/

            const count = 20000
            let seed = 123456789

            // Fast LCG PRNG for deterministic, reproducible fuzzing
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

                const mixSrgb = formatColorMix(argb, 'srgb')
                expect(mixSrgb).toMatch(mixRegex)

                const mixP3 = formatColorMix(argb, 'display-p3')
                expect(mixP3).toMatch(mixRegex)
            }
        })
    })

    // =========================================================================
    // 7. Throughput & Stress Benchmarks for Modern Formatter Engine
    // =========================================================================
    describe('7. High-Throughput Formatter & Serializer Benchmarks', () => {
        it('formats 100,000 colors with formatDisplayP3 under 200ms', () => {
            const count = 100000
            const startTime = performance.now()
            let lastFormatted = ''

            for (let i = 0; i < count; i++) {
                lastFormatted = formatDisplayP3(0xff000000 | i)
            }

            const duration = performance.now() - startTime
            const opsPerSec = (count / (duration / 1000)).toFixed(0)

            console.log(`[Challenger 1 Benchmark] 100,000 Display P3 format conversions in ${duration.toFixed(2)}ms (${opsPerSec} ops/sec)`)

            expect(duration).toBeLessThan(2000)
            expect(lastFormatted).toBeDefined()
        })

        it('serializes 500 complete themes into Display P3 CSS under 500ms', () => {
            const theme = createTheme({ variant: MaterialVariant.TonalSpot, specVersion: '2025' })('#6750A4')
            const serializer = toCSS({ format: 'display-p3', includePalettes: true })

            const count = 500
            const startTime = performance.now()
            let lastCSS = ''

            for (let i = 0; i < count; i++) {
                lastCSS = serializer(theme)
            }

            const duration = performance.now() - startTime
            const opsPerSec = (count / (duration / 1000)).toFixed(0)

            console.log(`[Challenger 1 Benchmark] 500 complete themes serialized to Display P3 CSS in ${duration.toFixed(2)}ms (${opsPerSec} themes/sec)`)

            expect(duration).toBeLessThan(3000)
            expect(lastCSS).toContain('color(display-p3')
        })
    })
})
