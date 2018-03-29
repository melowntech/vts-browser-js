# VTS Browser JS

**The VTS Browser JS** is a JavaScript WebGL map rendering engine with small footprint (about 163 kB of gziped JS code), it provides almost all features for 3D mapping you will ever want.

With VTS Browser JS you are able to combine and render various geospatial data in one map. Style and display heightcoded geodata. Render your textured meshes or OBJ models. Or occupy it's font rendering engine with exotic writing systems.

VTS Browser JS is (independently usable) part of [VTS 3D Geospatial Software Stack](http://vtsdocs.melown.com/en/latest/index.html): a state-of-the-art, full-stack open source platform for 3D geospatial application development. 

- [Features](#features)
- [Live Demos](#live-demos)
- [Get started with VTS Browser JS](#examples)
  - [First Steps](#first-steps)
  - [More examples](https://github.com/Melown/vts-browser-js/wiki/Examples)
- [Get the library](#get-the-library)
  - [Our CDN](#our-cdn)
  - [Prebuilt package](#prebuilt)
  - [NPM](#npm-repository)
  - [From Source code](#build-from-code)
- [Documentation](#documentation)
- [Roadmap](https://github.com/Melown/vts-browser-js/wiki/Roadmap)
- [Map Configuration](#map-configuration)
- [Licence](#licence)
- [How to Contribute](#how-to-contribute)

<img width="888" alt="VTS Browser JS showcase" src="https://github.com/Melown/assets/blob/master/vts-browser-js/vts-browser-js-readme-2.jpg?raw=true">

## Features
* [x] Part of large VTS 3D Geospatial Software Stack
* [x] Supports WebGL-capable browsers
* [x] Realistic rendering model
* [x] Map features search
* [x] Tiled, hierarchical data model
* [x] Web presentation optimalized
* [x] Different coordinate systems
* [x] Multiple surfaces
* [x] Multiple bound layers on each surface
* [x] Vector layers (geodata)
* [x] Geodata styling and interaction
* [x] Dynamic surfaces and layers switching
* [x] Various writing systems (e.g. Arabic, Indic, Chinese, Japanese, ...)
* [x] Extensive API (including UI extensions)
* [x] Custom meshes, lines, polygons, icons, OBJ models, ...
* [x] Rendering and styling GeoJSON files
* [x] Small library size 163KB (minified and gzipped)
* [x] Large set of ready to use data
* [x] BSD-2 license

### Comparsion to CesiumJS library

The [CesiumJS](https://cesiumjs.org) is an excelent JavaScript WebGL map rendering engine and we must acknowledge the hard work of Cesium team standing behind this library.

If you asks us to compare The VTS Browser JS with The CesiumJS. There is a list of points which you may find interesting:

| Feature | VTS&nbsp;Browser&nbsp;JS | Cesium |
| --- | --- | --- |
| Different [coordinate systems](http://vtsdocs.melown.com/en/latest/reference/concepts.html#reference-frame) support | yes | limited |
| Dynamic tiled [surfaces](http://vtsdocs.melown.com/en/latest/reference/concepts.html#surface) mixing (including [glues](http://vtsdocs.melown.com/en/latest/reference/concepts.html#glue)) | yes | no |
| Multiple surfaces and multiple bound layers support (Including transparent layers) | yes | no |
| Bound layers with optimized [masks](http://vtsdocs.melown.com/en/latest/reference/concepts.html#mask) | yes | no |
| Out-of-the-box OSM data support with [custom styling](https://github.com/Melown/vts-browser-js/wiki/VTS-Geodata-Format) | yes | limited |
| Fully open sourced back-end tools | yes | no |
| Part of the [VTS Software Stack](http://vtsdocs.melown.com/en/latest/index.html) for the large scale mapping | yes | no |
| Text rendering engine with almost complete coverage of writing systems | yes | limited |
| Compact-size library (gzipped and minified) | 163&nbsp;KB | 577&nbsp;KB&nbsp;+&nbsp;Workers |

## Live Demos

3D map can rapidly enhance your web project's user experience. You can find your inspiration in following use cases.

 * [Mercury](https://www.melown.com/mercury/)
 * [Intergeo presentation](https://www.melown.com/intergeo2017/)
 * [Mapy.cz](https://mapy.cz/zakladni?x=14.4125847&y=50.0517997&z=17&m3d=1&height=687&yaw=41.252&pitch=-26) (cs)
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

#### Install

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

Map configuration contains a all information The VTS Browser JS library needs to display given map/model. Library is usually initialize with URL to mapConfig.json file which is JSON representation of Map configuration data.

The question is, where you can get your own Map Configuration. Basically you have two options:

### Melown Cloud

[Melown Cloud](https://www.melown.com/cloud) is a source of custom map configurations for client application development.

It is a cloud 3D map development platform operated by Melown Technologies atop of VTS 3D Stack. It is a point-and-click interface to a subset of VTS functionality ideal for smaller projects and less technically savvy users.

### VTS 3D Geospatial Software stack

If Melown Cloud doesn't meet your needs you can install, configure and deploy your own backend instnace of [The VTS 3D Geospatial Software Stack](http://vtsdocs.melown.com/en/latest/index.html) components. You will gain full control over your data sources, Map Configurations and integration with other geospatial services.

## Documentation

VTS Browser JavaScript API documentation is available in our wiki:

* [VTS Browser API](https://github.com/Melown/vts-browser-js/wiki)

## License

See the `LICENSE` file for VTS Browser JS license, run `webpack` and check the
`build/3rdpartylicenses.txt` file for 3rd party licenses.

## How to contribute

Check out the [CONTRIBUTING.md](CONTRIBUTING.md) file.
