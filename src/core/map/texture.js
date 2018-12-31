
import MapSubtexture_ from './subtexture';

//get rid of compiler mess
var MapSubtexture = MapSubtexture_;


var MapTexture = function(map, path, type, extraBound, extraInfo, tile, internal) {
    this.map = map;
    this.stats = map.stats;
    this.tile = tile; // used only for stats
    this.internal = internal; // used only for stats
    
    if (tile) {
        this.mainTexture = tile.resources.getSubtexture(this, path, type, tile, internal); 
    } else {
        this.mainTexture = new MapSubtexture(map, path, type, tile, internal); 
    }

    this.maskTexture = null; 

    this.loadState = 0;
    this.loadErrorTime = null;
    this.loadErrorCounter = 0;
    this.neverReady = false;
    this.maskTexture = null;
    this.mapLoaderUrl = path;
    this.type = type || VTS_TEXTURETYPE_COLOR;
    this.extraBound = extraBound;
    this.extraInfo = extraInfo;
    this.statsCounter = 0;
    this.checkStatus = 0;
    this.checkType = null;
    this.checkValue = null;
    this.fastHeaderCheck = false;
    this.fileSize = 0;

    if (extraInfo && extraInfo.layer) {
        var layer = extraInfo.layer;
        
        if (layer.availability) {
            this.checkType = layer.availability.type;
            switch (this.checkType) {
            case VTS_TEXTURECHECK_TYPE: this.checkValue = layer.availability.mime; break;
            case VTS_TEXTURECHECK_CODE: this.checkValue = layer.availability.codes; break;
            case VTS_TEXTURECHECK_SIZE: this.checkValue = layer.availability.size; break;
            }
        }       
    }
};


MapTexture.prototype.kill = function() {
    this.mainTexture.killImage();
    this.mainTexture.killGpuTexture();
    this.mainTexture = null;
    
    if (this.maskTexture) {
        this.maskTexture.killImage(); 
        this.maskTexture.killGpuTexture(); 
    }
};


MapTexture.prototype.killImage = function() {
    this.mainTexture.killImage();

    if (this.maskTexture) {
        this.maskTexture.killImage(); 
    }
};


MapTexture.prototype.killGpuTexture = function() {
    this.mainTexture.killGpuTexture();

    if (this.maskTexture) {
        this.maskTexture.killGpuTexture(); 
    }
};


MapTexture.prototype.setBoundTexture = function(tile, layer, hmap) {
    if (tile) {
        if (hmap) {
            this.extraBound.sourceTile = tile;
            this.extraBound.hmap = hmap;

            if (!tile.hmap) {
                var path = tile.resourceSurface.getHMapUrl(tile.id, true);
                tile.hmap = tile.resources.getTexture(path, null, null, {tile: tile, hmap: hmap}, this.tile, this.internal);
            }

            this.extraBound.texture = tile.hmap; 

        } else if (layer) {
            this.extraBound.sourceTile = tile;
            this.extraBound.layer = layer;
            
            if (!tile.boundTextures[layer.id]) {
                tile.boundLayers[layer.id] = layer;
                var path = layer.getUrl(tile.id);
                tile.boundTextures[layer.id] = tile.resources.getTexture(path, null, null, {tile: tile, layer: layer}, this.tile, this.internal);
            }

            this.extraBound.texture = tile.boundTextures[layer.id]; 
        }
        
        this.extraBound.transform = this.map.draw.drawTiles.getTileTextureTransform(tile, this.extraBound.tile);
        this.map.markDirty();
    }
};


MapTexture.prototype.isReady = function(doNotLoad, priority, doNotCheckGpu) {
    var doNotUseGpu = (this.map.stats.gpuRenderUsed >= this.map.draw.maxGpuUsed);
    doNotLoad = doNotLoad || doNotUseGpu;
/*   
   if (this.mapLoaderUrl == "https://ecn.t3.tiles.virtualearth.net/tiles/a1202310323212333.jpeg?g=5549") {
       this.mapLoaderUrl = this.mapLoaderUrl;
   }
*/
    if (this.neverReady) {
        return false;
    }

    var parent;
   
    if (this.extraBound) {
        if (this.extraBound.texture) {
            while (this.extraBound.texture.extraBound || this.extraBound.texture.checkStatus == -1) {
//            while (this.extraBound.texture.checkStatus == -1) {
                parent = this.extraBound.sourceTile.parent;

                if (this.extraBound.hmap) {
                    if (!parent || parent.id[0] < 1) {
                        this.neverReady = true;
                        this.extraBound.tile.resetDrawCommands = true;
                        this.map.markDirty();
                        return false;
                    }
                } else if (this.extraBound.layer) {
                    if (parent.id[0] < this.extraBound.layer.lodRange[0]) {
                        this.neverReady = true;
                        this.extraBound.tile.resetDrawCommands = true;
                        this.map.markDirty();
                        return false;
                    }
                }
 
                this.setBoundTexture(parent, this.extraBound.layer);
            }
            
            var ready = this.extraBound.texture.isReady(doNotLoad, priority, doNotCheckGpu);
            
            if (ready && this.checkMask) {
                this.extraBound.tile.resetDrawCommands = (this.extraBound.texture.getMaskTexture() != null);
                this.checkMask = false;
            }

            return ready;
            
        } else {
            this.setBoundTexture(this.extraBound.sourceTile, this.extraBound.layer, this.extraBound.hmap);        
            return this.isReady(doNotLoad, priority, doNotCheckGpu);
        }
        
        return false;
    }

    /*
    if (!this.extraBound && this.extraInfo && !this.maskTexture) {
        var layer = this.extraInfo.layer;
        
        if (layer && layer.maskUrl && this.checkType != "metatile") {
            var path = layer.getMaskUrl(this.tile.id);
            this.maskTexture = this.tile.resources.getTexture(path, null, null, null, this.tile, this.internal);
        }
    }*/

    switch (this.checkType) {
    case VTS_TEXTURECHECK_MEATATILE:

        if (this.checkStatus != 2) {
            if (this.checkStatus == 0) {
                if (this.extraInfo && this.extraInfo.tile) {
                    var metaresources = this.extraInfo.tile.boundmetaresources;
                    if (!metaresources) {
                        metaresources = this.map.resourcesTree.findAgregatedNode(this.extraInfo.tile.id, 8);
                        this.extraInfo.tile.boundmetaresources = metaresources;
                    }
                        
                    var layer = this.extraInfo.layer;
                    var path = this.extraInfo.metaPath;
						
                    if(!this.extraInfo.metaPath) {
                        path = layer.getMetatileUrl(metaresources.id);	
                        this.extraInfo.metaPath = path;
                    }
						
                    var texture = metaresources.getTexture(path, true, null, null, this.tile, this.internal);
                        
                    if (this.maskTexture) {
                        if (this.maskTexture.isReady(doNotLoad, priority, doNotCheckGpu, this)) {
                            this.checkStatus = 2;
                        }
                    } else {
                        if (texture.isReady(doNotLoad, priority, doNotCheckGpu)) {
                            var tile = this.extraInfo.tile;
                            var value = texture.getHeightMapValue(tile.id[1] & 255, tile.id[2] & 255);
                            this.checkStatus = (value & 128) ? 2 : -1;
                                
                            if (this.checkStatus == 2) {
                                if (!(value & 64)) { //load mask
                                    path = layer.getMaskUrl(tile.id);
                                    this.maskTexture = tile.resources.getTexture(path, null, null, null, this.tile, this.internal);
                                    this.checkStatus = 0;
                                }
                            }

                            tile.resetDrawCommands = true;
                            this.map.markDirty();
                        }
                    }
                }
            }
                
            if (this.checkStatus == -1) {
                if (!this.extraBound) {
                    parent = this.extraInfo.tile.parent;
                    if (parent.id[0] < this.extraInfo.layer.lodRange[0]) {
                        this.neverReady = true;
                        this.extraInfo.tile.resetDrawCommands = true;
                        this.map.markDirty();
                        return false;
                    }

                    this.extraBound = { tile: this.extraInfo.tile, layer: this.extraInfo.layer};
                    this.setBoundTexture(this.extraBound.tile.parent, this.extraBound.layer);
                    this.checkMask = true;
                }

                while (this.extraBound.texture.extraBound || this.extraBound.texture.checkStatus == -1) {
                    //while (this.extraBound.texture.checkStatus == -1) {
                    parent = this.extraBound.sourceTile.parent;
                    if (parent.id[0] < this.extraBound.layer.lodRange[0]) {
                        this.neverReady = true;
                        this.extraBound.tile.resetDrawCommands = true;
                        this.map.markDirty();
                        return false;
                    }
                        
                    this.setBoundTexture(parent, this.extraBound.layer);        
                }
            }

            return false;
        }
        
        break;
    }

    var maskState = true;

    if (this.maskTexture) {
        maskState = this.maskTexture.isReady(doNotLoad, priority, doNotCheckGpu, this);
    }
    

    return this.mainTexture.isReady(doNotLoad, priority, doNotCheckGpu, this) && maskState;
};

MapTexture.prototype.isMaskPosible = function() {
    var texture = this;

    if (this.extraBound) {
        if (this.extraBound.texture) {
            texture = this.extraBound.texture;
        }
    }

    if (texture.checkType == VTS_TEXTURECHECK_MEATATILE) {
        return true;
    } else {
        return false;
    }
};

MapTexture.prototype.isMaskInfoReady = function() {
    var texture = this;

    if (this.extraBound) {
        if (this.extraBound.texture) {
            texture = this.extraBound.texture;
        }
    }

    if (texture.checkType == VTS_TEXTURECHECK_MEATATILE) {
        if (this.maskTexture || texture.checkStatus == 2 || texture.checkStatus ==  -1) {
            return true;
        }

        return false;
    }

    return true;
}

MapTexture.prototype.getGpuTexture = function() {
    if (this.extraBound) {
        if (this.extraBound.texture) {
            return this.extraBound.texture.getGpuTexture();
        }
        return null;
    } 

    return this.mainTexture.getGpuTexture();
};


MapTexture.prototype.getMaskTexture = function() {
    if (this.extraBound) {
        if (this.extraBound.texture) {
            return this.extraBound.texture.getMaskTexture();
        }
    } 

    return this.maskTexture;
};


MapTexture.prototype.getGpuMaskTexture = function() {
    if (this.extraBound) {
        if (this.extraBound.texture && this.extraBound.texture.maskTexture) {
            return this.extraBound.texture.getGpuMaskTexture();
        }
        return null;
    } 

    if (this.maskTexture) {
        return this.maskTexture.getGpuTexture();
    }
    
    return null;
};

MapTexture.prototype.getGpuSize = function() {
    return (this.mainTexture ? (this.mainTexture.gpuSize ? this.mainTexture.gpuSize : 0) : 0) + (this.maskTexture ? (this.maskTexture.gpuSize ? this.maskTexture.gpuSize : 0) : 0);
};

MapTexture.prototype.getImageData = function() {
    return this.mainTexture.imageData;
};


MapTexture.prototype.getImageExtents = function() {
    return this.mainTexture.imageExtents;
};


MapTexture.prototype.getHeightMapValue = function(x, y) {
    return this.mainTexture.getHeightMapValue(x, y);
};


MapTexture.prototype.getTransform = function() {
    if (this.extraBound) {
        if (this.extraBound.texture) {
            return this.extraBound.transform;
        }
        return null;
    } 

    return [1,1,0,0];
};


export default MapTexture;

