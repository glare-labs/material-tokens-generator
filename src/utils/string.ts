/**
 * Converts any string (camelCase, PascalCase, snake_case, dot.delimited, or space-separated)
 * into kebab-case.
 *
 * @example
 * toKebabCase('primaryContainer')       // 'primary-container'
 * toKebabCase('PRIMARY_CONTAINER')      // 'primary-container'
 * toKebabCase('surfaceContainerLowest') // 'surface-container-lowest'
 * toKebabCase('primary.container value')// 'primary-container-value'
 * toKebabCase('--primary-container--')  // 'primary-container'
 * toKebabCase('')                       // ''
 */
const KEBAB_FAST_PATH_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function toKebabCase<S extends string>(str: S | string | null | undefined): string {
    if (!str) return ''
    const s = String(str)
    if (KEBAB_FAST_PATH_REGEX.test(s)) return s
    return s
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_.]+/g, '-')
        .toLowerCase()
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Converts any string into snake_case.
 *
 * @example
 * toSnakeCase('primaryContainer')       // 'primary_container'
 * toSnakeCase('primary-container')      // 'primary_container'
 * toSnakeCase('onSecondaryFixedVariant')// 'on_secondary_fixed_variant'
 * toSnakeCase('')                       // ''
 */
export function toSnakeCase(str: string | null | undefined): string {
    if (!str) return ''
    return String(str)
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[\s.-]+/g, '_')
        .toLowerCase()
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
}

/**
 * Converts any string into PascalCase.
 *
 * @example
 * toPascalCase('primary-container')     // 'PrimaryContainer'
 * toPascalCase('surface_container_lowest') // 'SurfaceContainerLowest'
 * toPascalCase('')                      // ''
 */
export function toPascalCase(str: string | null | undefined): string {
    if (!str) return ''
    const kebab = toKebabCase(str)
    if (!kebab) return ''
    return kebab
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
}

/**
 * Converts any string into camelCase.
 *
 * @example
 * toCamelCase('primary-container')      // 'primaryContainer'
 * toCamelCase('PrimaryContainer')       // 'primaryContainer'
 * toCamelCase('')                       // ''
 */
export function toCamelCase(str: string | null | undefined): string {
    if (!str) return ''
    const pascal = toPascalCase(str)
    if (!pascal) return ''
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

/**
 * Backward compatibility object for legacy StringUtil invocations.
 */
export const StringUtil = {
    ToKebabCase : toKebabCase,
    ToSnakeCase : toSnakeCase,
    ToPascalCase: toPascalCase,
    ToCamelCase : toCamelCase,
} as const
