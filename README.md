# material-tokens-generator

This warehouse uses the [@material/material-color-utilities](https://github.com/material-foundation/material-color-utilities) open source warehouse to convert the results generated by @material/material-color-utilities into CSS styles.

+ ESM Supported
+ CommonJs Supported
+ Typescript Supported

## Usage

For example: 

```javascript
import { MaterialTokenGenerator, MaterialSchemaGenerator } from '@glare-labs/material-tokens-generator';

const tokens = MaterialTokenGenerator.GenerateBySourceColor('rgba(111,12,133, 0.2)')
const styleText = MaterialTokenGenerator.ToStyleText(
    tokens,
    {
        prefix: 'my-prefix'
    }
);

/**
 * @output
 * {
 *   primaryPaletteKeyColor: '#ad50c0',
 *   secondaryPaletteKeyColor: '#936998',
 *   ...
 *   onTertiaryFixed: '#3e001d',
 *   onTertiaryFixedVariant: '#89114a'
 * }
 */
console.log(tokens);

/**
 * @output
 * --my-prefix-primary-palette-key-color: #ad50c0;
 * --my-prefix-secondary-palette-key-color: #936998;
 * ...
 * --my-prefix-on-tertiary-fixed: #3e001d;
 * --my-prefix-on-tertiary-fixed-variant: #89114a;
 */
console.log(styleText);
```
If you are using **ESM**, you can try the introduction part of the following code:
```javascript
import { MaterialTokenGenerator, MaterialSchemaGenerator } from '@glare-labs/material-tokens-generator';
```

Or: 
```javascript
import { MaterialTokenGenerator, MaterialSchemaGenerator } from '@glare-labs/material-tokens-generator/build/index.esm';
```


If you are using **CommonJs**, you can try the introduction part of the following code:
```javascript
const { MaterialTokenGenerator, MaterialSchemaGenerator } = require('@glare-labs/material-tokens-generator');
```

Or: 
```javascript
const { MaterialTokenGenerator, MaterialSchemaGenerator } = require('@glare-labs/material-tokens-generator/build/index.cjs');
```