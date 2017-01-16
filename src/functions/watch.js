var logger = require('../utils/logger.js');
var gulp = require('gulp');
/*
 * 分类进行监听，防止出现一个文件变化整个项目编译的情况
 */

module.exports = function(run, conf) {
    if (conf.watchFolder) {

        gulp.watch(conf.watchFolder.js, function() {
            logger.info('Your Javascript files have changed!!')
            run('js');
        });

        gulp.watch(conf.watchFolder.css, function() {
            logger.info('Your style files have changed!!')
            run('css');
        });

        gulp.watch(conf.watchFolder.image, function() {
            logger.info('Your Image files have changed!!')
            run('img');
        });

        gulp.watch(conf.watchFolder.html, function() {
            logger.info('Your HTML files have changed!!')
            run('any');
        });
    }
}