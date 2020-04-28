
import {vec3 as vec3_, mat4 as mat4_} from '../../utils/matrix';
import BBox_ from '../bbox';
import {math as math_} from '../../utils/math';
import {utils as utils_} from '../../utils/utils';
import MapResourceNode_ from '../../map/resource-node';

//get rid of compiler mess
var vec3 = vec3_, mat4 = mat4_;
var BBox = BBox_;
var math = math_;
var utils = utils_;
var MapResourceNode = MapResourceNode_;


var GpuGroup = function(id, bbox, origin, gpu, renderer) {
    this.id = id;
    this.bbox = null;
    this.origin = origin || [0,0,0];
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.renderer = renderer;
    this.jobs = [];
    this.reduced = 0;
    this.geometries = {};
    this.subjob = null;
    this.mv = new Float32Array(16);
    this.mvp = new Float32Array(16);
    this.loadMode = 0;
    this.geFactor = 1/38;
    this.geNormalized = false;

    if (bbox != null && bbox[0] != null && bbox[1] != null) {
        this.bbox = new BBox(bbox[0][0], bbox[0][1], bbox[0][2], bbox[1][0], bbox[1][1], bbox[1][2]);
    }

    this.size = 0;
    this.polygons = 0;
};

//destructor
GpuGroup.prototype.kill = function() {
    for (var i = 0, li = this.jobs.length; i < li; i++) {
        var job = this.jobs[i]; 

        switch(job.type) {
        case VTS_JOB_FLAT_LINE:
        case VTS_JOB_POLYGON:
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;

        case VTS_JOB_FLAT_TLINE:
        case VTS_JOB_FLAT_RLINE:
        case VTS_JOB_PIXEL_LINE:
        case VTS_JOB_PIXEL_TLINE:
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexNormalBuffer) this.gl.deleteBuffer(job.vertexNormalBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;

        case VTS_JOB_LINE_LABEL:
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexTexcoordBuffer) this.gl.deleteBuffer(job.vertexTexcoordBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;

        case VTS_JOB_ICON:
        case VTS_JOB_LABEL:
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexTexcoordBuffer) this.gl.deleteBuffer(job.vertexTexcoordBuffer);
            if (job.vertexOriginBuffer) this.gl.deleteBuffer(job.vertexOriginBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;
        }
    }

    //remove geometries
    for (var key in this.geometries) {
        var geometries = this.geometries[key];
        var globalGeometry = this.renderer.geometries[key];
        this.geometries[key] = null;

        //remove geometry from glbal stack
        for (i = 0, li = geometries.length; i < li; i++) {
            if (geometries[i] == globalGeometry) {
                this.renderer.geometries[key] = null;
            }
        }
    }
};


GpuGroup.prototype.getSize = function() {
    return this.size;
};


GpuGroup.prototype.getZbufferOffset = function() {
    return this.size;
};

GpuGroup.prototype.addGeometry = function(data) {
    var id = data['id'];

    if (!this.geometries[id]) {
        this.geometries[id] = [data];
    } else {
        this.geometries[id].push(data);
    }

    this.renderer.geometries[id] = data;
};

GpuGroup.prototype.convertColor = function(c) {
    var f = 1.0/255;
    return [c[0]*f, c[1]*f, c[2]*f, c[3]*f];
};

GpuGroup.prototype.addLineJob = function(data) {
    var gl = this.gl;

    var vertices = data.vertexBuffer;

    var job = {};

    if (data.type == VTS_WORKER_TYPE_POLYGON) {
        job.type = VTS_JOB_POLYGON;
    } else {
        job.type = VTS_JOB_FLAT_LINE;
    }

    job.program = this.renderer.progLine;
    job.color = this.convertColor(data['color']);
    job.zIndex = data['z-index'] + 256;
    job.clickEvent = data['click-event'];
    job.hoverEvent = data['hover-event'];
    job.enterEvent = data['enter-event'];
    job.leaveEvent = data['leave-event'];
    job.advancedHit = data['advancedHit'];
    job.hitable = data['hitable'];
    job.eventInfo = data['eventInfo'];
    job.style = data['style'] || 0;
    job.stencil = (data['stencil'] === false) ? false : true;
    job.culling = data['culling'] || 0;
    job.state = data['state'];
    job.center = data['center'];
    job.lod = data['lod'];
    job.lineWidth = data['line-width'];
    job.zbufferOffset = data['zbuffer-offset'];
    job.reduced = false;
    job.ready = true;
    job.bbox = this.bbox;

    if (!job.program.isReady()) {
        return;
    }

    if (job.advancedHit) {
        job.program2 = this.renderer.progELine;

        if (!job.program2.isReady()) {
            return;
        }
    }

    //create vertex buffer
    job.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    job.vertexPositionBuffer.itemSize = 3;
    job.vertexPositionBuffer.numItems = vertices.length / 3;

    if (job.advancedHit) {
        job.program = this.renderer.progLine;

        var elements = data.elementBuffer;

        job.vertexElementBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexElementBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        job.vertexElementBuffer.itemSize = 1;
        job.vertexElementBuffer.numItems = elements.length;
    }

    this.jobs.push(job);

    this.size += vertices.length * 4;
    this.polygons += vertices.length / (3 * 3);
};


GpuGroup.prototype.addExtentedLineJob = function(data) {
    var gl = this.gl;

    var vertices = data.vertexBuffer;
    var normals = data.normalBuffer;

    var job = {};
    job.type = data['type'];

    
    switch(job.type) {
    case VTS_WORKER_TYPE_FLAT_LINE:  job.type = VTS_JOB_FLAT_TLINE;  break;
    case VTS_WORKER_TYPE_FLAT_RLINE:  job.type = VTS_JOB_FLAT_RLINE;  break;
    case VTS_WORKER_TYPE_PIXEL_LINE:  job.type = VTS_JOB_PIXEL_LINE;  break;
    case VTS_WORKER_TYPE_PIXEL_TLINE: job.type = VTS_JOB_PIXEL_TLINE; break;
    }

    job.color = this.convertColor(data['color']);
    job.zIndex = data['z-index'] + 256;
    job.clickEvent = data['click-event'];
    job.hoverEvent = data['hover-event'];
    job.hitable = data['hitable'];
    job.eventInfo = data['eventInfo'];
    job.enterEvent = data['enter-event'];
    job.leaveEvent = data['leave-event'];
    job.advancedHit = data['advancedHit'];
    job.widthByRatio = data['width-units'] == 'ratio',
    job.state = data['state'];
    job.center = data['center'];
    job.lod = data['lod'];
    job.lineWidth = data['line-width'];
    job.zbufferOffset = data['zbuffer-offset'];
    job.reduced = false;
    job.ready = true;
    job.bbox = this.bbox;

    if (data['texture'] != null) {
        var texture = data['texture'];
        var bitmap = texture[0];
        job.texture = [this.renderer.getBitmap(bitmap['url'], bitmap['filter'] || 'linear', bitmap['tiled'] || false),
            texture[1], texture[2], texture[3], texture[4]];
        var background = this.convertColor(data['background']);

        if (background[3] != 0) {
            job.background = background;
        }
    }

    switch(job.type) {
    case VTS_JOB_FLAT_TLINE:   job.program = (background[3] != 0) ? this.renderer.progTBLine : this.renderer.progTLine;  break;
    case VTS_JOB_FLAT_RLINE:   job.program = this.renderer.progRLine;  break;
    case VTS_JOB_PIXEL_LINE:   job.program = this.renderer.progLine3;  break;
    case VTS_JOB_PIXEL_TLINE:  job.program = (background[3] != 0) ? this.renderer.progTPBLine : this.renderer.progTPLine; break;
    }

    if (!job.program.isReady()) {
        return;
    }

    if (job.advancedHit) {
        switch(job.type) {
        case VTS_JOB_FLAT_TLINE:   job.program2 = this.renderer.progETLine;  break;
        case VTS_JOB_FLAT_RLINE:   job.program2 = this.renderer.progERLine;  break;
        case VTS_JOB_PIXEL_LINE:   job.program2 = this.renderer.progELine3;  break;
        case VTS_JOB_PIXEL_TLINE:  job.program2 = this.renderer.progETPLine; break;
        }

        if (!job.program2.isReady()) {
            return;
        }
    }

    //create vertex buffer
    job.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    job.vertexPositionBuffer.itemSize = 4;
    job.vertexPositionBuffer.numItems = vertices.length / 4;

    //create normal buffer
    job.vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    job.vertexNormalBuffer.itemSize = 4;
    job.vertexNormalBuffer.numItems = normals.length / 4;

    if (job.advancedHit) {
        var elements = data.elementBuffer;

        job.vertexElementBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexElementBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        job.vertexElementBuffer.itemSize = 1;
        job.vertexElementBuffer.numItems = elements.length;
    }

    this.jobs.push(job);

    this.size += vertices.length * 4 + normals.length * 4;
    this.polygons += vertices.length / (4 * 3);
};


GpuGroup.prototype.processReduce = function(job) {
    if (job.reduce) {
        switch(job.reduce[0]) {
            case 'tilt':       job.reduce[0] = 1; break;
            case 'tilt-cos':   job.reduce[0] = 2; break;
            case 'tilt-cos2':  job.reduce[0] = 3; break;
            case 'scr-count':  job.reduce[0] = 4; break;
            case 'scr-count2': job.reduce[0] = 5; this.renderer.drawnGeodataTilesUsed = true; break;
            case 'scr-count3': job.reduce[0] = 6; this.renderer.drawnGeodataTilesUsed = true; break;
            case 'scr-count4': job.reduce[0] = 7; break;
            case 'scr-count5': job.reduce[0] = 8; break;
            case 'scr-count6': job.reduce[0] = 9; break;
            case 'scr-count7': job.reduce[0] = 10; break;
            case 'scr-count8': job.reduce[0] = 11; break;
        }

        job.reduce[5] = 0; //zero debug value
        job.reduce[6] = 0;
        job.reduce[7] = 0;

        if (job.reduce[0] >= 7 && job.reduce[0] <= 11) {

            if (job.reduce[0] == 10 || job.reduce[0] == 11) {
                job.reduce[1] = Math.abs(job.reduce[1]);
                job.reduce[3] = job.reduce[1] * job.reduce[2];
                job.reduce[2] = job.reduce[1];
                job.reduce[4] = 0;
            } else {
                job.reduce[2] = Math.abs(job.reduce[1]); //copy prominence for prom / dist support

                if (this.renderer.config.mapFeaturesReduceFactor >= 1) { // prom / dists
                    job.reduce[1] = job.reduce[2];
                } else {
                    if (job.reduce[0] == 9) {
                        job.reduce[1] = job.reduce[2];
                    } else {
                        job.reduce[1] = Math.floor((Math.log(job.reduce[2] * 500) / Math.log(1.0017)) + 5000);
                    }
                }
            }
        }
    }
};


GpuGroup.prototype.addLineLabelJob = function(data) {
    var gl = this.gl;

    if (data.singleBuffer) {
        var singleBuffer = data.singleBuffer;
        var singleBuffer2 = data.singleBuffer2;
    } else {
        var vertices = data.vertexBuffer;
        var texcoords = data.texcoordsBuffer;
    }

    var job = {};
    job.type = VTS_JOB_LINE_LABEL;
    job.program = this.renderer.progText;
    job.color = this.convertColor(data['color']);
    job.color2 = this.convertColor(data['color2']);
    job.outline = data['outline'];
    job.zIndex = data['z-index'] + 256;
    job.visibility = data['visibility'];
    job.culling = data['culling'];
    job.clickEvent = data['click-event'];
    job.hoverEvent = data['hover-event'];
    job.enterEvent = data['enter-event'];
    job.leaveEvent = data['leave-event'];
    job.hitable = data['hitable'];
    job.eventInfo = data['eventInfo'];
    job.state = data['state'];
    job.center = data['center'];
    job.lod = data['lod'];
    job.labelPoints = data['labelPoints'];
    job.labelIndex = data['labelIndex'];
    job.labelSize = data['labelSize'];
    job.zbufferOffset = data['zbuffer-offset'];
    job.hysteresis = data['hysteresis'];
    job.noOverlap = data['noOverlap'];
    job.labelPointsBuffer = { id: -1, points: [], points2: [] },
    job.id = job.hysteresis ? job.hysteresis[2] : null;
    job.reduced = false;
    job.ready = true;
    job.bbox = this.bbox;
    job.reduce = data['reduce'];

    this.processReduce(job);
    
    job.files = data['files'] || [];
    var fonts = data['fonts'] || ['#default'];
    job.fonts = fonts;

    for (var i = 0, li = fonts.length; i < li; i++) {
        fonts[i] = this.renderer.fonts[fonts[i]];
    }

    job.program = this.renderer.progText2;

    if (!job.program.isReady()) {
        return;
    }

    if (singleBuffer) {

        job.singleBuffer = singleBuffer;
        job.singleBuffer2 = singleBuffer2;
        job.textVector = data['textVector'];

        //this.size += vertices.length * 4 + texcoords.length * 4;
        this.polygons += (singleBuffer.length / 12) * 2;

    } else {
        //create vertex buffer
        job.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        job.vertexPositionBuffer.itemSize = 4;
        job.vertexPositionBuffer.numItems = vertices.length / 4;

        //create normal buffer
        job.vertexTexcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
        job.vertexTexcoordBuffer.itemSize = 4;
        job.vertexTexcoordBuffer.numItems = texcoords.length / 4;

        this.size += vertices.length * 4 + texcoords.length * 4;
        this.polygons += vertices.length / (4 * 3);
    }

    this.jobs.push(job);
};


GpuGroup.prototype.addIconJob = function(data, label, tile) {
    var gl = this.gl;

    var vertices = data.vertexBuffer;
    var texcoords = data.texcoordsBuffer;
    var origins = data.originBuffer;
    var singleBuffer = data.singleBuffer;
    var s = data['stick'];
    var f = 1.0/255;

    var job = { tile: tile };
    job.type = label ? VTS_JOB_LABEL : VTS_JOB_ICON;
    job.program = this.renderer.progIcon;
    job.color = this.convertColor(data['color']);
    job.zIndex = data['z-index'] + 256;
    job.visibility = data['visibility'];
    job.culling = data['culling'];
    job.clickEvent = data['click-event'];
    job.hoverEvent = data['hover-event'];
    job.enterEvent = data['enter-event'];
    job.leaveEvent = data['leave-event'];
    job.hitable = data['hitable'];
    job.eventInfo = data['eventInfo'];
    job.state = data['state'];
    job.center = data['center'];
    job.stick = [s[0], s[1], s[2], s[3]*f, s[4]*f, s[5]*f, s[6]*f, s[7]];
    job.lod = data['lod'];
    job.zbufferOffset = data['zbuffer-offset'];
    job.hysteresis = data['hysteresis'];
    job.noOverlap = data['noOverlap'];
    job.id = job.hysteresis ? job.hysteresis[2] : null;
    job.reduced = false;
    job.ready = true;
    job.reduce = data['reduce'];

    this.processReduce(job);

    if (!job.program.isReady()) {
        return;
    }

    if (label !== true) {
        var icon = data['icon'];
        job.texture = this.renderer.getBitmap(null, icon['filter'] || 'linear', icon['tiled'] || false, icon['hash'], true);
        job.files = [];
    } else {
        job.color2 = this.convertColor(data['color2']);
        job.outline = data['outline'];
        job.size = data['size'];
        job.origin = data['origin'];
        job.files = data['files'] || [];
        job.index = data['index'] || 0;
        var fonts = data['fonts'] || ['#default'];
        job.fonts = fonts;
        job.gamma = [job.outline[2] * 1.4142 / job.size, job.outline[3] * 1.4142 / job.size];

        if (job.origin) {
            job.origin = new Float32Array(job.origin);
        }

        for (var i = 0, li = fonts.length; i < li; i++) {
            fonts[i] = this.renderer.fonts[fonts[i]];
        }

        job.program = this.renderer.progIcon2;
    }

    if (job.visibility != null && !Array.isArray(job.visibility)) {
        job.visibility = [job.visibility];
    }

    if (singleBuffer) {
        job.singleBuffer = singleBuffer;
        this.polygons += 2;

    } else {
        //create vertex buffer
        job.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        job.vertexPositionBuffer.itemSize = 4;
        job.vertexPositionBuffer.numItems = vertices.length / 4;

        //create normal buffer
        job.vertexTexcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
        job.vertexTexcoordBuffer.itemSize = 4;
        job.vertexTexcoordBuffer.numItems = texcoords.length / 4;

        //create origin buffer
        job.vertexOriginBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexOriginBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, origins, gl.STATIC_DRAW);
        job.vertexOriginBuffer.itemSize = 3;
        job.vertexOriginBuffer.numItems = origins.length / 3;

        this.size += job.vertexPositionBuffer.numItems * 4 +
                      job.vertexOriginBuffer.numItems * 4 +
                      job.vertexTexcoordBuffer.numItems * 4;
        this.polygons += job.vertexPositionBuffer.numItems / (4 * 3);
    }


    if (this.subjobs) {
        this.subjobs.push(job);
    } else {
        if (this.vsjobs) {
            this.vsjobs.push(job);
        } else {
            this.jobs.push(job);
        }
    }

};


GpuGroup.prototype.addPack = function(data) {
    if (!this.subjobs.length) {
        this.subjobs = null;
        return;
    }

    var job = {
        type : VTS_JOB_PACK,
        subjobs: this.subjobs,
        culling : 180,
        zIndex : 0,
        ready : true
    };

    //extract no overlap, remove it form subjobs
    for (var i = 0, li = job.subjobs.length; i < li; i++) {
        var subjob = job.subjobs[i];

        if (subjob.noOverlap) {
            
            if (!job.noOverlap) {
                job.noOverlap = subjob.noOverlap;
            } else {
                var o = job.noOverlap;
                var o2 = subjob.noOverlap;

                if (o2[0] < o[0]) o[0] = o2[0];
                if (o2[1] < o[1]) o[1] = o2[1];
                if (o2[2] > o[2]) o[2] = o2[2];
                if (o2[3] > o[3]) o[3] = o2[3];
            }

            subjob.noOverlap = null;
        }

        if (subjob.culling <= job.culling) {
            job.culling = subjob.culling;
            subjob.culling = 180;
        }

        if (subjob.visibility) {
            job.visibility = subjob.visibility;
            subjob.visibility = null;
        }

        if (subjob.stick) {
            job.stick = subjob.stick;
            subjob.stick = [0,0,0,255,255,255,255,0];
        }

        if (subjob.zIndex > job.zIndex) {
            job.zIndex = subjob.zIndex;
        }

        if (subjob.center) {
            job.center = subjob.center;
        }

        job.eventInfo = subjob.eventInfo;
        job.reduce = subjob.reduce;

        job.hysteresis = subjob.hysteresis;
        job.id = subjob.id;
    }

    if (this.vsjobs) {
        this.vsjobs.push(job);
    } else {
        this.jobs.push(job);
    }
    
    this.subjobs = null;
};


GpuGroup.prototype.addVSPoint = function(data, tile){
    var job = { tile: tile };
    job.type = VTS_JOB_VSPOINT;
    job.zIndex = data['z-index'] + 256;
    job.visibility = data['visibility'];
    job.culling = data['culling'];
    job.hitable = false;
    job.eventInfo = data['eventInfo'];
    job.state = data['state'];
    job.center = data['center'];
    job.lod = data['lod'];
    job.hysteresis = data['hysteresis'];
    job.id = job.hysteresis ? job.hysteresis[2] : null;
    job.reduced = false;
    job.ready = true;
    job.reduce = data['reduce'];
    job.vswitch = [];

    this.vsjob = job;
};


GpuGroup.prototype.storeVSJobs = function(data){
    this.vsjob.vswitch.push([data.viewExtent, this.vsjobs]);
    this.vsjobs = [];
};


GpuGroup.prototype.addVSwitch = function(){
    if (this.vsjob) {
        this.jobs.push(this.vsjob);
    }

    this.vsjobs = null;
};

GpuGroup.prototype.addMeshJob = function(data, lod) {
    var job = {};

    job.type = VTS_JOB_MESH;
    job.path = data['path'];
    
    job.textures = [];

    job.resources = new MapResourceNode(this.renderer.core.map, null, null);

    if (job.path) {
        var stmp = job.path.split(".");
        if (stmp.length > 1) {
            stmp.pop();
            job.texturePath = stmp.join('.');
        }

        job.mesh = job.resources.getMesh(job.path, null);
    }

    this.jobs.push(job);
};


GpuGroup.prototype.copyBuffer = function(buffer, source, index) {
    var tmp = new Uint8Array(buffer.buffer);
    tmp.set(new Uint8Array(source.buffer, index, buffer.byteLength));
    return buffer;
};


GpuGroup.prototype.addRenderJob2 = function(buffer, index, tile) {
    var data, str, length, tmp;
    var view = new DataView(buffer.buffer);
    var type = buffer[index]; index += 1;

    if (type != VTS_WORKER_TYPE_PACK_BEGIN && type != VTS_WORKER_TYPE_PACK_END && 
        type != VTS_WORKER_TYPE_VSWITCH_BEGIN && type != VTS_WORKER_TYPE_VSWITCH_END && type != VTS_WORKER_TYPE_VSWITCH_STORE) {

        length = view.getUint32(index); index += 4;
        str = utils.unint8ArrayToString(new Uint8Array(buffer.buffer, index, length)); index+= length;
        data = JSON.parse(str);
    }

    switch(type) {
        case VTS_WORKER_TYPE_POLYGON:
        case VTS_WORKER_TYPE_FLAT_LINE:
            data.type = type;
            length = view.getUint32(index); index += 4;
            data.vertexBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.vertexBuffer.byteLength;

            if (data['advancedHit']) {
                length = view.getUint32(index); index += 4;
                data.elementBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.elementBuffer.byteLength;
            }

            this.addLineJob(data);
            break;

        case VTS_WORKER_TYPE_FLAT_TLINE:
        case VTS_WORKER_TYPE_FLAT_RLINE:
        case VTS_WORKER_TYPE_PIXEL_LINE:
        case VTS_WORKER_TYPE_PIXEL_TLINE:
            data.type = type;
            length = view.getUint32(index); index += 4;
            data.vertexBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.vertexBuffer.byteLength;
            length = view.getUint32(index); index += 4;
            data.normalBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.normalBuffer.byteLength;

            if (data['advancedHit']) {
                length = view.getUint32(index); index += 4;
                data.elementBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.elementBuffer.byteLength;
            }

            this.addExtentedLineJob(data);
            break;

        case VTS_WORKER_TYPE_LINE_LABEL:

            length = view.getUint32(index); index += 4;
            data.vertexBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.vertexBuffer.byteLength;
            length = view.getUint32(index); index += 4;
            data.texcoordsBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.texcoordsBuffer.byteLength;
            this.addLineLabelJob(data);
            break;

        case VTS_WORKER_TYPE_LINE_LABEL2:

            length = view.getUint32(index); index += 4;
            data.singleBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.singleBuffer.byteLength;
            length = view.getUint32(index); index += 4;
            data.singleBuffer2 = this.copyBuffer(new Float32Array(length), buffer, index); index += data.singleBuffer2.byteLength;
            this.addLineLabelJob(data);
            break;

        case VTS_WORKER_TYPE_ICON:
        case VTS_WORKER_TYPE_LABEL:

            length = view.getUint32(index); index += 4;
            data.singleBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.singleBuffer.byteLength;
            this.addIconJob(data, (type == VTS_WORKER_TYPE_LABEL), tile);
            break;

        case VTS_WORKER_TYPE_ICON2:
        case VTS_WORKER_TYPE_LABEL2:

            length = view.getUint32(index); index += 4;
            data.vertexBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.vertexBuffer.byteLength;
            length = view.getUint32(index); index += 4;
            data.originBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.originBuffer.byteLength;
            length = view.getUint32(index); index += 4;
            data.texcoordsBuffer = this.copyBuffer(new Float32Array(length), buffer, index); index += data.texcoordsBuffer.byteLength;
            this.addIconJob(data, (type == VTS_WORKER_TYPE_LABEL2), tile);
            break;

        case VTS_WORKER_TYPE_POINT_GEOMETRY:
        case VTS_WORKER_TYPE_LINE_GEOMETRY:

            length = view.getUint32(index); index += 4;
            data.geometryBuffer = this.copyBuffer(new Float64Array(length), buffer, index); index += data.originBuffer.byteLength;
            length = view.getUint32(index); index += 4;
            data.indicesBuffer = this.copyBuffer(new Uint32Array(length), buffer, index); index += data.indicesBuffer.byteLength;
            length = view.getUint32(index); index += 4;
            this.addGeometry(data);
            break;

        case VTS_WORKER_TYPE_PACK_BEGIN:
            this.subjobs = []; index += 4;
            break;

        case VTS_WORKER_TYPE_PACK_END:
            this.addPack(); index += 4;
            break;

        case VTS_WORKER_TYPE_VSPOINT:
            this.addVSPoint(data, tile);
            break;

        case VTS_WORKER_TYPE_VSWITCH_BEGIN:
            this.vsjobs = []; this.vsjob = null; index += 4;
            break;

        case VTS_WORKER_TYPE_VSWITCH_END:
            this.addVSwitch(); index += 4;
            break;

        case VTS_WORKER_TYPE_VSWITCH_STORE:
            data = { viewExtent: view.getUint32(index) }; index += 4;
            this.storeVSJobs(data);
            break;

        case VTS_WORKER_TYPE_NODE_BEGIN:

            var node = data;
            node.nodes = [];
            node.jobs = [];
            node.parent = this.currentNode;

            if (node.volume) {
                var p = node.volume.points;
                var points = [
                    p[0][0],p[0][1],p[0][2],
                    p[1][0],p[1][1],p[1][2],
                    p[2][0],p[2][1],p[2][2],
                    p[3][0],p[3][1],p[3][2],
                    p[4][0],p[4][1],p[4][2],
                    p[5][0],p[5][1],p[5][2],
                    p[6][0],p[6][1],p[6][2],
                    p[7][0],p[7][1],p[7][2]
                ];

                node.volume.points2 = points;
            }

            if (this.rootNode) {
                this.currentNode.nodes.push(node);
                this.currentNode = node;
            } else {
                this.rootNode = node;
                this.currentNode = node;

                this.oldJobs = this.jobs;
            }

            this.jobs = node.jobs;

            break;

        case VTS_WORKER_TYPE_NODE_END:

            if (this.currentNode.parent) {
                this.currentNode = this.currentNode.parent;
                this.jobs = this.currentNode.jobs;
            } else {
                this.currentNode = this.currentNode.parent;
                this.jobs = this.oldJobs;
            }

            break;

        case VTS_WORKER_TYPE_MESH:
            this.addMeshJob(data, tile);
            break;
    }

    return index;
};


GpuGroup.prototype.addRenderJob = function(data, tile) {
    switch(data['type']) {
    case 'polygon':
    case 'flat-line':     this.addLineJob(data); break;
    case 'flat-tline':
    case 'flat-rline':
    case 'pixel-line':
    case 'pixel-tline':    this.addExtentedLineJob(data); break;
    case 'line-label':     this.addLineLabelJob(data); break;
    case 'icon':           this.addIconJob(data); break;
    case 'label':          this.addIconJob(data, true, tile); break;
    case 'point-geometry': this.addGeometry(data); break;
    case 'line-geometry':  this.addGeometry(data); break;
    case 'pack-begin':     this.subjobs = []; break;
    case 'pack-end':       this.addPack(); break;
    case 'vspoint':        this.addVSPoint(data, tile); break;
    case 'vswitch-begin':  this.vsjobs = []; this.vsjob = null; break;
    case 'vswitch-store':  this.storeVSJobs(data); break;
    case 'vswitch-end':    this.addVSwitch(); break;
    case 'node-begin':     this.nodeBegin(); break;
    case 'node-end':       this.nodeEnd(); break;
    case 'mesh':           this.addMesh(); break;
    }
};


function drawLineString(options, renderer) {
    if (options == null || typeof options !== 'object') {
        return this;    
    }

    if (options['points'] == null) {
        return this;    
    }

    var points = options['points'];
    var color = options['color'] || [255,255,255,255];
    var depthOffset = (options['depthOffset'] != null) ? options['depthOffset'] : null;
    var size = options['size'] || 2;
    var screenSpace = (options['screenSpace'] != null) ? options['screenSpace'] : true;
    var depthTest = (options['depthTest'] != null) ? options['depthTest'] : false;
    var blend = (options['blend'] != null) ? options['blend'] : false;
    var writeDepth = (options['writeDepth'] != null) ? options['writeDepth'] : false;
    var useState = (options['useState'] != null) ? options['useState'] : false;
    color[0] *= 1.0/255;
    color[1] *= 1.0/255;
    color[2] *= 1.0/255;
    color[3] *= 1.0/255;

    renderer.draw.drawLineString(points, screenSpace, size, color, depthOffset, depthTest, blend, writeDepth, useState);
    return this;    
};


GpuGroup.prototype.getNodeLOD = function(node) {
    var lod = 0;

    while(node.parent) {
        lod++;
        node = node.parent;
    }

    return lod;
};

/*
GpuGroup.prototype.getNodeTexelSize3 = function(node, screenPixelSize) {
    var camera = this.map.camera;
    var cameraDistance = camera.geocentDistance;// * factor;

    var a = vec3.dot(camera.geocentNormal, node.diskNormal); //get angle between tile normal and cameraGeocentNormal
    var d = cameraDistance - (node.diskDistance + (node.maxZ - node.minZ)), d2; //vertical distance from top bbox level

    if (a < node.diskAngle2) { //is camera inside tile conus?
        
        //get horizontal distance
        var a2 = Math.acos(a); 
        var a3 = node.diskAngle2A;
        a2 = a2 - a3; 
        var l1 = Math.tan(a2) * node.diskDistance;// * factor;

        if (d < 0) { //is camera is belown top bbox level?
            d2 = cameraDistance - node.diskDistance;
            if (d2 < 0) { //is camera is belown bottom bbox level?
                d = -d2;
                d = Math.sqrt(l1*l1 + d*d);
            } else { //is camera inside bbox
                d = l1;
            }
        } else {
            d = Math.sqrt(l1*l1 + d*d);
        }

    } else {
        if (d < 0) { //is camera is belown top bbox level?
            d2 = cameraDistance - node.diskDistance;
            if (d2 < 0) { //is camera is belown bottom bbox level?
                d = -d2;
            } else { //is camera inside bbox
                return [Number.POSITIVE_INFINITY, 0.1];
            }
        } 
    }

    return [camera.camera.scaleFactor2(d) * screenPixelSize, d];
};


GpuGroup.prototype.getNodeTexelSize2 = function(volume, cameraPos, screenPixelSize, returnDistance) {
    //TODO: 
    //      make camera pos relative to volume center
    //      convert camera pos to volume space
    //      min = [-sizeX*0.5, -sizeY*0.5, -sizeZ*0.5]
    //      max = [sizeX*0.5, sizeY*0.5, sizeZ*0.5]

    var pos = volume.center;
    cameraPos = [cameraPos[0] - pos[0], cameraPos[1] - pos[1], cameraPos[2] - pos[2]];

    var min = cameraPos * volume.m;

    var min = volume.min;
    var min = volume.max;

    var tilePos1x = min[0] - cameraPos[0];
    var tilePos1y = min[1] - cameraPos[1];
    var tilePos2x = max[0] - cameraPos[0];
    var tilePos2y = min[1] - cameraPos[1];
    var tilePos3x = max[0] - cameraPos[0];
    var tilePos3y = max[1] - cameraPos[1];
    var tilePos4x = min[0] - cameraPos[0];
    var tilePos4y = max[1] - cameraPos[1];
    var h1 = min[2] - cameraPos[2];
    var h2 = max[2] - cameraPos[2];
    
    //camera inside bbox
    if (cameraPos[0] > min[0] && cameraPos[0] < max[0] &&
        cameraPos[1] > min[1] && cameraPos[1] < max[1] &&
        cameraPos[2] > min[2] && cameraPos[2] < max[2]) {

        if (returnDistance) {
            return [Number.POSITIVE_INFINITY, 0.1];
        }
    
        return Number.POSITIVE_INFINITY;
    }

    var factor = 0;
    var camera = this.map.camera.camera;

    //find bbox sector
    if (0 < tilePos1y) { //top row - zero means camera position in y
        if (0 < tilePos1x) { // left top corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos1x, tilePos1y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos1x, tilePos1y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos1x, tilePos1y, (h1 + h2)*0.5], returnDistance);
            }
        } else if (0 > tilePos2x) { // right top corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos2x, tilePos2y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos2x, tilePos2y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos2x, tilePos2y, (h1 + h2)*0.5], returnDistance);
            }
        } else { //top side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, tilePos2y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, tilePos2y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, tilePos2y, (h1 + h2)*0.5], returnDistance);
            }
        }
    } else if (0 > tilePos4y) { //bottom row
        if (0 < tilePos4x) { // left bottom corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos4x, tilePos4y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos4x, tilePos4y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos4x, tilePos4y, (h1 + h2)*0.5], returnDistance);
            }
        } else if (0 > tilePos3x) { // right bottom corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos3x, tilePos3y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos3x, tilePos3y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos3x, tilePos3y, (h1 + h2)*0.5], returnDistance);
            }
        } else { //bottom side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([(tilePos4x + tilePos3x)*0.5, tilePos3y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([(tilePos4x + tilePos3x)*0.5, tilePos3y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([(tilePos4x + tilePos3x)*0.5, tilePos3y, (h1 + h2)*0.5], returnDistance);
            }
        }
    } else { //middle row
        if (0 < tilePos4x) { // left side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos1x, (tilePos2y + tilePos3y)*0.5, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos1x, (tilePos2y + tilePos3y)*0.5, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos1x, (tilePos2y + tilePos3y)*0.5, (h1 + h2)*0.5], returnDistance);
            }
        } else if (0 > tilePos3x) { // right side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos2x, (tilePos2y + tilePos3y)*0.5, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos2x, (tilePos2y + tilePos3y)*0.5, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos2x, (tilePos2y + tilePos3y)*0.5, (h1 + h2)*0.5], returnDistance);
            }
        } else { //center
            if (0 > h2) { // hi
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, (tilePos2y + tilePos3y)*0.5, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, (tilePos2y + tilePos3y)*0.5, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, (tilePos2y + tilePos3y)*0.5, (h1 + h2)*0.5], returnDistance);
            }
        }
    }

    //console.log("new: " + (factor * screenPixelSize) + " old:" + this.tilePixelSize2(node) );

    if (returnDistance) {
        return [(factor[0] * screenPixelSize), factor[1]];
    }

    return (factor * screenPixelSize);
};
*/


GpuGroup.prototype.getNodeTexelSize = function(node, screenPixelSize) {
    var pos = node.volume.center;
    var cameraPos = this.renderer.cameraPosition;
    var d = vec3.length(
        [pos[0] - cameraPos[0],
         pos[1] - cameraPos[1],
         pos[2] - cameraPos[2]]);

    d -= node.volume.radius;

    if (d <= 0) {
        return [Number.POSITIVE_INFINITY, 0.1];
    }

    return [this.renderer.camera.scaleFactor2(d) * screenPixelSize, d];
};


GpuGroup.prototype.normalizeGE = function(node, ge) {
    node.precision = ge;

    for (var i = 0, li = node.nodes.length; i < li; i++) {
        this.normalizeGE(node.nodes[i], ge * 0.5);
    }
}


GpuGroup.prototype.traverseNode = function(node, visible, isready) {

    var renderer = this.renderer;
    var points = node.volume.points2;
    var cameraPos = this.renderer.cameraPosition;

    if (!visible && !renderer.camera.pointsVisible(points, cameraPos)) {
        return;        
    }

//    var res = this.getNodeTexelSize(node, node.precision * renderer.curSize[0] * (1/18) /*node.precision * 100*/);
    var res = this.getNodeTexelSize(node, node.precision * renderer.curSize[0] * this.geFactor /*node.precision * 100*/);

    if (this.loadMode == 0) { // topdown

        if (!node.nodes.length || res[0] <= 1.1) {

            if (node.parent || this.isNodeReady(node)) { 
                this.drawNode(node);
            }

        } else {

            //are nodes ready
            var ready = true;
            var nodes = node.nodes;
            var visible = [];

            for (var i = 0, li = nodes.length; i < li; i++) {
                //visible[i] = renderer.camera.pointsVisible(nodes[i].volume.points2, cameraPos);

                //if (visible[i]) {
                    if (!this.isNodeReady(nodes[i])) {
                        ready = false;
                    }
                //}
            }


            if (ready) {
                for (var i = 0, li = nodes.length; i < li; i++) {
                    //if (visible[i]) {
                        //this.traverseNode(nodes[i], true, true);
                        this.traverseNode(nodes[i]);
                    //}
                }
            } else { // children are not ready, draw parent as fallback

                //if (this.isNodeReady(node)) {
                    this.drawNode(node);
                //}

            }

        }

    } else if (this.loadMode == 1) { // fit

        if (!node.nodes.length || res[0] <= 1.1) {

            if (isready || this.isNodeReady(node)) {
                this.drawNode(node);
            } else { //node is not ready, try childen

                var nodes = node.nodes;

                for (var i = 0, li = nodes.length; i < li; i++) {
                    if (renderer.camera.pointsVisible(nodes[i].volume.points2, cameraPos)) {
                        if (this.isNodeReady(nodes[i], true)) {
                            this.drawNode(node);
                        }
                    }
                }

            }

        } 

        else if (res[0] <= 2.2) {

            //are nodes ready
            var ready = true;
            var nodes = node.nodes;
            var visible = [];

            for (var i = 0, li = nodes.length; i < li; i++) {
                visible[i] = renderer.camera.pointsVisible(nodes[i].volume.points2, cameraPos);

                if (visible[i]) {
                    if (!this.isNodeReady(nodes[i])) {
                        ready = false;
                    }
                }
            }

            if (ready) {
                for (var i = 0, li = nodes.length; i < li; i++) {
                    if (visible[i]) {
                        this.traverseNode(nodes[i], true, true);
                    }
                }
            } else { // children are not ready, draw parent as fallback

                //if (this.isNodeReady(node)) {
                    this.drawNode(node);
                //}

            }

        } else {

            for (var i = 0, li = node.nodes.length; i < li; i++) {
                this.traverseNode(node.nodes[i]);
            }
        }

    } else if (this.loadMode == 2) { // fitonly

        if (!node.nodes.length || res[0] <= 1.1) {

            if (this.isNodeReady(node)) {
                this.drawNode(node);
            }

        } else {
            for (var i = 0, li = node.nodes.length; i < li; i++) {
                this.traverseNode(node.nodes[i]);
            }
        }
    }

};


GpuGroup.prototype.isNodeReady = function(node, doNotLoad) {
    var jobs = node.jobs;
    var ready = true;

    //return true;

    for (var i = 0, li = jobs.length; i < li; i++) {
        var job = jobs[i];
        
        if (job.type == VTS_JOB_MESH) {
            if (!this.isMeshReady(job, doNotLoad)) {
                ready = false;
            }
        }
    }

    return ready;
};


GpuGroup.prototype.drawNode = function(node) {
    var renderer = this.renderer;
    var debug = renderer.core.map.draw.debug;
    var jobs = node.jobs;

    renderer.drawnNodes++;

    if (debug.drawNBBoxes) {
        var points = node.volume.points;

        drawLineString({
            points : [points[0], points[1], points[2], points[3], points[0],
                      points[4], points[5], points[6], points[7], points[4]
            ],
            size : 1.0,
            color : [255,0,255,255],
            depthTest : false,
            //depthTest : true,
            //depthOffset : [-0.01,0,0],
            screenSpace : false, //switch to physical space
            blend : false
            }, renderer);

        drawLineString({
            points : [points[1], points[5]],
            size : 1.0,
            color : [255,0,255,255],
            depthTest : false,
            //depthTest : true,
            //depthOffset : [-0.01,0,0],
            screenSpace : false, //switch to physical space
            blend : false
            }, renderer);

        drawLineString({
            points : [points[2], points[6]],
            size : 1.0,
            color : [255,0,255,255],
            depthTest : false,
            //depthTest : true,
            //depthOffset : [-0.01,0,0],
            screenSpace : false, //switch to physical space
            blend : false
            }, renderer);

        drawLineString({
            points : [points[3], points[7]],
            size : 1.0,
            color : [255,0,255,255],
            depthTest : false,
            //depthTest : true,
            //depthOffset : [-0.01,0,0],
            screenSpace : false, //switch to physical space
            blend : false
            }, renderer);

        var cameraPos = this.renderer.cameraPosition;
        var pos = node.volume.center;

        var shift = [cameraPos[0] - pos[0],
               cameraPos[1] - pos[1],
               cameraPos[2] - pos[2]];

        vec3.normalize(shift);
        vec3.scale(shift, node.volume.radius);

        pos = [pos[0]+shift[0]-cameraPos[0],  
               pos[1]+shift[1]-cameraPos[1],
               pos[2]+shift[2]-cameraPos[2]];

        /*pos = [pos[0]-cameraPos[0],  
               pos[1]-cameraPos[1],
               pos[2]-cameraPos[2]];*/

        pos = this.renderer.core.getRendererInterface().getCanvasCoords(
            pos,
            /*[pos[0] - cameraPos[0],
             pos[1] - cameraPos[1],
             pos[2] - cameraPos[2]],*/
             this.renderer.camera.getMvpMatrix());

        var factor = 2, text;

        if (debug.drawLods) {
            text = '' + this.getNodeLOD(node);
            renderer.draw.drawText(Math.round(pos[0]-renderer.draw.getTextSize(4*factor, text)*0.5), Math.round(pos[1]-4*factor), 4*factor, text, [1,0,0,1], pos[2]);
        }
        
        if (debug.drawDistance) {
            var res = this.getNodeTexelSize(node, node.precision * renderer.curSize[0] * this.geFactor);
            text = '' + res[1].toFixed(2) + ' ' + res[0].toFixed(2) + ' ' + node.precision.toFixed(2);
            renderer.draw.drawText(Math.round(pos[0]-renderer.draw.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+17*factor), 4*factor, text, [0.5,0.5,1,1], pos[2]);
        }

        if (debug.drawFaceCount) {
            var mesh = (jobs[0] && jobs[0].type == VTS_JOB_MESH) ? jobs[0].mesh : null;
            if (mesh) {
                text = '' + mesh.faces + ' - ' + mesh.submeshes.length;
                renderer.draw.drawText(Math.round(pos[0]-renderer.draw.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [0,1,0,1], pos[2]);
            }
        }

        if (debug.drawResources && jobs[0]) {
            text = '' + (this.getGpuSize(jobs[0])/(1024*1024)).toFixed(2) + 'MB';
            renderer.draw.drawText(Math.round(pos[0]-renderer.draw.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+3*factor), 4*factor, text, [0,1,0,1], pos[2]);
        }

        if (debug.drawSurfaces && jobs[0]) {
            var text = '';

            if (jobs[0].texturePath) {
                var parts = jobs[0].texturePath.split('/');

                if (parts.length > 1) {
                    text = parts[parts.length-2] + '/' + parts[parts.length-1];
                } else {
                    text = parts[0];
                }
            }

            renderer.draw.drawText(Math.round(pos[0]-renderer.draw.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [0,1,0,1], pos[2]);
        }

        if (debug.drawTextureSize) {
            var mesh = (jobs[0] && jobs[0].type == VTS_JOB_MESH) ? jobs[0].mesh : null;
            if (mesh) {
                var submeshes = mesh.submeshes;
                for (i = 0, li = submeshes.length; i < li; i++) {

                    if (submeshes[i].internalUVs) {
                        var texture = jobs[0].textures[i];
                        if (texture) {
                            var gpuTexture = texture.getGpuTexture();
                            if (gpuTexture) {
                                text = '[' + i + ']: ' + gpuTexture.width + ' x ' + gpuTexture.height;
                                renderer.draw.drawText(Math.round(pos[0]-renderer.draw.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+(17+i*4*2)*factor), 4*factor, text, [1,1,1,1], pos[2]);
                            }
                        }
                    } else {
                        text = '[' + i + ']: 256 x 256';
                        renderer.draw.drawText(Math.round(pos[0]-renderer.draw.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+(17+i*4*2)*factor), 4*factor, text, [1,1,1,1], pos[2]);
                    }
                }
            }
        }
    }

    //return true;

    for (var i = 0, li = jobs.length; i < li; i++) {
        var job = jobs[i];
        
        if (job.type == VTS_JOB_MESH) {

            //if (this.isMeshReady(job)) {
                this.drawMesh(job);
            //}
        }
    }

};


GpuGroup.prototype.isMeshReady = function(job, doNotLoad) {
    var mesh = job.mesh;
    var submeshes = mesh.submeshes;
    var ready = true;
    var stats = this.renderer.core.map.stats;

    //console.log('' + stats.gpuNeeded + '  ' + job.texturePath);

    if (mesh.isReady(doNotLoad)) {
        stats.gpuNeeded += mesh.gpuSize;

        for (var i = 0, li = submeshes.length; i < li; i++) {
            var submesh = submeshes[i];
            
            if (submesh.internalUVs && job.texturePath) {
                if (job.textures[i] == null) {
                    var path = job.texturePath + '-' + i + '.jpg';
                    job.textures[i] = job.resources.getTexture(path, VTS_TEXTURETYPE_COLOR, null, null, null /*tile*/, true);
                } 

                if (!job.textures[i].isReady(doNotLoad)) {
                    ready = false;
                }

                stats.gpuNeeded += job.textures[i].getGpuSize();
            }
        }

    } else {
        ready = false;
    }

    //console.log('' + stats.gpuNeeded + '  finish');

    return ready;
}


GpuGroup.prototype.getGpuSize = function(job) {
    var mesh = job.mesh;

    if (!mesh) return 0;

    var submeshes = mesh.submeshes;
    var size = 0;
    var doNotLoad = true;

    if (mesh.isReady(doNotLoad)) {
        size += mesh.gpuSize;

        for (var i = 0, li = submeshes.length; i < li; i++) {
            var submesh = submeshes[i];
            
            if (submesh.internalUVs && job.texturePath) {
                if (job.textures[i]) {
                    size += job.textures[i].getGpuSize();
                }
            }
        }
    }

    return size;
}


GpuGroup.prototype.drawMesh = function(job) {
    var mesh = job.mesh;
    var submeshes = mesh.submeshes;
    var cameraPos = this.renderer.cameraPosition;

    for (var i = 0, li = submeshes.length; i < li; i++) {
        var submesh = submeshes[i];
        
        if (job.textures[i]) {
            mesh.drawSubmesh(cameraPos, i, job.textures[i], VTS_MATERIAL_INTERNAL /*type*/, null /*alpha*/, null /*layer*/, null /*surface*/,  null /*splitMask*/);
        }
    }
}

GpuGroup.prototype.draw = function(mv, mvp, applyOrigin, tiltAngle, texelSize) {
    if (this.id != null) {
        if (this.renderer.layerGroupVisible[this.id] === false) {
            return;
        }
    }

    var renderer = this.renderer;
    var renderCounter = [[renderer.geoRenderCounter, mv, mvp, this]];


    if (this.rootNode) {
        renderer.drawnNodes = 0;

        var mode = renderer.core.map.config.mapLoadMode; 

        switch(mode) {
        case 'topdown': this.loadMode = 0; break;
        case 'fit':     this.loadMode = 1; break; 
        case 'fitonly': this.loadMode = 2; break;
        }

        if (!this.geNormalized) {
            this.normalizeGE(this.rootNode, this.rootNode.precision);
            this.geNormalized = true;
        }


        //console.clear();

        this.traverseNode(this.rootNode, map);
        return;
    }


    if (applyOrigin) {
        var mvp2 = mat4.create();
        var mv2 = mat4.create();
        var pos = this.renderer.position;

        /*
        var transform = this.renderer.layerGroupTransform[this.id];

        if (transform != null) {
            origin = transform[1];
            origin = [origin[0] - pos[0], origin[1] - pos[1], origin[2]];
            mat4.multiply(math.translationMatrix(origin[0], origin[1], origin[2]), transform[0], mv2);
            mat4.multiply(mv, mv2, mv2);
        } else {*/
            var origin = this.origin;
            origin = [origin[0] - pos[0], origin[1] - pos[1], origin[2]];
            mat4.multiply(mv, math.translationMatrix(origin[0], origin[1], origin[2]), mv2);
        /*}*/

        mat4.multiply(mvp, mv2, mvp2);
        mv = mv2;
        mvp = mvp2;
    }

    var cameraPos = renderer.cameraPosition;
    var jobZBuffer = renderer.jobZBuffer;
    var jobZBufferSize = renderer.jobZBufferSize;
    var jobZBuffer2 = renderer.jobZBuffer2;
    var jobZBuffer2Size = renderer.jobZBuffer2Size;

    var onlyHitable = renderer.onlyHitLayers;

    for (var i = 0, li = this.jobs.length; i < li; i++) {
        var job = this.jobs[i];

        if ((job.type == VTS_JOB_ICON || job.type == VTS_JOB_LABEL) && job.visibility > 0) {
            var center = job.center;
            if (vec3.length([center[0]-cameraPos[0],
                center[1]-cameraPos[1],
                center[2]-cameraPos[2]]) > job.visibility) {
                continue;
            }
        }

        if (onlyHitable && !job.hitable) {
            continue;
        }

        job.mv = mv;
        job.mvp = mvp;
        job.renderCounter = renderCounter;
        job.tiltAngle = tiltAngle;
        job.texelSize = texelSize;

        var zIndex = job.zIndex;

        jobZBuffer[zIndex][jobZBufferSize[zIndex]] = job;
        jobZBufferSize[zIndex]++;
    }
};


export default GpuGroup;
