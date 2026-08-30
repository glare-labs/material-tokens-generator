import { describe, expect, it } from 'vitest'
import type { CreateThemeOptions, MaterialThemeData } from './theme.types'

describe('types/theme.types', () => {
    it('validates theme creation option types', () => {
        const options: CreateThemeOptions = {
            specVersion: '2025',
            oled: true,
            contrastLevel: 0,
            customColors: [
                { name: 'brand', value: '#FF0000', blend: true },
            ],
            tones: [0, 40, 80, 100],
            platform: 'phone',
        }

        expect(options.specVersion).toBe('2025')
        expect(options.oled).toBe(true)
        expect(options.customColors).toHaveLength(1)
    })
})
