import type { ColorFormat, ColorFormatter, ColorMixSpace } from '../types/css.types'

function srgbToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function linearToSrgb(c: number): number {
    const clamped = Math.max(0, Math.min(1, c))
    return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * Math.pow(clamped, 1.0 / 2.4) - 0.055
}

/**
 * Formats a 32-bit ARGB integer into Hex (#rrggbb or #rrggbbaa).
 */
export function formatHex(argb: number): string {
    const a = (argb >>> 24) & 0xff
    const r = (argb >>> 16) & 0xff
    const g = (argb >>> 8) & 0xff
    const b = argb & 0xff

    const rHex = r.toString(16).padStart(2, '0')
    const gHex = g.toString(16).padStart(2, '0')
    const bHex = b.toString(16).padStart(2, '0')

    if (a === 255) {
        return `#${rHex}${gHex}${bHex}`
    }

    const aHex = a.toString(16).padStart(2, '0')
    return `#${rHex}${gHex}${bHex}${aHex}`
}

/**
 * Formats a 32-bit ARGB integer into CSS Color 4 rgb(r g b) or rgb(r g b / a).
 */
export function formatRgb(argb: number): string {
    const a = (argb >>> 24) & 0xff
    const r = (argb >>> 16) & 0xff
    const g = (argb >>> 8) & 0xff
    const b = argb & 0xff

    if (a === 255) {
        return `rgb(${r} ${g} ${b})`
    }

    const alpha = Number((a / 255).toFixed(4))
    return `rgb(${r} ${g} ${b} / ${alpha})`
}

/**
 * Formats a 32-bit ARGB integer into CSS color(display-p3 r g b [/ a]).
 */
export function formatDisplayP3(argb: number): string {
    const a = (argb >>> 24) & 0xff
    const r = ((argb >>> 16) & 0xff) / 255
    const g = ((argb >>> 8) & 0xff) / 255
    const b = (argb & 0xff) / 255

    const rLin = srgbToLinear(r)
    const gLin = srgbToLinear(g)
    const bLin = srgbToLinear(b)

    // sRGB linear -> Display P3 linear transformation matrix (D65 aligned)
    const rP3Lin = 0.8224621 * rLin + 0.1775380 * gLin + 0.0000000 * bLin
    const gP3Lin = 0.0331941 * rLin + 0.9668058 * gLin + 0.0000000 * bLin
    const bP3Lin = 0.0170827 * rLin + 0.0723974 * gLin + 0.9105199 * bLin

    const rP3 = Number(Math.max(0, Math.min(1, linearToSrgb(rP3Lin))).toFixed(4))
    const gP3 = Number(Math.max(0, Math.min(1, linearToSrgb(gP3Lin))).toFixed(4))
    const bP3 = Number(Math.max(0, Math.min(1, linearToSrgb(bP3Lin))).toFixed(4))

    if (a === 255) {
        return `color(display-p3 ${rP3} ${gP3} ${bP3})`
    }

    const alpha = Number((a / 255).toFixed(4))
    return `color(display-p3 ${rP3} ${gP3} ${bP3} / ${alpha})`
}

/**
 * Formats a 32-bit ARGB integer into CSS color-mix() syntax.
 */
export function formatColorMix(argb: number, space: ColorMixSpace = 'srgb'): string {
    const hex = formatHex(argb)
    return `color-mix(in ${space}, ${hex} 100%, transparent)`
}

/**
 * Resolves a color formatter function based on format option.
 */
export function resolveColorFormatter(
    format?: ColorFormat | ColorFormatter,
    colorMixSpace: ColorMixSpace = 'srgb'
): ColorFormatter {
    if (typeof format === 'function') {
        return format
    }

    switch (format) {
        case 'rgb':
        case 'rgba':
            return formatRgb
        case 'display-p3':
            return formatDisplayP3
        case 'color-mix':
            return (argb: number) => formatColorMix(argb, colorMixSpace)
        case 'hex':
        default:
            return formatHex
    }
}
