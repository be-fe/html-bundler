var gulp = require('gulp');
var gulpif = require('gulp-if');
var path = require('path');

var handleImage = function(imgArr, conf, filename, env) {
    gulp.src(imgArr)
        // .pipe(gulpif(conf.inline, base64()))
        //.pipe(gulpif(conf.base64, base64()))

    gulp.src(conf.imgSrc)
        // .pipe(gulpif(conf.inline, base64()))
        .pipe(gulp.dest(path.join(conf.output, conf.imgFolder)))
}

module.exports = handleImage;