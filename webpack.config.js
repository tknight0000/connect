const path = require('path');

module.exports = {
    entry: './dist/working/connect.js',
    module: { },
    output: {
        filename: 'connect.js',
        publicPath: ''
    },
    stats: 'errors-only'
};