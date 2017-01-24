var colors = require('colors');
colors.setTheme({
    error: ['red', 'bold'],
    warn: ['yellow', 'bold'],
    info: ['green', 'bold'],
    log: ['white'],

});

module.exports = {
    error: function(msg) {
        console.error(msg.error);
    },

    info: function(msg) {
        console.info(msg.info);
    },

    warn: function(msg) {
        console.warn(msg.warn);
    },

    log: function(msg) {
        console.log(msg);
    },

    notice: function(msg, type) {
        var type = type || 'info';
        this[type]('***********' + msg + '***********');
    }

}
