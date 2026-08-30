import { Hct, Variant } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import {
    createTheme,
    MaterialContrastLevel,
    MaterialVariant,
    type SpecVersion,
} from '../../src/index'

describe('createTheme Core Unit Tests', () => {
    const seedHex = '#6750A4'
    const seedHct = Hct.from(276, 68, 40)
    const seedArgb = 0xff6750a4

    const dimTokens = ['primaryDim', 'secondaryDim', 'tertiaryDim', 'errorDim']

    describe('Curried Invocation & Polymorphic Inputs', () => {
        it('supports full curried invocation fn(options)(sourceColor)', () => {
            const theme = createTheme({ variant: MaterialVariant.Vibrant })(seedHex)
            expect(theme).toBeDefined()
            expect(theme.light).toBeDefined()
            expect(theme.dark).toBeDefined()
            expect(theme.palettes).toBeDefined()
            expect(typeof theme.light).toBe('object')
            expect(typeof theme.dark).toBe('object')
            expect(Array.isArray(theme.light)).toBe(false)
            expect(Array.isArray(theme.dark)).toBe(false)
        })

        it('supports partial application and independent execution across different seeds', () => {
            const generateTheme = createTheme({
                variant: MaterialVariant.Expressive,
                contrastLevel: MaterialContrastLevel.High,
            })

            const theme1 = generateTheme('#FF0055')
            const theme2 = generateTheme('#00AAFF')

            expect(theme1.light['primary']).not.toEqual(theme2.light['primary'])
            expect(theme1.palettes.primaryPalette.hue).not.toEqual(theme2.palettes.primaryPalette.hue)
        })

        it('accepts Hct instance, 32-bit ARGB number, and various hex string formats', () => {
            const fromHct = createTheme()(seedHct)
            const fromArgb = createTheme()(seedArgb)
            const fromHexLower = createTheme()('#6750a4')
            const fromHexUpper = createTheme()('#6750A4')
            const fromHex3 = createTheme()('#abc')
            const fromHex8 = createTheme()('#6750a4ff')

            expect(fromArgb.light['primary']).toEqual(fromHexLower.light['primary'])
            expect(fromHexUpper.light['primary']).toEqual(fromHexLower.light['primary'])
            expect(fromHex3.light['primary']).toBeDefined()
            expect(fromHex8.light['primary']).toEqual(fromHexLower.light['primary'])
        })

        it('throws TypeError for invalid or empty source color inputs', () => {
            expect(() => createTheme()('')).toThrow(TypeError)
            expect(() => createTheme()('   ')).toThrow(TypeError)
            expect(() => createTheme()('invalid-color-string')).toThrow(TypeError)
            // @ts-expect-error - testing invalid type
            expect(() => createTheme()(null)).toThrow(TypeError)
            // @ts-expect-error - testing invalid type
            expect(() => createTheme()(undefined)).toThrow(TypeError)
            expect(() => createTheme()(NaN)).toThrow(TypeError)
            expect(() => createTheme()(12.34)).toThrow(TypeError)
        })
    })

    describe('Spec Versioning: 2021 (55 tokens) vs 2025 (59 tokens)', () => {
        it('defaults to specVersion 2025 with 59 tokens in light and dark modes', () => {
            const theme = createTheme()(seedHex)
            expect(Object.keys(theme.light)).toHaveLength(59)
            expect(Object.keys(theme.dark)).toHaveLength(59)

            for (const dimToken of dimTokens) {
                expect(theme.light[dimToken]).toBeDefined()
                expect(typeof theme.light[dimToken]).toBe('number')
                expect(theme.dark[dimToken]).toBeDefined()
                expect(typeof theme.dark[dimToken]).toBe('number')
            }
        })

        it('produces exactly 55 tokens in 2021 spec without any *Dim tokens', () => {
            const theme = createTheme({ specVersion: '2021' })(seedHex)
            expect(Object.keys(theme.light)).toHaveLength(55)
            expect(Object.keys(theme.dark)).toHaveLength(55)

            for (const dimToken of dimTokens) {
                expect(theme.light[dimToken]).toBeUndefined()
                expect(theme.dark[dimToken]).toBeUndefined()
            }
        })
    })

    describe('OLED Pitch-Black Dark Mode Optimization', () => {
        it('sets dark background, surface, and surface-container-lowest to tone 0 (0xff000000) when oled: true', () => {
            const theme = createTheme({ oled: true })(seedHex)
            const PITCH_BLACK = 0xff000000

            expect(theme.dark['background']).toBe(PITCH_BLACK)
            expect(theme.dark['surface']).toBe(PITCH_BLACK)
            expect(theme.dark['surfaceContainerLowest']).toBe(PITCH_BLACK)
        })

        it('retains standard non-zero dark surface tones when oled: false (default)', () => {
            const theme = createTheme({ oled: false })(seedHex)
            const PITCH_BLACK = 0xff000000

            expect(theme.dark['background']).not.toBe(PITCH_BLACK)
            expect(theme.dark['surface']).not.toBe(PITCH_BLACK)
        })

        it('does not modify light mode tokens when oled: true is activated', () => {
            const standard = createTheme({ oled: false })(seedHex)
            const oled = createTheme({ oled: true })(seedHex)

            expect(oled.light).toEqual(standard.light)
        })
    })

    describe('6 Standard Tonal Palettes Extraction', () => {
        it('extracts primary, secondary, tertiary, error, neutral, neutralVariant palettes with metadata and tone methods', () => {
            const theme = createTheme()(seedHex)
            const paletteKeys = [
                'primaryPalette',
                'secondaryPalette',
                'tertiaryPalette',
                'errorPalette',
                'neutralPalette',
                'neutralVariantPalette',
            ] as const

            for (const key of paletteKeys) {
                const pal = theme.palettes[key]
                expect(pal).toBeDefined()
                expect(typeof pal.hue).toBe('number')
                expect(typeof pal.chroma).toBe('number')
                expect(typeof pal.tone).toBe('function')
                expect(typeof pal.getHct).toBe('function')
                expect(pal.keyColor).toBeDefined()
            }
        })
    })

    describe('Custom Colors Processing', () => {
        it('processes custom color definitions with optional harmonization blend', () => {
            const theme = createTheme({
                customColors: [
                    { name: 'brand-accent', value: '#FF5500', blend: true },
                    { name: 'brand-neutral', value: '#555555', blend: false },
                ],
            })(seedHex)

            expect(theme.customColors).toBeDefined()
            expect(theme.customColors).toHaveLength(2)
            expect(theme.customColors![0].name).toBe('brand-accent')
            expect(theme.customColors![0].light.color).toBeDefined()
            expect(theme.customColors![0].dark.color).toBeDefined()
            expect(theme.customColors![1].name).toBe('brand-neutral')
        })
    })
})
