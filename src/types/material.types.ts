import type { DynamicColor, DynamicScheme, Hct, TonalPalette, Variant } from '@material/material-color-utilities'

/**
 * Material Design specification versions supported by @material/material-color-utilities.
 * - '2021': Standard Material You (MD3) spec (55 dynamic color tokens).
 * - '2025': Updated Material Design spec (59 dynamic color tokens including primaryDim, secondaryDim, tertiaryDim, errorDim).
 */
export type SpecVersion = '2021' | '2025'

/**
 * Target device platform for DynamicScheme color evaluation.
 */
export type Platform = 'phone' | 'watch'

/**
 * Material Design palette/scheme generation variants.
 */
export const MaterialVariant = {
    Monochrome: 0 as Variant.MONOCHROME,
    Neutral   : 1 as Variant.NEUTRAL,
    TonalSpot : 2 as Variant.TONAL_SPOT,
    Vibrant   : 3 as Variant.VIBRANT,
    Expressive: 4 as Variant.EXPRESSIVE,
    Fidelity  : 5 as Variant.FIDELITY,
    Content   : 6 as Variant.CONTENT,
    Rainbow   : 7 as Variant.RAINBOW,
    FruitSalad: 8 as Variant.FRUIT_SALAD,
} as const satisfies Record<string, Variant>

export type MaterialVariant = typeof MaterialVariant[keyof typeof MaterialVariant]
export type TMaterialVariant = MaterialVariant

/**
 * Contrast level values for DynamicScheme color calculation.
 * - Reduced: -1.0
 * - Default: 0.0
 * - Medium : 0.5
 * - High   : 1.0
 */
export const MaterialContrastLevel = {
    Reduced: -1.0,
    Default: 0.0,
    Medium : 0.5,
    High   : 1.0,
} as const satisfies Record<string, number>

export type MaterialContrastLevel = typeof MaterialContrastLevel[keyof typeof MaterialContrastLevel]
export type TMaterialContrastLevel = MaterialContrastLevel

/**
 * Descriptor for a dynamic color token with getter function.
 */
export interface DynamicColorTokenDescriptor {
    id: string
    getter: (scheme: DynamicScheme) => DynamicColor | undefined
}

/**
 * Dynamic color token structure containing name representations, HCT value, and source palette.
 */
export interface MaterialDynamicColorToken {
    name          : string
    kebabCasedName: string
    snakeCaseName : string
    hct           : Hct
    palette      ?: TonalPalette
}

/**
 * Backward compatibility alias for MaterialDynamicColorToken.
 */
export type CustomizedColor = MaterialDynamicColorToken

/**
 * Evaluated token item with multiple naming representations and color formats.
 */
export interface MaterialColorItem extends MaterialDynamicColorToken {
    value?: number
    hex  ?: string
}

/**
 * Map of token kebab-case names to 32-bit ARGB integer color values.
 */
export type MaterialColorTokenMap = Record<string, number>

/**
 * Input definition for a custom color token.
 */
export interface CustomColorDefinition {
    name  : string
    value : Hct | number | string
    blend?: boolean
}

/**
 * Complete union of all standard Material Dynamic Color kebab-case token names.
 */
export type MaterialColorKebabCaseName =
    | 'primary-palette-key-color'
    | 'secondary-palette-key-color'
    | 'tertiary-palette-key-color'
    | 'neutral-palette-key-color'
    | 'neutral-variant-palette-key-color'
    | 'error-palette-key-color'
    | 'background'
    | 'on-background'
    | 'surface'
    | 'surface-dim'
    | 'surface-bright'
    | 'surface-container-lowest'
    | 'surface-container-low'
    | 'surface-container'
    | 'surface-container-high'
    | 'surface-container-highest'
    | 'on-surface'
    | 'surface-variant'
    | 'on-surface-variant'
    | 'inverse-surface'
    | 'inverse-on-surface'
    | 'outline'
    | 'outline-variant'
    | 'shadow'
    | 'scrim'
    | 'surface-tint'
    | 'primary'
    | 'primary-dim'
    | 'on-primary'
    | 'primary-container'
    | 'on-primary-container'
    | 'inverse-primary'
    | 'primary-fixed'
    | 'primary-fixed-dim'
    | 'on-primary-fixed'
    | 'on-primary-fixed-variant'
    | 'secondary'
    | 'secondary-dim'
    | 'on-secondary'
    | 'secondary-container'
    | 'on-secondary-container'
    | 'secondary-fixed'
    | 'secondary-fixed-dim'
    | 'on-secondary-fixed'
    | 'on-secondary-fixed-variant'
    | 'tertiary'
    | 'tertiary-dim'
    | 'on-tertiary'
    | 'tertiary-container'
    | 'on-tertiary-container'
    | 'tertiary-fixed'
    | 'tertiary-fixed-dim'
    | 'on-tertiary-fixed'
    | 'on-tertiary-fixed-variant'
    | 'error'
    | 'error-dim'
    | 'on-error'
    | 'error-container'
    | 'on-error-container'
