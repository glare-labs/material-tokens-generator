import { describe, it, expect } from 'vitest'
import {
    createTheme,
    toCSS,
} from '../../src/index'

describe('Modern CSS Serialization & Color Formats Suite (Features 8, 9, 10)', () => {
    const seed = '#6750A4'
    const theme = createTheme()(seed)

    describe('Tier 1: Feature Coverage — Color Formats', () => {
        it('T1.1: default format "hex" should emit standard 6-digit #rrggbb hex codes for opaque colors', () => {
            const css = toCSS({ format: 'hex' })(theme)
            const match = css.match(/--md-sys-color-primary:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#([0-9a-fA-F]{6})\);/)

            expect(match).not.toBeNull()
            expect(match![1]).toMatch(/^[0-9a-fA-F]{6}$/)
            expect(match![2]).toMatch(/^[0-9a-fA-F]{6}$/)
        })

        it('T1.2: format "hex" should emit 8-digit #rrggbbaa hex codes when alpha channel is present', () => {
            const rawThemeWithAlpha = {
                lightObject: { 'scrim-alpha': 0x80000000 }, // 50% opacity black
                darkObject: { 'scrim-alpha': 0x80000000 },
            }
            const css = toCSS({ format: 'hex' })(rawThemeWithAlpha)

            expect(css).toContain('light-dark(#00000080, #00000080)')
        })

        it('T1.3: format "rgb" should emit modern space-separated CSS Color 4 rgb(r g b) syntax', () => {
            const css = toCSS({ format: 'rgb' })(theme)
            const match = css.match(/--md-sys-color-primary:\s*light-dark\(rgb\((\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\),\s*rgb\((\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\)\);/)

            expect(match).not.toBeNull()
            const [_, r1, g1, b1, r2, g2, b2] = match!
            for (const val of [r1, g1, b1, r2, g2, b2]) {
                const num = parseInt(val, 10)
                expect(num).toBeGreaterThanOrEqual(0)
                expect(num).toBeLessThanOrEqual(255)
            }
        })

        it('T1.4: format "rgba" / "rgb" with alpha should emit space-separated slash rgb(r g b / a) syntax', () => {
            const rawTheme = {
                lightObject: { transparentPrimary: 0x806750a4 },
                darkObject: { transparentPrimary: 0x80d0bcff },
            }
            const css = toCSS({ format: 'rgb' })(rawTheme)

            expect(css).toMatch(/rgb\(\d+\s+\d+\s+\d+\s*\/\s*[\d.]+\)/)
        })

        it('T1.5: format "display-p3" should emit color(display-p3 r g b) with normalized [0, 1] floating-point values', () => {
            const css = toCSS({ format: 'display-p3' })(theme)
            const match = css.match(/--md-sys-color-primary:\s*light-dark\(color\(display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\),\s*color\(display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\)\);/)

            expect(match).not.toBeNull()
            const [_, r1, g1, b1, r2, g2, b2] = match!
            for (const val of [r1, g1, b1, r2, g2, b2]) {
                const floatVal = parseFloat(val)
                expect(floatVal).toBeGreaterThanOrEqual(0)
                expect(floatVal).toBeLessThanOrEqual(1)
            }
        })

        it('T1.6: format "color-mix" should emit valid color-mix() interpolation syntax', () => {
            const css = toCSS({ format: 'color-mix' })(theme)
            expect(css).toContain('color-mix(in srgb,')
        })

        it('T1.7: custom formatter function (argb: number) => string should format all CSS declarations', () => {
            const customFormatter = (argb: number) => `custom-argb-${(argb >>> 0).toString(16)}`
            const css = toCSS({ format: customFormatter })(theme)

            expect(css).toContain('--md-sys-color-primary: light-dark(custom-argb-')
        })

        it('T1.8: wrapLightDark: true (default) should wrap theme tokens with light-dark()', () => {
            const css = toCSS({ wrapLightDark: true })(theme)
            expect(css).toContain('--md-sys-color-primary: light-dark(')
        })

        it('T1.9: palette tokens should NOT be wrapped with light-dark()', () => {
            const css = toCSS({ paletteTones: [0, 50, 100] })(theme)
            const paletteLine = css.split('\n').find((line) => line.includes('--md-ref-palette-primary-50:'))

            expect(paletteLine).toBeDefined()
            expect(paletteLine).not.toContain('light-dark(')
            expect(paletteLine).toMatch(/--md-ref-palette-primary-50:\s*#[0-9a-fA-F]{6};/)
        })

        it('T1.10: varPrefix should customize the CSS variable prefix', () => {
            const css = toCSS({ varPrefix: 'brand' })(theme)
            expect(css).toContain('--brand-primary: light-dark(')
            expect(css).toContain('--brand-surface: light-dark(')
            expect(css).not.toContain('--md-sys-color-')
        })

        it('T1.11: varPrefix should normalize leading and trailing hyphens automatically', () => {
            const css = toCSS({ varPrefix: '--my-app--' })(theme)
            expect(css).toContain('--my-app-primary: light-dark(')
        })

        it('T1.12: varPrefix: "" (empty string) should generate direct variable names with standard -- prefix', () => {
            const css = toCSS({ varPrefix: '' })(theme)
            expect(css).toContain('--primary: light-dark(')
        })

        it('T1.13: paletteVarPrefix should customize the palette token variable prefix', () => {
            const css = toCSS({
                paletteVarPrefix: 'palette',
                paletteTones: [40],
            })(theme)

            expect(css).toContain('--palette-primary-40:')
        })

        it('T1.14: paletteTones option should restrict emitted palette tones to the exact specified stops', () => {
            const css = toCSS({ paletteTones: [10, 90] })(theme)

            expect(css).toContain('--md-ref-palette-primary-10:')
            expect(css).toContain('--md-ref-palette-primary-90:')
            expect(css).not.toContain('--md-ref-palette-primary-20:')
            expect(css).not.toContain('--md-ref-palette-primary-50:')
        })

        it('T1.15: includeTheme: false should omit theme tokens and emit only palette declarations', () => {
            const css = toCSS({
                includeTheme: false,
                paletteTones: [50],
            })(theme)

            expect(css).not.toContain('--md-sys-color-primary:')
            expect(css).toContain('--md-ref-palette-primary-50:')
        })
    })

    describe('Tier 2: Boundary & Corner Cases', () => {
        it('T2.1: toCSS should handle empty theme data and produce empty :root block', () => {
            const css = toCSS()({ lightObject: {}, darkObject: {} })
            expect(css).toBe(':root {\n}\n')
        })

        it('T2.2: toCSS should throw TypeError if lightObject and darkObject have mismatched key counts', () => {
            const mismatched = {
                lightObject: { primary: 0xff6750a4, surface: 0xfffef7ff },
                darkObject: { primary: 0xffd0bcff },
            }
            expect(() => toCSS()(mismatched)).toThrow(TypeError)
        })

        it('T2.3: toCSS should throw TypeError if lightObject contains invalid non-integer ARGB color', () => {
            const invalidTheme = {
                lightObject: { primary: NaN },
                darkObject: { primary: 0xffd0bcff },
            }
            expect(() => toCSS()(invalidTheme)).toThrow(TypeError)
        })

        it('T2.4: toCSS should throw TypeError on non-plain object input', () => {
            // @ts-expect-error - testing invalid input
            expect(() => toCSS()('not-an-object')).toThrow(TypeError)
            // @ts-expect-error - testing invalid input
            expect(() => toCSS()(null)).toThrow(TypeError)
        })

        it('T2.5: toCSS should normalize non-kebab keys into valid kebab-case CSS property names', () => {
            const unnormalized = {
                lightObject: { primaryContainer: 0xffeaddff, 'surface_dim': 0xffded8e1 },
                darkObject: { primaryContainer: 0xff4f378b, 'surface_dim': 0xff141218 },
            }
            const css = toCSS()(unnormalized)

            expect(css).toContain('--md-sys-color-primary-container:')
            expect(css).toContain('--md-sys-color-surface-dim:')
        })

        it('T2.6: includeRoot: false should produce declarations without :root wrapper', () => {
            const raw = {
                lightObject: { primary: 0xff6750a4 },
                darkObject: { primary: 0xffd0bcff },
            }
            const css = toCSS({ includeRoot: false })(raw)

            expect(css).not.toContain(':root')
            expect(css.trim()).toBe('--md-sys-color-primary: light-dark(#6750a4, #d0bcff);')
        })
    })

    describe('Tier 3: Cross-Feature Combinations', () => {
        it('T3.1: Display P3 + OLED Mode + Custom VarPrefix + Selective Palette Tones', () => {
            const oledTheme = createTheme({ oled: true })(seed)
            const css = toCSS({
                format: 'display-p3',
                varPrefix: 'apple-ui',
                paletteVarPrefix: 'apple-ref',
                paletteTones: [0, 100],
            })(oledTheme)

            expect(css).toContain('--apple-ui-surface: light-dark(color(display-p3')
            expect(css).toContain('--apple-ref-primary-0: color(display-p3')
            expect(css).toContain('--apple-ref-primary-100: color(display-p3')
        })

        it('T3.2: RGB format + 2021 Spec + custom prefix', () => {
            const theme2021 = createTheme({ specVersion: '2021' })(seed)
            const css = toCSS({
                format: 'rgb',
                varPrefix: 'v2021',
            })(theme2021)

            expect(css).toContain('--v2021-primary: light-dark(rgb(')
            expect(css).not.toContain('primary-dim')
        })
    })

    describe('Tier 4: Real-World Scenarios', () => {
        it('T4.1: Design System Multi-Format Stylesheet Exporter', () => {
            // Generates 3 stylesheets from a single theme data source
            const hexCss = toCSS({ format: 'hex', varPrefix: 'sys' })(theme)
            const rgbCss = toCSS({ format: 'rgb', varPrefix: 'sys' })(theme)
            const p3Css = toCSS({ format: 'display-p3', varPrefix: 'sys' })(theme)

            expect(hexCss).toContain('--sys-primary: light-dark(#')
            expect(rgbCss).toContain('--sys-primary: light-dark(rgb(')
            expect(p3Css).toContain('--sys-primary: light-dark(color(display-p3')

            // All three share identical CSS custom property keys
            const extractKeys = (css: string) =>
                [...css.matchAll(/(--sys-[\w-]+):/g)].map((m) => m[1])

            const hexKeys = extractKeys(hexCss)
            const rgbKeys = extractKeys(rgbCss)
            const p3Keys = extractKeys(p3Css)

            expect(hexKeys).toEqual(rgbKeys)
            expect(rgbKeys).toEqual(p3Keys)
            expect(hexKeys.length).toBe(59) // all 2025 tokens
        })
    })
})
