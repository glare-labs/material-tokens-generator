import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

// rollup.config.mjs
export default {
  input: './src/index.ts',
  output: [
    {
      file: './build/index.cjs',
      format: 'cjs',
    },
    {
      file: './build/index.mjs',
      format: 'es',
    },
  ],
  plugins: [nodeResolve(), typescript({tsconfig: './tsconfig.json'}), terser()],
};
