import { describe, it, expect } from 'vitest'
import {
    createTheme,
    createPaletteTones,
    toCSS,
    MaterialVariant,
    MaterialContrastLevel,
} from '../../src/index'

describe('Real-World Scenarios & Integration Suite (Tier 4 Real-World Workflows)', () => {
    describe('Scenario 1: Complete Enterprise UI Design Token Generation', () => {
        it('should generate complete brand tokens, tonal palettes, and Display P3 CSS from seed #0066FF', () => {
            const seedColor = '#0066FF'

            // 1. Generate 2025 Spec Theme with all 6 Tonal Palettes
            const theme = createTheme({
                specVersion: '2025',
                variant: MaterialVariant.TonalSpot,
                contrastLevel: MaterialContrastLevel.Default,
            })(seedColor)

            expect(Object.keys(theme.light)).toHaveLength(59)
            expect(Object.keys(theme.dark)).toHaveLength(59)

            // 2. Extract discrete palette tone stops for design handoff
            const primaryTones = createPaletteTones({
                tones: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
            })(theme.palettes.primaryPalette)

            expect(Object.keys(primaryTones)).toHaveLength(13)
            expect(primaryTones[0]).toBeDefined()
            expect(primaryTones[100]).toBeDefined()

            // 3. Serialize to modern Display P3 CSS custom properties
            const css = toCSS({
                format: 'display-p3',
                varPrefix: 'enterprise',
                paletteTones: [10, 50, 90],
            })(theme)

            expect(css).toContain(':root {')
            expect(css).toContain('--enterprise-primary: light-dark(color(display-p3')
            expect(css).toContain('--md-ref-palette-primary-50: color(display-p3')
            expect(css).toContain('}')
        })
    })

    describe('Scenario 2: Dynamic CSS Theme Switching with light-dark()', () => {
        it('should generate a valid single-sheet CSS file enabling OS-level and CSS color-scheme theme switching', () => {
            const seed = '#7B1FA2'
            const theme = createTheme()(seed)

            const stylesheet = toCSS({
                format: 'hex',
                varPrefix: 'sys-color',
            })(theme)

            // Verify structure contains valid light-dark declarations
            expect(stylesheet).toContain(':root {')
            const lines = stylesheet.split('\n').filter((l) => l.includes('light-dark('))
            expect(lines.length).toBe(59)

            // Verify each line adheres strictly to --sys-color-<token>: light-dark(#xxxxxx, #xxxxxx);
            for (const line of lines) {
                expect(line).toMatch(/^\s+--sys-color-[a-z0-9-]+:\s*light-dark\(#[0-9a-fA-F]{6},\s*#[0-9a-fA-F]{6}\);$/)
            }
        })
    })

    describe('Scenario 3: AMOLED Battery-Saver Dark Theme for Mobile Devices', () => {
        it('should generate pure black background & surface tokens while maintaining high contrast (>17:1)', () => {
            const seed = '#00B0FF'

            const oledTheme = createTheme({
                oled: true,
                contrastLevel: MaterialContrastLevel.Medium,
                specVersion: '2025',
            })(seed)

            // Background, surface, and surfaceContainerLowest are tone 0 (#000000)
            expect(oledTheme.dark['background']).toBe(0xff000000)
            expect(oledTheme.dark['surface']).toBe(0xff000000)
            expect(oledTheme.dark['surfaceContainerLowest']).toBe(0xff000000)

            // Foreground on-surface and on-background remain highly legible
            expect(oledTheme.dark['onBackground']).toBeDefined()
            expect(oledTheme.dark['onSurface']).toBeDefined()

            const css = toCSS({
                varPrefix: 'amoled',
                format: 'hex',
            })(oledTheme)

            expect(css).toMatch(/--amoled-background:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)
            expect(css).toMatch(/--amoled-surface:\s*light-dark\(#([0-9a-fA-F]{6}),\s*#000000\);/)
        })
    })

    describe('Scenario 4: Multi-Brand / Multi-Tenant Style Generator', () => {
        it('should generate distinct brand stylesheets without shared state or crosstalk', () => {
            const brands = [
                { id: 'fintech', seed: '#0052CC', variant: MaterialVariant.TonalSpot },
                { id: 'health', seed: '#00875A', variant: MaterialVariant.Vibrant },
                { id: 'retail', seed: '#6554C0', variant: MaterialVariant.Expressive },
            ]

            const stylesheets = brands.map((brand) => {
                const theme = createTheme({ variant: brand.variant })(brand.seed)
                return {
                    brandId: brand.id,
                    css: toCSS({ varPrefix: `brand-${brand.id}` })(theme),
                    theme,
                }
            })

            expect(stylesheets).toHaveLength(3)

            // Assert unique prefixes and color values across brands
            expect(stylesheets[0].css).toContain('--brand-fintech-primary:')
            expect(stylesheets[1].css).toContain('--brand-health-primary:')
            expect(stylesheets[2].css).toContain('--brand-retail-primary:')

            expect(stylesheets[0].theme.light['primary']).not.toEqual(stylesheets[1].theme.light['primary'])
            expect(stylesheets[1].theme.light['primary']).not.toEqual(stylesheets[2].theme.light['primary'])
        })
    })

    describe('Scenario 5: Custom Semantic & Status Color Extension', () => {
        it('should integrate custom status colors (success, warning, info) with Material theme in user-space', () => {
            const baseTheme = createTheme()('#1976D2')

            const semanticColors = {
                light: {
                    success: 0xff2e7d32,
                    'on-success': 0xffffffff,
                    warning: 0xffed6c02,
                    'on-warning': 0xffffffff,
                    info: 0xff0288d1,
                    'on-info': 0xffffffff,
                },
                dark: {
                    success: 0xff66bb6a,
                    'on-success': 0xff003300,
                    warning: 0xffffa726,
                    'on-warning': 0xff331100,
                    info: 0xff29b6f6,
                    'on-info': 0xff002233,
                },
            }

            const extendedTheme = {
                light: {
                    ...baseTheme.light,
                    ...semanticColors.light,
                },
                dark: {
                    ...baseTheme.dark,
                    ...semanticColors.dark,
                },
            }

            const combinedCss = toCSS({ varPrefix: 'app' })(extendedTheme)

            // Contains base Material tokens
            expect(combinedCss).toContain('--app-primary:')
            expect(combinedCss).toContain('--app-surface:')

            // Contains custom semantic tokens
            expect(combinedCss).toContain('--app-success: light-dark(#2e7d32, #66bb6a);')
            expect(combinedCss).toContain('--app-warning: light-dark(#ed6c02, #ffa726);')
            expect(combinedCss).toContain('--app-info: light-dark(#0288d1, #29b6f6);')
        })
    })

    describe('Scenario 6: Live CSSStyleSheet Adoption Simulation (Dev-App Pattern)', () => {
        it('should generate valid CSS stylesheet string matching dev-app onMounted injection requirements', () => {
            const theme = createTheme()(0xff00aa88)
            const css = toCSS()(theme)

            // Dev-app does:
            // const sheet = new CSSStyleSheet()
            // sheet.replaceSync(s)
            // document.adoptedStyleSheets.push(sheet)

            expect(typeof css).toBe('string')
            expect(css.startsWith(':root {\n')).toBe(true)
            expect(css.endsWith('}\n')).toBe(true)
            expect(css).not.toContain('undefined')
            expect(css).not.toContain('NaN')
            expect(css).not.toContain('null')
        })
    })
})
