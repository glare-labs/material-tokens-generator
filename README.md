# @sandlada/mcu-helper

![NPM Downloads](https://img.shields.io/npm/d18m/@sandlada/mcu-helper?label=NPM%20Downloads&labelColor=%2300531f&color=%23a3f5aa)
![npm version](https://img.shields.io/npm/v/@sandlada/mcu-helper?label=NPM%20Version&labelColor=%2300531f&color=%23a3f5aa)
![GitHub License](https://img.shields.io/github/license/sandlada/mcu-helper?label=License&labelColor=%2300531f&color=%23a3f5aa)

Generate **Material Design 3** (Material You) color tokens, tonal palettes, and CSS custom properties from a source color. Built on top of [`@material/material-color-utilities`](https://github.com/material-foundation/material-color-utilities).

---

## Installation

```bash
npm install @sandlada/mcu-helper @material/material-color-utilities
```

> `@material/material-color-utilities` is a **peer dependency** — make sure it's installed in your project.

---

## Quick Start

```ts
import { createTheme, toCSS } from "@sandlada/mcu-helper"

// 1. Generate light & dark theme colors (functional curried API)
const theme = createTheme({
  variant: 2, // TonalSpot
  specVersion: "2025",
  oled: false,
})("#6750A4")

// 2. Serialize to CSS custom properties
const css = toCSS({
  format: "hex",
  varPrefix: "md-sys-color",
})(theme)

console.log(css)
```

Output:

```css
:root {
    --md-sys-color-background: light-dark(#fdf7ff, #141218);
    --md-sys-color-error: light-dark(#ba1a1a, #ffb4ab);
    --md-sys-color-error-container: light-dark(#ffdad6, #93000a);
    --md-sys-color-error-dim: light-dark(#4e0002, #ffb4ab);
    --md-sys-color-primary: light-dark(#6750a4, #d0bcff);
    --md-sys-color-primary-container: light-dark(#eaddff, #4f378b);
    --md-sys-color-primary-dim: light-dark(#4f378b, #d0bcff);
    --md-sys-color-surface: light-dark(#fdf7ff, #141218);
    --md-sys-color-surface-container-lowest: light-dark(#ffffff, #0f0d13);
    /* ... 59 total design tokens + 6 tonal palettes ... */
}
```

---

## Core API

### `createTheme(options)(sourceColor)`

Higher-order pure functional theme generator.

```ts
import { createTheme, MaterialVariant, MaterialContrastLevel } from "@sandlada/mcu-helper"

const themeGenerator = createTheme({
  variant: MaterialVariant.Vibrant,             // default: MaterialVariant.TonalSpot
  contrastLevel: MaterialContrastLevel.Default, // -1.0 to 1.0, default: 0
  specVersion: "2025",                         // "2021" (55 tokens) | "2025" (59 tokens)
  oled: true,                                  // OLED pitch-black dark mode optimization
  platform: "phone",                           // "phone" | "watch"
  customColors: [
    { name: "brand-accent", value: "#FF5722", blend: true }
  ],
})

const theme = themeGenerator("#6750A4")
```

**Theme Structure (`MaterialThemeData`)**:

| Property | Description |
| --- | --- |
| `light` | Token map of camelCase tokens to ARGB integers (e.g. `{ primary: 0xff6750a4, ... }`) |
| `dark` | Token map of camelCase tokens to ARGB integers |
| `palettes` | Six tonal palettes (`primaryPalette`, `secondaryPalette`, `tertiaryPalette`, `errorPalette`, `neutralPalette`, `neutralVariantPalette`) |
| `customColors` | Evaluated custom color groups with light & dark role tokens |

---

### `createPaletteTones(options)(palette)`

Higher-order tonal palette evaluator.

```ts
import { createPaletteTones, STANDARD_PALETTE_TONES } from "@sandlada/mcu-helper"

// Evaluate standard 16 reference tones
const getTones = createPaletteTones()
const tones = getTones(theme.palettes.primaryPalette)
// → Record<number, number> e.g. { 0: 0xff000000, 10: ..., 40: 0xff6750a4, ..., 100: 0xffffffff }

// Custom tones
const getCustomTones = createPaletteTones({ tones: [10, 20, 30, 40, 50, 60, 70, 80, 90] })
const customTones = getCustomTones(theme.palettes.primaryPalette)
```

---

### `toCSS(options)(themeData)`

Modern CSS serializer supporting multiple color spaces, `light-dark()`, and customizable prefixes.

```ts
import { toCSS } from "@sandlada/mcu-helper"

const css = toCSS({
  format: "display-p3",           // "hex" | "rgb" | "display-p3" | "color-mix" | ((argb) => string)
  varPrefix: "app-color",         // default: "md-sys-color"
  paletteVarPrefix: "app-palette",// default: "md-ref-palette"
  wrapLightDark: true,            // wrap theme tokens in light-dark()
  includeTheme: true,             // emit theme tokens
  includePalettes: true,          // emit reference palette tones
  selector: ":root",              // CSS selector wrapper
})(theme)
```

---

### String Utilities

Standalone pure functions:

```ts
import { toKebabCase, toSnakeCase, toPascalCase, toCamelCase } from "@sandlada/mcu-helper"

toKebabCase("primaryContainer")        // "primary-container"
toSnakeCase("primaryContainer")        // "primary_container"
toPascalCase("primary-container")      // "PrimaryContainer"
toCamelCase("primary-container")       // "primaryContainer"
```

---

### Color Space Formatters

```ts
import { formatHex, formatRgb, formatDisplayP3, formatColorMix } from "@sandlada/mcu-helper"

formatHex(0xff6750a4)                    // "#6750a4"
formatRgb(0xff6750a4)                    // "rgb(103 80 164)"
formatDisplayP3(0xff6750a4)              // "color(display-p3 0.386884 0.315024 0.634125)"
formatColorMix(0xff6750a4, "display-p3") // "color-mix(in display-p3, ...)"
```

---

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build package
npm run compile
```

---

## License

[MIT](./LICENSE)
