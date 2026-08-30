import { describe, expect, it } from 'vitest'
import {
    createPaletteTones,
    createTheme,
    formatColorMix,
    formatDisplayP3,
    formatHex,
    formatRgb,
    MaterialContrastLevel,
    MaterialVariant,
    resolveColorFormatter,
    toCSS,
} from '../../src/index'
import { TonalPalette } from '@material/material-color-utilities'

describe('Challenger 2 Adversarial Verification: toCSS & Dev-App Engine', () => {

    // =========================================================================
    // 1. Edge Prefixes & Variable Name Normalization
    // =========================================================================
    describe('1. Edge Prefixes & Variable Name Normalization', () => {
        const sampleTheme = {
            lightObject: { primary: 0xff6750a4, onPrimary: 0xffffffff },
            darkObject: { primary: 0xffd0bcff, onPrimary: 0xff381e72 },
        }

        it('handles varPrefix: "" producing direct --<token> variables', () => {
            const serializer = toCSS({ varPrefix: '', includePalettes: false })
            const css = serializer(sampleTheme)

            expect(css).toContain('--primary: light-dark(#6750a4, #d0bcff);')
            expect(css).toContain('--on-primary: light-dark(#ffffff, #381e72);')
            expect(css).not.toContain('---')
        })

        it('handles varPrefix: "--" and "---" without generating excess hyphens', () => {
            const s1 = toCSS({ varPrefix: '--', includePalettes: false })
            const s2 = toCSS({ varPrefix: '---', includePalettes: false })

            const css1 = s1(sampleTheme)
            const css2 = s2(sampleTheme)

            expect(css1).toContain('--primary: light-dark(#6750a4, #d0bcff);')
            expect(css2).toContain('--primary: light-dark(#6750a4, #d0bcff);')
            expect(css1).not.toContain('---')
            expect(css2).not.toContain('---')
        })

        it('handles varPrefix with leading/trailing dashes and spaces', () => {
            const s = toCSS({ varPrefix: '----app-theme----', includePalettes: false })
            const css = s(sampleTheme)

            expect(css).toContain('--app-theme-primary: light-dark(#6750a4, #d0bcff);')
            expect(css).toContain('--app-theme-on-primary: light-dark(#ffffff, #381e72);')
            expect(css).not.toContain('----')
        })

        it('handles paletteVarPrefix edge cases ("", "--", "---brand---")', () => {
            const mockPalettes = {
                primaryPalette: TonalPalette.fromInt(0xff6750a4),
                secondaryPalette: TonalPalette.fromInt(0xff625b71),
                tertiaryPalette: TonalPalette.fromInt(0xff7d5260),
                errorPalette: TonalPalette.fromInt(0xffb3261e),
                neutralPalette: TonalPalette.fromInt(0xff605d62),
                neutralVariantPalette: TonalPalette.fromInt(0xff605d66),
            }

            const s1 = toCSS({
                paletteVarPrefix: '',
                paletteTones: [40, 80],
                includeTheme: false,
            })
            const css1 = s1({ palettes: mockPalettes })
            expect(css1).toContain('--primary-40: #')
            expect(css1).toContain('--primary-80: #')
            expect(css1).not.toContain('---')

            const s2 = toCSS({
                paletteVarPrefix: '---brand-palette---',
                paletteTones: [40],
                includeTheme: false,
            })
            const css2 = s2({ palettes: mockPalettes })
            expect(css2).toContain('--brand-palette-primary-40: #')
            expect(css2).not.toContain('---brand-palette---')
        })

        it('supports isCustomPalette: true and customPaletteName emitting standalone tone variables', () => {
            const mockPalettes = {
                primaryPalette: TonalPalette.fromInt(0xff6750a4),
            } as any

            const s1 = toCSS({
                paletteVarPrefix: 'brand',
                isCustomPalette: true,
                paletteTones: [50, 90],
                includeTheme: false,
            })
            const css1 = s1({ palettes: mockPalettes })
            expect(css1).toContain('--brand-50: #')
            expect(css1).toContain('--brand-90: #')
            expect(css1).not.toContain('--brand-primary-50')

            const s2 = toCSS({
                paletteVarPrefix: 'custom-accent',
                customPaletteName: 'accent',
                paletteTones: [20],
                includeTheme: false,
            })
            const css2 = s2({ palettes: mockPalettes })
            expect(css2).toContain('--custom-accent-20: #')
        })

        it('supports custom CSS selector and includeRoot: false', () => {
            const sSelector = toCSS({ selector: '[data-theme="brand"]', includePalettes: false })
            const cssSelector = sSelector(sampleTheme)
            expect(cssSelector.startsWith('[data-theme="brand"] {\n')).toBe(true)

            const sNoRoot = toCSS({ includeRoot: false, includePalettes: false })
            const cssNoRoot = sNoRoot(sampleTheme)
            expect(cssNoRoot.startsWith(':root')).toBe(false)
            expect(cssNoRoot).toContain('--md-sys-color-primary: light-dark(#6750a4, #d0bcff);')
        })
    })

    // =========================================================================
    // 2. Complex Custom Properties & Key Normalization
    // =========================================================================
    describe('2. Complex Custom Properties & Key Normalization', () => {
        it('normalizes PascalCase, camelCase, snake_case, and dot-notation into kebab-case', () => {
            const complexTheme = {
                lightObject: {
                    SurfaceContainerLowest: 0xffffffff,
                    surfaceContainerLow: 0xfff7f2fa,
                    surface_container_high: 0xffece6f0,
                    'surface.container.highest': 0xffe6e0e9,
                    'ON_PRIMARY_FIXED_VARIANT': 0xff4f378b,
                    'accent-color-1': 0xff0066ff,
                },
                darkObject: {
                    SurfaceContainerLowest: 0xff000000,
                    surfaceContainerLow: 0xff1d1b20,
                    surface_container_high: 0xff2b2930,
                    'surface.container.highest': 0xff36343b,
                    'ON_PRIMARY_FIXED_VARIANT': 0xffeaddff,
                    'accent-color-1': 0xff80b3ff,
                },
            }

            const serializer = toCSS({ includePalettes: false })
            const css = serializer(complexTheme)

            expect(css).toContain('--md-sys-color-surface-container-lowest: light-dark(#ffffff, #000000);')
            expect(css).toContain('--md-sys-color-surface-container-low: light-dark(#f7f2fa, #1d1b20);')
            expect(css).toContain('--md-sys-color-surface-container-high: light-dark(#ece6f0, #2b2930);')
            expect(css).toContain('--md-sys-color-surface-container-highest: light-dark(#e6e0e9, #36343b);')
            expect(css).toContain('--md-sys-color-on-primary-fixed-variant: light-dark(#4f378b, #eaddff);')
            expect(css).toContain('--md-sys-color-accent-color-1: light-dark(#0066ff, #80b3ff);')
        })

        it('matches keys when lightObject and darkObject use different casings for the same token', () => {
            const mixedCaseTheme = {
                lightObject: {
                    primaryColor: 0xff6750a4,
                    'surface_container': 0xfff3edf7,
                },
                darkObject: {
                    'primary-color': 0xffd0bcff,
                    SurfaceContainer: 0xff211f26,
                },
            }

            const serializer = toCSS({ includePalettes: false })
            const css = serializer(mixedCaseTheme)

            expect(css).toContain('--md-sys-color-primary-color: light-dark(#6750a4, #d0bcff);')
            expect(css).toContain('--md-sys-color-surface-container: light-dark(#f3edf7, #211f26);')
        })

        it('sorts declarations deterministically in alphabetical order', () => {
            const unsortedTheme = {
                lightObject: { zIndexColor: 0xff111111, alphaColor: 0xff222222, midColor: 0xff333333 },
                darkObject: { zIndexColor: 0xff444444, alphaColor: 0xff555555, midColor: 0xff666666 },
            }

            const css = toCSS({ includePalettes: false })(unsortedTheme)
            const lines = css.split('\n').filter((l) => l.includes('--md-sys-color-'))

            expect(lines[0]).toContain('--md-sys-color-alpha-color:')
            expect(lines[1]).toContain('--md-sys-color-mid-color:')
            expect(lines[2]).toContain('--md-sys-color-z-index-color:')
        })
    })

    // =========================================================================
    // 3. Large Palettes & Scale Stress Testing
    // =========================================================================
    describe('3. Large Palettes & Scale Stress Testing', () => {
        it('serializes large custom palette tone arrays (100+ tones) without stack overflow', () => {
            const customTones = Array.from({ length: 101 }, (_, i) => i) // tones 0 through 100
            const mockPalettes = {
                primaryPalette: TonalPalette.fromInt(0xff6750a4),
                secondaryPalette: TonalPalette.fromInt(0xff625b71),
                tertiaryPalette: TonalPalette.fromInt(0xff7d5260),
                errorPalette: TonalPalette.fromInt(0xffb3261e),
                neutralPalette: TonalPalette.fromInt(0xff605d62),
                neutralVariantPalette: TonalPalette.fromInt(0xff605d66),
            }

            const serializer = toCSS({
                paletteTones: customTones,
                includeTheme: false,
            })

            const start = performance.now()
            const css = serializer({ palettes: mockPalettes })
            const elapsed = performance.now() - start

            // 6 palettes * 101 tones = 606 declarations
            expect(css.match(/--md-ref-palette-/g)?.length).toBe(606)
            expect(elapsed).toBeLessThan(2000) // Resilient high-throughput execution
        })

        it('handles massive theme dictionary (500 token pairs) with high throughput', () => {
            const lightObj: Record<string, number> = {}
            const darkObj: Record<string, number> = {}

            for (let i = 0; i < 500; i++) {
                lightObj[`token-${i}`] = 0xff000000 + i
                darkObj[`token-${i}`] = 0xff100000 + i
            }

            const serializer = toCSS({ includePalettes: false })
            const start = performance.now()
            const css = serializer({ lightObject: lightObj, darkObject: darkObj })
            const elapsed = performance.now() - start

            expect(css.match(/--md-sys-color-token-/g)?.length).toBe(500)
            expect(elapsed).toBeLessThan(2000)
        })

        it('deduplicates and handles unsorted palette tones cleanly', () => {
            const mockPalettes = {
                primaryPalette: TonalPalette.fromInt(0xff6750a4),
            } as any

            const serializer = toCSS({
                paletteTones: [100, 50, 0, 50, 100, 0, 25],
                includeTheme: false,
            })

            const css = serializer({ palettes: mockPalettes })
            const matches = css.match(/--md-ref-palette-primary-(\d+)/g)

            expect(matches).toEqual([
                '--md-ref-palette-primary-0',
                '--md-ref-palette-primary-25',
                '--md-ref-palette-primary-50',
                '--md-ref-palette-primary-100',
            ])
        })
    })

    // =========================================================================
    // 4. Malformed themeData & Attack Inputs
    // =========================================================================
    describe('4. Malformed themeData & Attack Inputs', () => {
        it('throws TypeError for non-object themeData inputs', () => {
            const serializer = toCSS()
            expect(() => (serializer as any)(null)).toThrow(TypeError)
            expect(() => (serializer as any)(undefined)).toThrow(TypeError)
            expect(() => (serializer as any)(12345)).toThrow(TypeError)
            expect(() => (serializer as any)('string-data')).toThrow(TypeError)
            expect(() => (serializer as any)(true)).toThrow(TypeError)
            expect(() => (serializer as any)(Symbol('theme'))).toThrow(TypeError)
            expect(() => (serializer as any)([])).toThrow(TypeError)
        })

        it('throws TypeError when lightObject or darkObject are class instances or non-plain objects', () => {
            class CustomClass {
                primary = 0xff6750a4
            }

            const serializer = toCSS({ includePalettes: false })
            expect(() =>
                serializer({
                    lightObject: new CustomClass() as any,
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(TypeError)

            expect(() =>
                serializer({
                    lightObject: { primary: 0xff6750a4 },
                    darkObject: new CustomClass() as any,
                })
            ).toThrow(TypeError)
        })

        it('accepts plain objects created with Object.create(null)', () => {
            const light = Object.create(null)
            light.primary = 0xff6750a4
            const dark = Object.create(null)
            dark.primary = 0xffd0bcff

            const serializer = toCSS({ includePalettes: false })
            const css = serializer({ lightObject: light, darkObject: dark })
            expect(css).toContain('--md-sys-color-primary: light-dark(#6750a4, #d0bcff);')
        })

        it('throws TypeError on invalid/non-numeric ARGB colors (NaN, Infinity, null, undefined, strings)', () => {
            const serializer = toCSS({ includePalettes: false })

            expect(() =>
                serializer({
                    lightObject: { primary: NaN },
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(/numeric ARGB color/)

            expect(() =>
                serializer({
                    lightObject: { primary: Infinity },
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(/numeric ARGB color/)

            expect(() =>
                serializer({
                    lightObject: { primary: -Infinity },
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(/numeric ARGB color/)

            expect(() =>
                serializer({
                    lightObject: { primary: null as any },
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(/numeric ARGB color/)

            expect(() =>
                serializer({
                    lightObject: { primary: undefined as any },
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(/numeric ARGB color/)

            expect(() =>
                serializer({
                    lightObject: { primary: '0xff6750a4' as any },
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(/numeric ARGB color/)

            expect(() =>
                serializer({
                    lightObject: { primary: 0xff6750a4 },
                    darkObject: { primary: {} as any },
                })
            ).toThrow(/numeric ARGB color/)
        })

        it('throws TypeError with informative message on key mismatches between light and dark objects', () => {
            const serializer = toCSS({ includePalettes: false })

            // Missing in dark
            expect(() =>
                serializer({
                    lightObject: { primary: 0xff6750a4, secondary: 0xff625b71 },
                    darkObject: { primary: 0xffd0bcff },
                })
            ).toThrow(/Missing in darkObject: secondary/)

            // Missing in light
            expect(() =>
                serializer({
                    lightObject: { primary: 0xff6750a4 },
                    darkObject: { primary: 0xffd0bcff, tertiary: 0xffefb8c8 },
                })
            ).toThrow(/missing in lightObject: tertiary/)
        })

        it('handles empty theme data objects safely without crashing', () => {
            const serializer = toCSS()
            expect(serializer({})).toBe(':root {\n}\n')
            expect(serializer({ lightObject: {}, darkObject: {} })).toBe(':root {\n}\n')
            expect(toCSS({ includeRoot: false })({})).toBe('')
        })
    })

    // =========================================================================
    // 5. Modern Color Formats & Boundary Arithmetic Fuzzing
    // =========================================================================
    describe('5. Modern Color Formats & Boundary Arithmetic Fuzzing', () => {
        it('verifies exact Display P3 colorimetric conversions for boundary colors', () => {
            // Pure White
            expect(formatDisplayP3(0xffffffff)).toBe('color(display-p3 1 1 1)')
            // Pure Black
            expect(formatDisplayP3(0xff000000)).toBe('color(display-p3 0 0 0)')
            // Transparent Black
            expect(formatDisplayP3(0x00000000)).toBe('color(display-p3 0 0 0 / 0)')
            // Pure Red (sRGB red clamped in P3)
            const p3Red = formatDisplayP3(0xffff0000)
            expect(p3Red).toMatch(/^color\(display-p3 [\d.]+ [\d.]+ [\d.]+\)$/)
            // Alpha Red (50.2% alpha)
            const p3AlphaRed = formatDisplayP3(0x80ff0000)
            expect(p3AlphaRed).toContain('/ 0.502')
        })

        it('verifies signed int32 negative ARGB values across all formatters', () => {
            // In JavaScript bitwise operations, 0xff6750a4 is treated as signed 32-bit int
            const signedArgb = (0xff6750a4 | 0)

            expect(formatHex(signedArgb)).toBe('#6750a4')
            expect(formatRgb(signedArgb)).toBe('rgb(103 80 164)')
            expect(formatDisplayP3(signedArgb)).toMatch(/^color\(display-p3 /)
            expect(formatColorMix(signedArgb, 'srgb')).toBe('color-mix(in srgb, #6750a4 100%, transparent)')
            expect(formatColorMix(signedArgb, 'display-p3')).toBe('color-mix(in display-p3, #6750a4 100%, transparent)')
        })

        it('verifies custom formatter callback integration in toCSS', () => {
            const customFormatter = (argb: number) => `custom-color(${formatHex(argb)})`
            const serializer = toCSS({
                format: customFormatter,
                includePalettes: false,
            })

            const css = serializer({
                lightObject: { primary: 0xff6750a4 },
                darkObject: { primary: 0xffd0bcff },
            })

            expect(css).toContain('--md-sys-color-primary: light-dark(custom-color(#6750a4), custom-color(#d0bcff));')
        })

        it('fuzzes 1,000 arbitrary ARGB numbers across all formatters with zero NaN/undefined outputs', () => {
            for (let i = 0; i < 1000; i++) {
                // Generate random int32 value
                const argb = (Math.random() * 0xffffffff) | 0

                const hex = formatHex(argb)
                expect(hex).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/)

                const rgb = formatRgb(argb)
                expect(rgb).toMatch(/^rgb\(\d{1,3} \d{1,3} \d{1,3}( \/ [\d.]+)?\)$/)

                const p3 = formatDisplayP3(argb)
                expect(p3).toMatch(/^color\(display-p3 [\d.]+ [\d.]+ [\d.]+( \/ [\d.]+)?\)$/)
                expect(p3).not.toContain('NaN')
                expect(p3).not.toContain('undefined')

                const mixSrgb = formatColorMix(argb, 'srgb')
                expect(mixSrgb).toMatch(/^color-mix\(in srgb, #[0-9a-f]{6,8} 100%, transparent\)$/)

                const mixP3 = formatColorMix(argb, 'display-p3')
                expect(mixP3).toMatch(/^color-mix\(in display-p3, #[0-9a-f]{6,8} 100%, transparent\)$/)
            }
        })
    })

    // =========================================================================
    // 6. Dev-App Stylesheet Adoption Under Rapid State Mutations
    // =========================================================================
    describe('6. Dev-App Stylesheet Adoption & High-Frequency Slider Stress', () => {
        it('simulates 100 rapid state mutations with CSSStyleSheet.replaceSync without memory leaks', { timeout: 20000 }, () => {
            // Mock DOM CSSStyleSheet and adoptedStyleSheets
            class MockCSSStyleSheet {
                cssRules: string[] = []
                lastCssText = ''
                replaceSync(text: string) {
                    this.lastCssText = text
                    this.cssRules = text.split(';')
                }
            }

            const mockAdoptedStyleSheets: MockCSSStyleSheet[] = []
            let adoptedThemeSheet: MockCSSStyleSheet | null = null

            function applyThemeStyles(cssText: string) {
                if (!adoptedThemeSheet) {
                    adoptedThemeSheet = new MockCSSStyleSheet()
                    mockAdoptedStyleSheets.push(adoptedThemeSheet)
                }
                adoptedThemeSheet.replaceSync(cssText)
            }

            const themeFactory = createTheme({
                specVersion: '2025',
                oled: true,
                variant: MaterialVariant.TonalSpot,
                contrastLevel: MaterialContrastLevel.Default,
            })

            const cssSerializer = toCSS({
                format: 'display-p3',
                wrapLightDark: true,
                includePalettes: true,
            })

            const start = performance.now()

            // Run 100 continuous slider scrub mutations across hues 0° to 360°
            for (let step = 0; step < 100; step++) {
                const hex = '#' + Math.floor(0x100000 + (step * 0x003456) % 0xefffff).toString(16).padStart(6, '0')
                const themeData = themeFactory(hex)
                const css = cssSerializer(themeData)
                applyThemeStyles(css)
            }

            const elapsed = performance.now() - start

            // Verifications:
            // 1. Exactly 1 stylesheet instance retained in adoptedStyleSheets (no memory leak)
            expect(mockAdoptedStyleSheets.length).toBe(1)
            // 2. Contains valid latest generated CSS
            expect(mockAdoptedStyleSheets[0].lastCssText).toContain(':root {')
            expect(mockAdoptedStyleSheets[0].lastCssText).toContain('color(display-p3')
            expect(mockAdoptedStyleSheets[0].lastCssText).toContain('--md-sys-color-background: light-dark(')
            // 3. High throughput: 100 full pipeline generations + serialization in under 20,000ms
            expect(elapsed).toBeLessThan(20000)
            console.log(`[Challenger 2 Dev-App Stress Benchmark] 100 rapid mutations in ${elapsed.toFixed(2)}ms (${(100 / (elapsed / 1000)).toFixed(0)} themes/sec)`)
        })

        it('benchmarks isolated toCSS serialization throughput over 1,000 rapid calls', () => {
            const themeData = createTheme({ specVersion: '2025', oled: true })('#6750a4')
            const serializer = toCSS({ format: 'display-p3', includePalettes: true })

            const start = performance.now()
            for (let i = 0; i < 1000; i++) {
                serializer(themeData)
            }
            const elapsed = performance.now() - start

            expect(elapsed).toBeLessThan(3000) // 1,000 full 155-token CSS serializations in under 3000ms
            console.log(`[Challenger 2 toCSS Serialization Benchmark] 1,000 toCSS calls in ${elapsed.toFixed(2)}ms (${(1000 / (elapsed / 1000)).toFixed(0)} ops/sec)`)
        })

        it('simulates fallback DOM <style> tag injection without accumulating orphaned nodes', () => {
            const fakeHeadChildren: { id: string; textContent: string }[] = []

            function applyFallbackStyles(cssText: string) {
                let styleEl = fakeHeadChildren.find((el) => el.id === 'mcu-helper-live-theme')
                if (!styleEl) {
                    styleEl = { id: 'mcu-helper-live-theme', textContent: '' }
                    fakeHeadChildren.push(styleEl)
                }
                styleEl.textContent = cssText
            }

            const cssSerializer = toCSS({ format: 'hex' })
            const theme = createTheme({ oled: true })('#6750a4')

            for (let i = 0; i < 500; i++) {
                const css = cssSerializer(theme)
                applyFallbackStyles(css)
            }

            // Exactly 1 style node created and updated in place
            expect(fakeHeadChildren.length).toBe(1)
            expect(fakeHeadChildren[0].id).toBe('mcu-helper-live-theme')
            expect(fakeHeadChildren[0].textContent).toContain(':root {')
        })

        it('stress tests multi-parameter reactive switching simulating all dev-app controls simultaneously', { timeout: 20000 }, () => {
            const formats = ['hex', 'rgb', 'display-p3', 'color-mix'] as const
            const variants = [
                MaterialVariant.TonalSpot,
                MaterialVariant.Vibrant,
                MaterialVariant.Expressive,
                MaterialVariant.Neutral,
            ]
            const contrastLevels = [
                MaterialContrastLevel.Reduced,
                MaterialContrastLevel.Default,
                MaterialContrastLevel.Medium,
                MaterialContrastLevel.High,
            ]
            const specs = ['2021', '2025'] as const

            let styleUpdateCount = 0
            const mockSheet = {
                cssText: '',
                replaceSync(t: string) {
                    this.cssText = t
                    styleUpdateCount++
                }
            }

            // Cycle across 64 combinations of spec, variant, contrast, format, oled
            for (const spec of specs) {
                for (const variant of variants) {
                    for (const contrast of contrastLevels) {
                        for (const fmt of formats) {
                            const oled = Math.random() > 0.5
                            const theme = createTheme({
                                specVersion: spec,
                                variant,
                                contrastLevel: contrast,
                                oled,
                            })('#6750a4')

                            const css = toCSS({
                                format: fmt,
                                colorMixSpace: 'srgb',
                                wrapLightDark: true,
                                includePalettes: true,
                            })(theme)

                            mockSheet.replaceSync(css)
                            expect(mockSheet.cssText).toContain(':root {')
                        }
                    }
                }
            }

            expect(styleUpdateCount).toBe(64 * 2) // 128 total combinations tested cleanly
        })
    })
})
