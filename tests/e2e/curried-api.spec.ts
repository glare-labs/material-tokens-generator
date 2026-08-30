import { describe, it, expect } from 'vitest'
import { Hct, TonalPalette } from '@material/material-color-utilities'
import {
    createTheme,
    createPaletteTones,
    toCSS,
    toKebabCase,
    toSnakeCase,
    toPascalCase,
    MaterialVariant,
    MaterialContrastLevel,
} from '../../src/index'

describe('Curried Higher-Order API Suite (Features 1, 2, 3, 8)', () => {
    const seedHex = '#6750A4'
    const seedHct = Hct.from(276, 68, 40)
    const seedArgb = 0xff6750a4

    describe('Tier 1: Feature Coverage — createTheme(options)(sourceColor)', () => {
        it('T1.1: should invoke createTheme with default options and produce a complete Theme object', () => {
            const generateTheme = createTheme()
            const theme = generateTheme(seedHex)

            expect(theme).toBeDefined()
            expect(theme.light).toBeDefined()
            expect(theme.dark).toBeDefined()
            expect(theme.palettes).toBeDefined()

            expect(typeof theme.light).toBe('object')
            expect(typeof theme.dark).toBe('object')
            expect(Array.isArray(theme.light)).toBe(false)
            expect(Array.isArray(theme.dark)).toBe(false)
        })

        it('T1.2: should accept explicit CreateThemeOptions and apply custom variant and contrast', () => {
            const generateVibrantMedium = createTheme({
                variant: MaterialVariant.Vibrant,
                contrastLevel: MaterialContrastLevel.Medium,
            })
            const theme = generateVibrantMedium(seedHct)

            expect(Object.keys(theme.light).length).toBeGreaterThanOrEqual(55)
            expect(Object.keys(theme.dark).length).toBeGreaterThanOrEqual(55)
            expect(theme.light['primary']).toBeDefined()
            expect(typeof theme.light['primary']).toBe('number')
        })

        it('T1.3: should accept Hct instance as data argument', () => {
            const theme = createTheme()(seedHct)
            expect(theme.light['primary']).toBeDefined()
            expect(theme.palettes.primaryPalette.hue).toBeCloseTo(seedHct.hue, 0)
        })

        it('T1.4: should accept 32-bit ARGB number as data argument', () => {
            const theme = createTheme()(seedArgb)
            expect(theme.light['primary']).toBeDefined()
            expect(typeof theme.light['primary']).toBe('number')
        })

        it('T1.5: should accept hex string as data argument in various formats (#rrggbb, #RRGGBB)', () => {
            const themeLower = createTheme()('#6750a4')
            const themeUpper = createTheme()('#6750A4')

            expect(themeLower.light['primary']).toEqual(themeUpper.light['primary'])
        })
    })

    describe('Tier 1: Feature Coverage — createPaletteTones(options)(palette)', () => {
        const palette = TonalPalette.fromHueAndChroma(276, 68)

        it('T1.6: should invoke createPaletteTones with default options and produce all standard tones', () => {
            const getTones = createPaletteTones()
            const result = getTones(palette)

            expect(typeof result).toBe('object')
            expect(Object.keys(result).length).toBeGreaterThanOrEqual(16)
            expect(result[0]).toBeDefined()
            expect(result[50]).toBeDefined()
            expect(result[100]).toBeDefined()
        })

        it('T1.7: should accept custom tones array and return exact requested tones', () => {
            const getCustomTones = createPaletteTones({ tones: [10, 20, 30, 80, 90] })
            const result = getCustomTones(palette)

            expect(Object.keys(result)).toHaveLength(5)
            expect(Object.keys(result).map(Number)).toEqual([10, 20, 30, 80, 90])
        })

        it('T1.8: should map tone entries to valid 32-bit ARGB colors matching palette.tone()', () => {
            const tones = [0, 25, 50, 75, 100]
            const result = createPaletteTones({ tones })(palette)

            for (const [toneStr, color] of Object.entries(result)) {
                expect(color).toBe(palette.tone(Number(toneStr)))
            }
        })

        it('T1.9: should work with any Pick<TonalPalette, "tone"> implementation', () => {
            const mockPalette = {
                tone: (t: number) => 0xff000000 + t,
            }
            const result = createPaletteTones({ tones: [10, 50] })(mockPalette)

            expect(result).toEqual({
                10: 0xff000000 + 10,
                50: 0xff000000 + 50,
            })
        })

        it('T1.10: should return entries sorted strictly in ascending tone order', () => {
            const result = createPaletteTones({ tones: [95, 10, 50, 0, 100] })(palette)
            const toneNumbers = Object.keys(result).map(Number)

            expect(toneNumbers).toEqual([0, 10, 50, 95, 100])
        })
    })

    describe('Tier 1: Feature Coverage — toCSS(options)(themeData)', () => {
        const theme = createTheme()(seedHex)

        it('T1.11: should invoke toCSS with default options and generate valid :root block', () => {
            const serializer = toCSS()
            const css = serializer(theme)

            expect(css).toContain(':root {')
            expect(css).toContain('}')
            expect(css).toContain('--md-sys-color-primary:')
            expect(css).toContain('light-dark(')
        })

        it('T1.12: should serialize theme entries wrapped with light-dark() CSS color function', () => {
            const css = toCSS()(theme)
            const match = css.match(/--md-sys-color-primary:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#([0-9a-fA-F]{6})\);/)

            expect(match).not.toBeNull()
        })

        it('T1.13: should serialize palette tokens when palettes are included in themeData', () => {
            const css = toCSS({ paletteTones: [0, 50, 100] })(theme)

            expect(css).toContain('--md-ref-palette-primary-0:')
            expect(css).toContain('--md-ref-palette-primary-50:')
            expect(css).toContain('--md-ref-palette-primary-100:')
        })

        it('T1.14: should accept raw { lightObject, darkObject } without palettes', () => {
            const rawTheme = {
                lightObject: { primary: 0xff6750a4, surface: 0xfffef7ff },
                darkObject: { primary: 0xffd0bcff, surface: 0xff141218 },
            }
            const css = toCSS()(rawTheme)

            expect(css).toContain('--md-sys-color-primary: light-dark(#6750a4, #d0bcff);')
            expect(css).toContain('--md-sys-color-surface: light-dark(#fef7ff, #141218);')
        })

        it('T1.15: should format CSS properties with proper 4-space indentation and line breaks', () => {
            const rawTheme = {
                lightObject: { primary: 0xff6750a4 },
                darkObject: { primary: 0xffd0bcff },
            }
            const css = toCSS()(rawTheme)

            expect(css).toBe(':root {\n    --md-sys-color-primary: light-dark(#6750a4, #d0bcff);\n}\n')
        })
    })

    describe('Tier 1: Feature Coverage — Pure String Utilities', () => {
        it('T1.16: toKebabCase should convert camelCase and space-separated strings to kebab-case', () => {
            expect(toKebabCase('primaryContainer')).toBe('primary-container')
            expect(toKebabCase('surfaceContainerHighest')).toBe('surface-container-highest')
            expect(toKebabCase('neutralVariantPalette')).toBe('neutral-variant-palette')
        })

        it('T1.17: toSnakeCase should convert camelCase and kebab-case strings to snake_case', () => {
            expect(toSnakeCase('primaryContainer')).toBe('primary_container')
            expect(toSnakeCase('surface-container-highest')).toBe('surface_container_highest')
            expect(toSnakeCase('onSecondaryFixedVariant')).toBe('on_secondary_fixed_variant')
        })

        it('T1.18: toPascalCase should convert kebab-case and camelCase strings to PascalCase', () => {
            expect(toPascalCase('primary-container')).toBe('PrimaryContainer')
            expect(toPascalCase('surface_container_lowest')).toBe('SurfaceContainerLowest')
            expect(toPascalCase('onSurfaceVariant')).toBe('OnSurfaceVariant')
        })

        it('T1.19: string utilities should handle numbers, dots, and multiple underscores/dashes', () => {
            expect(toKebabCase('tone.20.color')).toBe('tone-20-color')
            expect(toKebabCase('surface__container--lowest')).toBe('surface-container-lowest')
            expect(toSnakeCase('color..mix--format')).toBe('color_mix_format')
            expect(toPascalCase('color--mix__space')).toBe('ColorMixSpace')
        })

        it('T1.20: string utilities should return empty string for empty, null, or undefined inputs safely', () => {
            expect(toKebabCase('')).toBe('')
            expect(toSnakeCase('')).toBe('')
            expect(toPascalCase('')).toBe('')
            // @ts-expect-error - testing falsy inputs
            expect(toKebabCase(undefined)).toBe('')
            // @ts-expect-error - testing falsy inputs
            expect(toSnakeCase(null)).toBe('')
        })
    })

    describe('Tier 2: Boundary & Corner Cases', () => {
        it('T2.1: createTheme should handle partial application and multiple invocations with isolated state', () => {
            const themedGenerator = createTheme({
                variant: MaterialVariant.Vibrant,
                contrastLevel: MaterialContrastLevel.High,
            })

            const theme1 = themedGenerator('#FF0055')
            const theme2 = themedGenerator('#00AAFF')

            expect(theme1.light['primary']).not.toEqual(theme2.light['primary'])
            expect(theme1.palettes.primaryPalette.hue).not.toEqual(theme2.palettes.primaryPalette.hue)
        })

        it('T2.2: createTheme options should not be mutated across invocations', () => {
            const options = { variant: MaterialVariant.Expressive, oled: false }
            const gen = createTheme(options)
            gen('#123456')

            expect(options).toEqual({ variant: MaterialVariant.Expressive, oled: false })
        })

        it('T2.3: createPaletteTones should deduplicate and sort tone inputs automatically', () => {
            const palette = TonalPalette.fromHueAndChroma(120, 50)
            const result = createPaletteTones({ tones: [90, 10, 50, 10, 90, 0] })(palette)

            expect(Object.keys(result).map(Number)).toEqual([0, 10, 50, 90])
        })

        it('T2.4: createPaletteTones should throw TypeError when tones array is empty', () => {
            const palette = TonalPalette.fromHueAndChroma(120, 50)
            expect(() => createPaletteTones({ tones: [] })(palette)).toThrow(TypeError)
        })

        it('T2.5: createPaletteTones should throw TypeError when tone values are out of bounds or non-integers', () => {
            const palette = TonalPalette.fromHueAndChroma(120, 50)
            expect(() => createPaletteTones({ tones: [-1] })(palette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [101] })(palette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [50.5] })(palette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [NaN] })(palette)).toThrow(TypeError)
        })

        it('T2.6: toCSS should throw TypeError when lightObject and darkObject have mismatched keys', () => {
            const invalidTheme = {
                lightObject: { primary: 0xff6750a4, surface: 0xfffef7ff },
                darkObject: { primary: 0xffd0bcff, background: 0xff141218 },
            }

            expect(() => toCSS()(invalidTheme)).toThrow(TypeError)
        })

        it('T2.7: toCSS should return empty :root block when both lightObject and darkObject are empty', () => {
            const emptyTheme = { lightObject: {}, darkObject: {} }
            const css = toCSS()(emptyTheme)

            expect(css).toBe(':root {\n}\n')
        })

        it('T2.8: toCSS should support includeRoot: false to emit raw declarations without :root wrapper', () => {
            const rawTheme = {
                lightObject: { primary: 0xff6750a4 },
                darkObject: { primary: 0xffd0bcff },
            }
            const css = toCSS({ includeRoot: false })(rawTheme)

            expect(css).not.toContain(':root')
            expect(css.trim()).toBe('--md-sys-color-primary: light-dark(#6750a4, #d0bcff);')
        })
    })

    describe('Tier 3: Cross-Feature Combinations', () => {
        it('T3.1: should compose createTheme and toCSS into a curried one-liner pipeline', () => {
            const createStylesheet = (seed: string) =>
                toCSS({
                    varPrefix: 'brand',
                    format: 'hex',
                })(
                    createTheme({
                        variant: MaterialVariant.FruitSalad,
                        contrastLevel: MaterialContrastLevel.Medium,
                    })(seed)
                )

            const css = createStylesheet('#00CC88')

            expect(css).toContain(':root {')
            expect(css).toContain('--brand-primary:')
            expect(css).toContain('light-dark(')
        })

        it('T3.2: should combine createTheme with custom tones and custom palette varPrefix', () => {
            const theme = createTheme()(seedHex)
            const css = toCSS({
                paletteVarPrefix: 'ref-pal',
                paletteTones: [10, 90],
            })(theme)

            expect(css).toContain('--ref-pal-primary-10:')
            expect(css).toContain('--ref-pal-primary-90:')
            expect(css).not.toContain('--ref-pal-primary-50:')
        })
    })

    describe('Tier 4: Real-World Scenarios', () => {
        it('T4.1: Multi-tenant design token generator factory pattern', () => {
            interface TenantConfig {
                tenantId: string
                seedColor: string
                contrast: MaterialContrastLevel
                variant: MaterialVariant
                cssPrefix: string
            }

            const tenants: TenantConfig[] = [
                {
                    tenantId: 'tenant-alpha',
                    seedColor: '#1A73E8',
                    contrast: MaterialContrastLevel.Default,
                    variant: MaterialVariant.TonalSpot,
                    cssPrefix: 'alpha',
                },
                {
                    tenantId: 'tenant-beta',
                    seedColor: '#E91E63',
                    contrast: MaterialContrastLevel.High,
                    variant: MaterialVariant.Vibrant,
                    cssPrefix: 'beta',
                },
            ]

            const results = tenants.map((tenant) => {
                const themeGen = createTheme({
                    variant: tenant.variant,
                    contrastLevel: tenant.contrast,
                })
                const cssGen = toCSS({
                    varPrefix: tenant.cssPrefix,
                })
                const theme = themeGen(tenant.seedColor)
                const stylesheet = cssGen(theme)

                return {
                    tenantId: tenant.tenantId,
                    theme,
                    stylesheet,
                }
            })

            expect(results).toHaveLength(2)
            expect(results[0].stylesheet).toContain('--alpha-primary:')
            expect(results[1].stylesheet).toContain('--beta-primary:')
            expect(results[0].theme.light['primary']).not.toEqual(results[1].theme.light['primary'])
        })
    })
})
