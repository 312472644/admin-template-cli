const fs = require('fs');
const path = require('node:path');
const {
  loadingStop,
  loading,
  sleep,
  execShellCmd,
  deleteObjKey,
  deleteFileOrFolder,
  setTextColor,
  execAsyncShellCmd,
} = require('../utils/index.js');
const {
  inputProNameQuestion,
  ruleConfigQuestion,
  delProjectQuestion,
  installQuestion,
  isRunQuestion,
} = require('./create-question.js');

const spinner = loading();

/**
 * 删除重复项目文件夹
 * @param {string} projectName
 */
const deleteProjectFolder = projectName => {
  spinner.start(setTextColor()('项目环境准备中...'));
  fs.rmSync(projectName, { recursive: true });
  spinner.stop();
};

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
        deleteProjectFolder(projectName);
      } else {
        const isDelete = await delProjectQuestion();
        if (!isDelete.isOverwrite) {
          success = false;
          return success;
        }
        deleteProjectFolder(projectName);
      }
    }
  } catch (error) {
    loadingStop(
      spinner,
      `创建项目失败，可能${projectName}文件夹被占用，请关闭相关程序后重试`,
      'Fail'
    );
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
    spinner.start(setTextColor()('项目拉取中...'));
    const { success, message } = await execShellCmd(giteeUrl);
    if (!success) {
      loadingStop(spinner, `项目下载失败：${message}`, 'Fail');
      return;
    }
    // 删除.git文件夹
    // fs.renameSync('backend-management-template', projectName);
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
    spinner.start(setTextColor()('项目初始化中...'));
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
    config: {
      projectName: null,
    },
  }
) => {
  const { url, config } = options;
  const { projectName } = config;

  // 创建项目文件夹
  let createSuccess = await createProjectFolder(config);
  if (!createSuccess) return;
  // 拉取项目
  const isCloneSuccess = await cloneRepo(`${url} ${projectName}`, projectName);
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
    spinner.start(setTextColor()('依赖安装中，请耐心等待...'));
    const cmd = `cd ${projectName} && pnpm i`;
    try {
      await execShellCmd(cmd);
      loadingStop(spinner, `依赖安装成功`, 'Success');
      runProject(projectName);
    } catch (error) {
      loadingStop(spinner, `安装依赖失败，${error.message}`, 'Fail');
    }
  }
};

/**
 * 启动项目
 * @param {string} projectName
 */
const runProject = async projectName => {
  const { isRun } = await isRunQuestion();
  if (isRun) {
    const cmd = `cd ${projectName} && pnpm run dev`;
    execAsyncShellCmd(cmd, data => {
      console.log(data);
    });
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

  // 删除eslint
  if (!ruleConfig.includes('Eslint')) {
    delete packageJson.scripts['lint'];
    packageJson.scripts['build'] = 'vite build';
    deleteObjKey(devDependencies, ['eslint', 'eslint-plugin-vue', 'vue-eslint-parser']);

    // 删除.eslintrc.js
    deleteFileOrFolder(projectName + '/.eslintrc.js');
  }

  // 重写package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

/**
 * 删除eslint plugin
 * @param {string} projectName
 */
const deleteEslintPlugin = projectName => {
  const filePath = path.resolve(process.cwd(), projectName + '/vite/plugins/index.js');
  let file = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  });
  // 删除eslint plugin 引用
  file = file
    .replace(`import eslintPlugin from 'vite-plugin-eslint';\r\n`, '')
    .replace(`// eslint\r\n`, '')
    .replace(`vitePlugins.push(eslintPlugin({ include: ['./src/**/*.{vue,js,ts}'] }));\r\n`, '');

  fs.writeFileSync(filePath, file);
};

/**
 * 重写package.json
 * @param {object} config
 */
const generateProject = config => {
  rewritePackageJson(config);
  const choiceList = config.ruleConfig || [];
  if (!choiceList.includes('Eslint')) {
    deleteEslintPlugin(config.projectName);
  }
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
    ruleConfig: [],
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
