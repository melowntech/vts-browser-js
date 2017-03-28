var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonChunks = require('copy-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;


var libraryName = 'bundle';
var outputFile = libraryName + '.js';
var outFile = libraryName + '.js';


var config = {
  entry: {
    'core-basic': __dirname + '/demos/core-basic/demo.js',
    'core-hit-surface': __dirname + '/demos/core-hit-surface/demo.js',
    'core-lines-and-images': __dirname + '/demos/core-lines-and-images/demo.js',
    'core-meshes': __dirname + '/demos/core-meshes/demo.js',
    'core-meshes-hit-test': __dirname + '/demos/core-meshes-hit-test/demo.js',
    'browser-basic': __dirname + '/demos/browser-basic/demo.js',
    'browser-flights': __dirname + '/demos/browser-flights/demo.js',
    'browser-hit-surface': __dirname + '/demos/browser-hit-surface/demo.js',
    'browser-lines-and-images': __dirname + '/demos/browser-lines-and-images/demo.js',
    'browser-meshes': __dirname + '/demos/browser-meshes/demo.js',
    'browser-meshes-hit-test': __dirname + '/demos/browser-meshes-hit-test/demo.js',
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/build/demos/',
    filename: '[name]/' + outFile,
    library: libraryName
  },
  module: {
    loaders: [
    {
        include: [path.resolve(__dirname, "src/")]
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
  plugins: [
    /*new UglifyJsPlugin({
      compress: true,
      mangle: true,
      sourceMap: true,
      extractComments: {},
    }), */
    new webpack.ProvidePlugin({
      /*"Melown": "Melown"*/
    }),
    new CopyWebpackPlugin([
        { from: 'libs', to: __dirname + '/build/libs', toType: 'dir'},
        { from: 'demos/images', to: __dirname + '/build/images', toType: 'dir'},
        { from: 'demos/core-basic/index.html', to: __dirname + '/build/demos/core-basic/', toType: 'dir'},
        { from: 'demos/core-hit-surface/index.html', to: __dirname + '/build/demos/core-hit-surface/', toType: 'dir'},
        { from: 'demos/core-lines-and-images/index.html', to: __dirname + '/build/demos/core-lines-and-images/', toType: 'dir'},
        { from: 'demos/core-meshes/index.html', to: __dirname + '/build/demos/core-meshes/', toType: 'dir'},
        { from: 'demos/core-meshes-hit-test/index.html', to: __dirname + '/build/demos/core-meshes-hit-test/', toType: 'dir'},
        { from: 'demos/browser-basic/index.html', to: __dirname + '/build/demos/browser-basic/', toType: 'dir'},
        { from: 'demos/browser-flights/index.html', to: __dirname + '/build/demos/browser-flights/', toType: 'dir'},
        { from: 'demos/browser-hit-surface/index.html', to: __dirname + '/build/demos/browser-hit-surface/', toType: 'dir'},
        { from: 'demos/browser-lines-and-images/index.html', to: __dirname + '/build/demos/browser-lines-and-images/', toType: 'dir'},
        { from: 'demos/browser-meshes/index.html', to: __dirname + '/build/demos/browser-meshes/', toType: 'dir'},
        { from: 'demos/browser-meshes-hit-test/index.html', to: __dirname + '/build/demos/browser-meshes-hit-test/', toType: 'dir'}

    ]),
    new webpack.optimize.CommonsChunkPlugin({
        'name': 'core',
        chunks: [
          'core-demo',
          'core-hit-surface',
          'core-lines-and-images',
          'core-meshes',
          'core-meshes-hit-test'
        ],
        filename: 'melown-core.js' // Name of the output file
    }),
    new webpack.optimize.CommonsChunkPlugin({
        'name': 'browser',
        chunks: [
          'core-demo',
          'core-hit-surface',
          'core-lines-and-images',
          'core-meshes',
          'core-meshes-hit-test',
          'browser-demo',
          'browser-hit-surface',
          'browser-lines-and-images',
          'browser-meshes',
          'browser-meshes-hit-test'
        ],
        filename: 'melown-browser.js' // Name of the output file
    })
  ]
};

module.exports = config;
