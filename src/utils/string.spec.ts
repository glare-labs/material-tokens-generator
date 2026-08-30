import { describe, expect, it } from 'vitest'
import {
    StringUtil,
    toCamelCase,
    toKebabCase,
    toPascalCase,
    toSnakeCase,
} from './string'

describe('utils/string', () => {
    describe('toKebabCase', () => {
        it('converts camelCase to kebab-case', () => {
            expect(toKebabCase('primaryContainer')).toBe('primary-container')
            expect(toKebabCase('surfaceContainerLowest')).toBe('surface-container-lowest')
        })

        it('converts snake_case and UPPER_CASE to kebab-case', () => {
            expect(toKebabCase('primary_container')).toBe('primary-container')
            expect(toKebabCase('PRIMARY_CONTAINER')).toBe('primary-container')
        })

        it('handles spaces, dots, and multiple dashes', () => {
            expect(toKebabCase('primary.container value')).toBe('primary-container-value')
            expect(toKebabCase('--primary--container--')).toBe('primary-container')
        })

        it('handles empty or falsy strings', () => {
            expect(toKebabCase('')).toBe('')
            expect(toKebabCase(null)).toBe('')
            expect(toKebabCase(undefined)).toBe('')
        })
    })

    describe('toSnakeCase', () => {
        it('converts camelCase to snake_case', () => {
            expect(toSnakeCase('primaryContainer')).toBe('primary_container')
            expect(toSnakeCase('onSecondaryFixedVariant')).toBe('on_secondary_fixed_variant')
        })

        it('converts kebab-case to snake_case', () => {
            expect(toSnakeCase('primary-container')).toBe('primary_container')
        })

        it('handles empty or falsy strings', () => {
            expect(toSnakeCase('')).toBe('')
            expect(toSnakeCase(null)).toBe('')
            expect(toSnakeCase(undefined)).toBe('')
        })
    })

    describe('toPascalCase', () => {
        it('converts kebab-case and snake_case to PascalCase', () => {
            expect(toPascalCase('primary-container')).toBe('PrimaryContainer')
            expect(toPascalCase('surface_container_lowest')).toBe('SurfaceContainerLowest')
        })

        it('handles empty strings', () => {
            expect(toPascalCase('')).toBe('')
        })
    })

    describe('toCamelCase', () => {
        it('converts kebab-case and PascalCase to camelCase', () => {
            expect(toCamelCase('primary-container')).toBe('primaryContainer')
            expect(toCamelCase('PrimaryContainer')).toBe('primaryContainer')
        })

        it('handles empty strings', () => {
            expect(toCamelCase('')).toBe('')
        })
    })

    describe('StringUtil Backward Compatibility Object', () => {
        it('provides static method bindings', () => {
            expect(StringUtil.ToKebabCase('primaryContainer')).toBe('primary-container')
            expect(StringUtil.ToSnakeCase('primaryContainer')).toBe('primary_container')
            expect(StringUtil.ToPascalCase('primary-container')).toBe('PrimaryContainer')
            expect(StringUtil.ToCamelCase('primary-container')).toBe('primaryContainer')
        })
    })
})
