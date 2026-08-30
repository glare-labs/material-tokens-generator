import { describe, it, expect } from 'vitest'
import {
    createTheme,
    toCSS,
    MaterialVariant,
    MaterialContrastLevel,
} from '../../src/index'

function getLuminance(argb: number): number {
    const r = ((argb >> 16) & 0xff) / 255
    const g = ((argb >> 8) & 0xff) / 255
    const b = (argb & 0xff) / 255

    const rLin = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const gLin = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const bLin = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

function getContrastRatio(foregroundArgb: number, backgroundArgb: number): number {
    const l1 = getLuminance(foregroundArgb)
    const l2 = getLuminance(backgroundArgb)
    const brighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (brighter + 0.05) / (darker + 0.05)
}

describe('OLED Pitch-Black Dark Mode Suite (Feature 5)', () => {
    const seed = '#6750A4'
    const PITCH_BLACK_ARGB = 0xff000000 // Tone 0

    describe('Tier 1: Feature Coverage — OLED Dark Mode Optimization', () => {
        it('T1.1: oled: true should set dark background to pure black #000000 (tone 0)', () => {
            const theme = createTheme({ oled: true })(seed)
            expect(theme.dark['background']).toBe(PITCH_BLACK_ARGB)
        })

        it('T1.2: oled: true should set dark surface to pure black #000000 (tone 0)', () => {
            const theme = createTheme({ oled: true })(seed)
            expect(theme.dark['surface']).toBe(PITCH_BLACK_ARGB)
        })

        it('T1.3: oled: true should set dark surface-container-lowest to pure black #000000 (tone 0)', () => {
            const theme = createTheme({ oled: true })(seed)
            expect(theme.dark['surfaceContainerLowest']).toBe(PITCH_BLACK_ARGB)
        })

        it('T1.4: oled: false (default) should retain standard non-zero dark surface tones', () => {
            const theme = createTheme({ oled: false })(seed)
            expect(theme.dark['background']).not.toBe(PITCH_BLACK_ARGB)
            expect(theme.dark['surface']).not.toBe(PITCH_BLACK_ARGB)
        })

        it('T1.5: oled: true should NOT affect any light mode tokens', () => {
            const defaultTheme = createTheme({ oled: false })(seed)
            const oledTheme = createTheme({ oled: true })(seed)

            expect(oledTheme.light).toEqual(defaultTheme.light)
            expect(oledTheme.light['background']).not.toBe(PITCH_BLACK_ARGB)
            expect(oledTheme.light['surface']).not.toBe(PITCH_BLACK_ARGB)
        })

        it('T1.6: dark mode on-background should maintain high contrast ratio (>= 15:1) against tone 0 background', () => {
            const theme = createTheme({ oled: true })(seed)
            const bg = theme.dark['background']
            const onBg = theme.dark['onBackground']

            const ratio = getContrastRatio(onBg, bg)
            expect(ratio).toBeGreaterThanOrEqual(15.0) // WCAG AAA requires >= 7.0:1
        })

        it('T1.7: dark mode on-surface should maintain high contrast ratio (>= 15:1) against tone 0 surface', () => {
            const theme = createTheme({ oled: true })(seed)
            const surface = theme.dark['surface']
            const onSurface = theme.dark['onSurface']

            const ratio = getContrastRatio(onSurface, surface)
            expect(ratio).toBeGreaterThanOrEqual(15.0)
        })

        it('T1.8: surface container elevation steps should maintain increasing luminance hierarchy above tone 0', () => {
            const theme = createTheme({ oled: true })(seed)

            const lowest = getLuminance(theme.dark['surfaceContainerLowest'])
            const low = getLuminance(theme.dark['surfaceContainerLow'])
            const standard = getLuminance(theme.dark['surfaceContainer'])
            const high = getLuminance(theme.dark['surfaceContainerHigh'])
            const highest = getLuminance(theme.dark['surfaceContainerHighest'])

            expect(lowest).toBe(0) // pure pitch black
            expect(low).toBeGreaterThanOrEqual(lowest)
            expect(standard).toBeGreaterThanOrEqual(low)
            expect(high).toBeGreaterThanOrEqual(standard)
            expect(highest).toBeGreaterThanOrEqual(high)
        })
    })

    describe('Tier 2: Boundary & Corner Cases', () => {
        it('T2.1: OLED mode should work reliably with pure black seed (#000000)', () => {
            const theme = createTheme({ oled: true })('#000000')

            expect(theme.dark['background']).toBe(PITCH_BLACK_ARGB)
            expect(theme.dark['surface']).toBe(PITCH_BLACK_ARGB)
            expect(theme.dark['surfaceContainerLowest']).toBe(PITCH_BLACK_ARGB)
            expect(theme.light['background']).not.toBe(PITCH_BLACK_ARGB)
        })

        it('T2.2: OLED mode should work reliably with pure white seed (#FFFFFF)', () => {
            const theme = createTheme({ oled: true })('#FFFFFF')

            expect(theme.dark['background']).toBe(PITCH_BLACK_ARGB)
            expect(theme.dark['surface']).toBe(PITCH_BLACK_ARGB)
            expect(theme.dark['onSurface']).toBeDefined()
            expect(getContrastRatio(theme.dark['onSurface'], PITCH_BLACK_ARGB)).toBeGreaterThanOrEqual(15.0)
        })

        it('T2.3: OLED mode should work across all Material variants without errors', () => {
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

            for (const variant of variants) {
                const theme = createTheme({ oled: true, variant })(seed)
                expect(theme.dark['background']).toBe(PITCH_BLACK_ARGB)
                expect(theme.dark['surface']).toBe(PITCH_BLACK_ARGB)
            }
        })

        it('T2.4: OLED mode with High Contrast (1.0) achieves maximal contrast on foreground tokens', () => {
            const theme = createTheme({
                oled: true,
                contrastLevel: MaterialContrastLevel.High,
            })(seed)

            expect(theme.dark['background']).toBe(PITCH_BLACK_ARGB)
            const onBgContrast = getContrastRatio(theme.dark['onBackground'], theme.dark['background'])
            expect(onBgContrast).toBeGreaterThanOrEqual(18.0)
        })
    })

    describe('Tier 3: Cross-Feature Combinations', () => {
        it('T3.1: OLED + 2025 Spec + light-dark() CSS serialization', () => {
            const theme = createTheme({
                specVersion: '2025',
                oled: true,
            })(seed)

            const css = toCSS()(theme)

            // Dark slot in light-dark() for surface and background must be #000000
            expect(css).toMatch(/--md-sys-color-background:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)
            expect(css).toMatch(/--md-sys-color-surface:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)
            expect(css).toMatch(/--md-sys-color-surface-container-lowest:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)
        })

        it('T3.2: OLED + Display P3 CSS serialization', () => {
            const theme = createTheme({ oled: true })(seed)
            const css = toCSS({ format: 'display-p3' })(theme)

            expect(css).toContain('color(display-p3')
            expect(css).toContain('--md-sys-color-background: light-dark(')
        })

        it('T3.3: OLED + Custom prefix and tone selection', () => {
            const theme = createTheme({ oled: true })(seed)
            const css = toCSS({
                varPrefix: 'amoled-ui',
                paletteTones: [0, 100],
            })(theme)

            expect(css).toContain('--amoled-ui-background:')
            expect(css).toContain('--md-ref-palette-primary-0:')
            expect(css).toContain('--md-ref-palette-primary-100:')
        })
    })

    describe('Tier 4: Real-World Scenarios', () => {
        it('T4.1: Battery-Saver AMOLED Mobile Profile Generation', () => {
            // Scenario: A mobile application dynamically activates OLED dark mode when battery saver is engaged
            const normalDarkTheme = createTheme({ oled: false })(seed)
            const batterySaverTheme = createTheme({ oled: true })(seed)

            const normalCss = toCSS({ varPrefix: 'app' })(normalDarkTheme)
            const oledCss = toCSS({ varPrefix: 'app' })(batterySaverTheme)

            // Standard theme does not have #000000 dark surface
            expect(normalCss).not.toMatch(/--app-surface:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)

            // Battery-saver OLED theme strictly uses pitch black #000000
            expect(oledCss).toMatch(/--app-surface:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)
            expect(oledCss).toMatch(/--app-background:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)
        })
    })
})
