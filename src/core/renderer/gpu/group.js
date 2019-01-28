
import {vec3 as vec3_, mat4 as mat4_} from '../../utils/matrix';
import BBox_ from '../bbox';
import {math as math_} from '../../utils/math';
import {utils as utils_} from '../../utils/utils';

//get rid of compiler mess
var vec3 = vec3_, mat4 = mat4_;
var BBox = BBox_;
var math = math_;
var utils = utils_;


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

    if (bbox != null && bbox[0] != null && bbox[1] != null) {
        this.bbox = new BBox(bbox[0][0], bbox[0][1], bbox[0][2], bbox[1][0], bbox[1][1], bbox[1][2]);
    }

    this.size = 0;
    this.polygons = 0;
};7

//destructor
GpuGroup.prototype.kill = function() {
    for (var i = 0, li = this.jobs.length; i < li; i++) {
        var job = this.jobs[i]; 

        switch(job.type) {
        case VTS_JOB_FLAT_LINE:
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


GpuGroup.prototype.size = function() {
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
    job.type = VTS_JOB_FLAT_LINE;
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
    job.state = data['state'];
    job.center = data['center'];
    job.lod = data['lod'];
    job.lineWidth = data['line-width'];
    job.zbufferOffset = data['zbuffer-offset'];
    job.reduced = false;
    job.ready = true;

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


GpuGroup.prototype.addLineLabelJob = function(data) {
    var gl = this.gl;

    var vertices = data.vertexBuffer;
    var texcoords = data.texcoordsBuffer;

    var job = {};
    job.type = VTS_JOB_LINE_LABEL;
    job.program = this.renderer.progText;
    job.color = this.convertColor(data['color']);
    job.color2 = this.convertColor(data['color2']);
    job.outline = data['outline'];
    job.zIndex = data['z-index'] + 256;
    job.clickEvent = data['click-event'];
    job.hoverEvent = data['hover-event'];
    job.enterEvent = data['enter-event'];
    job.leaveEvent = data['leave-event'];
    job.hitable = data['hitable'];
    job.eventInfo = data['eventInfo'];
    job.state = data['state'];
    job.center = data['center'];
    job.lod = data['lod'];
    job.zbufferOffset = data['zbuffer-offset'];
    job.reduced = false;
    job.ready = true;

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

    this.jobs.push(job);

    this.size += vertices.length * 4 + texcoords.length * 4;
    this.polygons += vertices.length / (4 * 3);
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

    //console.log('id: ' + job.eventInfo['#id']);

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
        }

        job.reduce[5] = 0; //zero debug value

        if (job.reduce[0] == 7 || job.reduce[0] == 8 || job.reduce[0] == 9) {
            job.reduce[2] = Math.abs(job.reduce[1]); //copy prominence for prom / dist support
            //job.reduce[1] = Math.log(job.reduce[2]) * VTS_IMPORATANCE_INV_LOG;
            //job.reduce[1] = Math.log(job.reduce[2]) / Math.log(1.0017);

            if (this.renderer.config.mapFeaturesReduceFactor == 1) { // prom / dists
                job.reduce[1] = job.reduce[2];
            } else {
                job.reduce[1] = Math.floor((Math.log(job.reduce[2] * 500) / Math.log(1.0017)) + 5000);
            }
        }
    }

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
    }

    return index;
};


GpuGroup.prototype.addRenderJob = function(data, tile) {
    switch(data['type']) {
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
    }
};


GpuGroup.prototype.draw = function(mv, mvp, applyOrigin, tiltAngle, texelSize) {
    if (this.id != null) {
        if (this.renderer.layerGroupVisible[this.id] === false) {
            return;
        }
    }

    var renderer = this.renderer;
    var renderCounter = [[renderer.geoRenderCounter, mv, mvp, this]];

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
