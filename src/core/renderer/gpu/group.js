
import {vec3 as vec3_, mat4 as mat4_} from '../../utils/matrix';
import BBox_ from '../bbox';
import {math as math_} from '../../utils/math';

//get rid of compiler mess
var vec3 = vec3_, mat4 = mat4_;
var BBox = BBox_;
var math = math_;


var GpuGroup = function(id, bbox, origin, gpu, renderer) {
    this.id = id;
    this.bbox = null;
    this.origin = origin || [0,0,0];
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.renderer = renderer;
    this.jobs = [];
    this.reduced = 0;

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
        case 'flat-line':
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;

        case 'flat-tline':
        case 'pixel-line':
        case 'pixel-tline':
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexNormalBuffer) this.gl.deleteBuffer(job.vertexNormalBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;

        case 'line-label':
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexTexcoordBuffer) this.gl.deleteBuffer(job.vertexTexcoordBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;

        case 'icon':
        case 'label':
            if (job.vertexPositionBuffer) this.gl.deleteBuffer(job.vertexPositionBuffer);
            if (job.vertexTexcoordBuffer) this.gl.deleteBuffer(job.vertexTexcoordBuffer);
            if (job.vertexOriginBuffer) this.gl.deleteBuffer(job.vertexOriginBuffer);
            if (job.vertexElementBuffer) this.gl.deleteBuffer(job.vertexElementBuffer);
            break;
        }
    }
};


GpuGroup.prototype.size = function() {
    return this.size;
};


GpuGroup.prototype.getZbufferOffset = function() {
    return this.size;
};


GpuGroup.prototype.addLineJob = function(data) {
    var gl = this.gl;

    var vertices = data['vertexBuffer'];
    var color = data['color'];
    var f = 1.0/255;

    var job = {};
    job.type = 'flat-line';
    job.program = data['program'];
    job.color = [color[0]*f, color[1]*f, color[2]*f, color[3]*f];
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

    //create vertex buffer
    job.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    job.vertexPositionBuffer.itemSize = 3;
    job.vertexPositionBuffer.numItems = vertices.length / 3;

    if (job.advancedHit) {
        var elements = data['elementBuffer'];

        gl.bufferData(gl.ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        job.vertexElementBuffer.itemSize = 1;
        job.vertexElementBuffer.numItems = elements.length;
    }

    this.jobs.push(job);

    this.size += vertices.length * 4;
    this.polygons += vertices.length / 3;
};


GpuGroup.prototype.addExtentedLineJob = function(data) {
    var gl = this.gl;

    var vertices = data['vertexBuffer'];
    var normals = data['normalBuffer'];
    var color = data['color'];
    var f = 1.0/255;

    var job = {};
    job.type = data['type'];
    job.program = data['program'];
    job.color = [color[0]*f, color[1]*f, color[2]*f, color[3]*f];
    job.zIndex = data['z-index'] + 256;
    job.clickEvent = data['click-event'];
    job.hoverEvent = data['hover-event'];
    job.hitable = data['hitable'];
    job.eventInfo = data['eventInfo'];
    job.enterEvent = data['enter-event'];
    job.leaveEvent = data['leave-event'];
    job.advancedHit = data['advancedHit'];
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
        var background = data['background'];

        if (background[3] != 0) {
            job.background = [background[0]*f, background[1]*f, background[2]*f, background[3]*f];
        }
    }

    switch(job.type) {
    case 'flat-tline':   job.program = (background[3] != 0) ? this.renderer.progTBLine : this.renderer.progTLine;  break;
    case 'pixel-line':   job.program = this.renderer.progLine3;  break;
    case 'pixel-tline':  job.program = (background[3] != 0) ? this.renderer.progTPBLine : this.renderer.progTPLine; break;
    }

    //create vertex buffer
    job.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    job.vertexPositionBuffer.itemSize = 4;
    job.vertexPositionBuffer.numItems = vertices.length / 4;

    //create normal buffer
    job.vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexNormalBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    job.vertexNormalBuffer.itemSize = 4;
    job.vertexNormalBuffer.numItems = normals.length / 4;

    if (job.advancedHit) {
        var elements = data['elementBuffer'];

        gl.bufferData(gl.ARRAY_BUFFER, elements, gl.STATIC_DRAW);
        job.vertexElementBuffer.itemSize = 1;
        job.vertexElementBuffer.numItems = elements.length;
    }

    this.jobs.push(job);

    this.size += vertices.length * 4 + normals.length * 4;
    this.polygons += vertices.length / 4;
};


GpuGroup.prototype.addLineLabelJob = function(data) {
    var gl = this.gl;

    var vertices = data['vertexBuffer'];
    var texcoords = data['texcoordsBuffer'];
    var color = data['color'];
    var f = 1.0/255;

    var job = {};
    job.type = 'line-label';
    job.program = data['program'];
    job.color = [color[0]*f, color[1]*f, color[2]*f, color[3]*f];
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

    //create vertex buffer
    job.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    job.vertexPositionBuffer.itemSize = 4;
    job.vertexPositionBuffer.numItems = vertices.length / 4;

    //create normal buffer
    job.vertexTexcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
    job.vertexTexcoordBuffer.itemSize = 4;
    job.vertexTexcoordBuffer.numItems = texcoords.length / 4;

    this.jobs.push(job);

    this.size += vertices.length * 4 + texcoords.length * 4;
    this.polygons += vertices.length / 4;
};


GpuGroup.prototype.addIconJob = function(data, label) {
    var gl = this.gl;

    var vertices = data['vertexBuffer'];
    var texcoords = data['texcoordsBuffer'];
    var origins = data['originBuffer'];
    var color = data['color'];
    var s = data['stick'];
    var f = 1.0/255;

    var job = {};
    job.type = label ? 'label' : 'icon';
    job.program = data['program'];
    job.color = [color[0]*f, color[1]*f, color[2]*f, color[3]*f];
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
    job.stick = [s[0], s[1], s[2], s[3]*f, s[4]*f, s[5]*f, s[6]*f];
    job.lod = data['lod'];
    job.zbufferOffset = data['zbuffer-offset'];
    job.reduced = false;
    job.ready = true;

    if (label !== true) {
        var icon = data['icon'];
        job.texture = this.renderer.getBitmap(icon['url'], icon['filter'] || 'linear', icon['tiled'] || false);
    } else {
        job.texture = this.renderer.font.texture;
    }

    //create vertex buffer
    job.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    job.vertexPositionBuffer.itemSize = 4;
    job.vertexPositionBuffer.numItems = vertices.length / 4;

    //create normal buffer
    job.vertexTexcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, texcoords, gl.STATIC_DRAW);
    job.vertexTexcoordBuffer.itemSize = 4;
    job.vertexTexcoordBuffer.numItems = texcoords.length / 4;

    //create origin buffer
    job.vertexOriginBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexOriginBuffer);

    //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(origins), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, origins, gl.STATIC_DRAW);
    job.vertexOriginBuffer.itemSize = 3;
    job.vertexOriginBuffer.numItems = origins.length / 3;

    this.jobs.push(job);

    this.size += job.vertexPositionBuffer.numItems * 4 +
                  job.vertexOriginBuffer.numItems * 4 +
                  job.vertexTexcoordBuffer.numItems * 4;
    this.polygons += job.vertexPositionBuffer.numItems / 4;
};


GpuGroup.prototype.addRenderJob = function(data) {
    switch(data['type']) {
    case 'flat-line':   this.addLineJob(data); break;
    case 'flat-tline':  this.addExtentedLineJob(data); break;
    case 'pixel-line':  this.addExtentedLineJob(data); break;
    case 'pixel-tline': this.addExtentedLineJob(data); break;
    case 'line-label':  this.addLineLabelJob(data); break;
    case 'icon':        this.addIconJob(data); break;
    case 'label':       this.addIconJob(data, true); break;
    case 'optimize':    this.optimaze(data); break;
    }
};


GpuGroup.prototype.draw = function(mv, mvp, applyOrigin) {
    if (this.id != null) {
        if (this.renderer.layerGroupVisible[this.id] === false) {
            return;
        }
    }

    if (applyOrigin) {
        var origin;
        var mvp2 = mat4.create();
        var mv2 = mat4.create();
        var pos = this.renderer.position;

        var transform = this.renderer.layerGroupTransform[this.id];

        if (transform != null) {
            origin = transform[1];
            origin = [origin[0] - pos[0], origin[1] - pos[1], origin[2]];
            mat4.multiply(math.translationMatrix(origin[0], origin[1], origin[2]), transform[0], mv2);
            mat4.multiply(mv, mv2, mv2);
        } else {
            origin = [this.origin[0] - pos[0], this.origin[1] - pos[1], this.origin[2]];
            mat4.multiply(mv, math.translationMatrix(origin[0], origin[1], origin[2]), mv2);
        }

        mat4.multiply(mvp, mv2, mvp2);
        mv = mv2;
        mvp = mvp2;
    }

    var cameraPos = this.renderer.cameraPosition;
    var jobZBuffer = this.renderer.jobZBuffer;
    var jobZBufferSize = this.renderer.jobZBufferSize;

    var onlyHitable = this.renderer.onlyHitLayers;

    for (var i = 0, li = this.jobs.length; i < li; i++) {
        var job = this.jobs[i];

        if ((job.type == 'icon' || job.type == 'label') && job.visibility > 0) {
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

        var zIndex = job.zIndex;
        jobZBuffer[zIndex][jobZBufferSize[zIndex]] = job;
        jobZBufferSize[zIndex]++;
    }
};


export default GpuGroup;
