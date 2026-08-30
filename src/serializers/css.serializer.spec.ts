import { describe, expect, it } from 'vitest'
import { createTheme } from '../core/theme'
import { toCSS } from './css.serializer'

describe('serializers/css.serializer', () => {
    const theme = createTheme()('#6750A4')

    describe('Curried toCSS Invocation', () => {
        it('serializes theme into valid CSS root block', () => {
            const serialize = toCSS()
            const css = serialize(theme)

            expect(css.startsWith(':root {\n')).toBe(true)
            expect(css.endsWith('}\n')).toBe(true)
            expect(css).toContain('--md-sys-color-primary:')
            expect(css).toContain('light-dark(')
        })

        it('supports custom selector and disabling root block', () => {
            const customSelector = toCSS({ selector: '.my-theme' })(theme)
            expect(customSelector.startsWith('.my-theme {\n')).toBe(true)

            const noRoot = toCSS({ includeRoot: false })(theme)
            expect(noRoot.startsWith(':root')).toBe(false)
            expect(noRoot).toContain('--md-sys-color-primary:')
        })
    })

    describe('Color Formats', () => {
        it('serializes using Display P3 format', () => {
            const css = toCSS({ format: 'display-p3' })(theme)
            expect(css).toContain('color(display-p3 ')
        })

        it('serializes using RGB format', () => {
            const css = toCSS({ format: 'rgb' })(theme)
            expect(css).toContain('rgb(')
        })

        it('serializes using color-mix format', () => {
            const css = toCSS({ format: 'color-mix', colorMixSpace: 'display-p3' })(theme)
            expect(css).toContain('color-mix(in display-p3, ')
        })

        it('serializes using custom formatter function', () => {
            const css = toCSS({ format: (argb) => `custom(#${argb.toString(16)})` })(theme)
            expect(css).toContain('custom(#')
        })
    })

    describe('Options & Prefixes', () => {
        it('supports custom varPrefix and paletteVarPrefix', () => {
            const css = toCSS({
                varPrefix: 'app-color',
                paletteVarPrefix: 'app-pal',
            })(theme)

            expect(css).toContain('--app-color-primary:')
            expect(css).toContain('--app-pal-primary-40:')
        })

        it('can disable wrapLightDark', () => {
            const css = toCSS({ wrapLightDark: false })(theme)
            expect(css).not.toContain('light-dark(')
            expect(css).toContain('--md-sys-color-primary: #')
        })

        it('can selectively include/exclude theme and palettes', () => {
            const onlyTheme = toCSS({ includeTheme: true, includePalettes: false })(theme)
            expect(onlyTheme).toContain('--md-sys-color-')
            expect(onlyTheme).not.toContain('--md-ref-palette-')

            const onlyPalettes = toCSS({ includeTheme: false, includePalettes: true })(theme)
            expect(onlyPalettes).not.toContain('--md-sys-color-')
            expect(onlyPalettes).toContain('--md-ref-palette-')
        })

        it('supports isCustomPalette mode', () => {
            const css = toCSS({
                isCustomPalette: true,
                paletteVarPrefix: 'brand',
                includeTheme: false,
            })(theme)

            expect(css).toContain('--brand-40:')
        })
    })

    describe('Error Handling', () => {
        it('throws TypeError when themeData is invalid', () => {
            const serialize = toCSS()
            // @ts-expect-error invalid input
            expect(() => serialize(null)).toThrow(TypeError)
            // @ts-expect-error invalid input
            expect(() => serialize('invalid')).toThrow(TypeError)
        })

        it('throws TypeError on key mismatch between lightObject and darkObject', () => {
            const serialize = toCSS()
            expect(() =>
                serialize({
                    lightObject: { primary: 0xff6750a4 },
                    darkObject: { secondary: 0xff6750a4 },
                })
            ).toThrow(/same normalized keys/i)
        })

        it('throws TypeError when color values are non-numeric', () => {
            const serialize = toCSS()
            expect(() =>
                serialize({
                    // @ts-expect-error invalid value
                    lightObject: { primary: 'not-a-number' },
                    darkObject: { primary: 0xff6750a4 },
                })
            ).toThrow(/numeric ARGB/i)
        })
    })

    describe('Empty theme handling', () => {
        it('handles empty theme without crashing', () => {
            const serialize = toCSS()
            const css = serialize({ lightObject: {}, darkObject: {} })
            expect(css.trim()).toBe(':root {\n}')
        })
    })
})
