import type { DynamicScheme, Hct, TonalPalette } from '@material/material-color-utilities'
import type {
    CustomColorDefinition,
    MaterialColorTokenMap,
    MaterialContrastLevel,
    MaterialDynamicColorToken,
    MaterialVariant,
    Platform,
    SpecVersion,
} from './material.types'
import type { CustomizedTonalPalette, MaterialThemePalettes, SchemePaletteName } from './palette.types'

export type { CustomColorDefinition }

/**
 * Options for curried createTheme(options)(sourceColor).
 */
export interface CreateThemeOptions {
    /**
     * Material Design scheme variant (style).
     * @default MaterialVariant.TonalSpot
     */
    variant?: MaterialVariant

    /**
     * Contrast level from -1.0 (reduced) to 1.0 (high).
     * @default MaterialContrastLevel.Default (0.0)
     */
    contrastLevel?: MaterialContrastLevel | number

    /**
     * Material Design specification version.
     * @default '2025'
     */
    specVersion?: SpecVersion

    /**
     * Enable OLED pitch-black dark mode optimization.
     * When true, dark theme `background`, `surface`, and `surface-container-lowest`
     * are set to tone 0 (#000000 / 0xff000000).
     * @default false
     */
    oled?: boolean

    /**
     * Custom override tonal palettes for DynamicScheme creation.
     */
    customPalettes?: Partial<Record<SchemePaletteName, TonalPalette>>

    /**
     * Custom color definitions to be generated alongside standard theme tokens.
     */
    customColors?: CustomColorDefinition[]

    /**
     * Custom tone numbers to evaluate for theme palettes.
     */
    tones?: number[]

    /**
     * Target device platform ('phone' | 'watch').
     * @default 'phone'
     */
    platform?: Platform
}

/**
 * Alias for CreateThemeOptions.
 */
export type MaterialThemeOptions = CreateThemeOptions

/**
 * Group of generated light and dark tokens for a custom color.
 */
export interface MaterialCustomColorGroup {
    name    : string
    color   : CustomColorDefinition
    value   : number
    palette : TonalPalette
    light   : {
        color           : number
        onColor         : number
        colorContainer  : number
        onColorContainer: number
    }
    dark    : {
        color           : number
        onColor         : number
        colorContainer  : number
        onColorContainer: number
    }
}

/**
 * Clean theme data object returned by createTheme(...).
 */
export interface MaterialThemeData {
    /**
     * Evaluated light mode token map (camelCase token names to ARGB integers).
     */
    light: Record<string, number>

    /**
     * Evaluated dark mode token map (camelCase token names to ARGB integers).
     */
    dark: Record<string, number>

    /**
     * Core scheme tonal palettes (primary, secondary, tertiary, error, neutral, neutralVariant).
     */
    palettes: Record<SchemePaletteName, TonalPalette>

    /**
     * Evaluated custom color groups.
     */
    customColors?: MaterialCustomColorGroup[]
}

/**
 * Permissive input structure accepted by toCSS(options)(data).
 */
export interface MaterialThemeCSSInput {
    light       ?: Record<string, unknown>
    dark        ?: Record<string, unknown>
    lightObject ?: MaterialColorTokenMap | Record<string, unknown>
    darkObject  ?: MaterialColorTokenMap | Record<string, unknown>
    palettes    ?: Partial<Record<SchemePaletteName | string, Pick<TonalPalette, 'tone'> | CustomizedTonalPalette>>
    customColors?: MaterialCustomColorGroup[]
}
