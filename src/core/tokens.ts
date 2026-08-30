import { type DynamicColor, DynamicScheme, Hct, MaterialDynamicColors, TonalPalette } from '@material/material-color-utilities'
import { MaterialContrastLevel, MaterialVariant, type DynamicColorTokenDescriptor, type MaterialDynamicColorToken } from '../types/material.types'
import type { CreateThemeOptions } from '../types/theme.types'
import { parseSourceColor } from '../utils/color'
import { toCamelCase, toKebabCase, toSnakeCase } from '../utils/string'

export type TokenKeyFormat = 'camelCase' | 'kebabCase' | 'snakeCase'

/**
 * Converts an array of MaterialDynamicColorToken objects to a key-value record of ARGB color integers.
 *
 * @param tokens - Array of dynamic color tokens
 * @param keyFormat - Naming format for keys: 'camelCase' (default), 'kebabCase', or 'snakeCase'
 * @returns Record mapping token names to 32-bit ARGB integer color values
 */
export function tokensToMap(
    tokens: readonly MaterialDynamicColorToken[] | MaterialDynamicColorToken[],
    keyFormat: TokenKeyFormat = 'camelCase'
): Record<string, number> {
    const map: Record<string, number> = {}
    for (const token of tokens) {
        let key: string
        if (keyFormat === 'kebabCase') {
            key = token.kebabCasedName
        } else if (keyFormat === 'snakeCase') {
            key = token.snakeCaseName
        } else {
            key = toCamelCase(token.name)
        }
        map[key] = token.hct.toInt()
    }
    return map
}

/**
 * Result structure containing rich token items for both light and dark themes.
 */
export interface MaterialRichThemeTokens {
    light: MaterialDynamicColorToken[]
    dark : MaterialDynamicColorToken[]
}

/**
 * Resolves rich MaterialDynamicColorToken arrays for light and dark schemes.
 * Useful when rich token metadata (HCT values, multiple naming formats, source palettes) is needed.
 *
 * @param options - Theme creation options
 * @returns A function accepting a sourceColor and returning { light, dark } rich token arrays
 */
export function resolveThemeTokens(options: CreateThemeOptions = {}) {
    const {
        variant: requestedVariant,
        contrastLevel = MaterialContrastLevel.Default,
        specVersion = '2025',
        oled = false,
        customPalettes = {},
        platform = 'phone',
    } = options

    return (sourceColor: Hct | number | string): MaterialRichThemeTokens => {
        const sourceColorHct = parseSourceColor(sourceColor)
        const contrast = typeof contrastLevel === 'number' ? contrastLevel : Number(contrastLevel)
        const isGrayscale = sourceColorHct.chroma < 5.0 || isNaN(sourceColorHct.chroma)
        const variant =
            requestedVariant !== undefined
                ? requestedVariant
                : isGrayscale
                ? MaterialVariant.Monochrome
                : MaterialVariant.TonalSpot

        const defaultPrimaryPalette = isGrayscale
            ? TonalPalette.fromHueAndChroma(sourceColorHct.hue, 0)
            : undefined

        const lightScheme = new DynamicScheme({
            sourceColorHct,
            variant,
            contrastLevel: contrast,
            isDark: false,
            specVersion,
            platform,
            ...(customPalettes.primaryPalette ? { primaryPalette: customPalettes.primaryPalette } : defaultPrimaryPalette ? { primaryPalette: defaultPrimaryPalette } : {}),
            ...(customPalettes.secondaryPalette ? { secondaryPalette: customPalettes.secondaryPalette } : {}),
            ...(customPalettes.tertiaryPalette ? { tertiaryPalette: customPalettes.tertiaryPalette } : {}),
            ...(customPalettes.errorPalette ? { errorPalette: customPalettes.errorPalette } : {}),
            ...(customPalettes.neutralPalette ? { neutralPalette: customPalettes.neutralPalette } : {}),
            ...(customPalettes.neutralVariantPalette ? { neutralVariantPalette: customPalettes.neutralVariantPalette } : {}),
        })

        const darkScheme = new DynamicScheme({
            sourceColorHct,
            variant,
            contrastLevel: contrast,
            isDark: true,
            specVersion,
            platform,
            ...(customPalettes.primaryPalette ? { primaryPalette: customPalettes.primaryPalette } : defaultPrimaryPalette ? { primaryPalette: defaultPrimaryPalette } : {}),
            ...(customPalettes.secondaryPalette ? { secondaryPalette: customPalettes.secondaryPalette } : {}),
            ...(customPalettes.tertiaryPalette ? { tertiaryPalette: customPalettes.tertiaryPalette } : {}),
            ...(customPalettes.errorPalette ? { errorPalette: customPalettes.errorPalette } : {}),
            ...(customPalettes.neutralPalette ? { neutralPalette: customPalettes.neutralPalette } : {}),
            ...(customPalettes.neutralVariantPalette ? { neutralVariantPalette: customPalettes.neutralVariantPalette } : {}),
        })

        return {
            light: resolveSchemeTokens(lightScheme, false, false),
            dark : resolveSchemeTokens(darkScheme, true, oled),
        }
    }
}

/**
 * Catalog of all 59 Material Dynamic Color token getters.
 * Accesses dynamic scheme.colors instance methods without deprecated static properties.
 */
export const DYNAMIC_COLOR_DESCRIPTORS: readonly DynamicColorTokenDescriptor[] = [
    // 6 Palette Key Colors
    { id: 'primaryPaletteKeyColor', getter: (s) => s.colors.primaryPaletteKeyColor() },
    { id: 'secondaryPaletteKeyColor', getter: (s) => s.colors.secondaryPaletteKeyColor() },
    { id: 'tertiaryPaletteKeyColor', getter: (s) => s.colors.tertiaryPaletteKeyColor() },
    { id: 'errorPaletteKeyColor', getter: (s) => s.colors.errorPaletteKeyColor() },
    { id: 'neutralPaletteKeyColor', getter: (s) => s.colors.neutralPaletteKeyColor() },
    { id: 'neutralVariantPaletteKeyColor', getter: (s) => s.colors.neutralVariantPaletteKeyColor() },

    // 15 Surface & Background Colors
    { id: 'background', getter: (s) => s.colors.background() },
    { id: 'onBackground', getter: (s) => s.colors.onBackground() },
    { id: 'surface', getter: (s) => s.colors.surface() },
    { id: 'surfaceDim', getter: (s) => s.colors.surfaceDim() },
    { id: 'surfaceBright', getter: (s) => s.colors.surfaceBright() },
    { id: 'surfaceContainerLowest', getter: (s) => s.colors.surfaceContainerLowest() },
    { id: 'surfaceContainerLow', getter: (s) => s.colors.surfaceContainerLow() },
    { id: 'surfaceContainer', getter: (s) => s.colors.surfaceContainer() },
    { id: 'surfaceContainerHigh', getter: (s) => s.colors.surfaceContainerHigh() },
    { id: 'surfaceContainerHighest', getter: (s) => s.colors.surfaceContainerHighest() },
    { id: 'onSurface', getter: (s) => s.colors.onSurface() },
    { id: 'surfaceVariant', getter: (s) => s.colors.surfaceVariant() },
    { id: 'onSurfaceVariant', getter: (s) => s.colors.onSurfaceVariant() },
    { id: 'inverseSurface', getter: (s) => s.colors.inverseSurface() },
    { id: 'inverseOnSurface', getter: (s) => s.colors.inverseOnSurface() },

    // 5 Utility & Outline Colors
    { id: 'outline', getter: (s) => s.colors.outline() },
    { id: 'outlineVariant', getter: (s) => s.colors.outlineVariant() },
    { id: 'shadow', getter: (s) => s.colors.shadow() },
    { id: 'scrim', getter: (s) => s.colors.scrim() },
    { id: 'surfaceTint', getter: (s) => s.colors.surfaceTint() },

    // 10 Primary Colors
    { id: 'primary', getter: (s) => s.colors.primary() },
    { id: 'primaryDim', getter: (s) => s.colors.primaryDim() },
    { id: 'onPrimary', getter: (s) => s.colors.onPrimary() },
    { id: 'primaryContainer', getter: (s) => s.colors.primaryContainer() },
    { id: 'onPrimaryContainer', getter: (s) => s.colors.onPrimaryContainer() },
    { id: 'inversePrimary', getter: (s) => s.colors.inversePrimary() },
    { id: 'primaryFixed', getter: (s) => s.colors.primaryFixed() },
    { id: 'primaryFixedDim', getter: (s) => s.colors.primaryFixedDim() },
    { id: 'onPrimaryFixed', getter: (s) => s.colors.onPrimaryFixed() },
    { id: 'onPrimaryFixedVariant', getter: (s) => s.colors.onPrimaryFixedVariant() },

    // 9 Secondary Colors
    { id: 'secondary', getter: (s) => s.colors.secondary() },
    { id: 'secondaryDim', getter: (s) => s.colors.secondaryDim() },
    { id: 'onSecondary', getter: (s) => s.colors.onSecondary() },
    { id: 'secondaryContainer', getter: (s) => s.colors.secondaryContainer() },
    { id: 'onSecondaryContainer', getter: (s) => s.colors.onSecondaryContainer() },
    { id: 'secondaryFixed', getter: (s) => s.colors.secondaryFixed() },
    { id: 'secondaryFixedDim', getter: (s) => s.colors.secondaryFixedDim() },
    { id: 'onSecondaryFixed', getter: (s) => s.colors.onSecondaryFixed() },
    { id: 'onSecondaryFixedVariant', getter: (s) => s.colors.onSecondaryFixedVariant() },

    // 9 Tertiary Colors
    { id: 'tertiary', getter: (s) => s.colors.tertiary() },
    { id: 'tertiaryDim', getter: (s) => s.colors.tertiaryDim() },
    { id: 'onTertiary', getter: (s) => s.colors.onTertiary() },
    { id: 'tertiaryContainer', getter: (s) => s.colors.tertiaryContainer() },
    { id: 'onTertiaryContainer', getter: (s) => s.colors.onTertiaryContainer() },
    { id: 'tertiaryFixed', getter: (s) => s.colors.tertiaryFixed() },
    { id: 'tertiaryFixedDim', getter: (s) => s.colors.tertiaryFixedDim() },
    { id: 'onTertiaryFixed', getter: (s) => s.colors.onTertiaryFixed() },
    { id: 'onTertiaryFixedVariant', getter: (s) => s.colors.onTertiaryFixedVariant() },

    // 5 Error Colors
    { id: 'error', getter: (s) => s.colors.error() },
    { id: 'errorDim', getter: (s) => s.colors.errorDim() },
    { id: 'onError', getter: (s) => s.colors.onError() },
    { id: 'errorContainer', getter: (s) => s.colors.errorContainer() },
    { id: 'onErrorContainer', getter: (s) => s.colors.onErrorContainer() },
] as const

/**
 * Resolves dynamic tokens for a given DynamicScheme.
 * Handles Spec 2021 (55 tokens) vs Spec 2025 (59 tokens) and OLED pitch-black dark mode (tone 0 / #000000).
 */
export function resolveSchemeTokens(
    scheme: DynamicScheme,
    isDark: boolean,
    oled: boolean
): MaterialDynamicColorToken[] {
    const tokens: MaterialDynamicColorToken[] = []
    const isSpec2021 = scheme.specVersion === '2021'

    for (const descriptor of DYNAMIC_COLOR_DESCRIPTORS) {
        if (
            isSpec2021 &&
            (descriptor.id === 'primaryDim' ||
                descriptor.id === 'secondaryDim' ||
                descriptor.id === 'tertiaryDim' ||
                descriptor.id === 'errorDim')
        ) {
            continue
        }

        const color = descriptor.getter(scheme)
        if (!color) {
            continue
        }

        const kebabCasedName = toKebabCase(color.name)
        const snakeCaseName = toSnakeCase(color.name)
        let hct = color.getHct(scheme)

        // OLED dark mode optimization
        if (isDark && oled) {
            if (
                kebabCasedName === 'background' ||
                kebabCasedName === 'surface' ||
                kebabCasedName === 'surface-container-lowest'
            ) {
                // Pitch black ARGB 0xff000000 (tone 0)
                hct = Hct.from(hct.hue, hct.chroma, 0)
            }
        }

        tokens.push({
            name: color.name,
            kebabCasedName,
            snakeCaseName,
            hct,
            palette: typeof color.palette === 'function' ? color.palette(scheme) : undefined,
        })
    }

    return tokens.sort((a, b) => a.name.localeCompare(b.name))
}
