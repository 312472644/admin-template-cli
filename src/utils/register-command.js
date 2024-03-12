const Chalk = require('chalk');
const { program } = require('commander');
const { implementCreateCmd } = require('../command/create.js');
const packageInfo = require('../../package.json');

/**
 * 创建项目命令
 * @param {*} program
 */
const registerCreateCmd = program => {
  program
    .usage('create')
    .command('create')
    .option('-n, --name <project_name>', '项目名称')
    .option('-f, --force', '强制创建项目，如果项目已存在则会被覆盖')
    .description('创建项目')
    .action(options => {
      implementCreateCmd(options);
    });
};

/**
 *
 * @param {*} program
 */
const watchHelpCmd = program => {
  // 设置未知命令的提示信息
  program.on('--help', function () {
    console.log();
    console.log(
      Chalk.hex('#515a6e')(
        `执行 ${Chalk.hex('#19be6b')('admin-template-cli <command> --help')} 查看命令的详细信息`
      )
    );
    console.log();
  });
};

/**
 * 命令注册
 * @param {object} program
 */
const registerCommand = () => {
  // 设置版本号
  program.name('admin-template-cli').version(packageInfo.version, '-v, --version', '查看版本号');

  registerCreateCmd(program);
  watchHelpCmd(program);

  // 解析命令行参数
  program.parse(process.argv);
};

module.exports = {
  registerCommand,
};
