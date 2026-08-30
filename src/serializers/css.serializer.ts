import type { TonalPalette } from '@material/material-color-utilities'
import { createPaletteTones } from '../core/palette'
import { resolveColorFormatter } from '../formatters/color-format'
import type { ToCSSOptions } from '../types/css.types'
import { SchemePaletteNameArray, type SchemePaletteName } from '../types/palette.types'
import type { MaterialThemeCSSInput, MaterialThemeData } from '../types/theme.types'
import { toKebabCase } from '../utils/string'

function normalizePrefix(prefix: string | undefined, defaultPrefix: string): string {
    if (prefix === undefined) {
        return `--${defaultPrefix.replace(/^-+|-+$/g, '')}-`
    }
    const clean = prefix.replace(/^-+|-+$/g, '')
    return clean.length > 0 ? `--${clean}-` : '--'
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return false
    }
    const proto = Object.getPrototypeOf(value)
    return proto === Object.prototype || proto === null
}

/**
 * Pure functional, strictly curried CSS custom properties serializer:
 * `toCSS(options)(themeData)`
 *
 * @param options - Serialization configuration (format, varPrefix, paletteVarPrefix, etc.)
 * @returns A function accepting MaterialThemeData or MaterialThemeCSSInput and returning CSS string
 */
export function toCSS(options: ToCSSOptions = {}) {
    const {
        format = 'hex',
        varPrefix,
        paletteVarPrefix,
        colorMixSpace = 'srgb',
        paletteTones,
        includeTheme = true,
        includePalettes = true,
        includeRoot = true,
        wrapLightDark = true,
        selector = ':root',
        customPaletteName,
        isCustomPalette = false,
    } = options

    const formatter = resolveColorFormatter(format, colorMixSpace)
    const themePrefix = normalizePrefix(varPrefix, 'md-sys-color')
    const palPrefix = normalizePrefix(paletteVarPrefix, 'md-ref-palette')

    return (themeData: MaterialThemeData | MaterialThemeCSSInput): string => {
        if (!themeData || typeof themeData !== 'object' || Array.isArray(themeData)) {
            throw new TypeError('toCSS: themeData must be a valid object.')
        }

        const lightObject = ((themeData as any).light ?? (themeData as any).lightObject) as Record<string, unknown> | undefined
        const darkObject = ((themeData as any).dark ?? (themeData as any).darkObject) as Record<string, unknown> | undefined
        const palettes = themeData.palettes

        const declarations: string[] = []

        // 1. Process Theme Tokens
        if (includeTheme && (lightObject !== undefined || darkObject !== undefined)) {
            const rawLight = lightObject ?? {}
            const rawDark = darkObject ?? {}

            if (!isPlainObject(rawLight) || !isPlainObject(rawDark)) {
                throw new TypeError('Serialization: lightObject and darkObject must be plain objects.')
            }

            const lightMap = new Map<string, number>()
            for (const k in rawLight) {
                const normKey = toKebabCase(k)
                if (!normKey) continue
                const v = rawLight[k]
                if (typeof v !== 'number' || !Number.isFinite(v)) {
                    throw new TypeError(`Serialization: lightObject key "${k}" must be a numeric ARGB color.`)
                }
                lightMap.set(normKey, v)
            }

            const darkMap = new Map<string, number>()
            for (const k in rawDark) {
                const normKey = toKebabCase(k)
                if (!normKey) continue
                const v = rawDark[k]
                if (typeof v !== 'number' || !Number.isFinite(v)) {
                    throw new TypeError(`Serialization: darkObject key "${k}" must be a numeric ARGB color.`)
                }
                darkMap.set(normKey, v)
            }

            // Validate key matching
            const lightKeys = Array.from(lightMap.keys()).sort()

            if (lightMap.size !== darkMap.size) {
                const missingInDark = lightKeys.filter((k) => !darkMap.has(k))
                const missingInLight = Array.from(darkMap.keys()).filter((k) => !lightMap.has(k))
                throw new TypeError(
                    `Serialization: lightObject and darkObject must contain the same normalized keys. Missing in darkObject: ${
                        missingInDark.length > 0 ? missingInDark.join(', ') : 'none'
                    }; missing in lightObject: ${missingInLight.length > 0 ? missingInLight.join(', ') : 'none'}.`
                )
            }

            for (let i = 0; i < lightKeys.length; i++) {
                const key = lightKeys[i]
                const darkArgb = darkMap.get(key)
                if (darkArgb === undefined) {
                    const missingInDark = lightKeys.filter((k) => !darkMap.has(k))
                    const missingInLight = Array.from(darkMap.keys()).filter((k) => !lightMap.has(k))
                    throw new TypeError(
                        `Serialization: lightObject and darkObject must contain the same normalized keys. Missing in darkObject: ${
                            missingInDark.length > 0 ? missingInDark.join(', ') : 'none'
                        }; missing in lightObject: ${missingInLight.length > 0 ? missingInLight.join(', ') : 'none'}.`
                    )
                }

                const lightArgb = lightMap.get(key)!
                const lightFormatted = formatter(lightArgb)
                const darkFormatted = formatter(darkArgb)

                if (wrapLightDark) {
                    declarations.push(`    ${themePrefix}${key}: light-dark(${lightFormatted}, ${darkFormatted});`)
                } else {
                    declarations.push(`    ${themePrefix}${key}: ${lightFormatted};`)
                }
            }
        }

        // 2. Process Palette Tokens
        if (includePalettes && palettes !== undefined) {
            const toneGen = createPaletteTones({ tones: paletteTones })

            for (const palName of SchemePaletteNameArray) {
                const paletteObj = palettes[palName]
                if (!paletteObj || typeof paletteObj.tone !== 'function') continue

                const familyName = toKebabCase(palName.replace(/Palette$/, ''))
                const toneMap = toneGen(paletteObj as Pick<TonalPalette, 'tone'>)

                for (const toneStr of Object.keys(toneMap)) {
                    const tone = Number(toneStr)
                    const color = toneMap[tone]
                    const formatted = formatter(color)
                    const propKey = isCustomPalette || customPaletteName !== undefined
                        ? `${palPrefix}${tone}`
                        : `${palPrefix}${familyName}-${tone}`
                    declarations.push(`    ${propKey}: ${formatted};`)
                }
            }
        }

        if (declarations.length === 0) {
            return includeRoot ? `${selector} {\n}\n` : ''
        }

        if (!includeRoot) {
            return declarations.map((d) => d.trimStart()).join('\n') + '\n'
        }

        return `${selector} {\n${declarations.join('\n')}\n}\n`
    }
}
