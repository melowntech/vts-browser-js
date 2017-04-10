# VTS-Browser-JS

The VTS-Browser-JS is a *JavaScript WebGL 3D maps rendering engine* used and
developed by Melown SE (http://melown.com) in their products.

The build system uses [webpack module bundler](http://webpack.github.io/).
Typical development cycle starts with `npm install` for installation of
dependenices. Then you usually run `webpack-dev-server` and build with `webpack
--watch`.

## User documentation

The Melown API (VTS-Browser-JS) user documentation (how to use generated
JavaScrip API in your web page) is available at:

* [Melown API](https://github.com/Melown/melown-js/wiki/Melown-API)

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

## Build (constantly)

If you are developing some web page, you might be wanting to rebuild & refresh
every time, some file is saved. You can run `webpack`

```
node_modules/.bin/webpack --watch
```

## Build compressed version

```
NODE_ENV=production node_modules/.bin/webpack
```

## Run dev server

```
node_modules/.bin/webpack-dev-server  --inline
```

And go to http://localhost:8080/demos/core/basic/

## Makefile

There is also `Makefile` available in the project directory. Referer `make help`
to specific make targets. The Makefile is just wrapper around `npm run` commands
(which are wrappers around webpack configuration).

## License

See the `LICENSE` file for VTS-Browser-JS license, run `webpack` and check the
`build/3rdpartylicenses.txt` file for 3rd party licenses.

## How to contribute

Check the `CONTRIBUTING` file.
