const path = require('path')

module.exports = {
    entry: ['./src/components/cl-board.js', './src/components/cl-lobby.js'],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
}