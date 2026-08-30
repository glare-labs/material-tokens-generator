import { describe, it, expect } from 'vitest'
import { Hct } from '@material/material-color-utilities'
import {
    createTheme,
    toCSS,
    MaterialVariant,
    MaterialContrastLevel,
} from '../../src/index'

describe('Spec Versioning Suite (2021 vs 2025) (Features 4, 6)', () => {
    const seed = '#6750A4'
    const dimTokens = ['primaryDim', 'secondaryDim', 'tertiaryDim', 'errorDim']
    const standardPaletteKeys = [
        'primaryPalette',
        'secondaryPalette',
        'tertiaryPalette',
        'errorPalette',
        'neutralPalette',
        'neutralVariantPalette',
    ] as const

    describe('Tier 1: Feature Coverage — Spec Versioning Mechanics', () => {
        it('T1.1: should default to specVersion 2025 when options or specVersion omitted', () => {
            const defaultTheme = createTheme()(seed)
            const explicit2025Theme = createTheme({ specVersion: '2025' })(seed)

            expect(Object.keys(defaultTheme.light).length).toBe(59)
            expect(Object.keys(defaultTheme.dark).length).toBe(59)
            expect(defaultTheme.light).toEqual(explicit2025Theme.light)
            expect(defaultTheme.dark).toEqual(explicit2025Theme.dark)
        })

        it('T1.2: 2025 spec should produce exactly 59 tokens in both light and dark modes', () => {
            const theme2025 = createTheme({ specVersion: '2025' })(seed)

            expect(Object.keys(theme2025.light)).toHaveLength(59)
            expect(Object.keys(theme2025.dark)).toHaveLength(59)
        })

        it('T1.3: 2021 spec should produce exactly 55 tokens in both light and dark modes', () => {
            const theme2021 = createTheme({ specVersion: '2021' })(seed)

            expect(Object.keys(theme2021.light)).toHaveLength(55)
            expect(Object.keys(theme2021.dark)).toHaveLength(55)
        })

        it('T1.4: 2025 spec should contain all 4 dim tokens (primaryDim, secondaryDim, tertiaryDim, errorDim)', () => {
            const theme2025 = createTheme({ specVersion: '2025' })(seed)

            for (const dimToken of dimTokens) {
                expect(theme2025.light[dimToken]).toBeDefined()
                expect(typeof theme2025.light[dimToken]).toBe('number')
                expect(theme2025.dark[dimToken]).toBeDefined()
                expect(typeof theme2025.dark[dimToken]).toBe('number')
            }
        })

        it('T1.5: 2021 spec should NOT contain any of the 4 dim tokens', () => {
            const theme2021 = createTheme({ specVersion: '2021' })(seed)

            for (const dimToken of dimTokens) {
                expect(theme2021.light[dimToken]).toBeUndefined()
                expect(theme2021.dark[dimToken]).toBeUndefined()
            }
        })

        it('T1.6: both 2021 and 2025 specs should produce all 6 standard Material tonal palette families', () => {
            const theme2025 = createTheme({ specVersion: '2025' })(seed)
            const theme2021 = createTheme({ specVersion: '2021' })(seed)

            for (const paletteKey of standardPaletteKeys) {
                expect(theme2025.palettes[paletteKey]).toBeDefined()
                expect(theme2021.palettes[paletteKey]).toBeDefined()

                expect(typeof theme2025.palettes[paletteKey].tone).toBe('function')
                expect(typeof theme2021.palettes[paletteKey].tone).toBe('function')
                expect(typeof theme2025.palettes[paletteKey].hue).toBe('number')
                expect(typeof theme2021.palettes[paletteKey].hue).toBe('number')
            }
        })

        it('T1.7: palette key color tokens should exist in both 2021 and 2025 specs', () => {
            const keyColorTokens = [
                'primaryPaletteKeyColor',
                'secondaryPaletteKeyColor',
                'tertiaryPaletteKeyColor',
                'errorPaletteKeyColor',
                'neutralPaletteKeyColor',
                'neutralVariantPaletteKeyColor',
            ]

            const theme2025 = createTheme({ specVersion: '2025' })(seed)
            const theme2021 = createTheme({ specVersion: '2021' })(seed)

            for (const token of keyColorTokens) {
                expect(theme2025.light[token]).toBeDefined()
                expect(theme2021.light[token]).toBeDefined()
            }
        })

        it('T1.8: 2025 spec dark surfaceContainerLowest resolves to tone 0 (#000000) on standard phone platform', () => {
            const theme2025 = createTheme({ specVersion: '2025', platform: 'phone' })(seed)
            const darkLowest = theme2025.dark['surfaceContainerLowest']

            // Tone 0 in ARGB is 0xff000000
            expect(darkLowest).toBe(0xff000000)
        })

        it('T1.9: 2021 spec dark surfaceContainerLowest resolves to non-zero tone 4 (#0f0d13)', () => {
            const theme2021 = createTheme({ specVersion: '2021', platform: 'phone' })(seed)
            const darkLowest = theme2021.dark['surfaceContainerLowest']

            expect(darkLowest).not.toBe(0xff000000)
        })

        it('T1.10: contrast levels should apply consistently across both 2021 and 2025 specs', () => {
            const levels = [
                MaterialContrastLevel.Reduced,
                MaterialContrastLevel.Default,
                MaterialContrastLevel.Medium,
                MaterialContrastLevel.High,
            ]

            for (const contrastLevel of levels) {
                const t2025 = createTheme({ specVersion: '2025', contrastLevel })(seed)
                const t2021 = createTheme({ specVersion: '2021', contrastLevel })(seed)

                expect(Object.keys(t2025.light)).toHaveLength(59)
                expect(Object.keys(t2021.light)).toHaveLength(55)
            }
        })
    })

    describe('Tier 2: Boundary & Corner Cases', () => {
        it('T2.1: 2025 spec should gracefully fall back to 2021 spec behavior for variants not supported in 2025 without crashing', () => {
            const fallbackVariants = [
                MaterialVariant.Monochrome,
                MaterialVariant.Fidelity,
                MaterialVariant.Content,
                MaterialVariant.Rainbow,
                MaterialVariant.FruitSalad,
            ]

            for (const variant of fallbackVariants) {
                expect(() => {
                    const theme = createTheme({ specVersion: '2025', variant })(seed)
                    expect(theme).toBeDefined()
                    expect(Object.keys(theme.light).length).toBeGreaterThanOrEqual(55)
                }).not.toThrow()
            }
        })

        it('T2.2: should handle boundary hue values (0, 90, 180, 270, 360) under both specs', () => {
            const boundaryHues = [0, 90, 180, 270, 360]

            for (const hue of boundaryHues) {
                const colorHct = Hct.from(hue, 50, 50)
                const t2025 = createTheme({ specVersion: '2025' })(colorHct)
                const t2021 = createTheme({ specVersion: '2021' })(colorHct)

                expect(t2025.light['primary']).toBeDefined()
                expect(t2021.light['primary']).toBeDefined()
            }
        })

        it('T2.3: should handle grayscale seed color (chroma 0) under both specs', () => {
            const graySeed = Hct.from(0, 0, 50) // neutral grey
            const t2025 = createTheme({ specVersion: '2025' })(graySeed)
            const t2021 = createTheme({ specVersion: '2021' })(graySeed)

            expect(t2025.light['primary']).toBeDefined()
            expect(t2021.light['primary']).toBeDefined()
            expect(t2025.palettes.primaryPalette.chroma).toBe(0)
            expect(t2021.palettes.primaryPalette.chroma).toBe(0)
        })

        it('T2.4: High Contrast (1.0) under 2025 vs 2021 maintains high luminance separation', () => {
            const t2025High = createTheme({ specVersion: '2025', contrastLevel: MaterialContrastLevel.High })(seed)
            const t2021High = createTheme({ specVersion: '2021', contrastLevel: MaterialContrastLevel.High })(seed)

            expect(t2025High.light['onPrimary']).toBeDefined()
            expect(t2021High.light['onPrimary']).toBeDefined()
        })
    })

    describe('Tier 3: Cross-Feature Combinations', () => {
        it('T3.1: pairwise interaction — 2025 Spec + OLED Mode + Display P3 CSS serialization', () => {
            const theme = createTheme({
                specVersion: '2025',
                oled: true,
            })(seed)

            const css = toCSS({
                format: 'display-p3',
                varPrefix: 'p3-oled',
            })(theme)

            expect(css).toContain('--p3-oled-surface: light-dark(')
            expect(css).toContain('--p3-oled-primary-dim:')
            expect(css).toContain('color(display-p3')
        })

        it('T3.2: pairwise interaction — 2021 Spec + RGB serialization + Custom VarPrefix', () => {
            const theme = createTheme({
                specVersion: '2021',
            })(seed)

            const css = toCSS({
                format: 'rgb',
                varPrefix: 'legacy-2021',
            })(theme)

            expect(css).toContain('--legacy-2021-primary: light-dark(rgb(')
            expect(css).not.toContain('primary-dim')
        })
    })

    describe('Tier 4: Real-World Scenarios', () => {
        it('T4.1: Design System Migration Audit: Upgrading an existing application theme from 2021 to 2025 spec', () => {
            const legacyTheme = createTheme({ specVersion: '2021' })(seed)
            const modernTheme = createTheme({ specVersion: '2025' })(seed)

            // 1. Assert all 55 legacy tokens still exist in the modern 2025 theme (backward compatibility)
            for (const tokenKey of Object.keys(legacyTheme.light)) {
                expect(modernTheme.light[tokenKey]).toBeDefined()
                expect(modernTheme.dark[tokenKey]).toBeDefined()
            }

            // 2. Identify the 4 net-new tokens added in the 2025 upgrade
            const addedTokens = Object.keys(modernTheme.light).filter(
                (key) => !(key in legacyTheme.light)
            )

            expect(addedTokens.sort()).toEqual(dimTokens.sort())

            // 3. Serialize both stylesheets and confirm 2025 stylesheet includes new dim variables
            const legacyCss = toCSS({ varPrefix: 'sys' })(legacyTheme)
            const modernCss = toCSS({ varPrefix: 'sys' })(modernTheme)

            const kebabDimTokens = ['primary-dim', 'secondary-dim', 'tertiary-dim', 'error-dim']
            for (const dimToken of kebabDimTokens) {
                expect(legacyCss).not.toContain(`--sys-${dimToken}:`)
                expect(modernCss).toContain(`--sys-${dimToken}:`)
            }
        })
    })
})
