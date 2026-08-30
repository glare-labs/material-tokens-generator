import { Hct, MaterialDynamicColors, TonalPalette } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import { MaterialContrastLevel, MaterialVariant } from '../types/material.types'
import { createTheme } from './theme'

describe('core/theme', () => {
    const seedHex = '#6750A4'
    const seedArgb = 0xff6750a4
    const seedHct = Hct.fromInt(seedArgb)

    describe('Curried Factory & Parameter Ingestion', () => {
        it('accepts hex string, ARGB integer, or Hct instance', () => {
            const themeFn = createTheme()

            const themeFromHex = themeFn(seedHex)
            const themeFromArgb = themeFn(seedArgb)
            const themeFromHct = themeFn(seedHct)

            expect(Object.keys(themeFromHex.light).length).toBe(Object.keys(themeFromArgb.light).length)
            expect(Object.keys(themeFromArgb.light).length).toBe(Object.keys(themeFromHct.light).length)
            expect(themeFromHex.light['primary']).toBe(themeFromHct.light['primary'])
        })

        it('returns clean MaterialThemeData structure with light/dark dictionaries and palettes', () => {
            const theme = createTheme()(seedHex)

            expect(theme).toHaveProperty('light')
            expect(theme).toHaveProperty('dark')
            expect(theme).toHaveProperty('palettes')
            expect(theme).not.toHaveProperty('lightObject')
            expect(theme).not.toHaveProperty('darkObject')
            expect(theme).not.toHaveProperty('schemes')

            expect(typeof theme.light).toBe('object')
            expect(typeof theme.dark).toBe('object')
            expect(Array.isArray(theme.light)).toBe(false)
            expect(Array.isArray(theme.dark)).toBe(false)
            expect(typeof theme.palettes).toBe('object')
        })
    })

    describe('Spec Versioning (2021 vs 2025)', () => {
        it('defaults to specVersion 2025 (59 tokens)', () => {
            const theme = createTheme()(seedHex)
            expect(Object.keys(theme.light)).toHaveLength(59)
            expect(Object.keys(theme.dark)).toHaveLength(59)
            expect(theme.light['primaryDim']).toBeDefined()
            expect(theme.light['secondaryDim']).toBeDefined()
            expect(theme.light['tertiaryDim']).toBeDefined()
            expect(theme.light['errorDim']).toBeDefined()
        })

        it('supports specVersion 2021 (55 tokens without dim variants)', () => {
            const theme = createTheme({ specVersion: '2021' })(seedHex)
            expect(Object.keys(theme.light)).toHaveLength(55)
            expect(Object.keys(theme.dark)).toHaveLength(55)
            expect(theme.light['primaryDim']).toBeUndefined()
            expect(theme.light['secondaryDim']).toBeUndefined()
            expect(theme.light['tertiaryDim']).toBeUndefined()
            expect(theme.light['errorDim']).toBeUndefined()
        })
    })

    describe('OLED Dark Mode Optimization', () => {
        it('sets dark mode background, surface, and surfaceContainerLowest to tone 0 (pure black 0xff000000)', () => {
            const oledTheme = createTheme({ oled: true })(seedHex)
            expect(oledTheme.dark['background']).toBe(0xff000000)
            expect(oledTheme.dark['surface']).toBe(0xff000000)
            expect(oledTheme.dark['surfaceContainerLowest']).toBe(0xff000000)

            // Light mode should NOT be modified
            expect(oledTheme.light['background']).not.toBe(0xff000000)
            expect(oledTheme.light['surface']).not.toBe(0xff000000)
        })

        it('preserves standard dark elevation tokens when oled is false', () => {
            const standardTheme = createTheme({ oled: false })(seedHex)
            expect(standardTheme.dark['background']).not.toBe(0xff000000)
            expect(standardTheme.dark['surface']).not.toBe(0xff000000)
        })
    })

    describe('Variants & Contrast Levels', () => {
        it('supports all Material variants', () => {
            const variants = [
                MaterialVariant.Monochrome,
                MaterialVariant.Neutral,
                MaterialVariant.TonalSpot,
                MaterialVariant.Vibrant,
                MaterialVariant.Expressive,
                MaterialVariant.Fidelity,
                MaterialVariant.Content,
                MaterialVariant.Rainbow,
                MaterialVariant.FruitSalad,
            ]

            for (const v of variants) {
                const theme = createTheme({ variant: v })(seedHex)
                expect(Object.keys(theme.light).length).toBeGreaterThanOrEqual(55)
            }
        })

        it('supports contrast levels (-1.0 to 1.0)', () => {
            const reduced = createTheme({ contrastLevel: MaterialContrastLevel.Reduced })(seedHex)
            const standard = createTheme({ contrastLevel: MaterialContrastLevel.Default })(seedHex)
            const high = createTheme({ contrastLevel: MaterialContrastLevel.High })(seedHex)

            expect(reduced.light['primary']).not.toBe(high.light['primary'])
            expect(standard.light['primary']).toBeDefined()
            expect(high.light['primary']).toBeDefined()
        })
    })

    describe('Custom Palettes & Custom Colors', () => {
        it('overrides palettes with customPalettes', () => {
            const customPal = TonalPalette.fromHueAndChroma(120, 50)
            const theme = createTheme({
                customPalettes: {
                    primaryPalette: customPal,
                },
            })(seedHex)

            expect(theme.palettes.primaryPalette.hue).toBeCloseTo(120, 0)
        })

        it('processes custom colors with harmonize blending', () => {
            const theme = createTheme({
                customColors: [
                    { name: 'brand-orange', value: '#FF5722', blend: true },
                    { name: 'brand-teal', value: '#009688', blend: false },
                ],
            })(seedHex)

            expect(theme.customColors).toBeDefined()
            expect(theme.customColors).toHaveLength(2)
            expect(theme.customColors![0].name).toBe('brand-orange')
            expect(theme.customColors![0].light.color).toBeDefined()
            expect(theme.customColors![1].name).toBe('brand-teal')
        })
    })
})
