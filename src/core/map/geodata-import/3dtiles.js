
import {math as math_} from '../../utils/math';
import {vec3 as vec3_} from '../../utils/matrix';
import {utils as utils_} from '../../utils/utils';
import {utilsUrl as utilsUrl_} from '../../utils/url';



//get rid of compiler mess
var math = math_;
var vec3 = vec3_;
var utils = utils_;
var utilsUrl = utilsUrl_;

var MapGeodataImport3DTiles = function(builder, options) {
    this.builder = builder;
    this.map = builder.map;
    //this.heightMode = heightMode || 'float';
    this.navSrs = this.map.getNavigationSrs();
    this.physSrs = this.map.getPhysicalSrs();
    this.srs = this.navSrs;
    this.rootPath = '';
    this.filesToLoad = 0;
    //this.options = options || {};
};


MapGeodataImport3DTiles.prototype.processNode = function(builderNode, node, onlyChildren) {
    var boundingVolume = node['boundingVolume'], volume;

    if (boundingVolume) {

        if (boundingVolume['region']) {
            var v = boundingVolume['region'];
            var min = [math.degrees(v[0]), math.degrees(v[1]), v[4]];
            var max = [math.degrees(v[2]), math.degrees(v[3]), v[5]];

            var p = [], r;

            p[0] = this.physSrs.convertCoordsFrom([min[0], max[1], max[2]], this.srs);
            p[1] = this.physSrs.convertCoordsFrom([max[0], max[1], max[2]], this.srs);
            p[2] = this.physSrs.convertCoordsFrom([max[0], min[1], max[2]], this.srs);
            p[3] = this.physSrs.convertCoordsFrom([min[0], min[1], max[2]], this.srs);

            p[4] = this.physSrs.convertCoordsFrom([min[0], max[1], min[2]], this.srs);
            p[5] = this.physSrs.convertCoordsFrom([max[0], max[1], min[2]], this.srs);
            p[6] = this.physSrs.convertCoordsFrom([max[0], min[1], min[2]], this.srs);
            p[7] = this.physSrs.convertCoordsFrom([min[0], min[1], min[2]], this.srs);

            //var center = this.physSrs.convertCoordsFrom([(max[0] + min[0]) * 0.5, (max[1] + min[1]) * 0.5, (max[2] + min[2]) * 0.5], this.srs);

            var center = [ (p[0][0]+p[1][0]+p[2][0]+p[3][0]+p[4][0]+p[5][0]+p[6][0]+p[7][0])/8,
                           (p[0][1]+p[1][1]+p[2][1]+p[3][1]+p[4][1]+p[5][1]+p[6][1]+p[7][1])/8,
                           (p[0][2]+p[1][2]+p[2][2]+p[3][2]+p[4][2]+p[5][2]+p[6][2]+p[7][2])/8 ];

            //var axisX = [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]];
            //var axisY = [p[2][0] - p[1][0], p[2][1] - p[1][1], p[2][2] - p[1][2]];
            //var axisZ = [p[0][0] - p[4][0], p[0][1] - p[4][1], p[0][2] - p[4][2]];

            r = vec3.length([p[0][0] - center[0], p[0][1] - center[1], p[0][2] - center[2]]);

            volume = {
                points : p,
                center : center,
                radius: r,
                halfAxis : [
                    [(p[1][0] - p[0][0]) * 0.5, (p[1][1] - p[0][1]) * 0.5, (p[1][2] - p[0][2]) * 0.5 ],
                    [(p[2][0] - p[1][0]) * 0.5, (p[2][1] - p[1][1]) * 0.5, (p[2][2] - p[1][2]) * 0.5 ],
                    [(p[4][0] - p[0][0]) * 0.5, (p[4][1] - p[0][1]) * 0.5, (p[4][2] - p[0][2]) * 0.5 ]
                ]
            }
        }
    }


    var precision = node['geometricError'];

    if (!onlyChildren) {
        builderNode = this.builder.addNode(builderNode, volume, precision, onlyChildren);
    }

    var content = node['content'];

    if (content && content['uri']) {
        var path = content['uri'];

        path = utilsUrl.getProcessUrl(path, this.rootPath);

        if (path.indexOf('.json') != -1) {
            if (this.baseOptions.gradualJSONLoader) {
                this.builder.addLoadNode(builderNode, path);
            } else {
                this.loadJSON(path, { internal: true, node: builderNode } );
            }
        }

        else if (path.indexOf('.mesh') != -1) {
            this.builder.addMesh(builderNode, path);
        }
    }

    var children = node['children'];

    if (children) {
        for (var i = 0, li = children.length; i < li; i++) {
            this.processNode(builderNode, children[i]);
        }
    }
};

MapGeodataImport3DTiles.prototype.processJSON = function(json) {
    if (!json) {
        return;
    }

    this.rootPath = rootPath || '';
    this.processNode(null, json['root']);
};


MapGeodataImport3DTiles.prototype.loadJSON = function(path, options, onLoaded) {
    this.filesToLoad++;

    options = options || {};

    if (!(options.internal)) {
        this.onFinished = onLoaded;
        this.baseOptions = options;
        options = { internal:true, node: null };
    }

    utils.loadJSON(path, this.onLoaded.bind(this, path, options), this.onError.bind(this, options));
};


MapGeodataImport3DTiles.prototype.onLoaded = function(path, options, json) {
    this.rootPath = utilsUrl.makeAbsolute(path);
    this.rootPath = utilsUrl.getBase(this.rootPath);

    this.processNode(options.node, json['root'], options.node ? true : false);

    this.filesToLoad--;

    if (!this.filesToLoad && this.onFinished) {
        this.onFinished();
    }
}

MapGeodataImport3DTiles.prototype.onError = function() {
    this.filesToLoad--;

    if (!this.filesToLoad && this.onFinished) {
        this.onFinished();
    }
}


export default MapGeodataImport3DTiles;









