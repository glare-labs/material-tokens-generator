import {
    Blend,
    DynamicScheme,
    Hct,
    TonalPalette,
} from '@material/material-color-utilities'
import { MaterialContrastLevel, MaterialVariant } from '../types/material.types'
import type {
    SchemePaletteName,
} from '../types/palette.types'
import type {
    CreateThemeOptions,
    CustomColorDefinition,
    MaterialCustomColorGroup,
    MaterialThemeData,
} from '../types/theme.types'
import { parseSourceColor } from '../utils/color'
import { resolveSchemeTokens, tokensToMap } from './tokens'

/**
 * Processes custom colors definitions and derives tonal palettes and role tokens.
 */
function processCustomColors(
    customColors: CustomColorDefinition[],
    sourceHct: Hct
): MaterialCustomColorGroup[] {
    const sourceArgb = sourceHct.toInt()

    return customColors.map((definition) => {
        const rawHct = parseSourceColor(definition.value)
        let value = rawHct.toInt()

        if (definition.blend) {
            value = Blend.harmonize(value, sourceArgb)
        }

        const customHct = Hct.fromInt(value)
        const palette = TonalPalette.fromHueAndChroma(customHct.hue, customHct.chroma)

        return {
            name: definition.name,
            color: definition,
            value,
            palette,
            light: {
                color           : palette.tone(40),
                onColor         : palette.tone(100),
                colorContainer  : palette.tone(90),
                onColorContainer: palette.tone(10),
            },
            dark: {
                color           : palette.tone(80),
                onColor         : palette.tone(20),
                colorContainer  : palette.tone(30),
                onColorContainer: palette.tone(90),
            },
        }
    })
}

/**
 * Pure functional, strictly curried Material Design 3 theme generator:
 * `createTheme(options)(sourceColor)`
 *
 * @param options - Theme generation options (variant, contrastLevel, specVersion, oled, customColors, tones, platform)
 * @returns A function accepting a sourceColor (Hct | number | string) and returning complete MaterialThemeData
 */
export function createTheme(options: CreateThemeOptions = {}) {
    const {
        variant: requestedVariant,
        contrastLevel = MaterialContrastLevel.Default,
        specVersion = '2025',
        oled = false,
        customPalettes = {},
        customColors = [],
        platform = 'phone',
    } = options

    return (sourceColor: Hct | number | string): MaterialThemeData => {
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

        const lightTokens = resolveSchemeTokens(lightScheme, false, false)
        const darkTokens = resolveSchemeTokens(darkScheme, true, oled)

        const light = tokensToMap(lightTokens, 'camelCase')
        const dark = tokensToMap(darkTokens, 'camelCase')

        const primaryPal = isGrayscale && defaultPrimaryPalette
            ? defaultPrimaryPalette
            : lightScheme.primaryPalette

        const palettes: Record<SchemePaletteName, TonalPalette> = {
            primaryPalette       : primaryPal,
            secondaryPalette     : lightScheme.secondaryPalette,
            tertiaryPalette      : lightScheme.tertiaryPalette,
            errorPalette         : lightScheme.errorPalette,
            neutralPalette       : lightScheme.neutralPalette,
            neutralVariantPalette: lightScheme.neutralVariantPalette,
        }

        const customColorGroups = customColors.length > 0
            ? processCustomColors(customColors, sourceColorHct)
            : undefined

        return {
            light,
            dark,
            palettes,
            ...(customColorGroups ? { customColors: customColorGroups } : {}),
        }
    }
}
