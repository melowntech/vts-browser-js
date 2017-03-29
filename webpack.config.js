var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonChunks = require('copy-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var PROD = (process.env.NODE_ENV === 'production')

var plugins = [
    new ExtractTextPlugin({
      filename: "melown-browser.css"
    })
];

if (PROD) {
    plugins.push(new UglifyJsPlugin({
      compress: true,
      mangle: true,
      extractComments: {},
    }));
}


var libraryName = 'bundle';
var outputFile = libraryName + '.js';
var outFile = libraryName + '.js';


var config = {
  entry: {
    'melown-core': __dirname + '/src/core/index.js',
    'melown-browser': __dirname + '/src/browser/index.js'
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/build/',
    filename: '[name].js',
  },
  module: {
    loaders: [
    {
        include: [path.resolve(__dirname, "src/")]
    },
    {
      test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader"})
    }
    ]
  },
  resolve: {
    modules : ['./node_modules/', './src/'],
    alias: {
      core: path.resolve(__dirname, 'src/core/'),
      browser: path.resolve(__dirname, 'src/browser/')
    }
  },
  devServer: {
    inline: true
  },
  plugins: plugins
};

module.exports = config;
