<img width="390" alt="VTS Browser JS" src="https://github.com/melowntech/assets/blob/master/vts-browser-js/vts-browser-js-no-left-padding.png?raw=true">

**VTS Browser JS** is a powerful JavaScript 3D map rendering engine with a very small footprint (about 163 kB of gziped JS code). It provides almost all features for web-based 3D mapping you will ever want.

VTS Browser JS is independently usable part of [VTS 3D Geospatial Software Stack](https://vts-geospatial.org): a state-of-the-art, full-stack open source platform for 3D geospatial application development. 

With VTS Browser JS you may combine and render diverse geospatial data in a single online map, style and display various types of geodata, render textured polygonal meshes or OBJ models, or even render topographic labels in almost any international writing system.


- [Features](#features)
- [Live Demos](#live-demos)
- [Getting Started with VTS Browser JS](#examples)
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

<img width="888" alt="VTS Browser JS showcase" src="https://github.com/melowntech/assets/blob/master/vts-browser-js/vts-browser-js-readme-2-880.jpg?raw=true">

## Features
* [x] part of a comprehensive open-source 3D geospatial software Stack
* [x] supports all modern web browsers
* [x] photorealistic rendering
* [x] geocoding API support
* [x] tiled, hierarchical data model
* [x] optimized for web-based rendering
* [x] supports any coordinate system
* [x] multiple surfaces
* [x] multiple bound layers on each surface
* [x] vector layers (geodata)
* [x] geodata styling and geodata interaction
* [x] dynamic surfaces and layer switching
* [x] international writing systems (e.g. Arabic, Devangaric, Chinese, Japanese, ...)
* [x] extensive, yet simple API (including UI extensions)
* [x] custom meshes, lines, polygons, icons, OBJ models, etc
* [x] rendering and styling of GeoJSON files
* [x] very small footprint (163KB minified and gzipped)
* [x] large set of ready-to-use data
* [x] open-source under BSD-2 license

### Comparison to CesiumJS library

The open-source [CesiumJS](https://cesiumjs.org) is an excellent JavaScript 3D mapping library which is widely used and frequently compared to VTS Browser JS. The following table might help you to identify the application scenarios where VTS Browser JS may be an alternative, or simply a straightforward software platform of choice for your project.  

| Feature | VTS&nbsp;Browser&nbsp;JS | CesiumJS |
| --- | --- | --- |
| Different [coordinate systems](https://vts-geospatial.org/reference/concepts.html#reference-frame) support | yes | limited |
| Dynamic tiled [surfaces](https://vts-geospatial.org/reference/concepts.html#surface) mixing (including [glues](https://vts-geospatial.org/reference/concepts.html#glue)) | yes | no |
| Multiple surfaces and multiple bound layers support (including transparent layers) | yes | no |
| Bound layers with optimized [masks](https://vts-geospatial.org/reference/concepts.html#mask) | yes | no |
| Out-of-the-box OSM data support with [custom styling](https://github.com/Melown/vts-browser-js/wiki/VTS-Geodata-Format) | yes | limited |
| Open-source backend components | yes | no |
| Backend data-fusion capabilities | yes | no |
| Support for international writing systems | yes | limited |
| Compact-size library (gzipped and minified) | 221&nbsp;KB | 577&nbsp;KB&nbsp;+&nbsp;Workers |

## Live Demos

These are some of the applications built with VTS browser JS:

 * [Planet Mercury](https://www.melown.com/mercury/)
 * [Intergeo presentation](https://www.melown.com/intergeo2017/)
 * [Mapy.cz](https://mapy.cz/zakladni?x=14.4125847&y=50.0517997&z=17&m3d=1&height=687&yaw=41.252&pitch=-26) (cs)
 * [GPX Demo](https://gpx-demo.mlwn.se)

## Examples

### First steps

1. Include The VTS browser JS library
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

Wonder where to find `mapConfig.json` file? See [Map Configuration](#map-configuration) section.

### Next steps

You can run many [examples in JSFiddle](https://github.com/Melown/vts-browser-js/wiki/Examples).

## Get the library

There is several ways how to bundle The VTS Browser JS Library into your project.

### Our CDN

The easiest way to link The VTS Browser JS Library is to use the latest build (or specific version) from Melown Technologies CDN.

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

If you prefer, you may build The VTS Browser JS Library from source code.

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

[Melown Cloud](https://www.melown.com/cloud) is point-and-click interface to a subset of VTS technology, operated by Melown Tecchnologies. Conveniently, Melown Cloud may be also used as a source of custom map configurations for VTS browser JS application development.

### VTS 3D Geospatial Software stack

VTS Browser JS forms part of the [VTS 3D Geospatial Software Stack](https://vts-geospatial.org). Running the full stack gives you complete control over your map resources, provides you with powerful data fusion capabilities and allows for closed networks or other types of off-grid deployment.

## Documentation

VTS Browser JavaScript API documentation is available in our wiki:

* [VTS Browser API](https://github.com/Melown/vts-browser-js/wiki)

## License

See the `LICENSE` file for VTS Browser JS license, run `webpack` and check the
`build/3rdpartylicenses.txt` file for 3rd party licenses.

## How to contribute

Check out the [CONTRIBUTING.md](CONTRIBUTING.md) file.
