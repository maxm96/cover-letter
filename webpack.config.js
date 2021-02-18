const path = require('path')

module.exports = {
    entry: './src/components/cl-game.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
}