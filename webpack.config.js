var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonChunks = require('copy-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var LicenseWebpackPlugin = require('license-webpack-plugin');
var fs = require("fs");


var PROD = (process.env.NODE_ENV === 'production')
var TARGET_DIR = PROD ? __dirname + "/dist/" : __dirname + "/build/";

var plugins = [
    new ExtractTextPlugin({
      filename: 'vts-browser' + (PROD ? '.min' : '') + '.css'
    }),
    new LicenseWebpackPlugin({pattern: /^(MIT|ISC|BSD.*)$/}),
    new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8'))
];

if (PROD) {
    plugins.unshift(new UglifyJsPlugin({
      compress: true,
      mangle: true,
      extractComments: {},
    }));
}


var config = {
  entry: {
    'vts-core': __dirname + '/src/core/index.js',
    'vts-browser': __dirname + '/src/browser/index.js'
  },
  devtool: 'source-map',
  output: {
    path: TARGET_DIR,
    filename: '[name]' + (PROD ? '.min' : '') + '.js',
    libraryTarget: "var",
    library: "vts"
  },
  module: {
    loaders: [
    {
        include: [path.resolve(__dirname, "src/")]
    },
    {
      test: /\.css$/, loader: ExtractTextPlugin.extract({fallback: "style-loader", use: "css-loader"})
    },
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
