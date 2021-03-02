
var PROD = (process.env.NODE_ENV === 'production')
var TARGET_DIR = PROD ? __dirname + "/dist/" : __dirname + "/build/";

var fs = require("fs");
var webpack = require('webpack');
var LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var CopyPlugin = require('copy-webpack-plugin');

var path = require('path');

var plugins = [
    new LicenseWebpackPlugin({ outputFilename: '3rdpartylicenses.txt' }),
    new MiniCssExtractPlugin({ filename: '[name]' + (PROD ? '.min' : '') + '.css' }),
    new webpack.BannerPlugin({
        "banner": function(filename) {
          return "Copyright (c) 2020 Melown Technologies SE\n" +
                 " *  For terms of use, see accompanying [name] file.\n" +
                 " *  For 3rd party libraries licenses, see 3rdpartylicenses.txt.\n"
        }
    }),
    new CopyPlugin({
      patterns: [
        { from: './LICENSE', to: 'vts-browser.js' + (PROD ? '.min' : '') + '.LICENSE' },
        { from: './LICENSE', to: 'vts-core.js' + (PROD ? '.min' : '') + '.LICENSE' }
      ],
    }),    
    new webpack.DefinePlugin({
      'VTS_MATERIAL_DEPTH':           1,
      'VTS_MATERIAL_FLAT':            2,
      'VTS_MATERIAL_FOG':             3,
      'VTS_MATERIAL_INTERNAL':        4,
      'VTS_MATERIAL_INTERNAL_NOFOG':  5,
      'VTS_MATERIAL_EXTERNAL':        6,
      'VTS_MATERIAL_EXTERNAL_NOFOG':  7,

      'VTS_PIPELINE_BASIC':           0,
      'VTS_PIPELINE_HMAP':            1,
      'VTS_PIPELINE_PROCEDURAL':      2,

      'VTS_DRAWCOMMAND_STATE':        1,
      'VTS_DRAWCOMMAND_SUBMESH':      2,
      'VTS_DRAWCOMMAND_GEODATA':      3,

      'VTS_TEXTURECHECK_MEATATILE':   1,
      'VTS_TEXTURECHECK_TYPE':        2,
      'VTS_TEXTURECHECK_CODE':        3,
      'VTS_TEXTURECHECK_SIZE':        4,

      'VTS_TEXTURETYPE_COLOR':        0,
      'VTS_TEXTURETYPE_HEIGHT':       1,
      'VTS_TEXTURETYPE_CLASS':        2,

      'VTS_JOB_FLAT_LINE':            1,
      'VTS_JOB_FLAT_RLINE':           2,
      'VTS_JOB_FLAT_TLINE':           3,
      'VTS_JOB_PIXEL_LINE':           4,
      'VTS_JOB_PIXEL_TLINE':          5,
      'VTS_JOB_LINE_LABEL':           6,
      'VTS_JOB_ICON':                 7,
      'VTS_JOB_LABEL':                8,
      'VTS_JOB_PACK':                 9,
      'VTS_JOB_VSPOINT':              10,
      'VTS_JOB_POLYGON':              11,
      'VTS_JOB_MESH':                 12,
      'VTS_JOB_POINTCLOUD':           13,

      'VTS_TILE_COUNT_FACTOR':        0.5,

      'VTS_NO_OVERLAP_DIRECT':        0,
      'VTS_NO_OVERLAP_DIV_BY_DIST':   1,

      'VTS_WORKERCOMMAND_ADD_RENDER_JOB':  5,
      'VTS_WORKERCOMMAND_STYLE_DONE':      6,
      'VTS_WORKERCOMMAND_ALL_PROCESSED':   7,
      'VTS_WORKERCOMMAND_READY':           8,
      'VTS_WORKERCOMMAND_GROUP_BEGIN':     9,
      'VTS_WORKERCOMMAND_GROUP_END':       10,
      'VTS_WORKERCOMMAND_LOAD_FONTS':      11,
      'VTS_WORKERCOMMAND_LOAD_BITMPAS':    12,

      'VTS_WORKER_TYPE_LABEL':             1,
      'VTS_WORKER_TYPE_LABEL2':            2,
      'VTS_WORKER_TYPE_ICON':              3,
      'VTS_WORKER_TYPE_ICON2':             4,
      'VTS_WORKER_TYPE_POINT_GEOMETRY':    5,
      'VTS_WORKER_TYPE_FLAT_LINE':         6,
      'VTS_WORKER_TYPE_FLAT_RLINE':        7,
      'VTS_WORKER_TYPE_FLAT_TLINE':        8,
      'VTS_WORKER_TYPE_PIXEL_LINE':        9,
      'VTS_WORKER_TYPE_PIXEL_TLINE':       10,
      'VTS_WORKER_TYPE_LINE_LABEL':        11,
      'VTS_WORKER_TYPE_LINE_LABEL2':       12,
      'VTS_WORKER_TYPE_POLYGON':           13,
      'VTS_WORKER_TYPE_LINE_GEOMETRY':     14,

      'VTS_WORKER_TYPE_PACK_BEGIN':       15,
      'VTS_WORKER_TYPE_PACK_END':         16,

      'VTS_WORKER_TYPE_VSWITCH_BEGIN':    17,
      'VTS_WORKER_TYPE_VSWITCH_STORE':    18,
      'VTS_WORKER_TYPE_VSWITCH_END':      19,
      'VTS_WORKER_TYPE_VSPOINT':          20,

      'VTS_WORKER_TYPE_NODE_BEGIN':       21,
      'VTS_WORKER_TYPE_NODE_END':         22,
      'VTS_WORKER_TYPE_MESH':             23,
      'VTS_WORKER_TYPE_LOAD_NODE':        24,

      'VTS_TILE_SHADER_CLIP4':            (1<<0),
      'VTS_TILE_SHADER_CLIP8':            (1<<1),
      'VTS_TILE_SHADER_SE':               (1<<2),

      'VTS_IMPORATANCE_LOG_BASE':     1.0017,
      'VTS_IMPORATANCE_INV_LOG':      1355.6127860321758038669705901537 // 1/log(LOG_BASE)

    })
];

module.exports = {
  entry: {
    'vts-core': __dirname + '/src/core/index.js',
    'vts-browser': __dirname + '/src/browser/index.js'
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: true,
            },
          },

        'css-loader']
      },
    ],
  },

  output: {
    path: TARGET_DIR,
    filename: '[name]' + (PROD ? '.min' : '') + '.js',
    libraryTarget: "var",
    library: "vts"
  },

  devtool: 'source-map',

  devServer: {
    inline: true
  },

  mode: (PROD) ? 'production' : 'development',

  plugins: plugins  
};

