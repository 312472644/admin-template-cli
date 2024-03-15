#!/usr/bin/env node
const fs = require('fs');

(() => {
  // 判断是否是生产环境 通过判断是否存在 lib 文件夹
  const isProduction = fs.existsSync(__dirname.replace('bin', 'lib'));
  if (isProduction) {
    require('../lib/index.js');
  } else {
    require('../src/index.js');
  }
})();
