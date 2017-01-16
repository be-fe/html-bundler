#!/usr/bin/env node
var commander = require('commander');
var htmlBundler = require('../src/index.js');
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
        }
        if (!fs.existsSync(REAL_WEBPACK_CONFIG) && webpack) {
            fs.copySync(DEFAULT_WEBPACK_CONFIG, REAL_WEBPACK_CONFIG);
        }

    })
/*
 * 直接创建一个测试项目
 */
commander.command('create [project]')
    .description('create a empty project')
    .action(function(project) {
        fs.copySync(DEFAULT_STRUCTURE, path.join(currentPath, project));
        fs.copySync(DEFAULT_CONFIG, path.join(currentPath, project, './html-bundler.config.js'));
        fs.copySync(DEFAULT_WEBPACK_CONFIG, path.join(currentPath, project, './webpack.config.js'));
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

commander.parse(process.argv);