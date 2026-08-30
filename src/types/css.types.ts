import type { MaterialThemeCSSInput } from './theme.types'

/**
 * Built-in supported CSS color serialization formats.
 */
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'display-p3' | 'color-mix'

/**
 * Supported color mix interpolation color spaces.
 */
export type ColorMixSpace = 'srgb' | 'display-p3'

/**
 * Custom color formatter callback function.
 */
export type ColorFormatter = (argb: number) => string

/**
 * Options for curried toCSS(options)(themeData).
 */
export interface ToCSSOptions {
    /**
     * Color formatting strategy or custom function.
     * @default 'hex'
     */
    format?: ColorFormat | ColorFormatter

    /**
     * CSS custom property prefix for theme tokens.
     * @default 'md-sys-color'
     */
    varPrefix?: string

    /**
     * CSS custom property prefix for palette tones.
     * @default 'md-ref-palette'
     */
    paletteVarPrefix?: string

    /**
     * Interpolation color space for color-mix format.
     * @default 'srgb'
     */
    colorMixSpace?: ColorMixSpace

    /**
     * Specific tone numbers to serialize for palettes.
     */
    paletteTones?: number[]

    /**
     * Whether to emit theme color tokens.
     * @default true
     */
    includeTheme?: boolean

    /**
     * Whether to emit palette tone tokens.
     * @default true
     */
    includePalettes?: boolean

    /**
     * Whether to wrap output in a CSS selector block (e.g. `:root { ... }`).
     * @default true
     */
    includeRoot?: boolean

    /**
     * Whether to wrap theme declarations with `light-dark(lightVal, darkVal)`.
     * @default true
     */
    wrapLightDark?: boolean

    /**
     * CSS selector for the declaration block if includeRoot is true.
     * @default ':root'
     */
    selector?: string

    /**
     * Custom palette name override when serializing a single palette.
     */
    customPaletteName?: string

    /**
     * Whether this is a standalone custom palette.
     */
    isCustomPalette?: boolean
}

/**
 * Output serialized CSS string representation.
 */
export type SerializedCSS = string

export type { MaterialThemeCSSInput }
