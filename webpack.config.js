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
    new webpack.BannerPlugin(fs.readFileSync('./LICENSE', 'utf8')),
    new LicenseWebpackPlugin({pattern: /^(MIT|ISC|BSD.*)$/})
];

if (PROD) {
    plugins.push(new UglifyJsPlugin({
      //comments: true,
      compress: true,
      mangle: true,
      extractComments: {
        "banner": function(filename) {
          return "Copyright (c) 2017 Melown Technologies SE\n" +
                 " *  For terms of use, see accompanying " + filename +" file.\n" +
                 " *  For 3rd party libraries licenses, see 3rdpartylicenses.txt.\n"
        }
      },
    }));
}

plugins.push(
    new ExtractTextPlugin({
      filename: 'vts-browser' + (PROD ? '.min' : '') + '.css'
    }),
    new webpack.DefinePlugin({
      'VTS_MATERIAL_DEPTH':           1,
      'VTS_MATERIAL_FLAT':            2,
      'VTS_MATERIAL_FOG':             3,
      'VTS_MATERIAL_INTERNAL' :       4,
      'VTS_MATERIAL_INTERNAL_NOFOG':  5,
      'VTS_MATERIAL_EXTERNAL' :       6,
      'VTS_MATERIAL_EXTERNAL_NOFOG':  7,

      'VTS_DRAWCOMMAND_STATE' :       1,
      'VTS_DRAWCOMMAND_SUBMESH' :     2,
      'VTS_DRAWCOMMAND_GEODATA' :     3,

      'VTS_TEXTURECHECK_MEATATILE' :  1,
      'VTS_TEXTURECHECK_TYPE' :       2,
      'VTS_TEXTURECHECK_CODE' :       3,
      'VTS_TEXTURECHECK_SIZE' :       4,

      'VTS_JOB_FLAT_LINE' :           1,
      'VTS_JOB_FLAT_RLINE' :          2,
      'VTS_JOB_FLAT_TLINE' :          3,
      'VTS_JOB_PIXEL_LINE' :          4,
      'VTS_JOB_PIXEL_TLINE' :         5,
      'VTS_JOB_LINE_LABEL' :          6,
      'VTS_JOB_ICON' :                7,
      'VTS_JOB_LABEL' :               8,

    })
);


var config = {
  entry: {
    'vts-core': __dirname + '/src/core/index.js',
    'vts-browser': __dirname + '/src/browser/index.js'
  },
  devtool: PROD ? undefined : 'source-map',
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
