import { pathToSDF } from './libs/sdf.js';

var iframeRight = null;
var panelList = null;
var positions = [];
var form = null;
var cancelPressed = false;

var canvases = [], ctxs = [];
var previewCanvas, previewCtx;
var previewCanvas2, previewCtx2;
var font = null;
var binaryExportData = null;
var binaryFontData = null;
var binaryFontDataIndex = 0;
var binaryFontHeaderIndex = 0;
var fileIndicesOffset256 = 0;
var fileIndicesOffset512 = 0;

function init() {
    iframeRight = document.getElementById('right-controls');
    panelList =  document.getElementById('panel-list');
    form = document.getElementById('right-controls');

    for (var i = 0; i < 5; i++) {
        canvases[i] = document.getElementById('font-canvas' + i);
        ctxs[i] = canvases[i].getContext("2d");
    }

    previewCanvas = document.getElementById('preview-canvas');
    previewCanvas2 = document.getElementById('preview-canvas2');
    previewCtx = previewCanvas.getContext("2d");
    previewCtx2 = previewCanvas2.getContext("2d");

    var node = document.body;
    node.addEventListener("drop", onDrop, false);
    node.addEventListener("dragenter", cancel, false);
    node.addEventListener("dragleave", cancel, false);
    node.addEventListener("dragover",  cancel, false);
}

function cancel(e) {  e.stopPropagation(); e.preventDefault();  }

function onDrop(e) {  
    cancel(e);
    var r = new FileReader();
    r.onload = function(e) { fontLoaded(e.target.result); };
    r.readAsArrayBuffer( e.dataTransfer.files[0] );
}

   
function fontLoaded(data) {
    font = Typr.parse(data);
    console.log(font);
    
    //supported tags
    var tags = [ "cmap", "head", "hhea", "maxp", "hmtx", "name", "OS/2",
    //"post",
    "loca",
    //"glyf",
    "kern","CFF ","GPOS","GSUB" ];

    //get total size
    var total = 0;
    var tabs = font._tabs;
    var vtsheader = 1 + 2 + 2 + 1 + 1;

    for (var key in tabs) {
        if (tags.indexOf(key) != -1) {
            var tab = tabs[key];
            total += tab.length;
        }
    }

    //clone font without geometery
    var source = font._data;
    var offset = 0, i, li;

    //version + numTables + searchRange + entrySelector + rangeShift
    var headerSize = 4 + 2 + 2 + 2 + 2;
    offset += headerSize;

    //tag + checkSum + toffset + length
    var tabSize = 4 + 4 + 4 + 4;
    var totalTabs = 0, currentTab = 0;

    for (var key in tabs) {
        if (tags.indexOf(key) != -1) {
            totalTabs ++;
        }
    }

    offset += tabSize * totalTabs;

    total += offset;
    total += vtsheader;
    total += font.maxp.numGlyphs * 6; //space for glyphs positions

    fileIndicesOffset256 = total;
    total += font.maxp.numGlyphs; //for textures bigger than 256
    fileIndicesOffset512 = total;

    total += font.maxp.numGlyphs; // reserve space for file indices

    var data2 = new Uint8Array(total);

    //copy header
    for (i = 0, li = headerSize; i < li; i++) {
        data2[i] = source[i];
    }

    //modify numtables
    data2[4] = (totalTabs >> 8) & 0xff;
    data2[4 + 1] = (totalTabs) & 0xff;

    //copy tabs
    for (var key in tabs) {
        if (tags.indexOf(key) != -1) {
            var tab = tabs[key];
            var offset2 = tab.offset2;
            var offset3 = headerSize + currentTab * tabSize; 

            //copy tab info
            for (i = 0, li = 16; i < li; i++) { 
                data2[offset3 + i] = source[offset2 + i];
            }

            //modify tab info - toffset
            data2[offset3 + 8] = (offset >> 24) & 0xff;
            data2[offset3 + 8 + 1] = (offset >> 16) & 0xff;
            data2[offset3 + 8 + 2] = (offset >> 8) & 0xff;
            data2[offset3 + 8 + 3] = (offset) & 0xff;

            //copy tab data
            for (i = 0, li = tab.length; i < li; i++) {
                data2[i + offset] = source[i + tab.offset];
            }

            currentTab++;
            offset += li;
        }
    }

    binaryFontHeaderIndex = offset;
    binaryFontDataIndex = offset + vtsheader;
    binaryFontData = data2;

    document.getElementById('panel-font').innerHTML = "Font: Loaded (" + font.maxp.numGlyphs + " glyphs)";
}

function finishFontHeader(textureLX) {
    var index = 0;

    if (textureLX > 256) {
        index = fileIndicesOffset512;
    } else {
        index = fileIndicesOffset256;
    }

    binaryFontData[index] = (fontFilesIndices.length >> 8) & 255;
    binaryFontData[index+1] = fontFilesIndices.length & 255;

    index += 2;

    for (var i = 0, li = fontFilesIndices.length; i < li; i++) {
        binaryFontData[index] = fontFilesIndices[i] >> 8;
        binaryFontData[index+1] = fontFilesIndices[i] & 255;
        index += 2;
    }

    return new Uint8Array(binaryFontData.buffer, 0, index);
}

function saveData(filename, data, type) {
    var file = new Blob([data], {type: type});

    var url = URL.createObjectURL(file);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
}

// Convert alpha-only to RGBA so we can use convenient
// `putImageData` for building the composite bitmap
function makeRGBAImageData(alphaChannel, w, h) {
    var imageData = ctxs[4].createImageData(w, h);
    var data = imageData.data;
    for (var i = 0; i < alphaChannel.length; i++) {
        data[4 * i + 0] = alphaChannel[i];
        data[4 * i + 1] = alphaChannel[i];
        data[4 * i + 2] = alphaChannel[i];
        data[4 * i + 3] = 255;
    }
    return imageData;
}


function pathToSDFPath(path,scale,pos) {
    var c = 0, crds = path.crds;
    var path2 = [], a = Number.POSITIVE_INFINITY, b = Number.NEGATIVE_INFINITY,
        bboxMin = [a,a], bboxMax = [b,b];
    
    for(var j=0; j<path.cmds.length; j++) {
        var cmd = path.cmds[j];
        var cmd2 = null;

        switch (cmd) {
            case "M":
                cmd2 = { type: 'M', x:(crds[c]*scale + pos[0]), y:((crds[c+1]* -scale)  + pos[1])};

                if (cmd2.x > bboxMax[0]) bboxMax[0] = cmd2.x;
                if (cmd2.y > bboxMax[1]) bboxMax[1] = cmd2.y;
                if (cmd2.x < bboxMin[0]) bboxMin[0] = cmd2.x;
                if (cmd2.y < bboxMin[1]) bboxMin[1] = cmd2.y;
                c+=2;
                break;

            case "L":
                cmd2 = { type: 'L', x:(crds[c]*scale + pos[0]), y:((crds[c+1]* -scale)  + pos[1])};

                if (cmd2.x > bboxMax[0]) bboxMax[0] = cmd2.x;
                if (cmd2.y > bboxMax[1]) bboxMax[1] = cmd2.y;
                if (cmd2.x < bboxMin[0]) bboxMin[0] = cmd2.x;
                if (cmd2.y < bboxMin[1]) bboxMin[1] = cmd2.y;
                c+=2;
                break;

            case "C":
                cmd2 = { type: 'C', x1:(crds[c]*scale + pos[0]), y1:((crds[c+1]* -scale)  + pos[1]), x2:(crds[c+2]*scale + pos[0]), y2:((crds[c+3]* -scale)  + pos[1]), x:(crds[c+4]*scale + pos[0]), y:((crds[c+5]* -scale)  + pos[1]) };

                if (cmd2.x > bboxMax[0]) bboxMax[0] = cmd2.x;
                if (cmd2.y > bboxMax[1]) bboxMax[1] = cmd2.y;
                if (cmd2.x < bboxMin[0]) bboxMin[0] = cmd2.x;
                if (cmd2.y < bboxMin[1]) bboxMin[1] = cmd2.y;
                if (cmd2.x1 > bboxMax[0]) bboxMax[0] = cmd2.x1;
                if (cmd2.y1 > bboxMax[1]) bboxMax[1] = cmd2.y1;
                if (cmd2.x1 < bboxMin[0]) bboxMin[0] = cmd2.x1;
                if (cmd2.y1 < bboxMin[1]) bboxMin[1] = cmd2.y1;
                if (cmd2.x2 > bboxMax[0]) bboxMax[0] = cmd2.x2;
                if (cmd2.y2 > bboxMax[1]) bboxMax[1] = cmd2.y2;
                if (cmd2.x2 < bboxMin[0]) bboxMin[0] = cmd2.x2;
                if (cmd2.y2 < bboxMin[1]) bboxMin[1] = cmd2.y2;
                c+=6;
                break;

            case "Q":
                cmd2 = { type: 'Q', x1:(crds[c]*scale + pos[0]), y1:((crds[c+1]* -scale)  + pos[1]), x:(crds[c+2]*scale + pos[0]), y:((crds[c+3]* -scale)  + pos[1]) };

                if (cmd2.x > bboxMax[0]) bboxMax[0] = cmd2.x;
                if (cmd2.y > bboxMax[1]) bboxMax[1] = cmd2.y;
                if (cmd2.x < bboxMin[0]) bboxMin[0] = cmd2.x;
                if (cmd2.y < bboxMin[1]) bboxMin[1] = cmd2.y;
                if (cmd2.x1 > bboxMax[0]) bboxMax[0] = cmd2.x1;
                if (cmd2.y1 > bboxMax[1]) bboxMax[1] = cmd2.y1;
                if (cmd2.x1 < bboxMin[0]) bboxMin[0] = cmd2.x1;
                if (cmd2.y1 < bboxMin[1]) bboxMin[1] = cmd2.y1;
                c+=4;
                break;

            case "Z":
                cmd2 = { type: 'Z' };
                break;
        }

        if (cmd2) {
            path2.push(cmd2);
        }
    }

    return [path2, bboxMin[0], bboxMin[1], bboxMax[0] - bboxMin[0], bboxMax[1] - bboxMin[1]];
}

var fontFilesIndices = [];

function storeBox(boxes, hints, w, h, space, textureLX, textureLY) {
    var w2 = w + space;
    var h2 = h + space;

    for (var y = 0, ly = textureLY - h - space; y < ly; y++) {
        if (hints[y]) {
            if (w2 >= hints[y][0] &&  h2 >= hints[y][1]) {
                continue;
            }
        }

        for (var x = 0, lx = textureLX - w - space; x < lx; x++) {
            var x2 = x + w2;
            var y2 = y + h2;
            var hit = false;

            for (var i = 0, li = boxes.length; i < li; i++) {
                var box = boxes[i];

                if (!(box[2] < x || box[0] > x2 || box[3] < y || box[1] > y2)) {
                    hit = true;
                    break;
                }
            }

            if (!hit) {
                boxes.push([x, y, x2, y2]);
                //storeHints(boxes, hints, 8, 8, y, y2, space, textureLX, textureLY);
                return [true, x, y];
            }
        }

        if (hints[y]) {
            if (w2 < hints[y][0] && h2 < hints[y][1]) {
                hints[y] = [w2, h2];
            }
        } else {
            hints[y] = [w2, h2];
        }

    }

    return [false, 0, 0];
}

function generateChars(codes, size, textureLX, textureLY, codesOffsset, stream, fileIndex, header, dataOnly) {
    var i, li, ctx, x, y, index;

    for (i = 0; i < 5; i++) {
        canvases[i].width = textureLX;
        canvases[i].height = textureLY;
    }

    ctx = ctxs[0];

    var cly = size; 
    var c, clx; 
    var chars = [], plane = 0, status = [true, 0];
    var scale = size / font.head.unitsPerEm;

    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,textureLX,textureLY);

    var fontSize = size;
    var buffer = fontSize / 8;
    var radius = fontSize / 3;
    scale = ((fontSize/0.75) / font.head.unitsPerEm) * 0.7;

    header = binaryFontData;
    index = binaryFontHeaderIndex;

    //store header
    header[index] = 1; index += 1; //version
    header[index] = ((textureLX >> 8) & 0xff); header[index+1] = (textureLX & 0xff); index += 2; //texture lx
    header[index] = ((textureLY >> 8) & 0xff); header[index+1] = (textureLY & 0xff); index += 2; //texture ly
    header[index] = fontSize; index += 1; //fontsize
    header[index] = 0; index += 1; //flags

    var planeData = [
        { boxes : [], hints : {} },
        { boxes : [], hints : {} },
        { boxes : [], hints : {} },
        { boxes : [], hints : {} }
    ];

    var densePack = form.elements["dense"].checked;
    var sx, sy, w, h, cplane, res, res2;

    for (var i = codesOffsset, li = font.maxp.numGlyphs; i < li; i++) {

        var path = Typr.U.glyphToPath(font, i);
        res = pathToSDFPath(path,scale,[0,0]);

        if (res[0].length) {
            sx = Math.round(res[1]) - 1, sy = Math.round(res[2]) - 1;
            w = Math.round(res[3]) + 6 + 2, h = Math.round(res[4]) + 6 + 2;

            res = pathToSDFPath(path,scale,[-sx,-sy]);
            cplane = 0, res2;

            if (densePack) {

                for (;cplane <= plane; cplane++) {
                    res2 = storeBox(planeData[cplane].boxes, planeData[cplane].hints, w, h, 1, textureLX, textureLY)
                    if (res2[0]) {
                        break;
                    }
                }

            } else {
                cplane = plane;
                res2 = storeBox(planeData[plane].boxes, planeData[plane].hints, w, h, 1, textureLX, textureLY)
            }

            if (!res2[0]) {
                plane++;

                if (plane > 3) {
                    if (!stream) {
                        return [false,0];
                    } else {
                        status = [false, i];
                        break;
                    }
                }

                res2 = storeBox(planeData[plane].boxes, planeData[plane].hints, w, h, 1, textureLX, textureLY)

                //console.log("" + i  + " / " + li);
                cplane = plane;
                ctx = ctxs[plane];
                ctx.fillRect(0,0,textureLX,textureLY);
            } 

            ctx = ctxs[cplane];

            x = res2[1];
            y = res2[2];

            path = res[0];

            var data = pathToSDF(path, w - 6, h - 6, 3, 2/8);
            ctx.putImageData(makeRGBAImageData(data, w, h), x, y);    
        } else {
            x = 0, y = 0, w = 0, h = 0, sx = 0, sy = 0, cplane = 0;
        }

        if (textureLX > 256) {
            index = binaryFontDataIndex + i*7;
        } else {
            index = binaryFontDataIndex + i*6;
        }


        //store glyph info
        // w 6bit | h 6bit | sx sign 1bit | abs sx 6bit | sy sign 1bit | abs sy 6bit | plane 2bit 
        var value = (w << 22) | (h << 16) | (((sx < 0) ? 1 : 0) << 15) | (Math.abs(sx) << 9) | (((sy < 0) ? 1 : 0) << 8) | (Math.abs(sy) << 2) | cplane;

        header[index] = (value >> 24) & 0xff;
        header[index+1] = (value >> 16) & 0xff;
        header[index+2] = (value >> 8) & 0xff;
        header[index+3] = ((value) & 0xff);

        //store glyph position
        switch (textureLX) {
            case 2048: // x 11bit | y 11bit
                value = (x << 11) | (y); break;
                       
            case 1024: // x 10bit | y 10bit
                value = (x << 10) | (y); break;

            case 512:  // x 9bit | y 9bit
                value = (x << 9) | (y); break;

            default:   // x 8bit | y 8bit
                value = (x << 8) | (y); break;
        }

        if (textureLX > 256) {
            header[index+4] = (value >> 16) & 0xff;
            header[index+5] = (value >> 8) & 0xff;
            header[index+6] = (value) & 0xff;
        } else {
            header[index+4] = (value >> 8) & 0xff;
            header[index+5] = (value) & 0xff;
        }

    }

    //combine canvases
    var data_ = ctxs[0].getImageData(0,0,textureLX,textureLY), data = data_.data;
    var data2_ = ctxs[1].getImageData(0,0,textureLX,textureLY), data2 = data2_.data;
    var data3_ = ctxs[2].getImageData(0,0,textureLX,textureLY), data3 = data3_.data;
    var data4_ = ctxs[3].getImageData(0,0,textureLX,textureLY), data4 = data4_.data;

    var data5  = ctxs[4].getImageData(0,0,textureLX,textureLY);
    var finalData = data5.data;

    //mix canvase into rgba channels
    for (i = 0, li = data.length; i < li; i+=4) {
        finalData[i] = data[i];
        finalData[i+1] = data2[i];
        finalData[i+2] = data3[i];
        finalData[i+3] = data4[i];
    }

    binaryExportData = finalData;

    var tmpData; 
    var canvas, ctx;

    var maxy = (2<<14) - textureLY;

    if (((textureLY + 1) * fileIndex) < maxy) {
        canvas = previewCanvas;
        ctx = previewCtx;
    } else {
        canvas = previewCanvas2;
        ctx = previewCtx2;
    }

    if (!dataOnly) {
        //get preview content
        tmpData = ctx.getImageData(0,0,canvas.width,canvas.height);

        y = (textureLY + 1) * (fileIndex);
        y = (ctx == previewCtx2) ? (y - maxy) : y;

        //resize preview
        canvas.width = (textureLX + 1) * 4;
        canvas.height = y + (textureLY);

        ctx.clearRect(0,0,canvas.width,canvas.height);

        if (ctx == previewCtx2) {
            ctx.fillStyle = '#f00';
            ctx.fillRect(0,0,canvas.width,canvas.height);
        }

        //put preview content before resizeing
        ctx.putImageData(tmpData, 0, 0);

        ctx.putImageData(data_, 0, y);
        ctx.putImageData(data2_, (textureLX+1), y);
        ctx.putImageData(data3_, (textureLX+1)*2, y);
        ctx.putImageData(data4_, (textureLX+1)*3, y);
    }

    return status;
}


function generateFont(onlyPreview, stream, state, onFinished) {
    if (cancelPressed) {
        return;
    }

    var size = parseFloat(form.elements['fontSize'].value);

    if (size == null) {
        size = 10;
    }

    var i, li, j, lj;
    var textureLX = 256;
    var textureLY = 256;

    if (!stream) {
        fontFilesIndices = [];

        while (textureLY <= 2048) {
            if (generateChars(font, size, textureLX, textureLY, 0, false, 0)[0]) {

                if(!onlyPreview) {
                    saveData(form.elements['fontName'].value + '.fnt', finishFontHeader(textureLX));
                    saveData(form.elements['fontName'].value + '.fnt2', canvases[4]);
                }

                return true;
            }

            textureLX *= 2;

            if (textureLX > 2048) {
                return false;
            }

            if (generateChars(font, size, textureLX, textureLY, 0, false, 0)[0]) {

                if(!onlyPreview) {
                    saveData(form.elements['fontName'].value + '.fnt', finishFontHeader(textureLX));
                    saveData(form.elements['fontName'].value + '.fnt2', canvases[4]);
                }

                return true;
            }

            textureLY *= 2;
        }
    } else {

        textureLX = parseInt(form.elements['streamBlocks'].value);
        textureLY = textureLX;

        var fileIndex = 0;
        var codesOffsset = 0;

        if (state) {
            codesOffsset = state.codesOffsset;
            fileIndex = state.fileIndex;
        } else {
            fontFilesIndices = [];
        }

        do {
            
            var status = generateChars(font, size, textureLX, textureLY, codesOffsset, true, fileIndex);
            codesOffsset = status[1];

            if(!onlyPreview) {

                saveData(form.elements['fontName'].value + '.fnt' + (fileIndex+2), binaryExportData, 'font');

                if (status[0]) { //save header
                    saveData(form.elements['fontName'].value + '.fnt', finishFontHeader(textureLX));
                } else {
                    fontFilesIndices.push(codesOffsset);
                }
            }

            fileIndex++;

            if (!status[0]) {
                state = {
                    codesOffsset : codesOffsset,
                    fileIndex : fileIndex
                }

                document.getElementById('panel-progress').innerHTML = "Progress: " + (100*(codesOffsset / font.maxp.numGlyphs)).toFixed(1) + "%";
                document.getElementById('cancel-button').style.display = 'block';
                window.setTimeout(generateFont.bind(this, onlyPreview, stream, state, onFinished), 1);
                return;
            }

        } while(!status[0]);

        if (onFinished) {
            onFinished(true);
        }

        return;
    }

    if (onFinished) {
        onFinished(false);
    }

    return;
}

function exportFont(onlyPreview) {
    var stream = form.elements["stream"].checked;
    cancelPressed = false;
    generateFont(onlyPreview, stream, null, exportDone);
}

function exportDone(status) {
    if (status) {
        document.getElementById('panel-status').innerHTML = 'Status: Done';
    } else {
        document.getElementById('panel-status').innerHTML = 'Status: Resulting size is out of limit. You have to enable streaming for this font.';
    }

    document.getElementById('panel-progress').innerHTML = "";
    document.getElementById('cancel-button').style.display = 'none';
}

function startProcessing(onlyPreview) {
    if (!font) {
        return;
    }
    document.getElementById('panel-status').innerHTML = 'Status: Processing...';
    window.setTimeout((function(){exportFont(onlyPreview);}), 10);
}

function cancelExport() {
    cancelPressed = true;
    document.getElementById('panel-status').innerHTML = 'Status: Canceled';
    document.getElementById('panel-progress').innerHTML = "";
    document.getElementById('cancel-button').style.display = 'none';
}


init();
document.getElementById('export-button').onclick = (function(){ startProcessing(); });
document.getElementById('preview-button').onclick = (function(){ startProcessing(true); });
document.getElementById('cancel-button').onclick = cancelExport;

