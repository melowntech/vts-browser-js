
var ModelOBJ = function(map, renderer, params) {
    if (!map || !renderer || !params || !params.path) {
        return;
    }

    this.optimize = (params.optimize === false)  ? false : true;
    this.textureFilter = params.textureFitler || 'trilinear';
    this.fastTessellation = params.fastTessellation || false;
    this.flipYZ = params.flipYZ || false;
    this.onLoaded = params.onLoaded;

    this.meshes = [];
    this.map = map;
    this.renderer = renderer;
    this.materials = {};
    this.textures = {};
    this.ready = false;
    this.downloading = 1;
    this.basePath = params.path.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    this.normalRS = renderer.createState({culling:true});
    this.blendRS = renderer.createState({culling:true, blend:true});

    vts.utils.loadText(params.path, this.objLoaded.bind(this));
};

ModelOBJ.prototype.loadMaterial = function(path) {
    this.downloading++;
    vts.utils.loadText(this.basePath + path, this.materialLoaded.bind(this));
};

ModelOBJ.prototype.loadTexture = function(path) {
    if (this.textures[path]) {
        return;
    }

    this.textures[path] = {};
    this.downloading++;

    var image = vts.utils.loadImage(this.basePath + path,
        (function(){
            this.textures[path] = this.renderer.createTexture({ source: image, repeat: true, filter:this.textureFilter });
            this.downloading--;
            this.checkStatus();
        }).bind(this, path)
        );
};

ModelOBJ.prototype.checkStatus = function() {
    this.ready = (this.downloading <= 0);

    if (this.ready) {
        this.map.redraw();

        if (this.onLoaded) {
            this.onLoaded();
        }
    }
};

ModelOBJ.prototype.materialLoaded = function(data) {
    var materials = this.materials, material = {};

    var lines = data.match(/[^\r\n]+/g);

    for (var i = 0, li = lines.length; i < li; i++) {
        var line = lines[i];
        var segments = line.split(' ');

        switch(segments[0]) {
            case 'newmtl':
                material = {
                    Ka : [0,0,0],
                    Kd : [0,0,0],
                    Ks : [0,0,0],
                    map_Kd : null,
                    Ns : 90,
                    d : 1.0,
                    blend : false
                }

                materials[segments[1]] = material;
                break;

            case 'Ka':
                material.Ka = [parseFloat(segments[1])*255, parseFloat(segments[2])*255, parseFloat(segments[3])*255];
                break;

            case 'Kd':
                material.Kd = [parseFloat(segments[1])*255, parseFloat(segments[2])*255, parseFloat(segments[3])*255];
                break;

            case 'Ks':
                material.Ks = [parseFloat(segments[1])*255, parseFloat(segments[2])*255, parseFloat(segments[3])*255];
                break;

            case 'Ns':
                material.Ns = parseFloat(segments[1]);
                break;

            case 'd':
                material.d = parseFloat(segments[1]);
                material.blend = (material.blend || material.d < 1.0);
                break;

            case 'Tr':
                material.d = 1-parseFloat(segments[1]);
                break;

            case 'map_Kd':
                material.map_Kd = segments[1];
                material.blend = (material.blend || (segments[1] && segments[1].toLowerCase().indexOf('.png') != -1));
                this.loadTexture(segments[1]);
                break;
        }
    }

    this.downloading--;
    this.checkStatus();
}

ModelOBJ.prototype.objLoaded = function(data) {
    if (!data) {
        return;
    }

    var meshes = this.meshes, mesh = {
        id: 'noname',
        gpuMesh: null,
        materialId: null
    };
    var vertices = new Array(655636*3),
        normals = new Array(655636*3),
        uvs = new Array(655636*2);

    var vertexIndex = 0, normalIndex = 0, uvIndex = 0;
    var meshVertices = [], meshNormals = [], meshUvs = []; 
    var v1, v2, v3, v4, id, materialId;
    var gpuMeshes = [], i, li, j, lj, tmp;

    var lines = data.match(/[^\r\n]+/g);

    for (i = 0, li = lines.length; i < li; i++) {
        var line = lines[i];
        var segments = line.split(' ');

        switch(segments[0]) {
            case 'mtllib':
                this.loadMaterial(segments[1]);
                break;

            case 'o':
            case 'g':
                id = segments[1];

            case 'usemtl':

                if (segments[0] == 'usemtl') {
                    materialId = segments[1];
                }

                if (meshVertices.length > 0) {
                    mesh.gpuData = { vertices: meshVertices, uvs: meshUvs, normals: meshNormals };
                }

                mesh = {
                    id: id,
                    gpuMesh: null,
                    materialId: materialId
                };

                meshes.push(mesh);

                meshVertices = [], meshNormals = [], meshUvs = []; 

                if (segments[0] == 'o') {
                    vertexIndex = 0, normalIndex = 0, uvIndex = 0;
                }

                break;

            case 'v':
                vertices[vertexIndex] = parseFloat(segments[1]);
                vertices[vertexIndex+1] = parseFloat(segments[2]);
                vertices[vertexIndex+2] = parseFloat(segments[3]);
                vertexIndex += 3;
                break;

            case 'vt':
                uvs[uvIndex] = parseFloat(segments[1]);
                uvs[uvIndex+1] = parseFloat(segments[2]);
                uvIndex += 2;
                break;

            case 'vn':
                normals[normalIndex] = parseFloat(segments[1]);
                normals[normalIndex+1] = parseFloat(segments[2]);
                normals[normalIndex+2] = parseFloat(segments[3]);
                normalIndex += 3;
                break;

            case 'f':

                var coords = [], faces;

                if (this.fastTessellation && segments.length <= 5) {
                    if (segments.length == 4) {
                        faces = [0,1,2]
                    } else {
                        faces = [0,1,2,2,3,0];
                    }
                } else if (segments.length == 4) { //simple polygon with 3 vertices
                    faces = [0,1,2]
                } else { //polygom with more than 3 vertices is more complex

                    //get polygon vertices
                    for (j = 1, lj = segments.length; j < lj; j++) {
                        if (segments[j] != "") {
                            var v = segments[j].split('/');
                            index = (v[0]-1) * 3;
                            coords.push(-vertices[index], -vertices[index+1], vertices[index+2]);
                        }

                    }

                    //find polygon plane
                    var nvec = [0,0,0];
                    var uvec = [coords[3] - coords[0], coords[4] - coords[1], coords[5] - coords[2]];
                    vts.vec3.normalize(uvec);

                    j = 6;

                    //find vvector which in not parallel with uvector
                    do {
                        var vvec = [coords[j] - coords[0], coords[j+1] - coords[1], coords[j+2] - coords[2]];
                        vts.vec3.normalize(vvec);
                        vts.vec3.cross(uvec, vvec, nvec);

                        j += 3;
                        if (j >= coords.length) {
                            break;
                        }

                    } while( (Math.abs(nvec[0]) + Math.abs(nvec[1]) + Math.abs(nvec[2])) < 0.0000001 );

                    vts.vec3.cross(nvec, uvec, vvec);

                    //conver polygon vertices to polygon plane
                    for (j = 0, lj = coords.length; j < lj; j+=3) {
                        var uu = uvec[0] * coords[j] + uvec[1] * coords[j+1] + uvec[2] * coords[j+2];
                        var vv = vvec[0] * coords[j] + vvec[1] * coords[j+1] + vvec[2] * coords[j+2];
                        coords[j] = uu;
                        coords[j+1] = vv;
                        coords[j+2] = 0;
                    }

                    //tesselate polygon
                    var faces = vts.earcut(coords, null, 3);
                }

                //store faces
                for (j = 0, lj = faces.length; j < lj; j+=3) {
                    v1 = segments[faces[j]+1].split('/');
                    v2 = segments[faces[j+1]+1].split('/');
                    v3 = segments[faces[j+2]+1].split('/');

                    index = (v1[0]-1) * 3;
                    meshVertices.push(-vertices[index], -vertices[index+1], vertices[index+2]);
                    index = (v2[0]-1) * 3;
                    meshVertices.push(-vertices[index], -vertices[index+1], vertices[index+2]);
                    index = (v3[0]-1) * 3;
                    meshVertices.push(-vertices[index], -vertices[index+1], vertices[index+2]);

                    if (v1[2]) {
                        index = (v1[2]-1) * 3;
                        meshNormals.push(-normals[index], -normals[index+1], normals[index+2]);
                        index = (v2[2]-1) * 3;
                        meshNormals.push(-normals[index], -normals[index+1], normals[index+2]);
                        index = (v3[2]-1) * 3;
                        meshNormals.push(-normals[index], -normals[index+1], normals[index+2]);
                    } else {
                        meshNormals.push(0,1,0, 0,1,0, 0,1,0);
                    }

                    if (v1[1]) {
                        index = (v1[1]-1) * 2;
                        meshUvs.push(uvs[index], 1-uvs[index+1]);
                        index = (v2[1]-1) * 2;
                        meshUvs.push(uvs[index], 1-uvs[index+1]);
                        index = (v3[1]-1) * 2;
                        meshUvs.push(uvs[index], 1-uvs[index+1]);
                    } else {
                        meshUvs.push(0,0, 0,0, 0,0);
                    }
                }

                break;
        }
    }

    if (mesh) {
        mesh.gpuData = { vertices: meshVertices, uvs: meshUvs, normals: meshNormals };
    }

    if (this.flipYZ) {
        for (i = 0, li = meshes.length; i < li; i++) {
            mesh = meshes[i];

            if (mesh.gpuData) {
                meshVertices = mesh.gpuData.vertices;

                for (j = 0, lj = meshVertices.length; j < lj; j+=3) {
                    tmp = meshVertices[j+1];
                    meshVertices[j+1] = -meshVertices[j+2];
                    meshVertices[j+2] = tmp;
                }

                meshNormals = mesh.gpuData.normals;
                for (j = 0, lj = meshNormals.length; j < lj; j+=3) {
                    tmp = meshNormals[j+1];
                    meshNormals[j+1] = -meshNormals[j+2];
                    meshNormals[j+2] = tmp;
                }
            }
        }
    }

    if (!this.optimize) {
        for (i = 0, li = meshes.length; i < li; i++) {
            meshes[i].gpuMesh = this.renderer.createMesh(meshes[i].gpuData);
        }
    } else {
        var newMeshes = [];
        for (i = 0, li = meshes.length; i < li; i++) {
            mesh = meshes[i];

            if (mesh.gpuData && !mesh.merged) {

                newMeshes.push(mesh);

                var index = 0, index2 = 0;
                
                for (j = i, lj = meshes.length; j < lj; j++) { //including mesh itself
                    var mesh2 = meshes[j];
                    if (mesh2.gpuData && !mesh2.merged && mesh2.materialId == mesh.materialId) {
                        
                        var vv = mesh2.gpuData.vertices;
                        var uu = mesh2.gpuData.uvs;
                        var nn = mesh2.gpuData.normals;

                        for (var k = 0, lk = vv.length; k < lk; k++) {
                            vertices[index] = vv[k];
                            normals[index] = nn[k];
                            index++;
                        }

                        for (k = 0, lk = uu.length; k < lk; k++) {
                            uvs[index2] = uu[k];
                            index2++;
                        }

                        mesh2.merged = true;
                        mesh2.gpuData = null;
                    }
                }
                
                mesh.gpuMesh = this.renderer.createMesh({
                    vertices : vertices.slice(0, index),
                    uvs: uvs.slice(0, index2),
                    normals : normals.slice(0, index)
                });
            }
        }

        this.meshes = newMeshes;
    }

    this.downloading--;
    this.checkStatus();
}

ModelOBJ.prototype.drawMeshes = function(mv, norm, blend, ambient, depthOffset, depthOnly) {
    var material, materialMatrix, texture;

    this.renderer.setState(blend ? this.blendRS : this.normalRS);

    var blendPresent = false;

    //loop this meshes
    for (var i = 0, li = this.meshes.length; i < li; i++) {
        var mesh = this.meshes[i];

        if (mesh.gpuMesh) {

            //setup material 
            var material = this.materials[mesh.materialId];

            if (material) {
                materialMatrix = [
                    material.Ka[0]+ambient[0], material.Ka[1]+ambient[1], material.Ka[2]+ambient[2], 0,
                    material.Kd[0], material.Kd[1], material.Kd[2], 0,
                    material.Ks[0], material.Ks[1], material.Ks[2], 0,
                    material.Ns, material.d, 0, 0   
                ];

                if (material.map_Kd) {
                    texture = this.textures[material.map_Kd];
                } else {
                    texture = null;
                }

                blendPresent = (blendPresent || material.blend);

                if (material.blend && !blend) {
                    continue;
                }

            } else {
                texture = null;
                materialMatrix = [
                    0, 0, 0, 0,
                    128, 128, 128, 0,
                    255, 255, 255, 0,
                    90, 1, 0, 0   
                ];
            }       

            //draw mesh
            this.renderer.drawMesh({
                    mesh : mesh.gpuMesh,
                    texture : texture,
                    shader : depthOnly ? 'hit' : (texture ? 'textured-and-shaded' : 'shaded'),
                    depthOffset : depthOffset,
                    shaderVariables : {
                        'uMV' : ['mat4', mv],
                        'uNorm' : ['mat3', norm],
                        'uMaterial' : ['mat4', materialMatrix]
                    }
                });
        }
    }

    return blendPresent; //retuns whether this contains transparent meshes
}


ModelOBJ.prototype.draw = function(params) {
    if (!params || !params.navCoords) {
        return;
    }

    var coords = params.navCoords,
        heightMode = params.heightMode || 'float',
        rotation = params.rotation || [0,0,0],
        scale = params.scale || [1,1,1],
        ambient = params.ambient || [90,90,90],
        depthOffset = params.depthOffset,
        depthOnly = params.depthOnly || false;

    //get camera transformations matrices
    var cameInfo = this.map.getCameraInfo();

    //get local space matrix
    //this matrix makes mesh
    //perpendiculal to the ground
    //and oriteted to the north
    var spaceMatrix = this.map.getNED(coords);

    //we have coords in navigation coodinates,
    //so we need to convert them to camera space.
    //you can imagine camera space as physical space
    //but reative to the camera coordinates
    coords = this.map.convertCoordsFromNavToCameraSpace(coords, heightMode);

    var translateMatrix = vts.math.translationMatrix(coords[0], coords[1], coords[2]);
    var scaleMatrix = vts.math.scaleMatrix(scale[0], scale[1], scale[2]);

    //combine scale, space and translate matrices
    var mv = vts.mat4.create(scaleMatrix);

    if (rotation[2]) { //roll
        vts.mat4.multiply(vts.math.rotationMatrix(2, vts.math.radians(rotation[2])), mv, mv);
    }

    if (rotation[1]) { //pitch
        vts.mat4.multiply(vts.math.rotationMatrix(0, vts.math.radians(rotation[1])), mv, mv);
    }
    
    if (rotation[0]) { //yaw
        vts.mat4.multiply(vts.math.rotationMatrix(1, vts.math.radians(rotation[0])), mv, mv);
    }

    //space and translate
    vts.mat4.multiply(spaceMatrix, mv, mv);
    vts.mat4.multiply(translateMatrix, mv, mv);

    //camera view matrix
    vts.mat4.multiply(cameInfo.viewMatrix, mv, mv);

    var norm = [
        0,0,0,
        0,0,0,
        0,0,0
    ];

    //extract normal transformation matrix from this view matrix
    //this matrix is needed for corret lighting
    vts.mat4.toInverseMat3(mv, norm);

    if (this.drawMeshes(mv, norm, false, ambient, depthOffset, depthOnly)) {
        this.drawMeshes(mv, norm, true, ambient, depthOffset, depthOnly); //draw transparent meshes
    }
};

