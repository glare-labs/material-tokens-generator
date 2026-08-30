import { describe, expect, it } from 'vitest'
import {
    Hct,
    TonalPalette,
} from '@material/material-color-utilities'
import {
    createPaletteTones,
    createTheme,
    MaterialContrastLevel,
    MaterialVariant,
    toCSS,
} from '../../src/index'

describe('Challenger 2 Empirical Verification: Currying, Isolation, & Stress', () => {
    // -------------------------------------------------------------------------
    // 1. Partial Application & State Isolation (50 Concurrent Diverse Seeds)
    // -------------------------------------------------------------------------
    describe('1. Partial Application & State Isolation', () => {
        it('instantiates createTheme with Vibrant + OLED and processes 50 diverse seeds concurrently with zero crosstalk', async () => {
            const options = {
                variant: MaterialVariant.Vibrant,
                oled: true,
                contrastLevel: MaterialContrastLevel.Default,
            }
            const gen = createTheme(options)

            // Generate 50 distinct seed colors across diverse hues, saturations, and lightnesses
            const seedColors: string[] = []
            for (let i = 0; i < 50; i++) {
                const hue = (i * 360) / 50
                const hct = Hct.from(hue, 48, 50)
                const hex = '#' + (hct.toInt() & 0xffffff).toString(16).padStart(6, '0')
                seedColors.push(hex)
            }

            expect(seedColors.length).toBe(50)

            // Run concurrently via Promise.all
            const concurrentResults = await Promise.all(
                seedColors.map(async (seed, idx) => {
                    // Introduce slight micro-tick jitter to stress concurrent execution interleaving
                    if (idx % 2 === 0) await new Promise((r) => setTimeout(r, 1))
                    return gen(seed)
                })
            )

            // Run sequentially with freshly instantiated generators for oracle comparison
            const sequentialOracles = seedColors.map((seed) =>
                createTheme({ variant: MaterialVariant.Vibrant, oled: true, contrastLevel: MaterialContrastLevel.Default })(seed)
            )

            for (let i = 0; i < 50; i++) {
                const res = concurrentResults[i]
                const oracle = sequentialOracles[i]
                const seed = seedColors[i]

                // 1. Exact match with oracle
                expect(res.light).toEqual(oracle.light)
                expect(res.dark).toEqual(oracle.dark)

                // 2. Token counts (Spec 2025 has 59 tokens)
                expect(Object.keys(res.light).length).toBe(59)
                expect(Object.keys(res.dark).length).toBe(59)

                // 3. OLED pitch-black verification in dark mode (tone 0 = 0xff000000)
                expect(res.dark['background']).toBe(0xff000000)
                expect(res.dark['surface']).toBe(0xff000000)
                expect(res.dark['surfaceContainerLowest']).toBe(0xff000000)

                // 4. Light mode background is NOT tone 0
                expect(res.light['background']).not.toBe(0xff000000)
                expect(res.light['surface']).not.toBe(0xff000000)

                // 5. Palettes properly created
                expect(res.palettes.primaryPalette.tone(100)).toBe(0xffffffff)
                expect(res.palettes.primaryPalette.tone(0)).toBe(0xff000000)

                // 6. Distinctness: different seeds produce different primary colors (except when hue wrapping matches)
                if (i > 0) {
                    const prevRes = concurrentResults[i - 1]
                    expect(res.light['primary']).not.toBe(prevRes.light['primary'])
                }
            }

            // Verify options object passed to createTheme was not mutated
            expect(options).toEqual({
                variant: MaterialVariant.Vibrant,
                oled: true,
                contrastLevel: MaterialContrastLevel.Default,
            })
        }, 30000)

        it('guarantees immutability and lack of shared reference mutation across theme results', () => {
            const gen = createTheme({ variant: MaterialVariant.Expressive, oled: false })
            const theme1 = gen('#FF0000')
            const theme2 = gen('#00FF00')

            // Mutating an object in theme1 must not affect theme2 or subsequent calls
            theme1.light['custom-mutation'] = 12345
            expect(theme2.light['custom-mutation']).toBeUndefined()

            const theme3 = gen('#FF0000')
            expect(theme3.light['custom-mutation']).toBeUndefined()
        })
    })

    // -------------------------------------------------------------------------
    // 2. Curried Palette Generation Across Multiple Instances & Custom Tones
    // -------------------------------------------------------------------------
    describe('2. Curried Palette Generation & Custom Tone Arrays', () => {
        it('curries createPaletteTones with custom tones across multiple palette instances', () => {
            const customTones = [0, 15, 30, 45, 60, 75, 90, 100]
            const getTones = createPaletteTones({ tones: customTones })

            // Test across diverse palette families generated from createTheme
            const seeds = [0xff6750a4, 0xff006688, 0xff990000, 0xff009944, 0xffbb6600]
            for (const seed of seeds) {
                const theme = createTheme()(seed)
                const palettes: Array<{ name: string; pal: TonalPalette }> = [
                    { name: 'primary', pal: theme.palettes.primaryPalette },
                    { name: 'secondary', pal: theme.palettes.secondaryPalette },
                    { name: 'tertiary', pal: theme.palettes.tertiaryPalette },
                    { name: 'neutral', pal: theme.palettes.neutralPalette },
                    { name: 'neutralVariant', pal: theme.palettes.neutralVariantPalette },
                    { name: 'error', pal: theme.palettes.errorPalette },
                ]

                for (const { pal } of palettes) {
                    const result = getTones(pal)

                    // Verify result structure
                    expect(Object.keys(result)).toHaveLength(8)
                    expect(Object.keys(result).map(Number)).toEqual([0, 15, 30, 45, 60, 75, 90, 100])

                    // Verify tone color values match direct palette.tone(t)
                    for (const [toneStr, color] of Object.entries(result)) {
                        expect(color).toBe(pal.tone(Number(toneStr)))
                    }
                }
            }
        })

        it('handles non-standard, unordered, and duplicate tone inputs robustly', () => {
            const unorderedDuplicateTones = [95, 10, 50, 10, 95, 0, 100, 50]
            const getTones = createPaletteTones({ tones: unorderedDuplicateTones })

            const palette = TonalPalette.fromHueAndChroma(210, 40)
            const result = getTones(palette)

            // Must be deduplicated and sorted ascending: [0, 10, 50, 95, 100]
            expect(Object.keys(result).map(Number)).toEqual([0, 10, 50, 95, 100])
            for (const [toneStr, color] of Object.entries(result)) {
                expect(color).toBe(palette.tone(Number(toneStr)))
            }
        })

        it('strictly validates palette argument and tone options boundary errors', () => {
            const getTones = createPaletteTones()

            // Null/undefined / invalid palette
            expect(() => getTones(null as unknown as TonalPalette)).toThrow(TypeError)
            expect(() => getTones(undefined as unknown as TonalPalette)).toThrow(TypeError)
            expect(() => getTones({} as unknown as TonalPalette)).toThrow(TypeError)

            // Invalid tone options
            expect(() => createPaletteTones({ tones: [] })).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [-1] })).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [101] })).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [50.5] })).toThrow(TypeError)
            expect(() => createPaletteTones({ tones: [NaN] })).toThrow(TypeError)
        })
    })

    // -------------------------------------------------------------------------
    // 3. Interleaved Curried Generators (Spec 2021 vs 2025, OLED vs Standard)
    // -------------------------------------------------------------------------
    describe('3. Re-entrancy and Interleaved Currying', () => {
        it('isolates state across interleaved execution of generators with contrasting options', () => {
            const genA = createTheme({
                variant: MaterialVariant.Expressive,
                specVersion: '2021',
                oled: false,
            })

            const genB = createTheme({
                variant: MaterialVariant.Vibrant,
                specVersion: '2025',
                oled: true,
            })

            const seeds = ['#FF5500', '#00AAFF', '#22CC88', '#AA00FF', '#FFD700']

            for (const seed of seeds) {
                const resA = genA(seed)
                const resB = genB(seed)

                // Generator A: 2021 spec (55 tokens), non-OLED
                expect(Object.keys(resA.light).length).toBe(55)
                expect(Object.keys(resA.dark).length).toBe(55)
                expect(resA.dark['primaryDim']).toBeUndefined()
                expect(resA.dark['surface']).not.toBe(0xff000000)

                // Generator B: 2025 spec (59 tokens), OLED
                expect(Object.keys(resB.light).length).toBe(59)
                expect(Object.keys(resB.dark).length).toBe(59)
                expect(resB.dark['primaryDim']).toBeDefined()
                expect(resB.dark['surface']).toBe(0xff000000)
                expect(resB.dark['surfaceContainerLowest']).toBe(0xff000000)
            }
        })
    })

    // -------------------------------------------------------------------------
    // 4. Large Batch Throughput & Memory Stability Benchmark
    // -------------------------------------------------------------------------
    describe('4. Large Batch Throughput and Memory Stress', () => {
        it('processes 100 full theme generations with high throughput and stable memory', () => {
            const gen = createTheme({
                variant: MaterialVariant.TonalSpot,
                specVersion: '2025',
                oled: true,
            })

            const count = 100
            const seeds: string[] = []
            for (let i = 0; i < count; i++) {
                const hue = (i * 360) / count
                const hct = Hct.from(hue, 40, 50)
                seeds.push('#' + (hct.toInt() & 0xffffff).toString(16).padStart(6, '0'))
            }

            const initialMemory = process.memoryUsage?.().heapUsed ?? 0
            const startTime = performance.now()
            let lastTheme: unknown = null

            for (let i = 0; i < count; i++) {
                const theme = gen(seeds[i])
                lastTheme = theme
            }

            const durationMs = performance.now() - startTime
            const finalMemory = process.memoryUsage?.().heapUsed ?? 0
            const memoryDeltaMB = ((finalMemory - initialMemory) / (1024 * 1024)).toFixed(2)
            const opsPerSec = (count / (durationMs / 1000)).toFixed(0)

            // Log empirical metrics for review
            console.log(`[Challenger 2 Benchmark] ${count} themes generated in ${durationMs.toFixed(2)}ms (${opsPerSec} themes/sec, Heap Delta: ${memoryDeltaMB} MB)`)

            expect(durationMs).toBeLessThan(15000) // 15s upper bound for 100 full theme builds
            expect(lastTheme).toBeDefined()
        })

        it('processes 10,000 curried palette tone resolutions with high throughput', () => {
            const getTones = createPaletteTones({ tones: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] })
            const palette = TonalPalette.fromHueAndChroma(180, 32)

            const count = 10000
            const startTime = performance.now()

            for (let i = 0; i < count; i++) {
                getTones(palette)
            }

            const durationMs = performance.now() - startTime
            const opsPerSec = (count / (durationMs / 1000)).toFixed(0)

            console.log(`[Challenger 2 Benchmark] 10,000 palette tone calls in ${durationMs.toFixed(2)}ms (${opsPerSec} ops/sec)`)

            expect(durationMs).toBeLessThan(2000) // High throughput expectation
        })
    })

    // -------------------------------------------------------------------------
    // 5. Curried Pipeline Composition (Theme -> CSS)
    // -------------------------------------------------------------------------
    describe('5. Functional Curried Pipeline Composition', () => {
        it('composes createTheme and toCSS into a pure single-expression pipeline', () => {
            const buildDesignSystemCSS = (
                themeOpts: Parameters<typeof createTheme>[0],
                cssOpts: Parameters<typeof toCSS>[0]
            ) => {
                const themeGen = createTheme(themeOpts)
                const cssGen = toCSS(cssOpts)
                return (seed: string | number | Hct) => cssGen(themeGen(seed))
            }

            const mobileAmoledPipeline = buildDesignSystemCSS(
                { variant: MaterialVariant.Content, oled: true, specVersion: '2025' },
                { format: 'hex', varPrefix: 'md-sys-color' }
            )

            const webDisplayP3Pipeline = buildDesignSystemCSS(
                { variant: MaterialVariant.Vibrant, oled: false, specVersion: '2025' },
                { format: 'display-p3', varPrefix: 'brand-color' }
            )

            const amoledCSS = mobileAmoledPipeline('#6750A4')
            const p3CSS = webDisplayP3Pipeline('#6750A4')

            expect(amoledCSS).toContain('--md-sys-color-surface: light-dark(#fdf7ff, #000000);')
            expect(p3CSS).toContain('color(display-p3')
            expect(p3CSS).toContain('--brand-color-primary:')
            expect(amoledCSS).not.toContain('color(display-p3')
            expect(p3CSS).not.toContain('--md-sys-color-')
        })
    })
})
