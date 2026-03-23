import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import camelCase from 'lodash.camelcase'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json' with { type: 'json' }

const libraryName = 'redux-saga-loop-utils'

export default {
  input: `src/${libraryName}.ts`,
  output: [
    {
      file: pkg.main,
      name: camelCase(libraryName),
      format: 'umd',
      sourcemap: true,
      globals: {
        'redux-saga/effects': 'ReduxSagaEffects'
      }
    },
    { file: pkg.module, format: 'es', sourcemap: true }
  ],
  external: ['redux-saga/effects'],
  watch: {
    include: 'src/**'
  },
  plugins: [json(), typescript({ useTsconfigDeclarationDir: true }), commonjs(), resolve()]
}
