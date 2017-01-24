var currentPath = process.cwd();
var path = require('path');

module.exports = function(absolutePath, ignoreArr) {
    if (!ignoreArr) {
        var ignoreArr = [];
    }

    checkArr = [];

    for (var i = 0; i < ignoreArr.length; i++) {
        checkArr.push(path.join(currentPath, ignoreArr[i]));
    }

    for (var i = 0; i < checkArr.length; i++) {
        if (absolutePath.match(checkArr[i])) {
            return true
        }
    }

    return false;
}