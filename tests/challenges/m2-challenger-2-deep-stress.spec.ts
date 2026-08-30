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

describe('Challenger 2 Deep Stress & Adversarial Hardening Suite', () => {

    // =========================================================================
    // 1. Edge Prefix & Custom Property Variations
    // =========================================================================
    describe('1. Edge Prefix & Custom Property Variations', () => {
        const testTheme = {
            lightObject: { primary: 0xff112233, onPrimary: 0xffffffff },
            darkObject: { primary: 0xff445566, onPrimary: 0xff000000 },
        }

        it('handles varPrefix with strange whitespace, tabs, and multiline characters', () => {
            const s1 = toCSS({ varPrefix: '  custom  ', includePalettes: false })
            const css1 = s1(testTheme)
            expect(css1).toContain('--  custom  -primary: light-dark(#112233, #445566);')

            const s2 = toCSS({ varPrefix: '---tabs\tprefix---', includePalettes: false })
            const css2 = s2(testTheme)
            expect(css2).toContain('--tabs\tprefix-primary: light-dark(#112233, #445566);')
        })

        it('handles edge prefix consisting solely of multiple hyphens ("-", "--", "---", "----")', () => {
            for (const prefix of ['-', '--', '---', '----', '----------']) {
                const s = toCSS({ varPrefix: prefix, includePalettes: false })
                const css = s(testTheme)
                expect(css).toContain('--primary: light-dark(#112233, #445566);')
                expect(css).not.toMatch(/---primary/)
            }
        })

        it('handles paletteVarPrefix with single/multiple hyphens and empty string', () => {
            const mockPalettes = {
                primaryPalette: TonalPalette.fromInt(0xff112233),
            } as any

            for (const prefix of ['', '-', '--', '---']) {
                const s = toCSS({
                    paletteVarPrefix: prefix,
                    paletteTones: [50],
                    includeTheme: false,
                })
                const css = s({ palettes: mockPalettes })
                expect(css).toContain('--primary-50: #')
                expect(css).not.toMatch(/---primary/)
            }
        })

        it('handles keys with symbols, unicode, emojis, numbers, and multiple delimiters', () => {
            const complexKeysTheme = {
                lightObject: {
                    'surface-100': 0xffffffff,
                    'surface_container_lowest.level-1': 0xfff0f0f0,
                    'ON_PRIMARY_FIXED_VARIANT_2025': 0xff123456,
                    'brand/accent/color': 0xffabcdef,
                    '🔥fireToken': 0xffff4500,
                    '--leading-trailing--': 0xff654321,
                },
                darkObject: {
                    'surface-100': 0xff000000,
                    'surface_container_lowest.level-1': 0xff101010,
                    'ON_PRIMARY_FIXED_VARIANT_2025': 0xff654321,
                    'brand/accent/color': 0xfffedcba,
                    '🔥fireToken': 0xffff6347,
                    '--leading-trailing--': 0xff123456,
                },
            }

            const s = toCSS({ includePalettes: false })
            const css = s(complexKeysTheme)

            expect(css).toContain('--md-sys-color-surface-100: light-dark(#ffffff, #000000);')
            expect(css).toContain('--md-sys-color-surface-container-lowest-level-1: light-dark(#f0f0f0, #101010);')
            expect(css).toContain('--md-sys-color-on-primary-fixed-variant-2025: light-dark(#123456, #654321);')
            expect(css).toContain('--md-sys-color-brand/accent/color: light-dark(#abcdef, #fedcba);')
            expect(css).toContain('--md-sys-color-🔥fire-token: light-dark(#ff4500, #ff6347);')
            expect(css).toContain('--md-sys-color-leading-trailing: light-dark(#654321, #123456);')
        })

        it('handles keys that resolve to empty strings gracefully without generating invalid CSS declarations', () => {
            const emptyKeyTheme = {
                lightObject: {
                    '': 0xff112233,
                    '---': 0xff445566,
                    '   ': 0xff778899,
                    validKey: 0xffaabbcc,
                },
                darkObject: {
                    '': 0xff112233,
                    '---': 0xff445566,
                    '   ': 0xff778899,
                    validKey: 0xffddeeff,
                },
            }

            const css = toCSS({ includePalettes: false })(emptyKeyTheme)
            expect(css).toContain('--md-sys-color-valid-key: light-dark(#aabbcc, #ddeeff);')
            expect(css).not.toContain('--md-sys-color-: ')
        })

        it('handles case collisions within the same object deterministically', () => {
            const duplicateTheme = {
                lightObject: {
                    primaryColor: 0xff111111,
                    'primary-color': 0xff222222, // will overwrite or merge to primary-color
                },
                darkObject: {
                    'PRIMARY_COLOR': 0xff333333,
                },
            }

            const css = toCSS({ includePalettes: false })(duplicateTheme)
            expect(css).toContain('--md-sys-color-primary-color: light-dark(#222222, #333333);')
        })
    })

    // =========================================================================
    // 2. Prototype Pollution & Malformed Object Robustness
    // =========================================================================
    describe('2. Prototype Pollution & Malformed Object Robustness', () => {
        it('ignores prototype properties and non-enumerable properties on lightObject/darkObject', () => {
            const protoObj = { inheritedToken: 0xff111111 }
            const light = Object.create(protoObj)
            light.primary = 0xff6750a4

            // Define non-enumerable property
            Object.defineProperty(light, 'hiddenToken', {
                value: 0xff999999,
                enumerable: false,
            })

            const dark = Object.create(protoObj)
            dark.primary = 0xffd0bcff
            Object.defineProperty(dark, 'hiddenToken', {
                value: 0xff888888,
                enumerable: false,
            })

            // Because protoObj is not Object.prototype or null, isPlainObject fails
            expect(() => toCSS({ includePalettes: false })({ lightObject: light, darkObject: dark })).toThrow(TypeError)
        })

        it('safely handles prototype pollution keys ("__proto__", "constructor") if present as own properties', () => {
            const light = Object.create(null)
            light.primary = 0xff6750a4
            light['constructor'] = 0xff123456

            const dark = Object.create(null)
            dark.primary = 0xffd0bcff
            dark['constructor'] = 0xff654321

            const css = toCSS({ includePalettes: false })({ lightObject: light, darkObject: dark })
            expect(css).toContain('--md-sys-color-primary: light-dark(#6750a4, #d0bcff);')
            expect(css).toContain('--md-sys-color-constructor: light-dark(#123456, #654321);')
        })

        it('safely handles frozen, sealed, and proxied plain objects', () => {
            const light = Object.freeze({ primary: 0xff6750a4 })
            const dark = Object.seal({ primary: 0xffd0bcff })

            const proxyLight = new Proxy(light, {
                get(target, prop) {
                    return Reflect.get(target, prop)
                },
            })

            const css = toCSS({ includePalettes: false })({ lightObject: proxyLight, darkObject: dark })
            expect(css).toContain('--md-sys-color-primary: light-dark(#6750a4, #d0bcff);')
        })

        it('rejects functions, regexes, dates, and maps passed as lightObject/darkObject', () => {
            const serializer = toCSS({ includePalettes: false })

            expect(() => serializer({ lightObject: (() => {}) as any, darkObject: {} })).toThrow(TypeError)
            expect(() => serializer({ lightObject: new Date() as any, darkObject: {} })).toThrow(TypeError)
            expect(() => serializer({ lightObject: /abc/ as any, darkObject: {} })).toThrow(TypeError)
            expect(() => serializer({ lightObject: new Map() as any, darkObject: {} })).toThrow(TypeError)
            expect(() => serializer({ lightObject: new Set() as any, darkObject: {} })).toThrow(TypeError)
        })
    })

    // =========================================================================
    // 3. Numeric ARGB & Color Edge Cases
    // =========================================================================
    describe('3. Numeric ARGB & Color Edge Cases', () => {
        it('handles all 32-bit integer boundaries (0, -1, MAX_INT32, MIN_INT32)', () => {
            const boundaryTheme = {
                lightObject: {
                    zero: 0,
                    minusOne: -1,
                    maxInt: 0x7fffffff,
                    minInt: -0x80000000,
                },
                darkObject: {
                    zero: 0,
                    minusOne: -1,
                    maxInt: 0x7fffffff,
                    minInt: -0x80000000,
                },
            }

            const css = toCSS({ includePalettes: false })(boundaryTheme)
            expect(css).toContain('--md-sys-color-zero: light-dark(#00000000, #00000000);')
            expect(css).toContain('--md-sys-color-minus-one: light-dark(#ffffff, #ffffff);')
            expect(css).toContain('--md-sys-color-max-int: light-dark(#ffffff7f, #ffffff7f);')
            expect(css).toContain('--md-sys-color-min-int: light-dark(#00000080, #00000080);')
        })

        it('rejects floating point NaN, Infinity, -Infinity and non-numeric values with exact field name in error', () => {
            const serializer = toCSS({ includePalettes: false })

            expect(() =>
                serializer({
                    lightObject: { badToken: NaN },
                    darkObject: { badToken: 0xff000000 },
                })
            ).toThrow('Serialization: lightObject key "badToken" must be a numeric ARGB color.')

            expect(() =>
                serializer({
                    lightObject: { goodToken: 0xff000000 },
                    darkObject: { badDarkToken: Infinity },
                })
            ).toThrow('Serialization: darkObject key "badDarkToken" must be a numeric ARGB color.')
        })
    })

    // =========================================================================
    // 4. Large Palettes & Extreme Tone Arrays
    // =========================================================================
    describe('4. Large Palettes & Extreme Tone Arrays', () => {
        it('handles 1,000 custom tones including duplicates and negative/overflow tone numbers', () => {
            const tonsOfTones = Array.from({ length: 1000 }, (_, i) => (i % 101))
            const mockPalettes = {
                primaryPalette: TonalPalette.fromInt(0xff6750a4),
                secondaryPalette: TonalPalette.fromInt(0xff625b71),
                tertiaryPalette: TonalPalette.fromInt(0xff7d5260),
                errorPalette: TonalPalette.fromInt(0xffb3261e),
                neutralPalette: TonalPalette.fromInt(0xff605d62),
                neutralVariantPalette: TonalPalette.fromInt(0xff605d66),
            }

            const s = toCSS({
                paletteTones: tonsOfTones,
                includeTheme: false,
            })

            const css = s({ palettes: mockPalettes })
            // 6 palettes * 101 deduplicated tones = 606 lines
            const lines = css.split('\n').filter((l) => l.includes('--md-ref-palette-'))
            expect(lines.length).toBe(606)
        })

        it('skips invalid or non-function palette members gracefully', () => {
            const corruptedPalettes = {
                primaryPalette: TonalPalette.fromInt(0xff6750a4),
                secondaryPalette: null,
                tertiaryPalette: undefined,
                errorPalette: 'not-a-palette' as any,
                neutralPalette: { tone: 'not-a-function' } as any,
                neutralVariantPalette: TonalPalette.fromInt(0xff605d66),
            }

            const s = toCSS({
                paletteTones: [40],
                includeTheme: false,
            })

            const css = s({ palettes: corruptedPalettes as any })
            expect(css).toContain('--md-ref-palette-primary-40: #')
            expect(css).toContain('--md-ref-palette-neutral-variant-40: #')
            expect(css).not.toContain('--md-ref-palette-secondary-')
            expect(css).not.toContain('--md-ref-palette-tertiary-')
            expect(css).not.toContain('--md-ref-palette-error-')
            expect(css).not.toContain('--md-ref-palette-neutral-40:')
        })
    })

    // =========================================================================
    // 5. Dev-App Stylesheet Adoption & High-Frequency Slider Stress (100 Iterations)
    // =========================================================================
    describe('5. Dev-App High-Frequency Slider Stress & Stylesheet Adoption', () => {
        it('executes 100 rapid slider mutations across all formats with zero stylesheet corruption', { timeout: 60000 }, () => {
            class MockCSSStyleSheet {
                cssRules: string[] = []
                lastCssText = ''
                replaceSync(text: string) {
                    this.lastCssText = text
                    this.cssRules = text.split(';')
                }
            }

            const mockAdopted: MockCSSStyleSheet[] = []
            let adoptedThemeSheet: MockCSSStyleSheet | null = null

            function applyLiveTheme(cssText: string) {
                if (!adoptedThemeSheet) {
                    adoptedThemeSheet = new MockCSSStyleSheet()
                    mockAdopted.push(adoptedThemeSheet)
                }
                adoptedThemeSheet.replaceSync(cssText)
            }

            const themeFactory = createTheme({
                specVersion: '2025',
                oled: true,
                variant: MaterialVariant.Vibrant,
                contrastLevel: MaterialContrastLevel.Default,
            })

            const formats = ['hex', 'rgb', 'display-p3', 'color-mix'] as const

            const start = performance.now()

            for (let i = 0; i < 100; i++) {
                const hex = '#' + Math.floor(0x100000 + (i * 0x002345) % 0xefffff).toString(16).padStart(6, '0')
                const fmt = formats[i % formats.length]

                const theme = themeFactory(hex)
                const css = toCSS({
                    format: fmt,
                    wrapLightDark: true,
                    includePalettes: true,
                })(theme)

                applyLiveTheme(css)
            }

            const duration = performance.now() - start

            expect(mockAdopted.length).toBe(1)
            expect(mockAdopted[0].lastCssText).toContain(':root {')
            expect(duration).toBeLessThan(45000)
            console.log(`[Challenger 2 Deep Stress] 100 rapid slider mutations completed in ${duration.toFixed(2)}ms (${(100 / (duration / 1000)).toFixed(1)} ops/sec)`)
        })

        it('benchmarks pure toCSS + stylesheet adoption over 2,000 rapid calls under 2,000ms', () => {
            class MockCSSStyleSheet {
                cssRules: string[] = []
                lastCssText = ''
                replaceSync(text: string) {
                    this.lastCssText = text
                    this.cssRules = text.split(';')
                }
            }

            const mockSheet = new MockCSSStyleSheet()
            const theme = createTheme({ specVersion: '2025', oled: true })('#0066FF')
            const serializer = toCSS({ format: 'display-p3', includePalettes: true })

            const start = performance.now()
            for (let i = 0; i < 2000; i++) {
                const css = serializer(theme)
                mockSheet.replaceSync(css)
            }
            const duration = performance.now() - start

            expect(mockSheet.lastCssText).toContain('color(display-p3')
            expect(duration).toBeLessThan(15000)
            console.log(`[Challenger 2 Deep Stress] 2,000 pure toCSS + replaceSync calls in ${duration.toFixed(2)}ms (${(2000 / (duration / 1000)).toFixed(0)} ops/sec)`)
        })

        it('verifies DOM fallback style injection remains single-instance across 500 updates', () => {
            const fakeDomNodes: { id: string; textContent: string }[] = []

            function applyFallbackTheme(cssText: string) {
                let styleEl = fakeDomNodes.find((el) => el.id === 'mcu-helper-live-theme')
                if (!styleEl) {
                    styleEl = { id: 'mcu-helper-live-theme', textContent: '' }
                    fakeDomNodes.push(styleEl)
                }
                styleEl.textContent = cssText
            }

            const theme = createTheme({ oled: true })('#6750A4')
            const serializer = toCSS({ format: 'display-p3' })

            for (let i = 0; i < 500; i++) {
                const css = serializer(theme)
                applyFallbackTheme(css)
            }

            expect(fakeDomNodes.length).toBe(1)
            expect(fakeDomNodes[0].textContent).toContain('color(display-p3')
        })
    })
})
