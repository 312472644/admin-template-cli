const { registerCommand } = require('./utils/register-command.js');
const { figletLog } = require('./utils/index.js');

// 打印欢迎信息
figletLog();
// 注册命令
registerCommand();
