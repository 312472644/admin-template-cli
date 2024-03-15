const fs = require('fs');
const path = require('path');
const { logError } = require('./src/utils/index.js');

const hasLibFolder = fs.existsSync(path.join(__dirname, 'lib'));
if (!hasLibFolder) {
  logError('lib文件夹不存在，请先执行npm run build命令生成lib文件夹\r\n');
  process.exit(1);
}
