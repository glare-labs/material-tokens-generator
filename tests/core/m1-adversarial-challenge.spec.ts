import { DynamicScheme, Hct, TonalPalette, Variant } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import {
    calculateContrastRatio,
    createPaletteTones,
    createTheme,
    getLuminance,
    MaterialContrastLevel,
    MaterialVariant,
    normalizeToneList,
    parseColor,
    parseSourceColor,
    StandardPaletteTones,
} from '../../src/index'

const PITCH_BLACK_ARGB = 0xff000000 // Tone 0, ARGB

describe('Milestone 1 Empirical Adversarial Challenge Suite', () => {
    // =========================================================================
    // SECTION 1: Boundary & Extreme Seed Colors
    // =========================================================================
    describe('Challenge 1: Boundary & Extreme Seed Colors', () => {
        const extremeHctSeeds = [
            { name: 'Hue 0.0 Boundary', hct: Hct.from(0.0, 50, 50) },
            { name: 'Hue 360.0 Boundary', hct: Hct.from(360.0, 50, 50) },
            { name: 'Fractional Hue 0.0001', hct: Hct.from(0.0001, 60, 45) },
            { name: 'Fractional Hue 180.555', hct: Hct.from(180.555, 40, 60) },
            { name: 'Fractional Hue 359.9999', hct: Hct.from(359.9999, 50, 50) },
            { name: 'Negative Hue -45.0', hct: Hct.from(-45.0, 48, 50) },
            { name: 'Negative Hue -360.0', hct: Hct.from(-360.0, 48, 50) },
            { name: 'Negative Fractional Hue -0.01', hct: Hct.from(-0.01, 48, 50) },
            { name: 'Overshoot Hue 720.5', hct: Hct.from(720.5, 48, 50) },
            { name: 'Chroma 0.0 (Pure Grayscale)', hct: Hct.from(0, 0, 50) },
            { name: 'Near-Zero Chroma 0.001', hct: Hct.from(120, 0.001, 50) },
            { name: 'Low Chroma (Near Grayscale)', hct: Hct.from(200, 2.0, 50) },
            { name: 'Threshold Chroma 5.0', hct: Hct.from(200, 5.0, 50) },
            { name: 'Extreme Chroma 120.0', hct: Hct.from(120, 120.0, 50) },
            { name: 'Extreme Chroma 200.0', hct: Hct.from(30, 200.0, 50) },
            { name: 'Tone 0 (Pitch Black)', hct: Hct.from(0, 0, 0) },
            { name: 'Tone 100 (Pure White)', hct: Hct.from(0, 0, 100) },
            { name: 'Fractional Tone 0.001', hct: Hct.from(240, 50, 0.001) },
            { name: 'Fractional Tone 99.999', hct: Hct.from(240, 50, 99.999) },
        ]

        for (const { name, hct } of extremeHctSeeds) {
            it(`evaluates theme cleanly with seed: ${name}`, () => {
                const isGrayscale = hct.chroma < 5.0 || isNaN(hct.chroma)
                const theme2025 = createTheme({ specVersion: '2025' })(hct)
                const theme2021 = createTheme({ specVersion: '2021' })(hct)

                // Chromatic seeds in 2025 spec have 59 tokens (TonalSpot variant).
                // Grayscale seeds fallback to Monochrome variant in MCU which provides 55 tokens.
                const expected2025Count = isGrayscale ? 55 : 59
                expect(Object.keys(theme2025.light)).toHaveLength(expected2025Count)
                expect(Object.keys(theme2025.dark)).toHaveLength(expected2025Count)

                // Verify 2021 spec token count & integrity (always 55 tokens)
                expect(Object.keys(theme2021.light)).toHaveLength(55)
                expect(Object.keys(theme2021.dark)).toHaveLength(55)

                // Ensure all token values are valid finite integers (no NaN, undefined, or null)
                for (const [key, val] of Object.entries(theme2025.light)) {
                    expect(Number.isInteger(val), `light token ${key} is not an integer: ${val}`).toBe(true)
                }
                for (const [key, val] of Object.entries(theme2025.dark)) {
                    expect(Number.isInteger(val), `dark token ${key} is not an integer: ${val}`).toBe(true)
                }

                // Verify all 6 standard palettes exist
                expect(theme2025.palettes.primaryPalette).toBeDefined()
                expect(theme2025.palettes.secondaryPalette).toBeDefined()
                expect(theme2025.palettes.tertiaryPalette).toBeDefined()
                expect(theme2025.palettes.errorPalette).toBeDefined()
                expect(theme2025.palettes.neutralPalette).toBeDefined()
                expect(theme2025.palettes.neutralVariantPalette).toBeDefined()
            })
        }

        it('handles boundary and polymorphic string & number seed inputs', () => {
            const validPolymorphicInputs = [
                '#000000',
                '#ffffff',
                '#FFFFFF',
                '#123456',
                '#abcdef',
                '#ABCDEF',
                '#000',
                '#fff',
                '#f00',
                '#0f0',
                '#00f',
                '#000000ff',
                '#ffffffff',
                '#ff000080',
                '#00000000',
                '123456',
                'fff',
                '#fff',
                '  #6750a4  ',
                0xff000000,
                0xffffffff,
                0x80ff0000,
                0x00000000,
                -1, // 0xffffffff in 32-bit signed int
                -16777216, // 0xff000000 in 32-bit signed int
            ]

            for (const input of validPolymorphicInputs) {
                const parsed = parseSourceColor(input)
                expect(parsed).toBeInstanceOf(Hct)
                expect(Number.isFinite(parsed.hue)).toBe(true)
                expect(Number.isFinite(parsed.chroma)).toBe(true)
                expect(Number.isFinite(parsed.tone)).toBe(true)

                const theme = createTheme()(input)
                expect(Object.keys(theme.light).length).toBeGreaterThanOrEqual(55)
            }
        })

        it('strictly rejects all invalid seed color representations with TypeError', () => {
            const invalidInputs = [
                '',
                '   ',
                'not-a-color',
                '#',
                '#1',
                '#12',
                '#1234',
                '#12345',
                '#1234567',
                '#123456789',
                '#gggggg',
                '#zzzzzz',
                'rgb(255, 0, 0)',
                'rgba(255, 0, 0, 1)',
                'hsl(0, 100%, 50%)',
                NaN,
                Infinity,
                -Infinity,
                12.34,
                0.5,
                // @ts-expect-error - testing invalid types
                null,
                // @ts-expect-error - testing invalid types
                undefined,
                // @ts-expect-error - testing invalid types
                true,
                // @ts-expect-error - testing invalid types
                false,
                // @ts-expect-error - testing invalid types
                {},
                // @ts-expect-error - testing invalid types
                [],
                // @ts-expect-error - testing invalid types
                Symbol('color'),
            ]

            for (const invalid of invalidInputs) {
                expect(() => parseSourceColor(invalid as any)).toThrow(TypeError)
                expect(() => createTheme()(invalid as any)).toThrow(TypeError)
            }
        })
    })

    // =========================================================================
    // SECTION 2: OLED Mode Matrix Across ALL Material Variants & Contrast Levels
    // =========================================================================
    describe('Challenge 2: OLED Mode Across All Material Variants & Contrast Levels', () => {
        const variants = [
            { name: 'Monochrome (0)', value: MaterialVariant.Monochrome },
            { name: 'Neutral (1)', value: MaterialVariant.Neutral },
            { name: 'TonalSpot (2)', value: MaterialVariant.TonalSpot },
            { name: 'Vibrant (3)', value: MaterialVariant.Vibrant },
            { name: 'Expressive (4)', value: MaterialVariant.Expressive },
            { name: 'Fidelity (5)', value: MaterialVariant.Fidelity },
            { name: 'Content (6)', value: MaterialVariant.Content },
            { name: 'Rainbow (7)', value: MaterialVariant.Rainbow },
            { name: 'FruitSalad (8)', value: MaterialVariant.FruitSalad },
        ]

        const contrastLevels = [
            { name: 'Reduced (-1.0)', value: -1.0 },
            { name: 'Sub-Reduced (-0.5)', value: -0.5 },
            { name: 'Default (0.0)', value: 0.0 },
            { name: 'Quarter (0.25)', value: 0.25 },
            { name: 'Medium (0.5)', value: 0.5 },
            { name: 'Three-Quarter (0.75)', value: 0.75 },
            { name: 'High (1.0)', value: 1.0 },
        ]

        const testSeeds = ['#6750A4', '#00AAFF', '#FF0055', '#00FF00', '#FFAA00', '#000000', '#FFFFFF']

        for (const variant of variants) {
            for (const contrast of contrastLevels) {
                it(`guarantees OLED pitch black for variant=${variant.name}, contrast=${contrast.name}`, () => {
                    for (const seed of testSeeds) {
                        const theme = createTheme({
                            variant: variant.value,
                            contrastLevel: contrast.value,
                            oled: true,
                        })(seed)

                        // Dark mode background, surface, and surfaceContainerLowest MUST be exact pitch black
                        expect(theme.dark['background']).toBe(PITCH_BLACK_ARGB)
                        expect(theme.dark['surface']).toBe(PITCH_BLACK_ARGB)
                        expect(theme.dark['surfaceContainerLowest']).toBe(PITCH_BLACK_ARGB)

                        // Surface container hierarchy must maintain non-decreasing luminance
                        const lumLowest = getLuminance(theme.dark['surfaceContainerLowest'])
                        const lumLow = getLuminance(theme.dark['surfaceContainerLow'])
                        const lumContainer = getLuminance(theme.dark['surfaceContainer'])
                        const lumHigh = getLuminance(theme.dark['surfaceContainerHigh'])
                        const lumHighest = getLuminance(theme.dark['surfaceContainerHighest'])

                        expect(lumLowest).toBe(0)
                        expect(lumLow).toBeGreaterThanOrEqual(lumLowest)
                        expect(lumContainer).toBeGreaterThanOrEqual(lumLow)
                        expect(lumHigh).toBeGreaterThanOrEqual(lumContainer)
                        expect(lumHighest).toBeGreaterThanOrEqual(lumHigh)

                        // Light mode tokens must remain completely unaffected by OLED
                        const standardTheme = createTheme({
                            variant: variant.value,
                            contrastLevel: contrast.value,
                            oled: false,
                        })(seed)

                        expect(theme.light).toEqual(standardTheme.light)
                    }
                })
            }
        }
    })

    // =========================================================================
    // SECTION 3: Mathematical Contrast Ratios for OLED Dark Mode
    // =========================================================================
    describe('Challenge 3: Mathematical Contrast Ratios for OLED Dark Mode (>15:1)', () => {
        const diverseSeeds = [
            { name: 'Material Purple', hex: '#6750A4' },
            { name: 'Deep Violet', hex: '#4A148C' },
            { name: 'Primary Blue', hex: '#1976D2' },
            { name: 'Cyan / Teal', hex: '#0097A7' },
            { name: 'Forest Green', hex: '#2E7D32' },
            { name: 'Lime Green', hex: '#AFB42B' },
            { name: 'Amber / Orange', hex: '#FFA000' },
            { name: 'Deep Orange', hex: '#E64A19' },
            { name: 'Red / Crimson', hex: '#D32F2F' },
            { name: 'Pink / Rose', hex: '#C2185B' },
            { name: 'Brown / Earth', hex: '#5D4037' },
            { name: 'Blue Grey', hex: '#455A64' },
            { name: 'Bright Yellow', hex: '#FFEB3B' },
            { name: 'Bright Cyan', hex: '#00E5FF' },
            { name: 'Electric Magenta', hex: '#FF00FF' },
            { name: 'Neon Green', hex: '#00FF66' },
            { name: 'Pure White', hex: '#FFFFFF' },
            { name: 'Pure Black', hex: '#000000' },
            { name: 'Mid Gray', hex: '#808080' },
            { name: 'Pastel Lavender', hex: '#E1BEE7' },
            { name: 'Pastel Mint', hex: '#C8E6C9' },
        ]

        for (const { name, hex } of diverseSeeds) {
            it(`exceeds 15:1 contrast ratio for ${name} (${hex}) in OLED dark mode at default contrast`, () => {
                const theme = createTheme({ oled: true, contrastLevel: 0.0 })(hex)

                const bg = theme.dark['background']
                const surface = theme.dark['surface']
                const onBg = theme.dark['onBackground']
                const onSurface = theme.dark['onSurface']

                expect(bg).toBe(PITCH_BLACK_ARGB)
                expect(surface).toBe(PITCH_BLACK_ARGB)

                const onBgContrast = calculateContrastRatio(onBg, bg)
                const onSurfaceContrast = calculateContrastRatio(onSurface, surface)

                // Contrast formula against black (L=0): (L_bright + 0.05) / 0.05 = 20 * L_bright + 1
                // For CR >= 15.0, L_bright must be >= 0.70 (which corresponds to high tone >= 85)
                expect(onBgContrast, `on-background contrast ratio ${onBgContrast.toFixed(2)} is < 15.0 for ${name}`).toBeGreaterThanOrEqual(15.0)
                expect(onSurfaceContrast, `on-surface contrast ratio ${onSurfaceContrast.toFixed(2)} is < 15.0 for ${name}`).toBeGreaterThanOrEqual(15.0)

                // WCAG AAA standard requires at least 7:1 for normal text. 15:1 provides extreme readability on AMOLED
                expect(onBgContrast).toBeGreaterThanOrEqual(7.0)
                expect(onSurfaceContrast).toBeGreaterThanOrEqual(7.0)
            })

            it(`exceeds 15:1 contrast ratio for ${name} (${hex}) in OLED dark mode at High Contrast (1.0)`, () => {
                const theme = createTheme({ oled: true, contrastLevel: 1.0 })(hex)

                const bg = theme.dark['background']
                const onBg = theme.dark['onBackground']
                const onSurface = theme.dark['onSurface']

                const onBgContrast = calculateContrastRatio(onBg, bg)
                const onSurfaceContrast = calculateContrastRatio(onSurface, bg)

                expect(onBgContrast, `High contrast on-background ${onBgContrast.toFixed(2)} < 15.0 for ${name}`).toBeGreaterThanOrEqual(15.0)
                expect(onSurfaceContrast, `High contrast on-surface ${onSurfaceContrast.toFixed(2)} < 15.0 for ${name}`).toBeGreaterThanOrEqual(15.0)
            })
        }
    })

    // =========================================================================
    // SECTION 4: Tone Validation in createPaletteTones
    // =========================================================================
    describe('Challenge 4: Tone Validation in createPaletteTones', () => {
        const dummyPalette: Pick<TonalPalette, 'tone'> = {
            tone: (t: number) => 0xff000000 | (t << 16) | (t << 8) | t,
        }

        it('normalizes valid custom tone arrays correctly', () => {
            const res = createPaletteTones({ tones: [90, 10, 50, 0, 100] })(dummyPalette)
            expect(Object.keys(res).map(Number)).toEqual([0, 10, 50, 90, 100])
        })

        it('deduplicates duplicate tone inputs and maintains ascending order', () => {
            const res = createPaletteTones({ tones: [50, 10, 50, 90, 10, 0, 100, 0] })(dummyPalette)
            expect(Object.keys(res).map(Number)).toEqual([0, 10, 50, 90, 100])
        })

        it('handles single tone input correctly', () => {
            const res = createPaletteTones({ tones: [42] })(dummyPalette)
            expect(Object.keys(res)).toHaveLength(1)
            expect(res[42]).toBeDefined()
        })

        it('handles full 101 tones [0..100] correctly', () => {
            const all101 = Array.from({ length: 101 }, (_, i) => i)
            const res = createPaletteTones({ tones: all101 })(dummyPalette)
            expect(Object.keys(res)).toHaveLength(101)
            expect(res[0]).toBeDefined()
            expect(res[100]).toBeDefined()
        })

        it('throws TypeError for empty tones array', () => {
            expect(() => createPaletteTones({ tones: [] })(dummyPalette)).toThrow(TypeError)
        })

        it('throws TypeError for out-of-range negative tones', () => {
            expect(() => createPaletteTones({ tones: [-1] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [-50] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [0, 50, -10] })(dummyPalette)).toThrow(TypeError)
        })

        it('throws TypeError for out-of-range tones > 100', () => {
            expect(() => createPaletteTones({ tones: [101] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [200] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [0, 50, 100.1] })(dummyPalette)).toThrow(TypeError)
        })

        it('throws TypeError for non-integer or special float tones', () => {
            expect(() => createPaletteTones({ tones: [50.5] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [0.1] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [99.9] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [NaN] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [Infinity] })(dummyPalette)).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [-Infinity] })(dummyPalette)).toThrow(TypeError)
        })

        it('throws TypeError for non-palette objects passed to curried invocation', () => {
            // @ts-expect-error - testing invalid palette inputs
            expect(() => createPaletteTones()(null)).toThrow(TypeError)
            // @ts-expect-error - testing invalid palette inputs
            expect(() => createPaletteTones()(undefined)).toThrow(TypeError)
            // @ts-expect-error - testing invalid palette inputs
            expect(() => createPaletteTones()({})).toThrow(TypeError)
            // @ts-expect-error - testing invalid palette inputs
            expect(() => createPaletteTones()({ tone: 'not-a-func' })).toThrow(TypeError)
        })
    })
})
