# VTS Browser JS

**The VTS Browser JS** is a JavaScript WebGL rendering engine used and developed by [Melown Technologies SE](http://melown.com) as part of their VTS 3D map streaming and rendering stack.

- [Features](#features)
- [Live Demos](#live-demos)
- [Examples](#examples)
- [Get the library](#get-the-library)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Map Configuration](#map-configuration)
- [Licence](#licence)
- [How to Contribute](#how-to-contribute)

<img width="888" alt="VTS Browser JS showcase" src="https://github.com/Melown/assets/blob/master/vts-browser-js/vts-browser-js-readme.jpg?raw=true">

## Features

### Comparsion to Cesium

People often ask as whether is VTS alternative to Cesium. Our answer is that VTS is excellent alternative to the Cesium. There is a list of the points which you may find interesting:

| Feature | VTS Browser JS | Cesium |
| --- | --- | --- |
| support for the different coordinate systems* (including glues) | yes | no |
| when the map have multiple surfaces, each surface can have its own set of bound layers** (including transparent ones) | yes | no |
| bound layers with optimized masks | yes | no |
| out of the box support for the OSM data with custom stilling | yes | limited |
| large ecosystem for the back-end and front-end | yes | limited |
| fully open sourced back-end tools | yes | no |
| part of the bigger photogrammetric package for the large scale mapping | yes | no |
| advanced text rendering with almost complete coverage of the writing systems | yes | limited |
| compact library size (gzipped and minified) | 163 KB | 577 KB + Workers |


\*) surface is for a example terrain or 3D city  
\**) bound layer is usually aerial imagery

## Live Demos

3D map can rapidly enhance your web project's user experience. You can find your inspiration in following excellent use cases.

 * [Mercury](https://www.melown.com/mercury/)
 * [Intergeo presentation](https://www.melown.com/intergeo2017/)
 * [Mapy.cz](https://mapy.cz/zakladni?x=14.4125847&y=50.0517997&z=17&m3d=1&height=687&yaw=41.252&pitch=-26)(cs)
 * [GPX Demo](https://gpx-demo.mlwn.se)

## Examples

### First steps

1. Include The VTS Browser JS library
```html
<link rel="stylesheet"
  type="text/css" href="https://cdn.melown.com/libs/vtsjs/browser/v2/vts-browser.min.css" />
<script type="text/javascript"
  src="https://cdn.melown.com/libs/vtsjs/browser/v2/vts-browser.min.js"></script>
```

2. Declare map containing element (with id `map-div`)
```html
<div id="map-div" style="width:100%; height:100%;"></div>
```

3. Initiate vts browser (with example [map configuration](https://))
```html
<script>
  var browser = vts.browser('map-div', {
    map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-map/mapConfig.json'
  });
</script>
 ```

Wonder where to find `mapConfig.json` file? See [Map Configuration](#Map Configuration) section.

### Next steps

You can run many [examples in JSFiddle](https://github.com/Melown/vts-browser-js/wiki/Examples).

## Get the library

There is several ways how to bundle The VTS Browser JS Library into your project.

### Our CDN

The most easy way to link The VTS Browser JS Library is to use the latest build (or specific version) from our CDN network.

```html
<link rel="stylesheet"
  href="https://cdn.melown.com/libs/vtsjs/browser/v2/vts-browser.min.css" />
<script type="text/javascript"
  src="https://cdn.melown.com/libs/vtsjs/browser/v2/vts-browser.min.js"></script>
```

### Prebuilt

In case you do not want to build libray yourself or use our CDN, there is a [link](https://github.com/Melown/vts-browser-js/releases) where you can find latest compiled libraries with demo examples.

### NPM repository

Vts-browser-js library is in npm js repository. To add it as dependecy to your project just add it as any npm package
```
npm install -S vts-browser-js
```

### Build from code

And of course you can build The VTS Browser JS Library from source code.

#### Build system
The build system uses [webpack module bundler](http://webpack.github.io/).
Typical development cycle starts with `npm install` for installation of
dependenices. Then you usually run `webpack-dev-server` and build with `webpack`.

##### Install

Download and install all dependencies to local `node_modules` directory.

**NOTE:** For some dependencies, you need `git` available in your system.

```
npm install
```

or more advanced (if you are using new versions of NodeJS and Yarn)

```
yarn install
```

#### Run dev server

The development server is serving local files at
[http://localhost:8080](http://localhost:8080).

```
node_modules/.bin/webpack-dev-server
```

And go to [http://localhost:8080/demos/](http://localhost:8080/demos/)


#### Build

```
node_modules/.bin/webpack
```
The unzipped file (along with source map and CSS) is stored in `build/`
directory. You may now start the dev server (see lower) and open browser at
[http://localhost:8080](http://localhost:8080) to see some demos in the `demos/`
directory.

#### Build compressed version

The compressed version - it's intended to be used in in production env. You can
include in the `<script ...></script>` tags (along with CSS) there.

Compressed version is build in the `dist/` directory.

```
NODE_ENV=production node_modules/.bin/webpack
```

#### Makefile

There is also `Makefile` available in the project directory. Referer `make help`
to specific make targets. The Makefile is just wrapper around `npm run` commands
(which are wrappers around webpack configuration).

## Map Configuration

### Melown Cloud

### VTS 3D Geospatial Software stack

## Documentation

VTS Browser JavaScript API documentation is available in our wiki:

* [VTS Browser API](https://github.com/Melown/vts-browser-js/wiki)




## License

See the `LICENSE` file for VTS Browser JS license, run `webpack` and check the
`build/3rdpartylicenses.txt` file for 3rd party licenses.

## How to contribute

Check out the [CONTRIBUTING.md](CONTRIBUTING.md) file.
