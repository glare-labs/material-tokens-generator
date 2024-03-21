# material-tokens-generator

This warehouse uses the [@material/material-color-utilities](https://github.com/material-foundation/material-color-utilities) open source warehouse to convert the results generated by @material/material-color-utilities into CSS styles.

+ ESM Supported
+ CommonJs Supported
+ Typescript Supported

## Usage

### Import
If you are using **ESM**, you can try the introduction part of the following code:
```javascript
import { MaterialDynamicSchemeGenerator, MaterialPaletteGenerator } from '@glare-labs/material-tokens-generator';
```

Or: 
```javascript
import { MaterialDynamicSchemeGenerator, MaterialPaletteGenerator } from '@glare-labs/material-tokens-generator/esm';
```


If you are using **CommonJs**, you can try the introduction part of the following code:
```javascript
const { MaterialDynamicSchemeGenerator, MaterialPaletteGenerator } = require('@glare-labs/material-tokens-generator');
```

Or: 
```javascript
const { MaterialDynamicSchemeGenerator, MaterialPaletteGenerator } = require('@glare-labs/material-tokens-generator/cjs');
```

### Generate colors
For example: 

```javascript
import { MaterialDynamicSchemeGenerator } from '@glare-labs/material-tokens-generator';

const s = MaterialDynamicSchemeGenerator.GenerateByVariant('#123456');

/**
 * @output
 * {
 *   primaryPaletteKeyColor: '#0697ff',
 *   secondaryPaletteKeyColor: '#6b7697',
 *   ...
 *   onTertiaryFixed: '#151643',
 *   onTertiaryFixedVariant: '#414271'
 * }
 */
console.log(s.value());

/**
 * @output
 * --my-prefix-primary-palette-key-color: #0697ff;
 * --my-prefix-secondary-palette-key-color: #6b7697;
 * ...
 * --my-prefix-on-tertiary-fixed: #151643;
 * --my-prefix-on-tertiary-fixed-variant: #414271;
 */
console.log(s.ToStyleText({ prefix: 'my-prefix' }));
```

### Generate palettes
For example: 

```javascript
import { MaterialPaletteGenerator } from '@glare-labs/material-tokens-generator';

const p = MaterialPaletteGenerator.GenerateByVariant('#123456');

/**
 * @output
 * {
 *   primary: {
 *     P0: '#000000'
 *     P5: '#001225'
 *     ...
 *   },
 *   ...
 *   neutralVariant: {
 *     NV0: '#000000',
 *     NV5: '#09111b',
 *     ...
 *   }
 * }
 */
console.log(p.value());

/**
 * @output
 * --my-prefix-p-0: #000000;
 * --my-prefix-p-5: #001225;
 * ...
 * --my-prefix-nv-95: #eaf1ff;
 * --my-prefix-nv-100: #ffffff;
 */
console.log(p.ToStyleText({ prefix: 'my-prefix' }));
```

## API

|Classes|Features|
|:--|--:|
|MaterialDynamicSchemeGenerator|Used to create tokens like `--md-sys-color-primary`.|
|MaterialPaletteGenerator|Used to create tokens like `--md-palette-p-40`.|

### MaterialDynamicSchemeGenerator

#### GenerateByVariant()

|Param|Type|Option|Required|
|:--|:--|:--|--:|
|soureColor|string||Yes|
|options|0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6|variant|No|
|options|boolean|isDark|No|
|options|-1.0 \| 0 \| 0.5 \| 1.0|contrastLevel|No|

```javascript
MaterialDynamicSchemeGenerator.GenerateByVariant('#123456');

MaterialDynamicSchemeGenerator.GenerateByVariant('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
});

MaterialDynamicSchemeGenerator.GenerateByVariant('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
  isDark: true,
  contrastLevel: EMaterialContrastLevel.HIGH
});
```


#### GenerateByPalette()

|Param|Type|Option|Required|
|:--|:--|:--|--:|
|soureColor|string||Yes|
|options|0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6|variant|No|
|options|boolean|isDark|No|
|options|-1.0 \| 0 \| 0.5 \| 1.0|contrastLevel|No|
|options|string|primaryPalette|No|
|options|string|secondaryPalette|No|
|options|string|tertiaryPalette|No|
|options|string|neutralPalette|No|
|options|string|neutralVariantPalette|No|

```javascript
MaterialDynamicSchemeGenerator.GenerateByPalette('#123456');

MaterialDynamicSchemeGenerator.GenerateByPalette('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
});

MaterialDynamicSchemeGenerator.GenerateByPalette('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
  isDark: true,
  contrastLevel: EMaterialContrastLevel.HIGH,
  primaryPalette: '#654321'
});
```

#### value()

|Param|Type|Required|
|:--|:--|--:|
|||

```javascript
const s = MaterialDynamicSchemeGenerator.GenerateByVariant('#123456');

/**
 * @output
 * {
 *   primaryPaletteKeyColor: '#0697ff',
 *   secondaryPaletteKeyColor: '#6b7697',
 *   ...
 *   onTertiaryFixed: '#151643',
 *   onTertiaryFixedVariant: '#414271'
 * }
 */
const tokens = s.value()

/**
 * @output
 * #161c24
 */ 
const onSurfaceHex = tokens.onSurface
```

#### ToStyleText()

|Param|Type|Option|Required|
|:--|:--|:--|--:|
|options|string|prefix|No|

```javascript
const s = MaterialDynamicSchemeGenerator.GenerateByVariant('#123456');

/**
 * @output
 * --md-sys-color-primary-palette-key-color: #0697ff; ...
 */
const style1 = s.ToStyleText()

/**
 * @output
 * --my-loved-primary-palette-key-color: #0697ff; ...
 */
const style2 = s.ToStyleText({
    prefix: 'my-loved'
})
```

### MaterialPaletteGenerator

#### GenerateByVariant()

|Param|Type|Option|Required|
|:--|:--|:--|--:|
|soureColor|string||Yes|
|options|0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6|variant|No|
|options|boolean|isDark|No|
|options|-1.0 \| 0 \| 0.5 \| 1.0|contrastLevel|No|
|options|Array\<number>|cl|No|

```javascript
MaterialPaletteGenerator.GenerateByVariant('#123456');

MaterialPaletteGenerator.GenerateByVariant('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
});

MaterialPaletteGenerator.GenerateByVariant('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
  isDark: true,
  cl: [0, 50, 100]
});
```

#### GenerateByPalette()

|Param|Type|Option|Required|
|:--|:--|:--|--:|
|soureColor|string||Yes|
|options|0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6|variant|No|
|options|boolean|isDark|No|
|options|-1.0 \| 0 \| 0.5 \| 1.0|contrastLevel|No|
|options|string|primaryPalette|No|
|options|string|secondaryPalette|No|
|options|string|tertiaryPalette|No|
|options|string|neutralPalette|No|
|options|string|neutralVariantPalette|No|
|options|Array\<number>|cl|No|

```javascript
MaterialPaletteGenerator.GenerateByPalette('#123456');

MaterialPaletteGenerator.GenerateByPalette('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
});

MaterialPaletteGenerator.GenerateByPalette('#123456', {
  variant: EMaterialVariant.TONAL_SPOT,
  isDark: true,
  cl: [0, 30, 60, 90, 100],
  primaryPalette: '#654321'
});
```

#### value()

|Param|Type|Required|
|:--|:--|--:|
|||

```javascript
const s = MaterialPaletteGenerator.GenerateByVariant('#123456');

/**
 * @output
 * {
 *   primary: {
 *     P0: '#000000',
 *     P5: '#001225',
 *     ...
 *   },
 *   ...
 * }
 */
const tokens = s.value()

/**
 * @output
 * #00325a
 */
const p20 = tokens.primary.P20;
```

#### ToStyleText()

|Param|Type|Option|Required|
|:--|:--|:--|--:|
|options|string|prefix|No|

```javascript
const s = MaterialPaletteGenerator.GenerateByVariant('#123456');

/**
 * @output
 * --md-sys-palette-p-0: #000000;--md-sys-palette-p-5: #001225; ...
 */
const style1 = s.ToStyleText()

/**
 * @output
 * --my-loved-p-0: #000000;--my-loved-p-5: #001225;--my-loved-p-10: #001c37; ...
 */
const style2 = s.ToStyleText({
    prefix: 'my-loved'
})
```
