import { DynamicScheme, Hct, MaterialDynamicColors, Variant } from '@material/material-color-utilities'
import { describe, expect, it } from 'vitest'
import { DYNAMIC_COLOR_DESCRIPTORS, resolveSchemeTokens, resolveThemeTokens, tokensToMap } from './tokens'

describe('core/tokens', () => {
    describe('DYNAMIC_COLOR_DESCRIPTORS', () => {
        it('contains exactly 59 descriptor definitions', () => {
            expect(DYNAMIC_COLOR_DESCRIPTORS).toHaveLength(59)
        })

        it('each descriptor has a unique ID and a getter function', () => {
            const ids = new Set<string>()
            for (const desc of DYNAMIC_COLOR_DESCRIPTORS) {
                expect(typeof desc.id).toBe('string')
                expect(typeof desc.getter).toBe('function')
                expect(ids.has(desc.id)).toBe(false)
                ids.add(desc.id)
            }
        })
    })

    describe('resolveSchemeTokens', () => {
        const sourceHct = Hct.fromInt(0xff6750a4)
        const lightScheme2025 = new DynamicScheme({
            sourceColorHct: sourceHct,
            variant: Variant.TONAL_SPOT,
            contrastLevel: 0,
            isDark: false,
            specVersion: '2025',
            platform: 'phone',
        })

        const darkScheme2025 = new DynamicScheme({
            sourceColorHct: sourceHct,
            variant: Variant.TONAL_SPOT,
            contrastLevel: 0,
            isDark: true,
            specVersion: '2025',
            platform: 'phone',
        })

        const lightScheme2021 = new DynamicScheme({
            sourceColorHct: sourceHct,
            variant: Variant.TONAL_SPOT,
            contrastLevel: 0,
            isDark: false,
            specVersion: '2021',
            platform: 'phone',
        })

        it('resolves 59 sorted tokens for spec 2025', () => {
            const tokens = resolveSchemeTokens(lightScheme2025, false, false)
            expect(tokens).toHaveLength(59)
            expect(tokens.every((t) => t.name && t.kebabCasedName && t.snakeCaseName && t.hct)).toBe(true)

            // Verify sorting alphabetically by name
            for (let i = 1; i < tokens.length; i++) {
                expect(tokens[i - 1].name.localeCompare(tokens[i].name)).toBeLessThanOrEqual(0)
            }
        })

        it('resolves 55 tokens for spec 2021 (excluding dim tokens)', () => {
            const tokens = resolveSchemeTokens(lightScheme2021, false, false)
            expect(tokens).toHaveLength(55)
            const tokenNames = tokens.map((t) => t.kebabCasedName)
            expect(tokenNames).not.toContain('primary-dim')
            expect(tokenNames).not.toContain('secondary-dim')
            expect(tokenNames).not.toContain('tertiary-dim')
            expect(tokenNames).not.toContain('error-dim')
        })

        it('applies pitch black (tone 0) to background and surface tokens in OLED dark mode', () => {
            const oledTokens = resolveSchemeTokens(darkScheme2025, true, true)
            const tokenMap = new Map(oledTokens.map((t) => [t.kebabCasedName, t]))

            const bg = tokenMap.get('background')
            const surface = tokenMap.get('surface')
            const surfaceLowest = tokenMap.get('surface-container-lowest')

            expect(bg?.hct.toInt()).toBe(0xff000000)
            expect(surface?.hct.toInt()).toBe(0xff000000)
            expect(surfaceLowest?.hct.toInt()).toBe(0xff000000)
        })

        it('does not apply pitch black in OLED light mode', () => {
            const tokens = resolveSchemeTokens(lightScheme2025, false, true)
            const tokenMap = new Map(tokens.map((t) => [t.kebabCasedName, t]))

            expect(tokenMap.get('background')?.hct.toInt()).not.toBe(0xff000000)
            expect(tokenMap.get('surface')?.hct.toInt()).not.toBe(0xff000000)
        })
    })

    describe('tokensToMap & resolveThemeTokens', () => {
        const sourceHct = Hct.fromInt(0xff6750a4)
        const lightScheme2025 = new DynamicScheme({
            sourceColorHct: sourceHct,
            variant: Variant.TONAL_SPOT,
            contrastLevel: 0,
            isDark: false,
            specVersion: '2025',
            platform: 'phone',
        })

        it('converts token array to camelCase map by default', () => {
            const tokens = resolveSchemeTokens(lightScheme2025, false, false)
            const map = tokensToMap(tokens)

            expect(Object.keys(map)).toHaveLength(59)
            expect(map['primary']).toBeDefined()
            expect(map['primaryContainer']).toBeDefined()
            expect(map['surfaceContainerLowest']).toBeDefined()
            expect(typeof map['primary']).toBe('number')
        })

        it('supports kebabCase and snakeCase formatting in tokensToMap', () => {
            const tokens = resolveSchemeTokens(lightScheme2025, false, false)
            const kebabMap = tokensToMap(tokens, 'kebabCase')
            const snakeMap = tokensToMap(tokens, 'snakeCase')

            expect(kebabMap['primary-container']).toBeDefined()
            expect(snakeMap['primary_container']).toBeDefined()
        })

        it('resolves rich theme tokens with resolveThemeTokens helper', () => {
            const rich = resolveThemeTokens({ specVersion: '2025', oled: true })('#6750A4')

            expect(rich.light).toHaveLength(59)
            expect(rich.dark).toHaveLength(59)
            expect(rich.light[0].hct).toBeDefined()
            expect(rich.light[0].kebabCasedName).toBeDefined()
        })
    })
})
