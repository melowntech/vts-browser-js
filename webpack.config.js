var path = require('path');
var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonChunks = require('copy-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var env = process.env.WEBPACK_ENV;


var libraryName = 'bundle';
var outputFile = libraryName + '.js';
var plugins = [], outFile;

if (env == 'library') {
  plugins.push(new UglifyJsPlugin({minimize: true}));
  outFile = libraryName + '.min.js';
} else {
  outFile = libraryName + '.js';
}


var config = {
  entry: {
    'basic': __dirname + '/demos/core/basic/demo.js',
    'hit-surface': __dirname + '/demos/core/hit-surface/demo.js',
    'lines-and-images': __dirname + '/demos/core/lines-and-images/demo.js',
    'meshes': __dirname + '/demos/core/meshes/demo.js',
    'meshes-hit-test': __dirname + '/demos/core/meshes-hit-test/demo.js',
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
  devServer: {
    inline: true
  },
  plugins: [
    new CopyWebpackPlugin([
        { from: 'libs', to: __dirname + '/build/libs', toType: 'dir'},
        { from: 'demos/core/images', to: __dirname + '/build/images', toType: 'dir'},
        { from: 'demos/core/basic/index.html', to: __dirname + '/build/demos/basic/', toType: 'dir'},
        { from: 'demos/core/hit-surface/index.html', to: __dirname + '/build/demos/hit-surface/', toType: 'dir'},
        { from: 'demos/core/lines-and-images/index.html', to: __dirname + '/build/demos/lines-and-images/', toType: 'dir'},
        { from: 'demos/core/meshes/index.html', to: __dirname + '/build/demos/meshes/', toType: 'dir'},
        { from: 'demos/core/meshes-hit-test/index.html', to: __dirname + '/build/demos/meshes-hit-test/', toType: 'dir'}
    ]),
    new webpack.optimize.CommonsChunkPlugin({
        'name': 'core',
        filename: 'melown-core.js' // Name of the output file
    })
  ]
};

module.exports = config;
