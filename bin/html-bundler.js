#!/usr/bin/env node
var commander = require('commander');
var htmlBundler = require('../src/index.js');
var logger = require('../src/utils/logger.js');
var process = require('process');
var fs = require('fs-extra');
var path = require('path');
var version = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')).version;
var currentPath = process.cwd();

const DEFAULT_CONFIG = path.join(__dirname, '../src/config.example.js');
const REAL_CONFIG = path.join(currentPath, './html-bundler.config.js');
const DEFAULT_WEBPACK_CONFIG = path.join(__dirname, '../src/webpack.config.example.js');
const REAL_WEBPACK_CONFIG = path.join(currentPath, './webpack.config.js');
const DEFAULT_STRUCTURE = path.join(__dirname, '../src/structure');


/*
 * 如果不存在则创建html-bundler.config.js和webpack.config.js, 根据自己项目进行修改
 */
commander.version(version)


commander.command('init')
    .description('if your project rootpath has not `html-bundler.config.js` & `webpack.config.js`, this command will create these files')
    .option('-w --webpack')
    .action(function(webpack) {
        if (!fs.existsSync(REAL_CONFIG)) {
            fs.copySync(DEFAULT_CONFIG, REAL_CONFIG);
            logger.info('html-bundler配置文件创建成功, 请根据项目情况进行配置');
        }
        if (!fs.existsSync(REAL_WEBPACK_CONFIG) && webpack.webpack) {
            fs.copySync(DEFAULT_WEBPACK_CONFIG, REAL_WEBPACK_CONFIG);
            logger.info('webpack配置文件创建成功, 请根据项目情况进行修改并安装依赖');
        }

    })
/*
 * 直接创建一个测试项目
 */
commander.command('create [project]')
    .description('create a empty project')
    .option('-w --webpack')
    .action(function(project, webpack) {
        fs.copySync(DEFAULT_STRUCTURE, path.join(currentPath, project));
        fs.copySync(DEFAULT_CONFIG, path.join(currentPath, project, './html-bundler.config.js'));
        logger.notice('项目' + project + '创建成功');
        if (webpack.webpack) {
            fs.copySync(DEFAULT_WEBPACK_CONFIG, path.join(currentPath, project, './webpack.config.js'));
            logger.info('webpack配置文件创建成功, 请根据项目情况进行修改并安装依赖');
        }
    })

/*
 * 开发环境
 */
commander.command('dev')
    .description('dev')
    .option('-p --port <port>')
    .action(function(port) {
        htmlBundler('dev', port.port);
    })

/*
 * 生产环境打包
 */
commander.command('dest')
    .description('dest')
    .action(function() {
        htmlBundler('dest');
    })

/*
 * QA环境打包
 */
commander.command('qa')
    .description('qa')
    .action(function() {
        htmlBundler('qa');
    })

/*
 * RD环境打包
 */
commander.command('rd')
    .description('rd')
    .action(function() {
        htmlBundler('rd');
    })

commander.parse(process.argv);