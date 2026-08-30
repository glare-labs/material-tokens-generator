import { describe, expect, it } from 'vitest'
import type { ColorFormat, ColorMixSpace, ToCSSOptions } from './css.types'

describe('types/css.types', () => {
    it('verifies type compatibility for CSS configuration options', () => {
        const options: ToCSSOptions = {
            format: 'display-p3',
            colorMixSpace: 'srgb',
            varPrefix: 'app',
            paletteVarPrefix: 'app-pal',
            includeTheme: true,
            includePalettes: true,
            includeRoot: true,
            wrapLightDark: true,
            selector: ':root',
        }

        expect(options.format).toBe('display-p3')
        expect(options.colorMixSpace).toBe('srgb')
        expect(options.wrapLightDark).toBe(true)
    })

    it('supports custom color formatter callback typing', () => {
        const customOptions: ToCSSOptions = {
            format: (argb: number) => `#${argb.toString(16)}`,
        }

        expect(typeof customOptions.format).toBe('function')
    })
})
