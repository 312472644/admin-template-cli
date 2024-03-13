const Chalk = require('chalk');
const Symbols = require('log-symbols');
const Figlet = require('figlet');
const Ora = require('ora');
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

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
  const { message, type, showSymbol = true, color } = config;
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
  console.log('\r\n' + Figlet.textSync('Grace', mergeConfig) + '\r\n');
}

/**
 * loading
 * @param {string} text
 * @param {*} color
 * @returns {object} Ora对象
 */
function loading(text, color = '#19be6b') {
  return Ora({ text: `${Chalk.hex(color)(text)}`, spinner: 'dots4', indent: 1 });
}

/**
 * 停止loading
 * @param {object} ora Ora对象
 * @param {'Success'|'Fail'} type 类型
 * @param {string} text 文案说明
 */
function loadingStop(ora, text, type = 'Success') {
  const symbol = type === 'Success' ? Symbols.success : Symbols.error;
  const color = type === 'Success' ? '#19be6b' : '#ed4014';
  ora.stopAndPersist({
    symbol,
    text: Chalk.hex(color)(text),
  });
}

/**
 * 删除对象中的指定key
 * @param {object} obj
 * @param {string} keys
 */
function deleteObjKey(obj, keys) {
  if (!obj) return null;
  Object.keys(obj).forEach(key => {
    if (keys.includes(key)) {
      delete obj[key];
    }
  });
}

/**
 * 删除文件或文件夹
 * @param {string} targetFilePath 要删除哦文件路径
 * @param {string} rootPath 根路径
 * @returns
 */
function deleteFileOrFolder(targetFilePath, rootPath = process.cwd()) {
  const removePath = path.resolve(rootPath, targetFilePath);
  if (!fs.existsSync(removePath)) return;
  fs.rmSync(removePath, { recursive: true });
}

/**
 * 函数延迟执行
 * @param {Function} fn 要执行的函数
 * @param {number} [time=1000] 延迟时间
 * @returns
 */
function sleep(fn, time = 1000) {
  return new Promise(resolve => {
    setTimeout(() => {
      fn && fn();
      resolve();
    }, time);
  });
}

/**
 * 执行shell命令
 * @param {string} cmd
 * @returns {Promise}
 */
function execShellCmd(cmd) {
  if (!cmd) return;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject({
          success: false,
          message: error,
        });
      }
      resolve({
        success: true,
        message: stdout,
      });
    });
  });
}

module.exports = {
  isDev,
  logSuccess,
  logError,
  logInfo,
  logWarning,
  figletLog,
  loading,
  loadingStop,
  deleteObjKey,
  deleteFileOrFolder,
  sleep,
  execShellCmd,
};
