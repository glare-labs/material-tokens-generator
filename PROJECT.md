# Project: @sandlada/mcu-helper Refactor

## Architecture
- Functional higher-order curried APIs: `createTheme(options)(sourceColor)`, `createPaletteTones(options)(palette)`, `toCSS(options)(themeData)`
- Pure color formatting module supporting Hex (`#rrggbb`/`#rrggbbaa`), RGB/RGBA (`rgb(r g b [/ a])`), Display P3 (`color(display-p3 r g b [/ a])`), Color-Mix (`color-mix(in srgb/display-p3, ...)`), Custom formatters `(argb: number) => string`, and `light-dark()` CSS serialization.
- Dynamic Color Engine supporting Material Design Specs `2021` and `2025` (default: `2025`), 6 tonal palette families (`primary`, `secondary`, `tertiary`, `error`, `neutral`, `neutral-variant`), and `oled` dark mode optimization (tone 0 / `#000000` for `background`, `surface`, `surface-container-lowest`).
- String & case formatting utilities pure functions (`toKebabCase`, `toSnakeCase`, `toPascalCase`).
- Complete elimination of `whiteList`, `blackList`, `paletteWhiteList`, and `paletteBlackList` in favor of user-space composition.
- Full Vitest test suite, TypeScript declaration emission, and Vue `dev-app` live verification.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Pure Functional Curried `createTheme` | `createTheme(options)(sourceColor)` higher-order curried API | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Pure Functional Curried `createPaletteTones` | `createPaletteTones(options)(palette)` higher-order curried API | M1 | ORIGINAL_REQUEST §R1 |
| 3 | Pure Functional Utilities | `toKebabCase`, `toSnakeCase`, `toPascalCase` standalone functions | M1 | ORIGINAL_REQUEST §R1 |
| 4 | Spec Versioning 2021 & 2025 | Support `specVersion: '2021' | '2025'` (default `'2025'`) with proper token sets (55 vs 59 tokens) | M1 | ORIGINAL_REQUEST §R2 |
| 5 | OLED Pitch-Black Dark Mode | `oled: true` sets dark mode background, surface, surface-container-lowest to tone 0 (#000000) | M1 | ORIGINAL_REQUEST §R2 |
| 6 | 6 Standard Tonal Palettes | Extract & produce primary, secondary, tertiary, error, neutral, neutral-variant palettes | M1 | ORIGINAL_REQUEST §R2 |
| 7 | Whitelist & Blacklist Removal | Complete excision of whitelist/blacklist filtering parameters and error branches | M1, M2 | ORIGINAL_REQUEST §R4 |
| 8 | Pure Functional Curried `toCSS` | `toCSS(options)(themeData)` higher-order curried API | M2 | ORIGINAL_REQUEST §R1, §R3 |
| 9 | Modern CSS Color Formats | Hex (`#rrggbb`/`#rrggbbaa`), RGB (`rgb(...)`), Display P3 (`color(display-p3 ...)`), Color Mix (`color-mix(...)`), Custom formatters | M2 | ORIGINAL_REQUEST §R3 |
| 10 | CSS Variable Customization & `light-dark()` | Configurable `varPrefix`, palette tone emission, and `light-dark()` mode wrapping | M2 | ORIGINAL_REQUEST §R3 |
| 11 | Comprehensive Vitest Test Suite | Unit & integration tests for all curried signatures, spec 2021/2025, OLED mode, all color formats | M3 / E2E Track | ORIGINAL_REQUEST §R5 |
| 12 | Clean TypeScript Build | `npm run compile` produces zero diagnostics, valid `.d.ts` declaration files | M3 | ORIGINAL_REQUEST §R5 |
| 13 | Dev-App Migration & Live CSS Verification | Update `dev-app/src/App.vue` to new curried API and verify stylesheet adoption | M3 | ORIGINAL_REQUEST §R5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Comprehensive opaque-box test suite across all 4 tiers (Tiers 1-4) published to `TEST_READY.md` | none | DONE |
| M1 | Functional Core & Dynamic Color Engine | Curried `createTheme`, `createPaletteTones`, Spec 2021/2025, OLED mode, 6 palettes, filter removal, pure string utils | none | DONE |
| M2 | Modern CSS Serializer & Color Formats | Curried `toCSS`, Display P3, RGB/RGBA, Hex, Color Mix, custom formatters, `light-dark()`, prefix config | M1 | DONE |
| M3 | Full Integration, Build & Dev-App Verification | Entry point exports (`src/index.ts`), 100% test pass (`npm test`), clean compile (`npm run compile`), dev-app update & build | M1, M2, E2E | DONE |

## Interface Contracts
### `createTheme`
`createTheme(options?: CreateThemeOptions)(sourceColor: Hct | number | string): MaterialThemeData`
Options:
- `variant?: MaterialVariant` (default: `MaterialVariant.TonalSpot`)
- `contrastLevel?: MaterialContrastLevel | number` (default: `MaterialContrastLevel.Default`)
- `specVersion?: '2021' | '2025'` (default: `'2025'`)
- `oled?: boolean` (default: `false`)
- `palettes?: boolean` (default: `true`)
- `customColors?: CustomColorDefinition[]` (optional)
- `tones?: number[]` (optional tone overrides)

### `createPaletteTones`
`createPaletteTones(options?: CreatePaletteTonesOptions)(palette: TonalPalette): Record<number, number>`
Options:
- `tones?: number[]` (default: standard tones `[0, 10, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100]`)

### `toCSS`
`toCSS(options?: ToCSSOptions)(themeData: MaterialThemeData | MaterialThemeCSSInput): string`
Options:
- `format?: 'hex' | 'rgb' | 'display-p3' | 'color-mix' | ((argb: number) => string)` (default: `'hex'`)
- `varPrefix?: string` (default: `'md-sys-color'`)
- `paletteVarPrefix?: string` (default: `'md-ref-palette'`)
- `colorMixSpace?: 'srgb' | 'display-p3'` (default: `'srgb'`)
- `paletteTones?: number[]` (tones to emit for palettes)
- `includePalettes?: boolean` (default: `true`)
- `includeRoot?: boolean` (default: `true`)

## Code Layout
- `src/index.ts` — Top-level pure functional and type exports
- `src/types/` — Theme, Palette, CSS and Spec type definitions
- `src/core/` — `theme.ts` (`createTheme`), `palette.ts` (`createPaletteTones`), `tokens.ts` (MaterialDynamicColors mapping)
- `src/formatters/` — `color-format.ts` (hex, rgb, display-p3, color-mix, custom formatters)
- `src/serializers/` — `css.serializer.ts` (`toCSS`)
- `src/utils/` — `string.ts` (`toKebabCase`, `toSnakeCase`, `toPascalCase`), `color.ts` (color space conversions)
- `tests/` — Test suites for curried core, spec versions, OLED, formatters, CSS serialization
- `dev-app/` — Vue 3 demo app testing live CSS generation and stylesheet adoption
