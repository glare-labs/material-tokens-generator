import { defineConfig } from 'rolldown'

export default defineConfig({
    input: {
        'index'                              : './src/index.ts',
        'core/index'                         : './src/core/index.ts',
        'core/theme'                         : './src/core/theme.ts',
        'core/palette'                       : './src/core/palette.ts',
        'core/tokens'                        : './src/core/tokens.ts',
        'types/index'                        : './src/types/index.ts',
        'utils/index'                        : './src/utils/index.ts',
        'utils/string'                       : './src/utils/string.ts',
        'utils/color'                        : './src/utils/color.ts',
        'formatters/index'                   : './src/formatters/index.ts',
        'formatters/color-format'            : './src/formatters/color-format.ts',
        'serializers/index'                  : './src/serializers/index.ts',
        'serializers/css.serializer'         : './src/serializers/css.serializer.ts',
    },
    output: {
        format        : 'esm',
        dir           : 'build',
        entryFileNames: '[name].js',
        minify        : true,
        sourcemap     : true,
        cleanDir      : true,
    },
    external: ['@material/material-color-utilities'],
})
