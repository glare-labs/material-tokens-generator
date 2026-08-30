# Test Infrastructure Documentation

## 1. Overview
The `@sandlada/mcu-helper` test suite provides comprehensive, opaque-box, requirement-driven end-to-end (E2E) and unit test coverage for the refactored Material Design 3 token and CSS serialization library.

Testing is built around the **4-Tier Testing Methodology**:
- **Tier 1: Feature Coverage** — Primary and secondary happy paths with $\ge 5$ discrete tests per feature.
- **Tier 2: Boundary & Corner Cases** — Extreme inputs, empty configurations, out-of-range parameters, invalid types, and error bubbling.
- **Tier 3: Cross-Feature Combinations** — Pairwise and multi-variable interactions across spec versions, OLED mode, color formats, and variable prefixes.
- **Tier 4: Real-World Scenarios** — End-to-end enterprise workflows including design system generation, theme switcher stylesheets, AMOLED mobile battery-saver themes, multi-brand composition, custom semantic tokens, and CSSOM stylesheet adoption.

---

## 2. Directory Layout
```
mcu-helper/
├── src/                          # Library source code
│   ├── index.ts                  # Top-level functional & type entry point
│   ├── core/                     # createTheme, createPaletteTones, token maps
│   ├── formatters/               # Hex, RGB, Display P3, Color Mix, Custom formatters
│   ├── serializers/              # toCSS serializer
│   ├── utils/                    # String and color math utilities
│   └── material/                 # MaterialVariant, MaterialContrastLevel constants
├── tests/
│   └── e2e/                      # Opaque-Box E2E Test Suites
│       ├── curried-api.test.ts          # Curried higher-order APIs & string utils
│       ├── spec-versioning.test.ts      # 2021 vs 2025 specs, 55 vs 59 tokens
│       ├── oled-dark-mode.test.ts       # Pitch-black dark mode & WCAG contrast
│       ├── css-serialization.test.ts   # Hex, RGB, P3, Color-mix, light-dark(), prefix
│       ├── whitelist-removal.test.ts    # Filter removal & user-space composition
│       └── real-world-scenarios.test.ts # Enterprise scenarios & CSSOM simulation
├── vitest.config.ts              # Vitest test runner configuration
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 3. Test Suites Inventory

| Suite | File Path | Scope | Target Features |
|---|---|---|---|
| Curried Higher-Order API | `tests/e2e/curried-api.test.ts` | Functional currying `fn(options)(data)`, data-last ordering, reusability, pure string utilities | Features 1, 2, 3, 8 |
| Spec Versioning | `tests/e2e/spec-versioning.test.ts` | 2021 vs 2025 specs, 55 vs 59 tokens, 4 dim tokens, variant fallback, contrast levels | Features 4, 6 |
| OLED Dark Mode | `tests/e2e/oled-dark-mode.test.ts` | `oled: true` pitch black (tone 0 / `#000000`), unaffected light mode, contrast ratios >15:1 | Feature 5 |
| CSS Serialization | `tests/e2e/css-serialization.test.ts` | Hex, RGB, Display P3, Color Mix, Custom formatters, `light-dark()`, `varPrefix`, `paletteTones` | Features 8, 9, 10 |
| Whitelist Removal | `tests/e2e/whitelist-removal.test.ts` | Absence of whitelist/blacklist arguments, unpolluted output, zero console warnings, user-space filtering | Feature 7 |
| Real-World Scenarios | `tests/e2e/real-world-scenarios.test.ts` | Complete design tokens, CSSOM injection, multi-brand themes, AMOLED battery saver, semantic color extensions | Features 1–13 (Integration) |

---

## 4. How to Execute Tests

### 4.1 Running All Tests
```bash
npm test
```
Runs the full Vitest suite (both unit tests and E2E test suites).

### 4.2 Running E2E Tests Only
```bash
npx vitest run tests/e2e
```

### 4.3 Running Specific Test Files
```bash
npx vitest run tests/e2e/curried-api.test.ts
npx vitest run tests/e2e/spec-versioning.test.ts
npx vitest run tests/e2e/oled-dark-mode.test.ts
npx vitest run tests/e2e/css-serialization.test.ts
npx vitest run tests/e2e/whitelist-removal.test.ts
npx vitest run tests/e2e/real-world-scenarios.test.ts
```

### 4.4 Running in Watch Mode
```bash
npm run test:watch
```

### 4.5 Type Checking & Declaration Emission
```bash
npm run compile
```

---

## 5. Expected Output Derivation & Verification Standards

1. **Material Design Spec Oracles**:
   - Dynamic colors and schemes derive directly from `@material/material-color-utilities` v0.4.0 (`DynamicScheme`, `MaterialDynamicColors`, `Hct`, `TonalPalette`).
   - 2025 spec token count = 59 (55 baseline + 4 dim tokens: `primaryDim`, `secondaryDim`, `tertiaryDim`, `errorDim`).
   - 2021 spec token count = 55 (dim tokens undefined).
2. **OLED Tone Derivation**:
   - Tone 0 evaluates to 32-bit ARGB `0xff000000` / hex `#000000`.
   - WCAG 2.1 relative luminance formula verifies foreground-to-background contrast $\ge 15:1$ against `#000000`.
3. **Display P3 Math**:
   - Uses D65 sRGB-to-Linear $\rightarrow$ linear P3 matrix transformation $\rightarrow$ P3 gamma transfer function.
   - Outputs valid CSS Color 4 `color(display-p3 r g b [/ a])` format.
4. **Modern CSS Serializer**:
   - Generates valid CSS custom properties inside `:root { ... }`.
   - Wraps dynamic theme tokens in `light-dark(<lightVal>, <darkVal>)`.
   - Palette tokens emitted as static declarations `--<paletteVarPrefix>-<family>-<tone>: <val>;`.
