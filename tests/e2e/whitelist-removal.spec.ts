import { describe, it, expect, vi } from 'vitest'
import {
    createTheme,
    toCSS,
} from '../../src/index'

describe('Whitelist & Blacklist Removal Suite (Feature 7)', () => {
    const seed = '#6750A4'

    describe('Tier 1: Feature Coverage — Elimination of Whitelist/Blacklist Overhead', () => {
        it('T1.1: createTheme should produce full, unpolluted 59-token dictionaries without internal filtering', () => {
            const theme = createTheme()(seed)

            expect(Object.keys(theme.light)).toHaveLength(59)
            expect(Object.keys(theme.dark)).toHaveLength(59)
        })

        it('T1.2: createTheme should execute with zero console.warn or console.error side effects', () => {
            const warnSpy = vi.spyOn(console, 'warn')
            const errorSpy = vi.spyOn(console, 'error')

            createTheme()(seed)

            expect(warnSpy).not.toHaveBeenCalled()
            expect(errorSpy).not.toHaveBeenCalled()

            warnSpy.mockRestore()
            errorSpy.mockRestore()
        })

        it('T1.3: toCSS should execute with zero console.warn or console.error side effects', () => {
            const warnSpy = vi.spyOn(console, 'warn')
            const errorSpy = vi.spyOn(console, 'error')
            const theme = createTheme()(seed)

            toCSS()(theme)

            expect(warnSpy).not.toHaveBeenCalled()
            expect(errorSpy).not.toHaveBeenCalled()

            warnSpy.mockRestore()
            errorSpy.mockRestore()
        })

        it('T1.4: toCSS should serialize all tokens present in theme data without dropping unknown or unlisted tokens', () => {
            const customTheme = {
                light: {
                    'brandAccent': 0xff123456,
                    'customSurface': 0xfffafafa,
                    'heroGlow': 0xff00ffcc,
                },
                dark: {
                    'brandAccent': 0xff654321,
                    'customSurface': 0xff1a1a1a,
                    'heroGlow': 0xff008866,
                },
            }

            const css = toCSS()(customTheme)

            expect(css).toContain('--md-sys-color-brand-accent:')
            expect(css).toContain('--md-sys-color-custom-surface:')
            expect(css).toContain('--md-sys-color-hero-glow:')
        })

        it('T1.5: User-space composition: consumers can easily filter tokens with standard Object.entries()', () => {
            const theme = createTheme()(seed)
            const allowedTokens = new Set(['primary', 'onPrimary', 'surface', 'onSurface'])

            const filteredLight = Object.fromEntries(
                Object.entries(theme.light).filter(([key]) => allowedTokens.has(key))
            )
            const filteredDark = Object.fromEntries(
                Object.entries(theme.dark).filter(([key]) => allowedTokens.has(key))
            )

            expect(Object.keys(filteredLight)).toHaveLength(4)
            expect(Object.keys(filteredDark)).toHaveLength(4)

            const css = toCSS()({
                light: filteredLight,
                dark: filteredDark,
            })

            expect(css).toContain('--md-sys-color-primary:')
            expect(css).toContain('--md-sys-color-on-primary:')
            expect(css).toContain('--md-sys-color-surface:')
            expect(css).toContain('--md-sys-color-on-surface:')
            expect(css).not.toContain('--md-sys-color-background:')
            expect(css).not.toContain('--md-sys-color-secondary:')
        })
    })

    describe('Tier 2: Boundary & Corner Cases', () => {
        it('T2.1: Filtering down to a single token in user-space and serializing to CSS', () => {
            const theme = createTheme()(seed)
            const singleTokenTheme = {
                light: { primary: theme.light['primary'] },
                dark: { primary: theme.dark['primary'] },
            }

            const css = toCSS()(singleTokenTheme)
            const lines = css.trim().split('\n')

            expect(lines).toHaveLength(3) // :root {\n --primary ...\n }
            expect(css).toContain('--md-sys-color-primary:')
        })

        it('T2.2: Filtering surface-only tokens by prefix pattern in user-space', () => {
            const theme = createTheme()(seed)
            const isSurfaceToken = (key: string) => key.startsWith('surface') || key.startsWith('onSurface')

            const surfaceLight = Object.fromEntries(
                Object.entries(theme.light).filter(([k]) => isSurfaceToken(k))
            )
            const surfaceDark = Object.fromEntries(
                Object.entries(theme.dark).filter(([k]) => isSurfaceToken(k))
            )

            const css = toCSS({ varPrefix: 'surface' })({
                light: surfaceLight,
                dark: surfaceDark,
            })

            expect(css).toContain('--surface-surface:')
            expect(css).toContain('--surface-surface-container:')
            expect(css).not.toContain('--surface-primary:')
            expect(css).not.toContain('--surface-secondary:')
        })
    })

    describe('Tier 3: Cross-Feature Combinations', () => {
        it('T3.1: User-space filtered tokens + OLED Dark Mode + Display P3 format', () => {
            const oledTheme = createTheme({ oled: true })(seed)
            const essentialTokens = ['surface', 'onSurface', 'background', 'onBackground', 'primary']

            const filteredTheme = {
                light: Object.fromEntries(
                    Object.entries(oledTheme.light).filter(([k]) => essentialTokens.includes(k))
                ),
                dark: Object.fromEntries(
                    Object.entries(oledTheme.dark).filter(([k]) => essentialTokens.includes(k))
                ),
            }

            const css = toCSS({
                format: 'display-p3',
                varPrefix: 'oled-app',
            })(filteredTheme)

            expect(css).toContain('--oled-app-surface: light-dark(color(display-p3')
            expect(css).toContain('--oled-app-background: light-dark(color(display-p3')
            expect(css).toContain('--oled-app-primary: light-dark(color(display-p3')
        })
    })

    describe('Tier 4: Real-World Scenarios', () => {
        it('T4.1: Micro-Bundle Optimization Scenario for Embedded / Lightweight Web Widgets', () => {
            // Scenario: An embedded widget requires a lightweight CSS payload with only 6 core tokens
            const fullTheme = createTheme()(seed)
            const widgetTokens = ['primary', 'onPrimary', 'surface', 'onSurface', 'outline', 'error']

            const widgetTheme = {
                light: Object.fromEntries(
                    Object.entries(fullTheme.light).filter(([k]) => widgetTokens.includes(k))
                ),
                dark: Object.fromEntries(
                    Object.entries(fullTheme.dark).filter(([k]) => widgetTokens.includes(k))
                ),
            }

            const fullCss = toCSS()(fullTheme)
            const widgetCss = toCSS({ varPrefix: 'widget' })(widgetTheme)

            expect(widgetCss.length).toBeLessThan(fullCss.length / 5) // >80% reduction in CSS size
            expect(widgetCss).toContain('--widget-primary:')
            expect(widgetCss).toContain('--widget-surface:')
            expect(widgetCss).not.toContain('--widget-tertiary-fixed-dim:')
        })
    })
})
