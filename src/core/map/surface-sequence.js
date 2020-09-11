
var MapSurfaceSequence = function(map) {
    this.map = map;
};


MapSurfaceSequence.prototype.generateSurfaceSequence = function() {
    var view = this.map.currentView;
    var tree = this.map.tree;
    
    if (!tree) {
        return;
    }
    
    tree.surfaceSequence = [];
    tree.surfaceSequenceIndices = []; //probably not used
    tree.surfaceOnlySequence = [];

    var vsurfaces = {}, surface, glue; 
    var vsurfaceCount = 0;
    var list = [], listId, i, li, j , lj, key;
    var strId = [];
        
    //add surfaces to the list
    for (key in view.surfaces) {
        surface = this.map.getSurface(key);
        
        if (surface) {
            strId.push(surface.id);
            vsurfaceCount++;
            vsurfaces[key] = surface.index + 1; //add one to avoid zero 
            //list.push(["" + (surface.index + 1), surface, true]);    
            list.push([ [(surface.index + 1)], surface, true, false]); //[surfaceId, surface, isSurface, isAlien]    
        }
    }


    if (vsurfaceCount >= 1) { //do we have virtual surface?
        strId.sort(); 
        strId = strId.join(';');

        surface = this.map.virtualSurfaces[strId];
        if (surface) {
            list = [ [ [(surface.index + 1)], surface, true, false] ]; //[surfaceId, surface, isSurface, isAlien]    
            vsurfaceCount = 1;
        }
    }
    
    if (vsurfaceCount > 1) {
        
        var glues = [];
    
        //add proper glues to the list
        for (key in this.map.glues) {
            glue = this.map.glues[key];

            //add only glue which contains desired surfaces

            if (!glue || !glue.id) continue;

            var id = glue.id; 
            if (id.length <= vsurfaceCount) {
    
                var missed = false;
                for (j = 0, lj = id.length; j < lj; j++) {
                    if (!vsurfaces[id[j]]) {
                        missed = true;
                        break;
                    }
                }
    
                if (!missed) {
                    //var listId = "";
                    listId = [];
                    
                    //create glue id in reverse order for sorting
                    for (j = 0, lj = id.length; j < lj; j++) {
                        //listId = vsurfaces[id[j]] + (j ? "." : "") + listId;
                        listId.unshift(vsurfaces[id[j]]);
                    }
    
                    glues.push([listId, glue, false, false]); //[surfaceId, surface, isSurface, isAlien]   
                }
            }
        }
    
        //process glue flags
        for (i = 0, li = glues.length; i < li; i++) {
            var item = glues[i];
            glue = item[1];
    
            glue.flagProper = true;
            glue.flagAlien = true;
    
            if (glue.flagProper) {
                list.push(item);  
            }
                    
            if (glue.flagAlien) {
                //remove first surface from id
                listId = item[0].slice(1);
                            
                //add same glue as alien
                list.push([listId, item[1], false, true]); //[surfaceId, surface, isSurface, isAlien]   
            }
        }
    
        //sort list alphabetically
        do {
            var sorted = true;
            
            for (i = 0, li = list.length - 1; i < li; i++) {
                var a1 = list[i][0];
                var a2 = list[i+1][0];
                
                var lesser = false;
                
                for (j = 0, lj = Math.min(a1.length, a2.length); j < lj; j++) {
                    if (a1[j] < a2[j] || (j == (lj -1) && a1[j] == a2[j] && a2.length > a1.length)) {
                        lesser = true;
                        break;                    
                    }
                }
                
                if (lesser) {
                    var t = list[i];
                    list[i] = list[i+1];
                    list[i+1] = t;
                    sorted = false;
                } 
            }
            
        } while(!sorted);
   
        var lastIndex = vsurfaceCount - 1;
    
        //convert list to surface sequence
        for (i = 0, li = list.length; i < li; i++) {
            tree.surfaceSequence.push([list[i][1], list[i][3]]); //[surface, isAlien]
            //this.surfaceSequence.push(list[i][1]); 
            list[i][1].viewSurfaceIndex = lastIndex; 
            
            if (list[i][2]) {
                lastIndex--;
                tree.surfaceOnlySequence.push(list[i][1]);
            }
        }
    
        //this.generateSurfaceSequenceOld();
        
    } else {
        if (vsurfaceCount == 1) {
            tree.surfaceSequence.push([list[0][1], list[0][3]]); //[surface, isAlien]
            list[0][1].viewSurfaceIndex = vsurfaceCount - 1;
            tree.surfaceOnlySequence = [list[0][1]];
        }
    }

    this.map.freeLayersHaveGeodata = false;

    //free layers
    for (key in view.freeLayers) {
        var freeLayer = this.map.getFreeLayer(key);
        if (freeLayer) {
            freeLayer.surfaceSequence = [freeLayer];
            freeLayer.surfaceOnlySequence = [freeLayer];
            
            if (freeLayer.geodata) {
                this.map.freeLayersHaveGeodata = true;
            }
        }
    }    

    //just in case
    this.map.renderer.draw.clearJobBuffer();
};


MapSurfaceSequence.prototype.generateBoundLayerSequence = function() {
    var view = this.map.currentView;
    var key, item, layer, alpha, i, li, item2;
    
    //zero bound layer filters
    var layers = this.map.boundLayers;
    for (var key in layers) {
        layers[key].shaderFilters = null;
    }

    //surfaces
    for (key in view.surfaces) {
        var surfaceLayers = view.surfaces[key];
        var surface = this.map.getSurface(key);
        if (surface != null) {
            surface.boundLayerSequence = [];
            
            for (i = 0, li = surfaceLayers.length; i < li; i++) {
                item = surfaceLayers[i];
        
                if (typeof item === 'string') {
                    layer = this.map.getBoundLayerById(item);
                    if (layer) {
                        surface.boundLayerSequence.push([layer, 1]);
                    }
                } else {
                    layer = this.map.getBoundLayerById(item['id']);
                    if (layer) {

                        alpha = 1;
                        if (typeof item['alpha'] !== 'undefined') {
                            alpha = parseFloat(item['alpha']);
                        }

                        surface.boundLayerSequence.push([layer, alpha]);

                        item2 = item['options'] || item;

                        if (item2['shaderVarFlatShade']) {
                            if (!layer.shaderFilters) {
                                layer.shaderFilters = {};
                            }
                            
                            if (!layer.shaderFilters[surface.id]) {
                                layer.shaderFilters[surface.id] = {};
                            }

                            layer.shaderFilters[surface.id].varFlatShade = item2['shaderVarFlatShade'];
                        }

                        if (item2['shaderFilter']) {
                            if (!layer.shaderFilters) {
                                layer.shaderFilters = {};
                            }
                            
                            if (!layer.shaderFilters[surface.id]) {
                                layer.shaderFilters[surface.id] = {};
                            }

                            layer.shaderFilters[surface.id].filter = item2['shaderFilter'];
                        }
                    }
                }
            }
        }
    }

    //free layers
    for (key in view.freeLayers) {
        var freeLayersProperties = view.freeLayers[key];
        var freeLayer = this.map.getFreeLayer(key);
        if (freeLayer != null && freeLayer.ready) {

            freeLayer.options = freeLayersProperties['options'] || {};

            freeLayer.boundLayerSequence = [];
            
            var boundLayers = freeLayersProperties['boundLayers'];
            
            if (boundLayers && Array.isArray(boundLayers)) {

                for (i = 0, li = boundLayers.length; i < li; i++) {
                    item = boundLayers[i];
            
                    if (typeof item === 'string') {
                        layer = this.map.getBoundLayerById(item);
                        if (layer) {
                            freeLayer.boundLayerSequence.push([layer, 1]);
                        }
                    } else {
                        layer = this.map.getBoundLayerById(item['id']);
                        if (layer) {
    
                            alpha = 1;
                            if (typeof item['alpha'] !== 'undefined') {
                                alpha = parseFloat(item['alpha']);
                            }
    
                            freeLayer.boundLayerSequence.push([layer, alpha]);

                            if (item['shaderVarFlatShade']) {
                                if (!layer.shaderFilters) {
                                    layer.shaderFilters = {};
                                }
                                
                                if (!layer.shaderFilters[surface.id]) {
                                    layer.shaderFilters[surface.id] = {};
                                }

                                layer.shaderFilters[surface.id].varFlatShade = item['shaderVarFlatShade'];
                            }

                            if (item['shaderFilter']) {
                                if (!layer.shaderFilters) {
                                    layer.shaderFilters = {};
                                }
                                
                                if (!layer.shaderFilters[surface.id]) {
                                    layer.shaderFilters[surface.id] = {};
                                }

                                layer.shaderFilters[surface.id].filter = item['shaderFilter'];
                            }
                        }
                    }
                }
            }  
        }
    }
};


export default MapSurfaceSequence;

