var logger = require('../utils/logger');
var network = require('../utils/network');
var bird = require('gulp-bird');
var connect = require('gulp-connect');
var is = require('is_js');
var path = require('path');
var currentPath = process.cwd();

module.exports = function(usage, config, port) {

    var port = port || '8008';
    network.port = port;

    if (usage === 'bird' && is.object(config.birdConfig)) {
        var birdconf = config.birdConfig;
        var server = {};
        var TranspondRules = {};
        server[port] = {
            basePath: path.join(currentPath, birdconf.basePath)
        };
        TranspondRules[port] = {
            targetServer: birdconf.targetServer,
            ajaxOnly: birdconf.ajaxOnly
        };
        bird.start(server, TranspondRules);
        logger.info('Bird server runing at port: ' + port + '.');
    }
    else if (usage && is.object(config.serverConfig)) {
        config.serverConfig.port = port;
        connect.server(config.serverConfig);
        logger.info('connect server runing at port: ' + port + '.');
    }
}
