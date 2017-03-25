var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;


var libraryName = 'melown_core';
var outputFile = libraryName + '.js';
var plugins = [], outFile;

if (env == 'library') {
  plugins.push(new UglifyJsPlugin({minimize: true}));
  outFile = libraryName + '.min.js';
} else {
  outFile = libraryName + '.js';
}


var config = {
  entry: __dirname + '/demos/core/basic/demo.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/build/demos/core/basic/',
    filename: 'basic-' + outFile,
    library: libraryName
  },
  module: {
    loaders: [
    {
        include: [path.resolve(__dirname, "src/core/")]
    }
    ]
  },
  resolve: {
    modules : ['./node_modules/', './src/'],
    alias: {
      core: path.resolve(__dirname, 'src/core/')
    }

  },
  plugins: [
    new CopyWebpackPlugin([
        { from: 'libs', to: '../../../libs', toType: 'dir'}
    ])
  ]
};

module.exports = config;
