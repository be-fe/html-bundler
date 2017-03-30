var gulp = require('gulp');
var gulpif = require('gulp-if');
var path = require('path');

var handleImage = function(imgArr, conf, filename, env) {
    //暂不处理
    // var stream = gulp.src(imgArr)
    // if (conf.custom && conf.custom.imgs && conf.custom.imgs.length) {
    //     conf.custom.imgs.forEach(function (task) {
    //         stream = stream.pipe(task.func(task.opts));
    //     });
    // }
}

module.exports = handleImage;