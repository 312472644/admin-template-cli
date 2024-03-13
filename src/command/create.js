const fs = require('node:fs');
const path = require('node:path');
const {
  logError,
  loadingStop,
  loading,
  sleep,
  execShellCmd,
  deleteObjKey,
  deleteFileOrFolder,
  logInfo,
} = require('../utils/index.js');
const {
  inputProNameQuestion,
  ruleConfigQuestion,
  delProjectQuestion,
  installQuestion,
} = require('./create-question.js');

const spinner = loading();
/**
 * 创建项目文件夹
 * @param {object} config 项目名称
 * @returns
 */
const createProjectFolder = async config => {
  const { projectName, force } = config;
  let success = true;
  try {
    // 如果项目已经存在,并且不是强制创建
    if (fs.existsSync(projectName)) {
      if (force) {
        fs.rmSync(projectName, { recursive: true });
      } else {
        const isDelete = await delProjectQuestion();
        if (!isDelete.isOverwrite) {
          logError('取消创建');
          return;
        }
        fs.rmSync(projectName, { recursive: true });
      }
    }
  } catch (error) {
    logError('错误信息：' + error.message);
    // throw new Error(`${Chalk.hex('#ed4014')('错误信息：' + error.message)}`);
    success = false;
  } finally {
    return success;
  }
};

/**
 * 克隆项目
 * @param {string} giteeUrl
 * @param {string} projectName
 * @returns
 */
const cloneRepo = async (giteeUrl, projectName) => {
  let success = true;
  try {
    spinner.start('项目拉取中...');
    const { success, message } = await execShellCmd(giteeUrl);
    if (!success) {
      loadingStop(spinner, `项目下载失败：${message}`, 'Fail');
      return;
    }
    // 重命名文件夹(以项目名称)删除.git文件夹
    fs.renameSync('backend-management-template', projectName);
    fs.rmSync(`${projectName}/.git`, { recursive: true });
    loadingStop(spinner, `项目拉取成功`, 'Success');
  } catch (error) {
    loadingStop(spinner, `项目拉取失败：${error.message}`, 'Fail');
    success = false;
  } finally {
    return success;
  }
};

/**
 * 初始化项目
 * @param {object} config
 */
const initProject = async config => {
  await sleep(async () => {
    spinner.start('项目初始化中...');
    generateProject(config);
  }, 500);
  await sleep(() => {
    loadingStop(spinner, '项目初始化完成', 'Success');
  }, 3000);
  // 安装依赖
  await installDependence(config.projectName);
};

/**
 * 从gitee中克隆项目
 * @param {object} options
 * @param {string} options.url 项目地址
 * @param {object} options.config 项目配置
 * @param {string} options.config.projectName 项目名称
 */
const downloadRepo = async (
  options = {
    url: '',
    config: {},
  }
) => {
  const { url, config } = options;
  const { projectName } = config;

  // 创建项目文件夹
  const createSuccess = await createProjectFolder(config);
  if (!createSuccess) return;
  // 拉取项目
  const isCloneSuccess = await cloneRepo(url, projectName);
  if (!isCloneSuccess) return;
  // 初始化项目
  await initProject(config);
};

/**
 * 依赖安装
 * @param {string} projectName
 */
const installDependence = async projectName => {
  const result = await installQuestion();
  if (result.install) {
    spinner.start('依赖安装中...');
    const cmd = `cd ${projectName} && npm install`;
    try {
      await execShellCmd(cmd);
      loadingStop(spinner, `依赖安装成功`, 'Success');
    } catch (error) {
      loadingStop(spinner, `安装依赖失败，${error.message}`, 'Fail');
    }
  } else {
    logInfo('请手动安装依赖');
  }
};

/**
 * 重写package.json
 * @param {object} options
 */
const rewritePackageJson = options => {
  const { projectName, ruleConfig } = options;
  // 读取package.json
  const packageJsonPath = path.resolve(process.cwd(), projectName + '/package.json');
  const packageJson = require(packageJsonPath);
  const devDependencies = packageJson.devDependencies;

  // 删除husky、lint-staged、prepare、lint-staged
  if (!ruleConfig.includes('Husky')) {
    delete packageJson['lint-staged'];
    delete packageJson.scripts.prepare;
    deleteObjKey(devDependencies, ['husky', 'lint-staged']);
    // 删除.husky
    deleteFileOrFolder(projectName + '/.husky');
  }

  // 删除stylelint
  if (!ruleConfig.includes('Stylelint')) {
    delete packageJson.scripts['lint:stylelint'];
    deleteObjKey(devDependencies, [
      'stylelint',
      'stylelint-config-standard',
      'stylelint-config-standard-scss',
      'stylelint-config-standard-vue',
      'stylelint-order',
      'stylelint-scss',
    ]);
    deleteFileOrFolder(projectName + '/.stylelintrc');
  }

  if (!ruleConfig.includes('Eslint')) {
    // 删除eslint
    delete packageJson.scripts['lint'];
    deleteObjKey(devDependencies, ['eslint', 'eslint-plugin-vue', 'vue-eslint-parser']);

    // 删除.eslintrc.js
    deleteFileOrFolder(projectName + '/.eslintrc.js');
  }

  // 重写package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

/**
 * 重写package.json
 * @param {object} config
 */
const generateProject = config => {
  // console.log('config', config);
  rewritePackageJson(config);
};

/**
 * 命令实现
 * @param {object} options
 * @param {string} options.name 项目名称
 * @param {boolean} options.force 是否强制创建项目
 */
const implementCreateCmd = async options => {
  const { force } = options;
  const config = {
    projectName: null,
    force,
  };
  const projectName = options.name || (await inputProNameQuestion()).projectName;
  const ruleConfig = (await ruleConfigQuestion()).config || [];

  config.projectName = projectName;
  config.ruleConfig = ruleConfig;

  downloadRepo({
    url: 'git clone https://gitee.com/flaw_du/backend-management-template.git',
    config,
  });
};

module.exports = { implementCreateCmd };
