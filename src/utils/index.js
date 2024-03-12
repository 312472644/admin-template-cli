const Chalk = require('chalk');
const Symbols = require('log-symbols');
const figlet = require('figlet');

// 是否是开发环境
const isDev = process.env.NODE_ENV === 'development';

/**
 * 打印日志
 * @param {object} config
 * @param {string} config.message 消息
 * @param {string} config.type 类型
 * @param {boolean} config.showSymbol 是否显示符号
 * @param {string} config.color 颜色
 */
function log(config = { message, type, showSymbol, color }) {
  const { message, type, showSymbol = true, color = '#515a6e' } = config;
  if (!message) return;
  if (showSymbol) {
    console.log(Symbols[type], Chalk.hex(color)(message));
    return;
  }
  console.log(Chalk.hex(color)(message));
}

/**
 * 打印成功信息
 * @param {string} message
 */
function logSuccess(message, showSymbol = true) {
  log({ message, type: 'success', showSymbol, color: '#19be6b' });
}

/**
 * 打印错误信息
 * @param {string} message
 */
function logError(message, showSymbol = true) {
  log({ message, type: 'error', color: '#ed4014', showSymbol });
}

/**
 * 打印提示信息
 * @param {string} message
 */
function logInfo(message, showSymbol = true) {
  log({ message, type: 'info', color: '#515a6e', showSymbol });
}

/**
 * 打印警告信息
 * @param {string} message
 */
function logWarning(message, showSymbol = true) {
  log({ message, type: 'warning', color: '#ff9900', showSymbol });
}

/**
 * 艺术字打印
 * @param {*} config
 */
function figletLog(config) {
  const mergeConfig = Object.assign(
    {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    },
    config
  );
  // 打印欢迎信息
  console.log('\r\n' + figlet.textSync('Grace', mergeConfig) + '\r\n');
}

module.exports = {
  isDev,
  logSuccess,
  logError,
  logInfo,
  logWarning,
  figletLog,
};
