var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonChunks = require('copy-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var PROD = (process.env.NODE_ENV === 'production')

var plugins = [
    new ExtractTextPlugin({
      filename: "vts-browser.css"
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
    'vts-core': __dirname + '/src/core/index.js',
    'vts-browser': __dirname + '/src/browser/index.js'
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/build/',
    filename: '[name].js',
    libraryTarget: "var",
    library: "vts"
  },
  module: {
    loaders: [
    {
        include: [path.resolve(__dirname, "src/")],

//        test: /\.(js|jsx)$/,
        //loader: "babel-loader",

//        query: {
//  "presents": ["es2015"],
//  "plugins": ["babel-plugin-add-module-exports"]
  //      }

        //loaders: [
        //{
         // loader: 'babel-loader',

      //query: {
//        presets: [
    //      'es2015'
  //      ],
        //plugins: []
    //}          
         // options: { presets: ['es2015'] }
        //}
       // ]
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
