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
      'VTS_MATERIAL_EXTERNAL':        6,
      'VTS_MATERIAL_EXTERNAL_NOFOG':  7,

      'VTS_PIPELINE_BASIC':           0,
      'VTS_PIPELINE_HMAP':            1,
      'VTS_PIPELINE_PROCEDURAL':      2,

      'VTS_DRAWCOMMAND_STATE' :       1,
      'VTS_DRAWCOMMAND_SUBMESH' :     2,
      'VTS_DRAWCOMMAND_GEODATA' :     3,

      'VTS_TEXTURECHECK_MEATATILE' :  1,
      'VTS_TEXTURECHECK_TYPE' :       2,
      'VTS_TEXTURECHECK_CODE' :       3,
      'VTS_TEXTURECHECK_SIZE' :       4,

      'VTS_TEXTURETYPE_COLOR' :       0,
      'VTS_TEXTURETYPE_HEIGHT' :      1,
      'VTS_TEXTURETYPE_CLASS' :       2,

      'VTS_JOB_FLAT_LINE' :           1,
      'VTS_JOB_FLAT_RLINE' :          2,
      'VTS_JOB_FLAT_TLINE' :          3,
      'VTS_JOB_PIXEL_LINE' :          4,
      'VTS_JOB_PIXEL_TLINE' :         5,
      'VTS_JOB_LINE_LABEL' :          6,
      'VTS_JOB_ICON' :                7,
      'VTS_JOB_LABEL' :               8,
      'VTS_JOB_PACK' :                9,
      'VTS_JOB_VSPOINT' :             10,

      'VTS_TILE_COUNT_FACTOR' :       0.5,

      'VTS_NO_OVERLAP_DIRECT' :       0,
      'VTS_NO_OVERLAP_DIV_BY_DIST' :  1,

      'VTS_WORKERCOMMAND_ADD_RENDER_JOB' : 5,
      'VTS_WORKERCOMMAND_STYLE_DONE':      6,
      'VTS_WORKERCOMMAND_ALL_PROCESSED':   7,
      'VTS_WORKERCOMMAND_READY':           8,
      'VTS_WORKERCOMMAND_GROUP_BEGIN':     9,
      'VTS_WORKERCOMMAND_GROUP_END':       10,
      'VTS_WORKERCOMMAND_LOAD_FONTS':      11,
      'VTS_WORKERCOMMAND_LOAD_BITMPAS':    12,

      'VTS_WORKER_TYPE_LABEL' :            1,
      'VTS_WORKER_TYPE_LABEL2' :           2,
      'VTS_WORKER_TYPE_ICON' :             3,
      'VTS_WORKER_TYPE_ICON2' :            4,
      'VTS_WORKER_TYPE_POINT_GEOMETRY' :   5,
      'VTS_WORKER_TYPE_FLAT_LINE' :        6,
      'VTS_WORKER_TYPE_FLAT_RLINE' :       7,
      'VTS_WORKER_TYPE_FLAT_TLINE' :       8,
      'VTS_WORKER_TYPE_PIXEL_LINE' :       9,
      'VTS_WORKER_TYPE_PIXEL_TLINE' :      10,
      'VTS_WORKER_TYPE_LINE_LABEL' :       11,
      'VTS_WORKER_TYPE_LINE_GEOMETRY' :    12,

      'VTS_WORKER_TYPE_PACK_BEGIN' :      13,
      'VTS_WORKER_TYPE_PACK_END' :        14,

      'VTS_WORKER_TYPE_VSWITCH_BEGIN' :   15,
      'VTS_WORKER_TYPE_VSWITCH_STORE' :   16,
      'VTS_WORKER_TYPE_VSWITCH_END' :     17,
      'VTS_WORKER_TYPE_VSPOINT' :         18,

      'VTS_IMPORATANCE_LOG_BASE' :    1.0017,
      'VTS_IMPORATANCE_INV_LOG' :     1355.6127860321758038669705901537 // 1/log(LOG_BASE)

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
