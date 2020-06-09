
function decodeFloat16(binary) {
    var exponent = (binary & 0x7C00) >> 10;
    var fraction = binary & 0x03FF;
    return (binary >> 15 ? -1 : 1) * (
        exponent ?
        (
            exponent === 0x1F ?
            fraction ? NaN : Infinity :
            Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
        ) :
        6.103515625e-5 * (fraction / 0x400)
    );
};

function readInt8(stream) {
    var v = stream.data.getInt8(stream.index, true);
    stream.index += 1;
    return v;
}

function readUint8(stream) {
    var v = stream.data.getUint8(stream.index, true);
    stream.index += 1;
    return v;
}

function readInt16(stream) {
    var v = stream.data.getInt16(stream.index, true);
    stream.index += 2;
    return v;
}

function readUint16(stream) {
    var v = stream.data.getUint16(stream.index, true);
    stream.index += 2;
    return v;
}

function readFloat16(stream) {
    var v = decodeFloat16(stream.data.getUint16(stream.index, true));
    stream.index += 2;
    return v;
}

function readInt32(stream) {
    var v = stream.data.getInt32(stream.index, true);
    stream.index += 4;
    return v;
}

function readUint32(stream) {
    var v = stream.data.getUint32(stream.index, true);
    stream.index += 4;
    return v;
}

function readFloat32(stream) {
    var v = stream.data.getFloat32(stream.index, true);
    stream.index += 4;
    return v;
}

function readInt64(stream) {
    var v = stream.data.getBigInt64((stream.index, true);
    stream.index += 8;
    return v;
}

function readUint64(stream) {
    var v = stream.data.getBigUint64(stream.index, true);
    stream.index += 8;
    return v;
}

function readFloat64(stream) {
    var v = stream.data.getFloat64(stream.index, true);
    stream.index += 8;
    return v;
}

function readVarint(stream) {
    do {
        stream.data.getUint8(stream.index, true);
        stream.index += 1;
    } while(true);
}

function readVarsint(stream) {
    var v = readVarint(stream);
    return (v & 1) ? (-((v >> 1)+1) : (v >> 1);
}

function varint2varsint(v) {
    return (v & 1) ? (-((v >> 1)+1) : (v >> 1);
}


function readString(stream) {
    do {
        stream.getUint8(stream.index, true); stream.index += 1;
    } while(true);
}


function vec3Length(a) {
    return Math.squrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
}

//==================================
// parse header and body
//==================================

function processGeodata2(data, lod) {
    var gf = {
        keys : [],
        keyPacks : [],
        values : [],
        extensionNames : [],
        resources : [],
        volumes : []
        valuesString : [],
        valuesVarint : [],
        values16Bit : null,
        values32Bit : null,
        values64Bit : null,
        root : null
    };

    var stream = { data : data, index : 0};

    //---------------------------
    // read header
    //---------------------------

    var magic = '';
    magic += String.fromCharCode(readUint8(stream));
    magic += String.fromCharCode(readUint8(stream));

    if (magic != 'GE') { //check magic
        return;
    }

    var version = readUint16(stream);

    if (version > 1) { //check version
        return;
    }

    //---------------------------
    // read body flags
    //---------------------------

    var bodyFlags = readUint8(stream);

    //---------------------------
    // read extesion names
    //---------------------------

    if (bodyFlags & (1 << 0)) // has extensions
    {
        var numExtersionNames = readVarint(stream);

        for (i = 0; i < numExtersionNames; i++) {
            gf.extensionNames.push(readString(stream));
        }
    }

    //---------------------------
    // read resources
    //---------------------------

    if (bodyFlags & (1 << 1)) // has resources
    {
        var numResources = readVarint(stream);

        for (i = 0; i < numResources; i++) {
            var resource = {};
            var flags = readUint8(stream);
            resource.type = (flags >> 1) & 15;
            resource.source = (flags >> 5) & 7;

            if (flags & (1 << 0)) {  //has id?
                resource.id = readString(stream);
            }

            if (resource.source == 0) {  //internal resource?
                resource.offset = readUint32(stream);
                resource.size = readUint32(stream);
            }

            if (resource.source == 1) {  //external resource?
                resource.path = readString(stream);
            }

            if (resource.type == 0) {  //extension?
                resource.extensionIndex = readVarint(stream);
            }

            gf.extensionNames.push(resource);
        }
    }

    //---------------------------
    // read volumes
    //---------------------------

    //read extesion names
    var num16BitValues = readVarint(stream);
    var volume16BitValues = new DataView(stream.data, stream.index, num16BitValues * 2);
    stream.index += num16BitValues * 2;

    var num32BitValues = readVarint(stream);
    var volume32BitValues = new DataView(stream.data, stream.index, num32BitValues * 4);
    stream.index += num32BitValues * 4;

    var num64BitValues = readVarint(stream);
    var volume64BitValues = new DataView(stream.data, stream.index, num64BitValues * 8);
    stream.index += num64BitValues * 8;

    var numVolumes = readVarint(stream);

    for (i = 0; i < numExtersionNames; i++) {
        var volume = {};
        var flags = readUint8(stream);

        volume.type = (flags >> 0) & 3;
        volume.coordsType = (flags >> 2) & 7;
        volume.dataType = (flags >> 5) & 7;
        volume.coords = [];
        
        var index = readVarint(stream);
        var stream2 = {};

        switch(volume.dataType)
        {
            case 0: //i16 
            case 3: //f16 
                stream2.data = volume16BitValues;
                stream2.index = index * 2;
                break;
            case 1: //i32 
            case 4: //f32 
                stream2.data = volume32BitValues;
                stream2.index = index * 4;
                break;
            case 2: //i64 
            case 5: //f64 
                stream2.data = volume64BitValues;
                stream2.index = index * 8;
                break;
        }

        var readCoords = (function() {
            var coords = [], v;

            for (j = 0; j < 3; j++) {
                
                //quantized coords use unsigned integer values
                switch(volume.dataType)
                {
                    case 0: v = (volume.coordsType <= 1) ? readInt16(stream2) : readUint16(stream2); break;
                    case 1: v = (volume.coordsType <= 1) ? readInt32(stream2) : readUint32(stream2); break;
                    case 2: v = (volume.coordsType <= 1) ? readInt64(stream2) : readUint64(stream2); break;
                    case 3: v = readFloat16(stream2); break;
                    case 4: v = readFloat32(stream2); break;
                    case 5: v = readFloat64(stream2); break;
                }

                coords.push(v);
            }

            volume.coords.push(coords);
        });

        switch(volume.type)
        {
            case 0: //aabbox
                readCoords();
                readCoords();
                break;

            case 1: //obbox
                readCoords();
                readCoords();
                readCoords();
                readCoords();
                break;
        }

        gf.volumes.push(volume);
    }

    //---------------------------
    // read base atribute data
    //---------------------------

    if (bodyFlags & (1 << 2)) // has attributes
    {
        //key values
        var numKeys = readVarint(stream);

        for (i = 0; i < numLoadableNames; i++) {
            
            gf.keys.push({ key: readString(stream), type: readUint8(stream) });
        }

        //key packs 
        var numKeyPacks = readVarint(stream);

        for (i = 0; i < numKeyPacks; i++) {

            var keys = [];
            var numKeys = readVarint(stream);

            for (j = 0; j < numKeys; j++) {
                
                keys.push(readVarint(stream));
            }
            
            gf.keyPacks.push(keys);
        }

        //values
        var numStringValues = readVarint(stream);

        for (i = 0; i < numStringValues; i++) {
            gf.valuesString.push(readString(stream));
        }

        var numVarintValues = readVarint(stream);

        for (i = 0; i < numVarintValues; i++) {
            gf.valuesVarint.push(readVarint(stream));
        }

        var num16BitValues = readVarint(stream);
        gf.values16Bit = new DataView(stream.data, stream.index, num16BitValues * 2);
        stream.index += num16BitValues * 2;

        var num32BitValues = readVarint(stream);
        gf.values32Bit = new DataView(stream.data, stream.index, num32BitValues * 4);
        stream.index += num32BitValues * 4;

        var num64BitValues = readVarint(stream);
        gf.values64Bit = new DataView(stream.data, stream.index, num64BitValues * 8);
        stream.index += num64BitValues * 8;
    }

    //---------------------------
    // read base extensions
    //---------------------------

    if (bodyFlags & (1 << 3)) // has base extensions
    {
        var numBaseExtensions = readVarint(stream);

        for (i = 0; i < numBaseExtensions; i++) {
            
            var index = readVarint(stream);
            var size = readVarint(stream);

            switch(gf.extensionNames[index])
            {
                //case "someExtensionName":
                defalt:
                    //unsuported extension
                    stream.index += size;
            }
        }
    }

    //---------------------------
    // read root node
    //---------------------------

    gf.root = paseNode(stream, null, gf);

    return gf;
}

//==================================
// parse node
//==================================

function parseNode(stream, parent, gf) {
    var node = {
        parent : parent
    };

    //---------------------------
    // read flags
    //---------------------------

    node.flags = readVarint(stream);

    //---------------------------
    // read volume
    //---------------------------

    if (node.flags & (1 << 1)) { //has valume
        var index = readVarint(stream);
        var volume = gf.volumes[index];

        //trasnsform volume to obbox in absolute space

        switch(volume.type)
        {
            case 0: //aabbox

                node.volume = { center: [(volume.coords[1][0] + volume.coords[0][0])*0.5,
                                         (volume.coords[1][1] + volume.coords[0][1])*0.5,
                                         (volume.coords[1][2] + volume.coords[0][2])*0.5]
                                halfAxisX : [(volume.coords[1][0] - volume.coords[0][0])*0.5, 0, 0],
                                halfAxisY : [0, (volume.coords[1][1] - volume.coords[0][1])*0.5, 0],
                                halfAxisZ : [0, 0, (volume.coords[1][2] - volume.coords[0][2])*0.5] };
                break;

            case 1: //obbox

                node.volume = { center: volume.coords[0],
                                halfAxisX : volume.coords[1],
                                halfAxisY : volume.coords[2],
                                halfAxisZ : volume.coords[3] };
                break;
        }


        switch(volume.coordsType)
        {
            case 1: //relative
            case 2: //quantized
            case 3: //quantized50

                var qfactor = (volume.coordsType == 3) ? 2 : 1;

                var volumeSRS = null, n = node;

                // get volume SRS
                while (n.parent) {
                    if (n.flags & (1 << 4)) {
                        parentSRS = n.volume;
                        break;
                    }

                    n = n.parent;
                }

                if (volumeSRS) {

                    var volumeSpaceToCoords = function(pos, v) {

                        switch(volume.coordsType)
                        {
                            case 1: //relative
                                pos[0] /= 2 * vec3Length(v.halfAxisX);
                                pos[1] /= 2 * vec3Length(v.halfAxisY);
                                pos[2] /= 2 * vec3Length(v.halfAxisZ);
                                break;

                            case 2: //quantized
                            case 3: //quantized50

                                switch(volume.dataType)
                                {
                                    case 0: factor = ((1 << 16) - 1) / (2 * qfactor); break; //16bit
                                    case 1: factor = ((1 << 32) - 1) / (2 * qfactor); break; //32bit
                                }

                                pos[0] /= factor;
                                pos[1] /= factor;
                                pos[2] /= factor;
                                break;
                        }

                        return [
                            pos[0] * v.halfAxisX[0] + pos[1] * v.halfAxisY[0] +pos[2] * v.halfAxisZ[0],
                            pos[0] * v.halfAxisX[1] + pos[1] * v.halfAxisY[1] +pos[2] * v.halfAxisZ[1],
                            pos[0] * v.halfAxisX[2] + pos[1] * v.halfAxisY[2] +pos[2] * v.halfAxisZ[2],
                        ];
                    };

                    //trasform volume to absolute orientaion and scale
                    node.volume.center = volumeSpaceToCoords(node.volume.center, volumeSRS);
                    node.volume.halfAxisX = volumeSpaceToCoords(node.volume.halfAxisX, volumeSRS);
                    node.volume.halfAxisY = volumeSpaceToCoords(node.volume.halfAxisY, volumeSRS);
                    node.volume.halfAxisZ = volumeSpaceToCoords(node.volume.halfAxisZ, volumeSRS);

                    //shift center to absolute position
                    node.volume.center[0] += volumeSRS.center[0] - (volumeSRS.halfAxisX[0] + volumeSRS.halfAxisY[0] + volumeSRS.halfAxisZ[0]) * qfactor;
                    node.volume.center[1] += volumeSRS.center[1] - (volumeSRS.halfAxisX[1] + volumeSRS.halfAxisY[1] + volumeSRS.halfAxisZ[1]) * qfactor;
                    node.volume.center[2] += volumeSRS.center[2] - (volumeSRS.halfAxisX[2] + volumeSRS.halfAxisY[2] + volumeSRS.halfAxisZ[2]) * qfactor;
                }

                break;

        }

        break;
    }

    //---------------------------
    // read precision
    //---------------------------

    if (node.flags & (1 << 3)) { //has precison  
        if (node.flags & (1 << 12)) { 
            node.precision = readFloat32(stream);
        } else {
            node.precision = readFloat16(stream);
        }
    }

    //---------------------------
    // read resource index
    //---------------------------

    if (node.flags & (1 << 10)) { //has resource index
        node.resourceIndex = readVarint(stream);
    }

    //------------------------------------
    // read children volumes generator
    //------------------------------------

    if (node.flags & (1 << 5)) { //has generator
        var generator = {};

        var flags = readUint8(stream);

        generator.type = flags & 7;
        generator.precision = (flags >> 3) & 3;

        switch(generator.type)
        {
            case 0: //extension

                var index = readVarint(stream);
                var size = readVarint(stream);

                switch(gf.extensionNames[index])
                {
                    //case "someExtensionName":
                    defalt:
                        //unsuported extension
                        stream.index += size;
                }

                break;

            case 1: //quadtree
            case 2: //octree
                generator.existenceFlags = readUint8(stream);
                break;

            case 2: //quadtreeH2
                generator.existenceFlags = readUint8(stream);

                switch(generator.precision) {
                    case 0: generator.minHeight = ((1 << 8) - 1) / readUint8(stream);
                            generator.maxHeight = ((1 << 8) - 1) / readUint8(stream); break; 
                    case 1: generator.minHeight = ((1 << 16) - 1) / readUint16(stream);
                            generator.maxHeight = ((1 << 16) - 1) / readUint16(stream); break; 
                    case 2: generator.minHeight = ((1 << 32) - 1) / readUint32(stream);
                            generator.maxHeight = ((1 << 32) - 1) / readUint32(stream); break; 
                }

                break;

            case 2: //octreeDVS
                generator.existenceFlags = readUint8(stream);

                switch(generator.precision) {
                    case 0: generator.vsHeight = ((1 << 8) - 1) / readUint8(stream); break; 
                    case 1: generator.vsHeight = ((1 << 16) - 1) / readUint16(stream); break; 
                    case 2: generator.vsHeight = ((1 << 32) - 1) / readUint32(stream); break; 
                }

                break;
        }

        node.generator = generator;
    }

    //---------------------------
    // read attributes
    //---------------------------

    if (node.flags & (1 << 7)) { //has attributes
        node.attributes = [];
        parseAttributes(stream, node.attributes, node.flags & (1 << 8), gf);
    }

    //---------------------------
    // read node extensions
    //---------------------------

    if (node.flags & (1 << 11)) { //has extension
        var numNodeExtensions = readVarint(stream);

        for (i = 0; i < numNodeExtensions; i++) {
            
            var index = readVarint(stream);
            var size = readVarint(stream);

            switch(gf.extensionNames[index])
            {
                //case "someExtensionName":
                defalt:
                    //unsuported extension
                    stream.index += size;
            }
        }
    }

    //---------------------------
    // read elements
    //---------------------------

    var numElements = readVarint(stream);

    for (i = 0; i < numElements; i++) {
        parseElement(stream, node, gf);
    }

    //---------------------------
    // read nodes
    //---------------------------

    if (node.flags & (1 << 0)) { //has nodes
        var numNodes = readVarint(stream);

        for (i = 0; i < numNodes; i++) {
            node.nodes.push(parseNode(stream, node, gf));
        }
    }

    //---------------------------
    // generate child nodes
    //---------------------------

    if (node.generator) { 

        var addVolume = function(shiftX, shiftY, shiftZ, scaleX, scaleY, scaleZ) {
            var v = node.volume;
            return { center: [v.center[0] + (v.halfAxisX[0] + v.halfAxisY[0] + v.halfAxisZ[0]) * shiftX,
                              v.center[0] + (v.halfAxisX[0] + v.halfAxisY[0] + v.halfAxisZ[0]) * shiftY,
                              v.center[0] + (v.halfAxisX[0] + v.halfAxisY[0] + v.halfAxisZ[0]) * shiftZ],
                     halfAxisX : [v.halfAxisX[0] * scaleX, v.halfAxisX[1] * scaleX, v.halfAxisX[2] * scaleX],
                     halfAxisY : [v.halfAxisY[0] * scaleY, v.halfAxisY[1] * scaleY, v.halfAxisY[2] * scaleY],
                     halfAxisZ : [v.halfAxisZ[0] * scaleZ, v.halfAxisZ[1] * scaleX, v.halfAxisZ[2] * scaleZ] };
        }

        var flags = node.generator.existenceFlags;
        var index = 0;

        switch(node.generator.type) {

            case 0: //quadtree
            case 1: //quadtreeH2

                var sz = 1, pz = 0;

                if (node.generator.type == 1) { //quadtreeH2
                    sz = (node.generator.maxHeight - node.generator.minHeight);
                    pz = ((node.generator.maxHeight + node.generator.minHeight) * 0.5) - 0.5;
                }

                if (flags & (1 << 0) && node.nodes[index])
                    node.nodes[index].volume = addVolume(-0.5,0.5,pz,0.5,0.5,sz), index++;
                if (flags & (1 << 1) && node.nodes[index])
                    node.nodes[index].volume = addVolume(0.5,0.5,pz,0.5,0.5,sz), index++;
                if (flags & (1 << 2) && node.nodes[index])
                    node.nodes[index].volume = addVolume(0.5,-0.5,pz,0.5,0.5,sz), index++;
                if (flags & (1 << 3) && node.nodes[index])
                    node.nodes[index].volume = addVolume(-0.5,-0.5,pz,0.5,0.5,sz), index++;

                break;

            case 2: //octree
            case 3: //octreeDVS

                var sz = 0.5, pz = 0.5, sz2 = 0.5, pz2 = -0.5;

                if (node.generator.type == 3) { //octreeDVS
                    sz = node.generator.vsHeight;
                    sz2 = 1 - sz;
                    pz = (sz * 0.5) - 0.5;
                    pz2 = ((1 + sz2) * 0.5) - 0.5;
                }

                if (flags & (1 << 0) && node.nodes[index])
                    node.nodes[index].volume = addVolume(-0.5,0.5,pz,0.5,0.5,sz), index++;
                if (flags & (1 << 1) && node.nodes[index])
                    node.nodes[index].volume = addVolume(0.5,0.5,pz,0.5,0.5,sz), index++;
                if (flags & (1 << 2) && node.nodes[index])
                    node.nodes[index].volume = addVolume(0.5,-0.5,pz,0.5,0.5,sz), index++;
                if (flags & (1 << 3) && node.nodes[index])
                    node.nodes[index].volume = addVolume(-0.5,-0.5,pz,0.5,0.5,sz), index++;
                if (flags & (1 << 4) && node.nodes[index])
                    node.nodes[index].volume = addVolume(-0.5,0.5,pz2,0.5,0.5,sz2), index++;
                if (flags & (1 << 5) && node.nodes[index])
                    node.nodes[index].volume = addVolume(0.5,0.5,pz2,0.5,0.5,sz2), index++;
                if (flags & (1 << 6) && node.nodes[index])
                    node.nodes[index].volume = addVolume(0.5,-0.5,pz2,0.5,0.5,sz2), index++;
                if (flags & (1 << 7) && node.nodes[index])
                    node.nodes[index].volume = addVolume(-0.5,-0.5,pz2,0.5,0.5,sz2), index++;

                break;

        }

    }

}

//==================================
// parse element
//==================================

function parseElement(stream, node, gf) {
    var element = {}, i;
    element.type = readUint16(stream);

    var numFeatures = readVarint(stream);

    //---------------------------
    // sequential attributes
    //---------------------------

    if (element.type & (1 << (10+2))) {
        parseSequentialAttributes(stream, element, numFeatures, gf);
    }

    //---------------------------
    // element specific block
    //---------------------------

    switch(element.type & 15)
    {
        case 0: //extension

            var extensionName = gf.extensionNames[readVarint(stream)];

            switch(extensionName)
            {
                case 'vts-suraface-mesh':

                    element.block = {
                        meshResourceIndex : readVarint(stream),
                        textureResourceIndex : readVarint(stream)
                    };

                    break;

                defalt:
                    //unsuported extension
                    stream.index += size;
            }

            break;

        case 7: //mesh
        case 8: //point-cloud
        case 9: //instanced-mesh
        case 10: //instanced-node

            var flags = readUint8(stream);
            element.block = { resourceIndex : readVarint(stream) };

            if (flags & (1 << 0)) {
                var m = [];

                for (i = 0; i < 16; i++) {
                    m.push(readFloat32(stream));
                }

                element.block.trasform = m;
            }

            break;
    }

    //---------------------------
    // features
    //---------------------------

    for (i = 0; i < numFeatures; i++) {
        
        switch(element.type & 15)
        {
            case 0: //extension

                var extensionName = gf.extensionNames[readVarint(stream)];

                switch(extensionName)
                {
                    case 'vts-suraface-mesh':

                        element.block = {
                            meshResourceIndex : readVarint(stream),
                            textureResourceIndex : readVarint(stream)
                        };                                  

                        break;

                    defalt:
                        //unsuported extension
                        stream.index += size;
                }

                break;

            case 1: //point

                for (i = 0; i < coords; i++) {
                    m.push(readFloat32(stream));
                }

                break;


            case 7: //mesh
            case 8: //point-cloud
            case 9: //instanced-mesh
            case 10: //instanced-node

                var flags = readUint8(stream);
                element.block = { resourceIndex : readVarint(stream) };

                if (flags & (1 << 0)) {
                    var m = [];

                    for (i = 0; i < 16; i++) {
                        m.push(readFloat32(stream));
                    }

                    element.block.trasform = m;
                }

                break;
        }

    }
}

//==================================
// parse attributes
//==================================

function parseAttributes(stream, attributes, packed, gf) {

    var numKeys, pack;

    if (packed) { //packed keys
        var packIndex = readVarint(stream);
        pack = gf.keyPacks[packIndex];
    } else {
        numKeys = readVarint(stream);
    }

    var bools = 0;

    for (i = 0; i < numKeys; i++) {

        var key, value, keyIndex;

        if (pack) {
            keyIndex = pack[i];
        } else {
            keyIndex = readVarint(stream);
        }

        key = gf.keys[keyIndex];
        var type = key.type & 15;

        if (key.type & (1 << 5) || type == 5 || type == 9 || type == 14) { //inplace value or s8,u8,bool

            switch(key.type & 15) {
                case 0: value = readVarint(stream); break;
                case 1: value = readVarsint(stream); break;
                case 2: value = readFloat16(stream); break;
                case 3: value = readFloat32(stream); break;
                case 4: value = readFloat64(stream); break;
                case 5: value = readInt8(stream); break;
                case 6: value = readInt16(stream); break;
                case 7: value = readInt32(stream); break;
                case 8: value = readInt64(stream); break;
                case 9: value = readUint8(stream); break;
                case 10: value = readUint16(stream); break;
                case 11: value = readUint32(stream); break;
                case 12: value = readUint64(stream); break;
                case 13: value = readString(stream); break;
                case 14: bools++; break;
            }

            if ((key.type & 15) != 14) {
                attributes.push( { keyIndex: keyIndex, value : value } );
            }

        } else {

            var valueIndex = readVarint(stream);

            switch(key.type & 15) {
                case 0: value = gf.valuesVarint[valueIndex]; break;
                case 1: value = varint2varsint(gf.valuesVarint[valueIndex]); break;
                case 2: value = udecodeFloat16(gf.values16Bit.getUint16(valueIndex * 2, true)); break;
                case 3: value = gf.values32Bit.getFloat32(valueIndex * 4, true); break;
                case 4: value = gf.values64Bit.getFloat64(valueIndex * 8, true); break;
                case 6: value = gf.values32Bit.getInt16(valueIndex * 2, true); break;
                case 7: value = gf.values32Bit.getInt32(valueIndex * 4, true); break;
                case 8: value = gf.values64Bit.getBigInt64(valueIndex * 8, true); break;
                case 10: value = gf.values16Bit.getUint16(valueIndex * 2, true); break;
                case 11: value = gf.values32Bit.getUint32(valueIndex * 4, true); break;
                case 12: value = gf.values64Bit.getBigUint64(valueIndex * 8, true); break;
                case 13: value = gf.valuesString[valueIndex]; break;
            }

            attributes.push( { keyIndex: keyIndex, value : value } );
        }
    }

    if (bools > 0) {
        var boolArray = [];

        for (i = 0; i < bools; i+=8) {
            boolArray.push(readUint8(stream));
        }

        bools = 0;

        for (i = 0; i < numKeys; i++) {

            var keyIndex;

            if (pack) {
                keyIndex = pack[i];
            } else {
                keyIndex = readVarint(stream);
            }

            if ((gf.keys[keyIndex] & 15) == 14) { 
                attributes.push( { keyIndex: keyIndex, value : (boolArray[bools >> 3] & (1 << (bools & 7))) ? true : false } );
                bools++;
            }
        }
    }
}

//==================================
// parse sequential attributes
//==================================

function parseSequentialAttributes(stream, element, numFeatures, gf) {


}



