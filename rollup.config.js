const { babel } = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const copy = require('rollup-plugin-copy');
const clear = require('rollup-plugin-clear');

const { isDev } = require('./src/utils');

module.exports = {
  input: {
    'command/create': './src/command/create.js',
    'utils/index': './src/utils/index.js',
    'utils/register-command': './src/utils/register-command.js',
    index: './src/index.js',
  },
  output: {
    dir: 'lib',
    entryFileNames: '[name].js',
    // entryFileNames: function (chunkInfo) {
    //   const { facadeModuleId } = chunkInfo;
    //   if (facadeModuleId.includes('utils')) {
    //     return 'utils/[name].js';
    //   }
    //   return '[name].js';
    // },
    format: 'cjs',
  },
  plugins: [
    json(),
    // terser({
    //   compress: {
    //     drop_console: true,
    //   },
    // }),
    isDev
      ? [
          nodeResolve(),
          commonjs({
            include: 'node_modules/**',
          }),
        ]
      : '',
    babel({
      babelHelpers: 'runtime',
      exclude: ['node_modules/**'],
    }),
    clear({ targets: ['lib'] }),
  ],
};
