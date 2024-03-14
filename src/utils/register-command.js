const { program } = require('commander');
const { implementCreateCmd } = require('../command/create.js');
const packageInfo = require('../../package.json');
const { cmdDescColor, cmdColor } = require('./index.js');

/**
 * 创建项目命令
 * @param {object} program
 */
const registerCreateCmd = program => {
  program
    .command('create')
    .description(cmdDescColor('创建项目'))
    .option('-n, --name <project_name>', cmdDescColor('项目名称'))
    .option('-f, --force', cmdDescColor('强制创建项目，如果项目已存在则会被覆盖'))
    .helpOption(false)
    .action(options => {
      implementCreateCmd(options);
    });
};

/**
 * 命令注册
 * @param {object} program
 */
const registerCommand = () => {
  // 设置版本号
  program
    .name(packageInfo.name)
    .usage(cmdColor('[command]'))
    .helpOption(false)
    .helpCommand('help [command]', cmdDescColor('查看帮助'))
    .version(packageInfo.version, '-v, --version', cmdDescColor('查看版本号'));

  registerCreateCmd(program);
  // 解析命令行参数
  program.parse(process.argv);
};

module.exports = {
  registerCommand,
};
