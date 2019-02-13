
import {bidi as bidi_} from './worker-bidi.js';


//get rid of compiler mess
var bidi = bidi_;


var Typr = {};

Typr.parse = function(buff) {
    var bin = Typr._bin;
    var data = new Uint8Array(buff);
    var offset = 0;
    
    var sfnt_version = bin.readFixed(data, offset);
    offset += 4;
    var numTables = bin.readUshort(data, offset);
    offset += 2;
    var searchRange = bin.readUshort(data, offset);
    offset += 2;
    var entrySelector = bin.readUshort(data, offset);
    offset += 2;
    var rangeShift = bin.readUshort(data, offset);
    offset += 2;
    
    var tags = [
        "cmap",
        "head",
        "hhea",
        "maxp",
        "hmtx",
        //"name",
        //"OS/2",
        //"post",
        
        //"cvt",
        //"fpgm",
        //"loca",
        //"glyf",
        "kern",
        
        //"prep"
        //"gasp"
        
        "GPOS",
        "GSUB"
        //"VORG",
        ];
    
    var obj = {_data:data};
    //console.log(sfnt_version, numTables, searchRange, entrySelector, rangeShift);
    
    var tabs = {};
    var tablesOffset = 0;
    
    for(var i=0; i<numTables; i++) {
        var tag = bin.readASCII(data, offset, 4);   offset += 4;
        var checkSum = bin.readUint(data, offset);  offset += 4;
        var toffset = bin.readUint(data, offset);   offset += 4;
        var length = bin.readUint(data, offset);    offset += 4;
        tabs[tag] = {offset:toffset, length:length};
        tablesOffset = toffset + length;
        //if(tags.indexOf(tag)==-1) console.log("unknown tag", tag);
    }
    
    for(var i=0; i< tags.length; i++) {
        var t = tags[i];
        //console.log(t);
        //if(tabs[t]) console.log(t, tabs[t].offset, tabs[t].length);
        if(tabs[t]) obj[t.trim()] = Typr[t.trim()].parse(data, tabs[t].offset, tabs[t].length, obj);
    }

    obj._tabs = tabs;

    Typr._processGlyphs(data, tablesOffset, tabs, obj);

    //get tables
    var gsub = obj['GSUB'];
    if (gsub) {
        var llist = gsub.lookupList, flist = gsub.featureList;

        obj.gsubIsolTable = [];
        obj.gsubInitTable = [];
        obj.gsubFinaTable = [];
        obj.gsubMediTable = [];

        obj.gsubRligLigaTable = [];

        for(var fi = 0; fi < flist.length; fi++) {
            var tag = flist[fi].tag;

            switch (tag) {
                case 'isol':
                case 'init':
                case 'fina':
                case 'medi':

                    for(var ti = 0; ti < flist[fi].tab.length; ti++) {
                        var tab = llist[flist[fi].tab[ti]];
                        
                        if(tab.ltype == 1) {
                            switch (tag) {
                                case 'isol': obj.gsubIsolTable.push(tab.tabs); break;
                                case 'init': obj.gsubInitTable.push(tab.tabs); break;
                                case 'fina': obj.gsubFinaTable.push(tab.tabs); break;
                                case 'medi': obj.gsubMediTable.push(tab.tabs); break;
                            }
                        }
                    }

                    break;

                case 'rlig':
                case 'liga':

                    for(var ti = 0; ti < flist[fi].tab.length; ti++) {
                        var tab = llist[flist[fi].tab[ti]];
                        
                        if(tab.ltype == 4) {
                            obj.gsubRligLigaTable.push(tab.tabs);
                        }
                    }

                    break;
            }

        }
    }
   
    return obj;
}

Typr._processGlyphs = function(data, index, tabs, obj) {
    var version = data[index]; index += 1;
    var textureLX = (data[index] << 8) | (data[index+1]); index += 2;
    var textureLY = (data[index] << 8) | (data[index+1]); index += 2;
    var size = data[index]; index += 1;
    var flags = data[index]; index += 1;

    obj.version = version;
    obj.textureLX = textureLX;
    obj.textureLY = textureLY;
    obj.size = size;
    obj.cly = size * 1.5;
    obj.flags = flags;

    var glyphs = new Array(obj.maxp.numGlyphs);
    var fx = 1.0 / textureLX, fy = 1.0 / textureLY;
    var step = (textureLX > 256) ? 7 : 6;

    var filesIndicesIndex = index + obj.maxp.numGlyphs * step;
    var filesIndicesCount = (data[filesIndicesIndex] << 8) | data[filesIndicesIndex+1];
    var files = new Array(filesIndicesCount);

    filesIndicesIndex += 2;

    for (var i = 0, li = filesIndicesCount; i < li; i++) {
        files[i] = (data[filesIndicesIndex+i*2] << 8) | data[filesIndicesIndex+i*2+1];
    }

    var fileIndex = 0;

    for (i = 0, li = obj.maxp.numGlyphs; i < li; i++) {
        if (i == files[fileIndex]) {
            fileIndex++;
        }

        glyphs[i] = Typr._processGlyph(data, index, fx, fy, textureLX, obj, i, fileIndex);
        index += step;
    }

    obj.glyphs = glyphs;
}

Typr._processGlyph = function(data, index, fx, fy, textureLX, font, glyphIndex, fileIndex) {
    var value = (data[index] << 24) | (data[index+1] << 16) | (data[index+2] << 8) | (data[index+3]);

    // w 6bit | h 6bit | sx sign 1bit | abs sx 6bit | sy sign 1bit | abs sy 6bit | plane 2bit 
    var w = (value >> 22) & 63;
    var h = (value >> 16) & 63;
    var sx = ((value >> 9) & 63) * (((value >> 15) & 1) ? -1 : 1);
    var sy = -((value >> 2) & 63) * (((value >> 8) & 1) ? -1 : 1);
    var plane = (value & 3) + (fileIndex * 4);

    if (textureLX > 256) {
        value = (data[index+4] << 16) | (data[index+5] << 8) | (data[index+6]);
    } else {
        value = (data[index+4] << 8) | (data[index+5]);
    }    

    var scale = ((font.size/0.75) / font.head.unitsPerEm) * 0.75;
    var x, y, step = font.hmtx.aWidth[glyphIndex] * scale;

    //store glyph position
    switch (textureLX) {
        case 2048: // x 11bit | y 11bit
            x = ((value >> 11) & 2047), y = (value & 2047); break;
                   
        case 1024: // x 10bit | y 10bit
            x = ((value >> 10) & 1023), y = (value & 1023); break;

        case 512:  // x 9bit | y 9bit
            x = ((value >> 9) & 511), y = (value & 511); break;

        default:   // x 8bit | y 8bit
            x = ((value >> 8) & 255), y = (value & 255); break;
    }

    return {
        u1 : (x) * fx,
        v1 : (y * fy) + plane,
        u2 : (x + w) * fx,
        v2 : ((y + h) * fy) + plane,
        lx : w,
        ly : h,
        sx : sx, 
        sy : sy, 
        step : (step), 
        plane: plane
    };
}

Typr._tabOffset = function(data, tab) {
    var bin = Typr._bin;
    var numTables = bin.readUshort(data, 4);
    var offset = 12;
    for(var i=0; i<numTables; i++) {
        var tag = bin.readASCII(data, offset, 4);   offset += 4;
        var checkSum = bin.readUint(data, offset);  offset += 4;
        var toffset = bin.readUint(data, offset);   offset += 4;
        var length = bin.readUint(data, offset);    offset += 4;
        if(tag==tab) return toffset;
    }
    return 0;
}




Typr._bin = {
    readFixed : function(data, o) {
        return ((data[o]<<8) | data[o+1]) +  (((data[o+2]<<8)|data[o+3])/(256*256+4));
    },

    readF2dot14 : function(data, o) {
        var num = Typr._bin.readShort(data, o);
        return num / 16384;
        
        var intg = (num >> 14), frac = ((num & 0x3fff)/(0x3fff+1));
        return (intg>0) ? (intg+frac) : (intg-frac);
    },

    readInt : function(buff, p) {
        //if(p>=buff.length) throw "error";
        var a = Typr._bin.t.uint8;
        a[0] = buff[p+3];
        a[1] = buff[p+2];
        a[2] = buff[p+1];
        a[3] = buff[p];
        return Typr._bin.t.int32[0];
    },
    
    readInt8 : function(buff, p) {
        //if(p>=buff.length) throw "error";
        var a = Typr._bin.t.uint8;
        a[0] = buff[p];
        return Typr._bin.t.int8[0];
    },

    readShort : function(buff, p) {
        //if(p>=buff.length) throw "error";
        var a = Typr._bin.t.uint8;
        a[1] = buff[p]; a[0] = buff[p+1];
        return Typr._bin.t.int16[0];
    },

    readUshort : function(buff, p) {
        //if(p>=buff.length) throw "error";
        return (buff[p]<<8) | buff[p+1];
    },

    readUshorts : function(buff, p, len) {
        var arr = [];
        for(var i=0; i<len; i++) arr.push(Typr._bin.readUshort(buff, p+i*2));
        return arr;
    },

    readUint : function(buff, p) {
        //if(p>=buff.length) throw "error";
        var a = Typr._bin.t.uint8;
        a[3] = buff[p];  a[2] = buff[p+1];  a[1] = buff[p+2];  a[0] = buff[p+3];
        return Typr._bin.t.uint32[0];
    },

    readUint64 : function(buff, p) {
        //if(p>=buff.length) throw "error";
        return (Typr._bin.readUint(buff, p)*(0xffffffff+1)) + Typr._bin.readUint(buff, p+4);
    },

    readASCII : function(buff, p, l) {   // l : length in Characters (not Bytes)
        //if(p>=buff.length) throw "error";
        var s = "";
        for(var i = 0; i < l; i++) s += String.fromCharCode(buff[p+i]);
        return s;
    },

    readUnicode : function(buff, p, l) {
        //if(p>=buff.length) throw "error";
        var s = "";
        for(var i = 0; i < l; i++)  
        {
            var c = (buff[p++]<<8) | buff[p++];
            s += String.fromCharCode(c);
        }
        return s;
    },

    readBytes : function(buff, p, l) {
        //if(p>=buff.length) throw "error";
        var arr = [];
        for(var i=0; i<l; i++) arr.push(buff[p+i]);
        return arr;
    },

    readASCIIArray : function(buff, p, l) {  // l : length in Characters (not Bytes)
        //if(p>=buff.length) throw "error";
        var s = [];
        for(var i = 0; i < l; i++)  
            s.push(String.fromCharCode(buff[p+i]));
        return s;
    }
};

Typr._bin.t = {
    buff: new ArrayBuffer(8),
};
Typr._bin.t.int8   = new Int8Array  (Typr._bin.t.buff);
Typr._bin.t.uint8  = new Uint8Array (Typr._bin.t.buff);
Typr._bin.t.int16  = new Int16Array (Typr._bin.t.buff);
Typr._bin.t.uint16 = new Uint16Array(Typr._bin.t.buff);
Typr._bin.t.int32  = new Int32Array (Typr._bin.t.buff);
Typr._bin.t.uint32 = new Uint32Array(Typr._bin.t.buff);





// OpenType Layout Common Table Formats

Typr._lctf = {};

Typr._lctf.parse = function(data, offset, length, font, subt) {
    var bin = Typr._bin;
    var obj = {};
    var offset0 = offset;
    var tableVersion = bin.readFixed(data, offset);  offset += 4;
    
    var offScriptList  = bin.readUshort(data, offset);  offset += 2;
    var offFeatureList = bin.readUshort(data, offset);  offset += 2;
    var offLookupList  = bin.readUshort(data, offset);  offset += 2;
    
    
    obj.scriptList  = Typr._lctf.readScriptList (data, offset0 + offScriptList);
    obj.featureList = Typr._lctf.readFeatureList(data, offset0 + offFeatureList);
    obj.lookupList  = Typr._lctf.readLookupList (data, offset0 + offLookupList, subt);
    
    return obj;
}

Typr._lctf.readLookupList = function(data, offset, subt) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    var count = bin.readUshort(data, offset);  offset+=2;

    for(var i=0; i<count; i++) 
    {
        var noff = bin.readUshort(data, offset);  offset+=2;
        var lut = Typr._lctf.readLookupTable(data, offset0 + noff, subt);
        obj.push(lut);
    }
    return obj;
}

Typr._lctf.readLookupTable = function(data, offset, subt) {
    //console.log("Parsing lookup table", offset);
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {tabs:[]};
    
    obj.ltype = bin.readUshort(data, offset);  offset+=2;
    obj.flag  = bin.readUshort(data, offset);  offset+=2;
    var cnt   = bin.readUshort(data, offset);  offset+=2;
    
    for(var i=0; i<cnt; i++) {
        var noff = bin.readUshort(data, offset);  offset+=2;
        var tab = subt(data, obj.ltype, offset0 + noff);
        //console.log(obj.type, tab);
        obj.tabs.push(tab);
    }
    return obj;
}

Typr._lctf.numOfOnes = function(n) {
    var num = 0;
    for(var i=0; i<32; i++) if(((n>>>i)&1) != 0) num++;
    return num;
}

Typr._lctf.readClassDef = function(data, offset) {
    var bin = Typr._bin;
    var obj = { start:[], end:[], class:[] };
    var format = bin.readUshort(data, offset);  offset+=2;

    if(format==1) {
        var startGlyph  = bin.readUshort(data, offset);  offset+=2;
        var glyphCount  = bin.readUshort(data, offset);  offset+=2;
        for(var i=0; i<glyphCount; i++) {
            obj.start.push(startGlyph+i);
            obj.end  .push(startGlyph+i);
            obj.class.push(bin.readUshort(data, offset));  offset+=2;
        }
    }

    if(format==2) {
        var count = bin.readUshort(data, offset);  offset+=2;
        for(var i=0; i<count; i++) {
            obj.start.push(bin.readUshort(data, offset));  offset+=2;
            obj.end  .push(bin.readUshort(data, offset));  offset+=2;
            obj.class.push(bin.readUshort(data, offset));  offset+=2;
        }
    }
    return obj;
}

Typr._lctf.readValueRecord = function(data, offset, valFmt) {
    var bin = Typr._bin;
    var arr = [];
    arr.push( (valFmt&1) ? bin.readShort(data, offset) : 0 );  offset += (valFmt&1) ? 2 : 0;
    arr.push( (valFmt&2) ? bin.readShort(data, offset) : 0 );  offset += (valFmt&2) ? 2 : 0;
    arr.push( (valFmt&4) ? bin.readShort(data, offset) : 0 );  offset += (valFmt&4) ? 2 : 0;
    arr.push( (valFmt&8) ? bin.readShort(data, offset) : 0 );  offset += (valFmt&8) ? 2 : 0;
    return arr;
}

Typr._lctf.readCoverage = function(data, offset) {
    var bin = Typr._bin;
    var cvg = {};
    cvg.fmt   = bin.readUshort(data, offset);  offset+=2;
    var count = bin.readUshort(data, offset);  offset+=2;
    //console.log("parsing coverage", offset-4, format, count);
    if(cvg.fmt==1) cvg.tab = bin.readUshorts(data, offset, count); 
    if(cvg.fmt==2) cvg.tab = bin.readUshorts(data, offset, count*3);

    //get min,max

    var min = Number.POSITIVE_INFINITY, max = 0;
    var tab = cvg.tab;

    if(cvg.fmt==1) {

        for(var i=0; i<tab.length; i++) {
            var v = tab[i];
            if (v > max) max = v;
            if (v < min) min = v;
        }
    }

    if(cvg.fmt==2) {
        for(var i=0; i<tab.length; i+=3) {
            var start = tab[i], end = tab[i+1];
            if (start > max) max = start;
            if (start < min) min = start;
            if (end > max) max = end;
            if (end < min) min = end;
        }
    }

    cvg.min = min;
    cvg.max = max;

    return cvg;
}

Typr._lctf.coverageIndex = function(cvg, val) {
    if (val < cvg.min || val > cvg.max) {
        return -1;
    }

    var tab = cvg.tab;
    if(cvg.fmt==1) return tab.indexOf(val);
    
    for(var i=0; i<tab.length; i+=3) {
        var start = tab[i], end = tab[i+1], index = tab[i+2];
        if(start<=val && val<=end) return index + (val-start);
    }
    return -1;
}

Typr._lctf.readFeatureList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = [];
    
    var count = bin.readUshort(data, offset);  offset+=2;
    
    for(var i=0; i<count; i++) {
        var tag = bin.readASCII(data, offset, 4);  offset+=4;
        var noff = bin.readUshort(data, offset);  offset+=2;
        obj.push({tag: tag.trim(), tab:Typr._lctf.readFeatureTable(data, offset0 + noff)});
    }
    return obj;
}

Typr._lctf.readFeatureTable = function(data, offset) {
    var bin = Typr._bin;
    
    var featureParams = bin.readUshort(data, offset);  offset+=2;   // = 0
    var lookupCount = bin.readUshort(data, offset);  offset+=2;
    
    var indices = [];
    for(var i=0; i<lookupCount; i++) indices.push(bin.readUshort(data, offset+2*i));
    return indices;
}


Typr._lctf.readScriptList = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    
    var count = bin.readUshort(data, offset);  offset+=2;
    
    for(var i=0; i<count; i++) {
        var tag = bin.readASCII(data, offset, 4);  offset+=4;
        var noff = bin.readUshort(data, offset);  offset+=2;
        obj[tag.trim()] = Typr._lctf.readScriptTable(data, offset0 + noff);
    }
    return obj;
}

Typr._lctf.readScriptTable = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    
    var defLangSysOff = bin.readUshort(data, offset);  offset+=2;
    obj.default = Typr._lctf.readLangSysTable(data, offset0 + defLangSysOff);
    
    var langSysCount = bin.readUshort(data, offset);  offset+=2;
    
    for(var i=0; i<langSysCount; i++) {
        var tag = bin.readASCII(data, offset, 4);  offset+=4;
        var langSysOff = bin.readUshort(data, offset);  offset+=2;
        obj[tag.trim()] = Typr._lctf.readLangSysTable(data, offset0 + langSysOff);
    }
    return obj;
}

Typr._lctf.readLangSysTable = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    
    var lookupOrder = bin.readUshort(data, offset);  offset+=2;
    //if(lookupOrder!=0)  throw "lookupOrder not 0";
    obj.reqFeature = bin.readUshort(data, offset);  offset+=2;
    //if(obj.reqFeature != 0xffff) throw "reqFeatureIndex != 0xffff";
    
    //console.log(lookupOrder, obj.reqFeature);
    
    var featureCount = bin.readUshort(data, offset);  offset+=2;
    obj.features = bin.readUshorts(data, offset, featureCount);
    return obj;
}


Typr.cmap = {};
Typr.cmap.parse = function(data, offset, length) {
    data = new Uint8Array(data.buffer, offset, length);
    offset = 0;

    var offset0 = offset;
    var bin = Typr._bin;
    var obj = {};
    var version   = bin.readUshort(data, offset);  offset += 2;
    var numTables = bin.readUshort(data, offset);  offset += 2;
    
    //console.log(version, numTables);
    
    var offs = [];
    obj.tables = [];
    
    
    for(var i=0; i<numTables; i++) {
        var platformID = bin.readUshort(data, offset);  offset += 2;
        var encodingID = bin.readUshort(data, offset);  offset += 2;
        var noffset = bin.readUint(data, offset);       offset += 4;
        
        var id = "p"+platformID+"e"+encodingID;
        
        //console.log("cmap subtable", platformID, encodingID, noffset);
                
        var tind = offs.indexOf(noffset);
        
        if(tind==-1) {
            tind = obj.tables.length;
            var subt;
            offs.push(noffset);
            var format = bin.readUshort(data, noffset);
            if     (format== 0) subt = Typr.cmap.parse0(data, noffset);
            else if(format== 4) subt = Typr.cmap.parse4(data, noffset);
            else if(format== 6) subt = Typr.cmap.parse6(data, noffset);
            else if(format==12) subt = Typr.cmap.parse12(data,noffset);
            else console.log("unknown format: "+format, platformID, encodingID, noffset);
            obj.tables.push(subt);
        }
        
        if(obj[id]!=null) throw "multiple tables for one platform+encoding";
        obj[id] = tind;
    }
    return obj;
}

Typr.cmap.parse0 = function(data, offset) {
    var bin = Typr._bin;
    var obj = {};
    obj.format = bin.readUshort(data, offset);  offset += 2;
    var len    = bin.readUshort(data, offset);  offset += 2;
    var lang   = bin.readUshort(data, offset);  offset += 2;
    obj.map = [];
    for(var i=0; i<len-6; i++) obj.map.push(data[offset+i]);
    return obj;
}

Typr.cmap.parse4 = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    
    obj.format = bin.readUshort(data, offset);  offset+=2;
    var length = bin.readUshort(data, offset);  offset+=2;
    var language = bin.readUshort(data, offset);  offset+=2;
    var segCountX2 = bin.readUshort(data, offset);  offset+=2;
    var segCount = segCountX2/2;
    obj.searchRange = bin.readUshort(data, offset);  offset+=2;
    obj.entrySelector = bin.readUshort(data, offset);  offset+=2;
    obj.rangeShift = bin.readUshort(data, offset);  offset+=2;
    obj.endCount   = bin.readUshorts(data, offset, segCount);  offset += segCount*2;
    offset+=2;
    obj.startCount = bin.readUshorts(data, offset, segCount);  offset += segCount*2;
    obj.idDelta = [];
    for(var i=0; i<segCount; i++) {obj.idDelta.push(bin.readShort(data, offset));  offset+=2;}
    obj.idRangeOffset = bin.readUshorts(data, offset, segCount);  offset += segCount*2;
    obj.glyphIdArray = [];
    while(offset< offset0+length) {obj.glyphIdArray.push(bin.readUshort(data, offset));  offset+=2;}
    return obj;
}

Typr.cmap.parse6 = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    
    obj.format = bin.readUshort(data, offset);  offset+=2;
    var length = bin.readUshort(data, offset);  offset+=2;
    var language = bin.readUshort(data, offset);  offset+=2;
    obj.firstCode = bin.readUshort(data, offset);  offset+=2;
    var entryCount = bin.readUshort(data, offset);  offset+=2;
    obj.glyphIdArray = [];
    for(var i=0; i<entryCount; i++) {obj.glyphIdArray.push(bin.readUshort(data, offset));  offset+=2;}
    
    return obj;
}

Typr.cmap.parse12 = function(data, offset) {
    var bin = Typr._bin;
    var offset0 = offset;
    var obj = {};
    
    obj.format = bin.readUshort(data, offset);  offset+=2;
    offset += 2;
    var length = bin.readUint(data, offset);  offset+=4;
    var lang   = bin.readUint(data, offset);  offset+=4;
    var nGroups= bin.readUint(data, offset);  offset+=4;
    obj.groups = [];
    
    for(var i=0; i<nGroups; i++) {
        var off = offset + i * 12;
        var startCharCode = bin.readUint(data, off+0);
        var endCharCode   = bin.readUint(data, off+4);
        var startGlyphID  = bin.readUint(data, off+8);
        obj.groups.push([  startCharCode, endCharCode, startGlyphID  ]);
    }
    return obj;
}



Typr.GPOS = {};
Typr.GPOS.parse = function(data, offset, length, font) {  return Typr._lctf.parse(data, offset, length, font, Typr.GPOS.subt);  }



Typr.GPOS.subt = function(data, ltype, offset) { // lookup type
    if(ltype!=2) return null;
    
    var bin = Typr._bin, offset0 = offset, tab = {};
    
    tab.format  = bin.readUshort(data, offset);  offset+=2;
    var covOff  = bin.readUshort(data, offset);  offset+=2;
    tab.coverage = Typr._lctf.readCoverage(data, covOff+offset0);
    tab.valFmt1 = bin.readUshort(data, offset);  offset+=2;
    tab.valFmt2 = bin.readUshort(data, offset);  offset+=2;
    var ones1 = Typr._lctf.numOfOnes(tab.valFmt1);
    var ones2 = Typr._lctf.numOfOnes(tab.valFmt2);

    if(tab.format==1) {
        tab.pairsets = [];
        var count = bin.readUshort(data, offset);  offset+=2;
        
        for(var i=0; i<count; i++) {
            var psoff = bin.readUshort(data, offset);  offset+=2;
            psoff += offset0;
            var pvcount = bin.readUshort(data, psoff);  psoff+=2;
            var arr = [];

            for(var j=0; j<pvcount; j++) {
                var gid2 = bin.readUshort(data, psoff);  psoff+=2;
                var value1, value2;
                if(tab.valFmt1!=0) {  value1 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt1);  psoff+=ones1*2;  }
                if(tab.valFmt2!=0) {  value2 = Typr._lctf.readValueRecord(data, psoff, tab.valFmt2);  psoff+=ones2*2;  }
                arr.push({gid2:gid2, val1:value1, val2:value2});
            }
            tab.pairsets.push(arr);
        }
    }

    if(tab.format==2) {
        var classDef1 = bin.readUshort(data, offset);  offset+=2;
        var classDef2 = bin.readUshort(data, offset);  offset+=2;
        var class1Count = bin.readUshort(data, offset);  offset+=2;
        var class2Count = bin.readUshort(data, offset);  offset+=2;
        
        tab.classDef1 = Typr._lctf.readClassDef(data, offset0 + classDef1);
        tab.classDef2 = Typr._lctf.readClassDef(data, offset0 + classDef2);
        
        tab.matrix = [];
        for(var i=0; i<class1Count; i++) {
            var row = [];
            for(var j=0; j<class2Count; j++) {
                var value1 = null, value2 = null;
                if(tab.valFmt1!=0) { value1 = Typr._lctf.readValueRecord(data, offset, tab.valFmt1);  offset+=ones1*2; }
                if(tab.valFmt2!=0) { value2 = Typr._lctf.readValueRecord(data, offset, tab.valFmt2);  offset+=ones2*2; }
                row.push({val1:value1, val2:value2});
            }
            tab.matrix.push(row);
        }
    }
    return tab;
}

Typr.GSUB = {};
Typr.GSUB.parse = function(data, offset, length, font) {  return Typr._lctf.parse(data, offset, length, font, Typr.GSUB.subt);  }


Typr.GSUB.subt = function(data, ltype, offset) { // lookup type
    var bin = Typr._bin, offset0 = offset, tab = {};
    
    if(ltype!=1 && ltype!=4) return null;
    
    tab.fmt  = bin.readUshort(data, offset);  offset+=2;
    var covOff  = bin.readUshort(data, offset);  offset+=2;
    tab.coverage = Typr._lctf.readCoverage(data, covOff+offset0);   // not always is coverage here
    
    if(false) {}
    else if(ltype==1) {
        if(tab.fmt==1) {
            tab.delta = bin.readShort(data, offset);  offset+=2;
        }
        else if(tab.fmt==2) {
            var cnt = bin.readUshort(data, offset);  offset+=2;
            tab.newg = bin.readUshorts(data, offset, cnt);  offset+=tab.newg.length*2;
        }
    }
    else if(ltype==4) {
        tab.vals = [];
        var cnt = bin.readUshort(data, offset);  offset+=2;
        for(var i=0; i<cnt; i++) {
            var loff = bin.readUshort(data, offset);  offset+=2;
            tab.vals.push(Typr.GSUB.readLigatureSet(data, offset0+loff));
        }
        //console.log(tab.coverage);
        //console.log(tab.vals);
    } 
    
    return tab;
}

Typr.GSUB.readChainSubClassSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var cnt = bin.readUshort(data, offset);  offset+=2;
    for(var i=0; i<cnt; i++) {
        var loff = bin.readUshort(data, offset);  offset+=2;
        lset.push(Typr.GSUB.readChainSubClassRule(data, offset0+loff));
    }
    return lset;
}

Typr.GSUB.readChainSubClassRule= function(data, offset) {
    var bin = Typr._bin, offset0 = offset, rule = {};
    var pps = ["backtrack", "input", "lookahead"];
    for(var pi=0; pi<pps.length; pi++) {
        var cnt = bin.readUshort(data, offset);  offset+=2;  if(pi==1) cnt--;
        rule[pps[pi]]=bin.readUshorts(data, offset, cnt);  offset+= rule[pps[pi]].length*2;
    }
    var cnt = bin.readUshort(data, offset);  offset+=2;
    rule.subst = bin.readUshorts(data, offset, cnt*2);  offset += rule.subst.length*2;
    return rule;
}

Typr.GSUB.readLigatureSet = function(data, offset) {
    var bin = Typr._bin, offset0 = offset, lset = [];
    var lcnt = bin.readUshort(data, offset);  offset+=2;
    for(var j=0; j<lcnt; j++) {
        var loff = bin.readUshort(data, offset);  offset+=2;
        lset.push(Typr.GSUB.readLigature(data, offset0+loff));
    }
    return lset;
}

Typr.GSUB.readLigature = function(data, offset) {
    var bin = Typr._bin, lig = {chain:[]};
    lig.nglyph = bin.readUshort(data, offset);  offset+=2;
    var ccnt = bin.readUshort(data, offset);  offset+=2;
    for(var k=0; k<ccnt-1; k++) {  lig.chain.push(bin.readUshort(data, offset));  offset+=2;  }
    return lig;
}



Typr.head = {};
Typr.head.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    var tableVersion = bin.readFixed(data, offset);  offset += 4;
    obj.fontRevision = bin.readFixed(data, offset);  offset += 4;
    var checkSumAdjustment = bin.readUint(data, offset);  offset += 4;
    var magicNumber = bin.readUint(data, offset);  offset += 4;
    obj.flags = bin.readUshort(data, offset);  offset += 2;
    obj.unitsPerEm = bin.readUshort(data, offset);  offset += 2;
    obj.created  = bin.readUint64(data, offset);  offset += 8;
    obj.modified = bin.readUint64(data, offset);  offset += 8;
    obj.xMin = bin.readShort(data, offset);  offset += 2;
    obj.yMin = bin.readShort(data, offset);  offset += 2;
    obj.xMax = bin.readShort(data, offset);  offset += 2;
    obj.yMax = bin.readShort(data, offset);  offset += 2;
    obj.macStyle = bin.readUshort(data, offset);  offset += 2;
    obj.lowestRecPPEM = bin.readUshort(data, offset);  offset += 2;
    obj.fontDirectionHint = bin.readShort(data, offset);  offset += 2;
    obj.indexToLocFormat  = bin.readShort(data, offset);  offset += 2;
    obj.glyphDataFormat   = bin.readShort(data, offset);  offset += 2;
    return obj;
}


Typr.hhea = {};
Typr.hhea.parse = function(data, offset, length) {
    var bin = Typr._bin;
    var obj = {};
    var tableVersion = bin.readFixed(data, offset);  offset += 4;
    obj.ascender  = bin.readShort(data, offset);  offset += 2;
    obj.descender = bin.readShort(data, offset);  offset += 2;
    obj.lineGap = bin.readShort(data, offset);  offset += 2;
    
    obj.advanceWidthMax = bin.readUshort(data, offset);  offset += 2;
    obj.minLeftSideBearing  = bin.readShort(data, offset);  offset += 2;
    obj.minRightSideBearing = bin.readShort(data, offset);  offset += 2;
    obj.xMaxExtent = bin.readShort(data, offset);  offset += 2;
    
    obj.caretSlopeRise = bin.readShort(data, offset);  offset += 2;
    obj.caretSlopeRun  = bin.readShort(data, offset);  offset += 2;
    obj.caretOffset    = bin.readShort(data, offset);  offset += 2;
    
    offset += 4*2;
    
    obj.metricDataFormat = bin.readShort (data, offset);  offset += 2;
    obj.numberOfHMetrics = bin.readUshort(data, offset);  offset += 2;
    return obj;
}


Typr.hmtx = {};
Typr.hmtx.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    var obj = {};
    
    obj.aWidth = [];
    obj.lsBearing = [];
        
    var aw = 0, lsb = 0;
    
    for(var i=0; i<font.maxp.numGlyphs; i++) {
        if(i<font.hhea.numberOfHMetrics) {  aw=bin.readUshort(data, offset);  offset += 2;  lsb=bin.readShort(data, offset);  offset+=2;  }
        obj.aWidth.push(aw);
        obj.lsBearing.push(lsb);
    }
    
    return obj;
}


Typr.kern = {};
Typr.kern.parse = function(data, offset, length, font) {
    var bin = Typr._bin;
    
    var version = bin.readUshort(data, offset);  offset+=2;
    if(version==1) return Typr.kern.parseV1(data, offset-2, length, font);
    var nTables = bin.readUshort(data, offset);  offset+=2;
    
    var map = {glyph1: [], rval:[]};
    for(var i=0; i<nTables; i++) {
        offset+=2;  // skip version
        var length  = bin.readUshort(data, offset);  offset+=2;
        var coverage = bin.readUshort(data, offset);  offset+=2;
        var format = coverage>>>8;
        /* I have seen format 128 once, that's why I do */ format &= 0xf;
        if(format==0) offset = Typr.kern.readFormat0(data, offset, map);
        else throw "unknown kern table format: "+format;
    }
    return map;
}

Typr.kern.parseV1 = function(data, offset, length, font) {
    var bin = Typr._bin;
    
    var version = bin.readFixed(data, offset);  offset+=4;
    var nTables = bin.readUint(data, offset);  offset+=4;
    
    var map = {glyph1: [], rval:[]};
    for(var i=0; i<nTables; i++) {
        var length = bin.readUint(data, offset);   offset+=4;
        var coverage = bin.readUshort(data, offset);  offset+=2;
        var tupleIndex = bin.readUshort(data, offset);  offset+=2;
        var format = coverage>>>8;
        /* I have seen format 128 once, that's why I do */ format &= 0xf;
        if(format==0) offset = Typr.kern.readFormat0(data, offset, map);
        else throw "unknown kern table format: "+format;
    }
    return map;
}

Typr.kern.readFormat0 = function(data, offset, map) {
    var bin = Typr._bin;
    var pleft = -1;
    var nPairs        = bin.readUshort(data, offset);  offset+=2;
    var searchRange   = bin.readUshort(data, offset);  offset+=2;
    var entrySelector = bin.readUshort(data, offset);  offset+=2;
    var rangeShift    = bin.readUshort(data, offset);  offset+=2;
    for(var j=0; j<nPairs; j++) {
        var left  = bin.readUshort(data, offset);  offset+=2;
        var right = bin.readUshort(data, offset);  offset+=2;
        var value = bin.readShort (data, offset);  offset+=2;
        if(left!=pleft) { map.glyph1.push(left);  map.rval.push({ glyph2:[], vals:[] }) }
        var rval = map.rval[map.rval.length-1];
        rval.glyph2.push(right);   rval.vals.push(value);
        pleft = left;
    }
    return offset;
}



Typr.maxp = {};
Typr.maxp.parse = function(data, offset, length) {
    //console.log(data.length, offset, length);
    
    var bin = Typr._bin;
    var obj = {};
    
    // both versions 0.5 and 1.0
    var ver = bin.readUint(data, offset); offset += 4;
    obj.numGlyphs = bin.readUshort(data, offset);  offset += 2;
    
    // only 1.0
    if(ver == 0x00010000) {
        obj.maxPoints             = bin.readUshort(data, offset);  offset += 2;
        obj.maxContours           = bin.readUshort(data, offset);  offset += 2;
        obj.maxCompositePoints    = bin.readUshort(data, offset);  offset += 2;
        obj.maxCompositeContours  = bin.readUshort(data, offset);  offset += 2;
        obj.maxZones              = bin.readUshort(data, offset);  offset += 2;
        obj.maxTwilightPoints     = bin.readUshort(data, offset);  offset += 2;
        obj.maxStorage            = bin.readUshort(data, offset);  offset += 2;
        obj.maxFunctionDefs       = bin.readUshort(data, offset);  offset += 2;
        obj.maxInstructionDefs    = bin.readUshort(data, offset);  offset += 2;
        obj.maxStackElements      = bin.readUshort(data, offset);  offset += 2;
        obj.maxSizeOfInstructions = bin.readUshort(data, offset);  offset += 2;
        obj.maxComponentElements  = bin.readUshort(data, offset);  offset += 2;
        obj.maxComponentDepth     = bin.readUshort(data, offset);  offset += 2;
    }
    
    return obj;
}


Typr.U = {};

Typr.U.codeToGlyph = function(font, code) {
    var cmap = font.cmap;
    
    
    var tind = -1;
    if(cmap.p0e4!=null) tind = cmap.p0e4;
    else if(cmap.p3e1!=null) tind = cmap.p3e1;
    else if(cmap.p1e0!=null) tind = cmap.p1e0;
    
    if(tind==-1) throw "no familiar platform and encoding!";
    
    var tab = cmap.tables[tind];
    
    if (tab.format==0) {
        if(code>=tab.map.length) return 0;
        return tab.map[code];
    } else if(tab.format==4) {
        var sind = -1;
        for(var i=0; i<tab.endCount.length; i++)   if(code<=tab.endCount[i]){  sind=i;  break;  } 
        if(sind==-1) return 0;
        if(tab.startCount[sind]>code) return 0;
        
        var gli = 0;
        if(tab.idRangeOffset[sind]!=0) gli = tab.glyphIdArray[(code-tab.startCount[sind]) + (tab.idRangeOffset[sind]>>1) - (tab.idRangeOffset.length-sind)];
        else                           gli = code + tab.idDelta[sind];
        return gli & 0xFFFF;
    } else if(tab.format==12) {
        if(code>tab.groups[tab.groups.length-1][1]) return 0;
        for(var i=0; i<tab.groups.length; i++) {
            var grp = tab.groups[i];
            if(grp[0]<=code && code<=grp[1]) return grp[2] + (code-grp[0]);
        }
        return 0;
    }
    else throw "unknown cmap table format "+tab.format;
}


Typr.U._getGlyphClass = function(g, cd) {
    for(var i=0; i<cd.start.length; i++) 
        if(cd.start[i]<=g && cd.end[i]>=g) return cd.class[i];
    return 0;
}

Typr.U.getPairAdjustment = function(font, g1, g2) {
    if(font.GPOS) {
        var ltab = null;
        for(var i = 0; i < font.GPOS.featureList.length; i++) {
            var fl = font.GPOS.featureList[i];
            if (fl.tag=="kern")
                for(var j=0; j<fl.tab.length; j++) 
                    if(font.GPOS.lookupList[fl.tab[j]].ltype==2) ltab=font.GPOS.lookupList[fl.tab[j]];
        }
        if(ltab) {
            for(var i = 0; i < ltab.tabs.length; i++) {
                var tab = ltab.tabs[i];
                var ind = Typr._lctf.coverageIndex(tab.coverage, g1);
                if (ind==-1) continue;
                var adj = 0;
                if (tab.format==1) {
                    var right = tab.pairsets[ind];
                    for (var j=0; j<right.length; j++) if (right[j].gid2==g2) adj = right[j];
                    if (adj==null) continue;
                } else if (tab.format==2) {
                    var c1 = Typr.U._getGlyphClass(g1, tab.classDef1);
                    var c2 = Typr.U._getGlyphClass(g2, tab.classDef2);
                    adj = tab.matrix[c1][c2];
                }
                return adj.val1[2];
            }
        }
    }
    if(font.kern) {
        var ind1 = font.kern.glyph1.indexOf(g1);
        if(ind1!=-1) {
            var ind2 = font.kern.rval[ind1].glyph2.indexOf(g2);
            if(ind2!=-1) return font.kern.rval[ind1].vals[ind2];
        }
    }
    
    return 0;
}

/*
Typr.U.isRTL = function(str) {           
    var weakChars       = '\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF',
        rtlChars        = '\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC',
        rtlDirCheck     = new RegExp('^['+weakChars+']*['+rtlChars+']');

    return rtlDirCheck.test(str);
};*/

// var wsep = "\n\t\" ,.:;!?()  ،";
//Typr.U.WSepTable = [9, 10, 32, 33, 34, 40, 41, 44, 46, 58, 59, 63, 1548]

//var L = "ꡲ્૗";
//Typr.U.LTable = [ 2765, 2775, 43122 ]

//var R = "آأؤإاةدذرزوٱٲٳٵٶٷڈډڊڋڌڍڎڏڐڑڒړڔڕږڗژڙۀۃۄۅۆۇۈۉۊۋۍۏےۓەۮۯܐܕܖܗܘܙܞܨܪܬܯݍݙݚݛݫݬݱݳݴݸݹࡀࡆࡇࡉࡔࡧࡩࡪࢪࢫࢬࢮࢱࢲࢹૅેૉ૊૎૏ૐ૑૒૝ૡ૤૯஁ஃ஄அஉ஌எஏ஑னப஫஬";
Typr.U.RTable = [
    1570, 1571, 1572, 1573, 1575, 1577, 1583, 1584, 1585, 1586,
    1608, 1649, 1650, 1651, 1653, 1654, 1655, 1672, 1673, 1674,
    1675, 1676, 1677, 1678, 1679, 1680, 1681, 1682, 1683, 1684,
    1685, 1686, 1687, 1688, 1689, 1728, 1731, 1732, 1733, 1734,
    1735, 1736, 1737, 1738, 1739, 1741, 1743, 1746, 1747, 1749,
    1774, 1775, 1808, 1813, 1814, 1815, 1816, 1817, 1822, 1832,
    1834, 1836, 1839, 1869, 1881, 1882, 1883, 1899, 1900, 1905,
    1907, 1908, 1912, 1913, 2112, 2118, 2119, 2121, 2132, 2151,
    2153, 2154, 2218, 2219, 2220, 2222, 2225, 2226, 2233, 2757,
    2759, 2761, 2762, 2766, 2767, 2768, 2769, 2770, 2781, 2785,
    2788, 2799, 2945, 2947, 2948, 2949, 2953, 2956, 2958, 2959,
    2961, 2985, 2986, 2987, 2988 ];


Typr.U.stringToGlyphs = function(fonts, str) {
    var gls = [], g, i, li, j, lj, k, ti, c, c2, gsub, font, llist, flist, t, gsubTable;
    var gl, gfonts = [], codes = [], scodes = [], scodesType = [], str2 = '';

    var bidiResult = bidi(str, -1, false);

    var rtable = Typr.U.RTable;

   for (i = 0, li = str.length; i < li; i++) {
        c = str.charCodeAt(i);
        scodes.push(c);
        scodesType.push(0);

        //types wsep = 1, L = 2, R = 3

        if (c == 2765 || c == 2775 || c == 43122) { // L
            scodesType[i] = 2;
        } else if (c == 1548) { // wsep
            scodesType[i] = 1;
        } else if (c <= 63) { // wsep
            if (c == 9 || c == 10 || c == 32 || c == 33 || c == 34 || c == 40 || c == 41 || c == 44 || c == 46 || c == 58 || c == 59 || c == 63) {
                scodesType[i] = 1;
            }
        } else if (c >= 1570 && c <= 2988) { // R
            if (rtable.indexOf(c) != -1) {
                scodesType[i] = 3;
            }
        }
    }

    //basic shaping
    for (i = 0, li = str.length; i < li; i++) {
        c = scodes[i];

        if (scodesType[i] != 1) { //not wsep
            if (i < li - 2) {
                c2 = scodes[i+1];

                //myanmar 
                if (c2 == 0x103c) { //medial ra - prebase substitution
                    scodes[i] = c2;
                    scodes[i+1] = c;
                    i++;
                    continue;
                }
            }
        }
    }

    //get glyphs and fonts for codes
    for (i = 0, li = str.length; i < li; i++) {
        c = scodes[i];

        for (j = 0, lj = fonts.length; j < lj; j++) {
            font = fonts[j];
            g = Typr.U.codeToGlyph(font, c);
            if (g) {
                break;
            }
        }

        gls.push(g);
        gfonts.push(g ? j : 0);
    }

    codes = scodes;
    font = null;
    
    
    for(var ci = 0; ci < gls.length; ci++) {
        gl = gls[ci];

        if (font != gfonts[ci]) {
            font = fonts[gfonts[ci]];
            gsub = font['GSUB'];
        }

        if(!gsub) {
            continue;
        }

        var t1 = scodesType[ci-1], t2 = scodesType[ci], t3 = scodesType[ci+1];

        var slft = (ci==0) || (t1 == 1);
        var srgt = (ci==gls.length-1) || (t3 == 1);
        
        if(!slft && (t1 == 3)) slft=true;
        if(!srgt && (t2 == 3)) srgt=true;
        
        if(!srgt && (t3 == 2)) srgt=true;
        if(!slft && (t2 == 2)) slft=true;
        
        gsubTable = null;
        if (slft) {
            gsubTable = srgt ? font.gsubIsolTable : font.gsubInitTable;        
        } else {
            gsubTable = srgt ? font.gsubFinaTable : font.gsubMediTable;            
        }
        
        if (gsubTable) {
            for(ti = 0; ti < gsubTable.length; ti++) {
                var tab = gsubTable[ti];

                for(j = 0; j < tab.length; j++) {
                    var ttab = tab[j];
                    var ind = Typr._lctf.coverageIndex(ttab.coverage,gl);
                    if(ind == -1) continue;  

                    if(ttab.fmt == 0) {
                        gls[ci] = ind+ttab.delta;
                    } else {
                        if (!ttab.newg) {
                            gls[ci] = gl;
                            console.log(ci, gl, 'subst-error', ' original:', str);
                        } else {
                            gls[ci] = ttab.newg[ind];
                        }
                    }
                }
            }
        }
    }

    font = null;
    
    for(var ci=0; ci<gls.length; ci++) {
        gl = gls[ci];

        if (font != gfonts[ci]) {
            font = fonts[gfonts[ci]];
            gsub = font['GSUB'];
        }

        if(!gsub) {
            continue;
        }

        gsubTable = font.gsubRligLigaTable;

        if (gsubTable) {
            var rlim = Math.min(3, gls.length-ci-1);

            for(ti = 0; ti < gsubTable.length; ti++) {
                var tab = gsubTable[ti];

                for(j = 0; j < tab.length; j++) {
                    var ttab = tab[j];
                    var ind = Typr._lctf.coverageIndex(ttab.coverage, gl);
                    if(ind==-1) continue;  

                    var vals = ttab.vals[ind];
                    
                    for(k=0; k<vals.length; k++) {
                        var lig = vals[k], rl = lig.chain.length;  if(rl>rlim) continue;
                        var good = true;
                        for(var l=0; l<rl; l++) if(lig.chain[l]!=gls[ci+(1+l)]) good=false;
                        if(!good) continue;
                        gls[ci]=lig.nglyph;
                        for(var l=0; l<rl; l++) gls[ci+l+1]=-1;
                        //console.log("lig", fl.tag,  gl, lig.chain, lig.nglyph);
                    }
                }
            }
        }
    }

    var indices = bidiResult.indices;
    var gls2 = gls.slice();
    var codes2 = codes.slice();
    var gfonts2 = gfonts.slice();

    for (i = 0, li = gls.length; i < li; i++) {
        c = indices[i];
        gls2[i] = gls[c];
        codes2[i] = codes[c];
        gfonts2[i] = gfonts[c];
    }

    return [gls2, gfonts2, codes2];
}


export {Typr};



