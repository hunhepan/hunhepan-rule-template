import { defineConfig, RolldownOptions } from 'rolldown';
import * as path from 'path';
import nodePolyfills from '@rolldown/plugin-node-polyfills';
import copyJson from './plugins/copyJson.js';
import createJson from './plugins/createJson.js';

const resolve = (p: string) => {
  return path.resolve(__dirname, p);
};

const input = {};
const srcDir = './src';
const fs = require('fs');

fs.readdirSync(srcDir).forEach((file: string) => {
  if (path.extname(file) === '.js') {
    input[path.join(srcDir, file)] = file;
  }
});

console.log('🚀 ~ input:', input);

export default defineConfig(
  Object.keys(input).map((key) => ({
    input: resolve(key),
    output: {
      // minify: true,
      polyfillRequire: true,
      format: 'es',
      file: `dist/${input[key]}`,
    },
    plugins: [nodePolyfills(), copyJson(), createJson()],
  })) as RolldownOptions
);
