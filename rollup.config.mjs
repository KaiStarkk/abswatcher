import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'lib/index.mjs',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [json(), commonjs(), nodeResolve()]
};