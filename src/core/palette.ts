import type { TonalPalette } from '@material/material-color-utilities'
import type { CreatePaletteTonesOptions } from '../types/palette.types'
import {
    DEFAULT_PALETTE_TONES,
    DefaultPaletteTones,
    STANDARD_PALETTE_TONES,
    StandardPaletteTones,
} from '../types/palette.types'
import { normalizeToneList } from '../utils/color'

export {
    DEFAULT_PALETTE_TONES,
    DefaultPaletteTones,
    STANDARD_PALETTE_TONES,
    StandardPaletteTones
}

/**
 * Pure functional, strictly curried palette tone generator:
 * `createPaletteTones(options)(palette)`
 *
 * @param options - Palette tone generation options (tones array)
 * @returns A function that accepts a TonalPalette (or Pick<TonalPalette, 'tone'>) and returns Record<number, number>
 */
export function createPaletteTones(options: CreatePaletteTonesOptions = {}) {
    const tones = normalizeToneList(options.tones, STANDARD_PALETTE_TONES)

    return (palette: Pick<TonalPalette, 'tone'>): Record<number, number> => {
        if (!palette || typeof palette.tone !== 'function') {
            throw new TypeError('createPaletteTones: palette must be a TonalPalette with a tone method.')
        }

        const result: Record<number, number> = {}
        for (const tone of tones) {
            result[tone] = palette.tone(tone)
        }
        return result
    }
}
