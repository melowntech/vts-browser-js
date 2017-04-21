# VTS Browser JS

The VTS Browser JS is a *JavaScript WebGL 3D maps rendering engine* used and
developed by Melown SE (http://melown.com) in their products.

The build system uses [webpack module bundler](http://webpack.github.io/).
Typical development cycle starts with `npm install` for installation of
dependenices. Then you usually run `webpack-dev-server` and build with `webpack`.

## User documentation

The Melown API (VTS Browser JS) user documentation (how to use generated
JavaScrip API in your web page) is available at:

* [VTS Browser API](https://github.com/Melown/vts-browser-js/wiki)

## Install

Download and install all dependencies to local `node_modules` directory. 

**NOTE:** For some dependencies, you need `git` available in your system.

```
npm install
```

or more advanced (if you are using new versions of NodeJS and Yarn)

```
yarn install
```

## Build

```
node_modules/.bin/webpack
```
The unzipped file (along with source map and CSS) is stored in `build/`
directory. You may now start the dev server (see lower) and open browser at
[http://localhost:8080](http://localhost:8080) to see some demos in the `demos/`
directory.


## Build compressed version

The compressed version - it's intended to be used in in production env. You can
include in the `<script ...></script>` tags (along with CSS) there.

Compressed version is build in the `dist/` directory.

```
NODE_ENV=production node_modules/.bin/webpack
```

## Run dev server

The development server is serving local files at
[http://localhost:8080](http://localhost:8080).

```
node_modules/.bin/webpack-dev-server
```

And go to [http://localhost:8080/demos/browser/basic/](http://localhost:8080/demos/browser/basic/)

## Makefile

There is also `Makefile` available in the project directory. Referer `make help`
to specific make targets. The Makefile is just wrapper around `npm run` commands
(which are wrappers around webpack configuration).

## License

See the `LICENSE` file for VTS Browser JS license, run `webpack` and check the
`build/3rdpartylicenses.txt` file for 3rd party licenses.

## How to contribute

Check the `CONTRIBUTING` file.
