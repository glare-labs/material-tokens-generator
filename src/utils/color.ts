import { argbFromHex, Hct } from '@material/material-color-utilities'
import { StandardPaletteTones } from '../types/palette.types'

/**
 * Parses a polymorphic sourceColor input (Hct instance, ARGB 32-bit integer, or Hex string)
 * into a verified Hct instance.
 */
export function parseSourceColor(sourceColor: Hct | number | string): Hct {
    if (sourceColor instanceof Hct) {
        return sourceColor
    }

    if (typeof sourceColor === 'number') {
        if (!Number.isFinite(sourceColor) || !Number.isInteger(sourceColor)) {
            throw new TypeError('parseSourceColor: numeric sourceColor must be a valid 32-bit integer ARGB value.')
        }
        return Hct.fromInt(sourceColor)
    }

    if (typeof sourceColor === 'string') {
        const trimmed = sourceColor.trim()
        if (!trimmed) {
            throw new TypeError('parseSourceColor: string sourceColor cannot be empty.')
        }

        const cleanHex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`

        // Validate hex format strictly (#RGB, #RRGGBB, #RRGGBBAA)
        if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(cleanHex)) {
            throw new TypeError(`parseSourceColor: invalid hex color string "${sourceColor}".`)
        }

        const hexBody = cleanHex.slice(1)

        // Handle 8-digit hex (#RRGGBBAA)
        if (hexBody.length === 8) {
            const r = parseInt(hexBody.slice(0, 2), 16)
            const g = parseInt(hexBody.slice(2, 4), 16)
            const b = parseInt(hexBody.slice(4, 6), 16)
            const a = parseInt(hexBody.slice(6, 8), 16)
            const argb = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0
            return Hct.fromInt(argb)
        }

        // Handle 3-digit hex (#RGB)
        if (hexBody.length === 3) {
            const rgb = hexBody.split('').map((c) => c + c).join('')
            return Hct.fromInt(argbFromHex('#' + rgb))
        }

        // Handle standard 6-digit hex (#RRGGBB)
        try {
            return Hct.fromInt(argbFromHex(cleanHex))
        } catch {
            throw new TypeError(`parseSourceColor: invalid hex color string "${sourceColor}".`)
        }
    }

    throw new TypeError(
        `parseSourceColor: unsupported sourceColor type "${typeof sourceColor}". Expected Hct instance, ARGB integer, or Hex string.`
    )
}

/**
 * Alias for parseSourceColor.
 */
export const parseColor = parseSourceColor

/**
 * Normalizes a list of tone values: validates range [0, 100], checks integer constraint,
 * deduplicates, and sorts ascending.
 */
export function normalizeToneList(
    tones?: number[],
    defaultTones: readonly number[] = StandardPaletteTones
): number[] {
    if (tones === undefined) {
        return [...defaultTones]
    }

    if (tones.length === 0) {
        throw new TypeError('createPaletteTones: tones cannot be empty.')
    }

    const validated = tones.map((tone) => {
        if (!Number.isFinite(tone) || !Number.isInteger(tone) || tone < 0 || tone > 100) {
            throw new TypeError('createPaletteTones: tones must be integers between 0 and 100.')
        }
        return tone
    })

    return [...new Set(validated)].sort((a, b) => a - b)
}

/**
 * Calculates standard sRGB relative luminance for a 32-bit ARGB color integer.
 */
export function getLuminance(argb: number): number {
    const r = ((argb >> 16) & 0xff) / 255
    const g = ((argb >> 8) & 0xff) / 255
    const b = (argb & 0xff) / 255

    const rLin = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const gLin = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const bLin = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

/**
 * Calculates the WCAG contrast ratio between two 32-bit ARGB colors.
 */
export function calculateContrastRatio(foregroundArgb: number, backgroundArgb: number): number {
    const l1 = getLuminance(foregroundArgb)
    const l2 = getLuminance(backgroundArgb)
    const brighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (brighter + 0.05) / (darker + 0.05)
}
