import type { Hct, TonalPalette } from '@material/material-color-utilities'

/**
 * The 6 standard Material Tonal Palette families in camelCase.
 */
export type MaterialPaletteFamily =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'error'
    | 'neutral'
    | 'neutralVariant'

/**
 * The 6 standard Material Tonal Palette families in kebab-case.
 */
export type MaterialPaletteKebabFamily =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'error'
    | 'neutral'
    | 'neutral-variant'

export const SchemePaletteNameArray = [
    'primaryPalette',
    'secondaryPalette',
    'tertiaryPalette',
    'errorPalette',
    'neutralPalette',
    'neutralVariantPalette',
] as const

export type SchemePaletteName = (typeof SchemePaletteNameArray)[number]

/**
 * Standard 16 Material Design 3 reference tones.
 */
export const StandardPaletteTones: readonly number[] = [
    0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100,
] as const

export const STANDARD_PALETTE_TONES = StandardPaletteTones

/**
 * Full 101 reference tones (0 to 100).
 */
export const DefaultPaletteTones: readonly number[] = Array.from({ length: 101 }, (_, tone) => tone)
export const DEFAULT_PALETTE_TONES = DefaultPaletteTones

/**
 * Discrete tone-to-color entry.
 */
export interface PaletteToneEntry {
    tone : number
    color: number
}

/**
 * Options for curried createPaletteTones(options)(palette).
 */
export interface CreatePaletteTonesOptions {
    /**
     * Array of tones (0 to 100) to generate.
     * Defaults to the standard 16 Material reference tones.
     */
    tones?: number[]
}

/**
 * Mapping of tone numbers (e.g. 0, 10, 40, 90, 100) to ARGB integer color values (0xAARRGGBB).
 */
export type MaterialPaletteTonesData = Record<number, number>

/**
 * Metadata and accessor functions for an evaluated tonal palette.
 */
export interface CustomizedTonalPalette {
    name          : string
    kebabCasedName: string
    snakeCaseName : string
    hue           : number
    chroma        : number
    keyColor      : Hct
    tone(tone: number): number
    getHct(tone: number): Hct
    tones?: PaletteToneEntry[] | Record<number, number>
}

/**
 * Map of the 6 standard tonal palettes in a generated theme.
 */
export type MaterialThemePalettes = Record<SchemePaletteName, TonalPalette>

/**
 * Map of raw TonalPalette instances keyed by family.
 */
export type MaterialPalettesMap = Record<MaterialPaletteFamily, TonalPalette>
