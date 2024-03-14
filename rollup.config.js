const { babel } = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');
const commonjs = require('@rollup/plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const clear = require('rollup-plugin-clear');

const { isDev, flatFolderPath } = require('./src/utils');

module.exports = {
  input: flatFolderPath('./src'),
  output: {
    dir: 'lib',
    entryFileNames: '[name].js',
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
