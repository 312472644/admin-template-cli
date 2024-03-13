const Inquirer = require('inquirer');

/**
 * 输入项目名称
 * @returns {Promise<{projectName:string}>}
 */
const inputProNameQuestion = () => {
  return new Inquirer.prompt({
    type: 'input',
    name: 'projectName',
    message: '请输入项目名称',
    validate: function (val) {
      if (val) {
        return true;
      }
      return logError('请输入项目名称');
    },
  });
};

/**
 * 代码规则配置
 * @returns {Promise<{config:['Eslint'|'Husky'|'Stylelint']}>}
 */
const ruleConfigQuestion = () => {
  return new Inquirer.prompt([
    {
      name: 'config',
      type: 'checkbox',
      message: '选择配置项',
      choices: [
        { name: 'Eslint', checked: true },
        { name: 'Husky', checked: true },
        { name: 'Stylelint' },
      ],
    },
  ]);
};

/**
 * 是否覆盖已有项目
 * @returns {Promise<{isOverwrite:boolean}>}
 */
const delProjectQuestion = () => {
  return new Inquirer.prompt([
    {
      name: 'isOverwrite',
      type: 'list',
      message: '项目已存在，是否覆盖？',
      choices: [
        { name: '确认', value: true },
        { name: '取消', value: false },
      ],
    },
  ]);
};

/**
 * 安装依赖
 * @returns {Promise<{install:boolean}>}
 */
const installQuestion = () => {
  return new Inquirer.prompt([
    {
      name: 'install',
      type: 'list',
      message: '是否安装依赖？',
      choices: [
        { name: '是', value: true },
        { name: '否', value: false },
      ],
    },
  ]);
};

module.exports = {
  inputProNameQuestion,
  ruleConfigQuestion,
  delProjectQuestion,
  installQuestion,
};
