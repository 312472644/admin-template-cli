const { registerCommand } = require('./utils/register-command.js');
const { welcome } = require('./utils/index.js');

// 打印欢迎信息
welcome();
// 注册命令
registerCommand();
