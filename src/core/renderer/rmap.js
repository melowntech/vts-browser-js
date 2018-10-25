

var RendererRMap = function(renderer, blockSize, maxBlockRectangles) {
    this.renderer = renderer;
    this.maxBlockRectangles = maxBlockRectangles || 500;
    this.blockSize = blockSize;
    this.blockSizeFactor = 1/blockSize;
    this.blocks = [];
    this.blocksRCount = [];
    this.allocatedBlocks = 0;
    this.lx = 1;
    this.ly = 1;
    this.counter = 0;
    this.rectangles = null;
    this.rectanglesCount = 0;
    this.rectangles2 = null;
    this.rectangles2Count = 0;
};


RendererRMap.prototype.clear = function() {
    this.slx = this.renderer.curSize[0];
    this.sly = this.renderer.curSize[1];

    //reduce by credits
    this.sly = Math.max(1, this.sly - 55);
    
    //compass size
    this.clx = 135;
    this.cly = (150 - 35);

    //search bar size
    this.blx = 245;
    this.bly = 45;


    this.lx = Math.floor(this.slx * this.blockSizeFactor) + 1;
    this.ly = Math.floor(this.sly * this.blockSizeFactor) + 1;

    var totalNeeded = this.ly * this.lx;
    
    if (!this.rectangles) {
        this.rectangles = new Array(totalNeeded * this.maxBlockRectangles * 6); //preallocate empty rectangles
    }

    if (!this.rectangles2) {
        this.rectangles2 = new Array(totalNeeded * this.maxBlockRectangles * 6); //preallocate empty rectangles
    }

    if (this.rectanglesCount > 0 || this.allocatedBlocks != totalNeeded) {
        this.allocatedBlocks = totalNeeded;

        for (var i = 0; i < totalNeeded; i++) { //check if all rectangles are preallocated and reset coutner
            if (!this.blocks[i]) {
                this.blocks[i] = [];
            }

            this.blocksRCount[i] = 0;
        }

    }

    this.rectanglesCount = 0;
    this.counter = this.renderer.geoRenderCounter;
};


RendererRMap.prototype.storeRemovedRectangle = function(x1, y1, x2, y2, z, subjob) {
        var rectangles2 = this.rectangles2;
        var rectangles2Count = this.rectangles2Count;

        rectangles2[rectangles2Count] = x1;
        rectangles2[rectangles2Count+1] = y1;
        rectangles2[rectangles2Count+2] = x2;
        rectangles2[rectangles2Count+3] = y2;
        rectangles2[rectangles2Count+4] = z;
        rectangles2[rectangles2Count+5] = subjob;
        this.rectangles2Count += 6;
};


RendererRMap.prototype.addRectangle = function(x1, y1, x2, y2, z, subjob, any) {
    var x, y, i, index, blockRectangles, blockRectanglesCount,
        rectangles = this.rectangles, rectangleIndex, t;

    if (x1 > x2) { t = x1; x1 = x2; x2 = t; }
    if (y1 > y2) { t = y1; y1 = y2; y2 = t; }

    var y3 = y2 + subjob[1]; //add stick shift
    
    //screen including credits
    if (x1 < 0 || x2 > this.slx || y1 < 0 || y3 > this.sly) {
        return false;
    }

    //compass
    if (x1 < this.clx && x2 > 0 && y1 <= this.sly && y3 > (this.sly -this.cly)) {
        return false;
    }

    //search bar
    if (x1 < this.blx && x2 > 0 && y1 <= this.bly && y3 > 0) {
        return false;
    }

    var xx1 = Math.floor(x1 * this.blockSizeFactor);
    var yy1 = Math.floor(y1 * this.blockSizeFactor);
    var xx2 = Math.floor(x2 * this.blockSizeFactor);
    var yy2 = Math.floor(y2 * this.blockSizeFactor);

    if (xx2 < 0 || yy2 < 0 || xx1 >= this.lx || yy1 >= this.ly) {
        return false;
    }

    if (xx1 < 0) xx1 = 0;
    if (xx2 >= this.lx) xx2 = this.lx - 1;

    if (yy1 < 0) yy1 = 0;
    if (yy2 >= this.ly) yy2 = this.ly - 1;

    var lx = (xx2 - xx1) + 1;
    var ly = (yy2 - yy1) + 1;
    var removeList = {};
    var exit = false;

    var top = this.renderer.config.mapFeaturesSortByTop;

    //test collision
    for (y = 0; y < ly; y++) {
        for (x = 0; x < lx; x++) {
            index = (yy1 + y)*this.lx + (xx1 + x);

            blockRectangles = this.blocks[index];
            blockRectanglesCount = this.blocksRCount[index];

            for (i = 0; i < blockRectanglesCount; i++) {
                rectangleIndex = blockRectangles[i];

                if (x1 < rectangles[rectangleIndex + 2] && x2 > rectangles[rectangleIndex + 0] &&
                    y1 < rectangles[rectangleIndex + 3] && y2 > rectangles[rectangleIndex + 1]) {

                    if (any) {
                        return false;
                    }

                    if (top) {
                        if (z < rectangles[rectangleIndex + 4]) {
                            return false;
                        }
                    } else {
                        if (z > rectangles[rectangleIndex + 4]) {
                            return false;
                        }
                    }

                    removeList[rectangleIndex] = true;
                }
            }

            if ((blockRectanglesCount + 1) >= this.maxBlockRectangles) {
                return false;
            }
        }
    }

    //remove rectangles
    for (var key in removeList) {
        this.removeRectangle(parseInt(key));
    }

    //there is no collision so we can store rectangle
    rectangleIndex = this.rectanglesCount
    rectangles[rectangleIndex] = x1;
    rectangles[rectangleIndex+1] = y1;
    rectangles[rectangleIndex+2] = x2;
    rectangles[rectangleIndex+3] = y2;
    rectangles[rectangleIndex+4] = z;
    rectangles[rectangleIndex+5] = subjob;
    this.rectanglesCount += 6;

    for (y = 0; y < ly; y++) {
        for (x = 0; x < lx; x++) {
            index = (yy1 + y)*this.lx + (xx1 + x);
            this.blocks[index][this.blocksRCount[index]] = rectangleIndex;
            this.blocksRCount[index]++;
        }
    }

    return true;
};

RendererRMap.prototype.removeRectangle = function(rectangleIndex) {
    var rectangles = this.rectangles, x1, y1, x2, y2, x, y, i, index,
        blockRectangles, blockRectanglesCount;

    x1 = rectangles[rectangleIndex];
    y1 = rectangles[rectangleIndex+1];
    x2 = rectangles[rectangleIndex+2];
    y2 = rectangles[rectangleIndex+3];

    //store removed rectangels for second pass
    var rectangles2 = this.rectangles2;
    var rectangles2Count = this.rectangles2Count;

    rectangles2[rectangles2Count] = x1;
    rectangles2[rectangles2Count+1] = y1;
    rectangles2[rectangles2Count+2] = x2;
    rectangles2[rectangles2Count+3] = y2;
    rectangles2[rectangles2Count+4] = rectangles[rectangleIndex+4];
    rectangles2[rectangles2Count+5] = rectangles[rectangleIndex+5];
    this.rectangles2Count += 6;

    //remove subjob
    rectangles[rectangleIndex+5] = null;

    var xx1 = Math.floor(x1 * this.blockSizeFactor);
    var yy1 = Math.floor(y1 * this.blockSizeFactor);
    var xx2 = Math.floor(x2 * this.blockSizeFactor);
    var yy2 = Math.floor(y2 * this.blockSizeFactor);

    if (xx1 < 0) xx1 = 0;
    if (xx2 >= this.lx) xx2 = this.lx - 1;

    if (yy1 < 0) yy1 = 0;
    if (yy2 >= this.ly) yy2 = this.ly - 1;

    var lx = (xx2 - xx1) + 1;
    var ly = (yy2 - yy1) + 1;

    for (y = 0; y < ly; y++) {
        for (x = 0; x < lx; x++) {
            index = (yy1 + y)*this.lx + (xx1 + x);

            blockRectangles = this.blocks[index];
            blockRectanglesCount = this.blocksRCount[index];

            for (i = 0; i < blockRectanglesCount; i++) {
                if (blockRectangles[i] == rectangleIndex) {
                    blockRectangles[i] = blockRectangles[blockRectanglesCount - 1];
                    this.blocksRCount[index]--;
                    break;
                }
            }

        }
    }
};

RendererRMap.prototype.processRectangles = function(gpu, gl, renderer, screenPixelSize) {
    var rectangles = this.rectangles;
    var rectangles2 = this.rectangles2;
    var draw = renderer.draw;

    // second pass
    // add removed rectangles
    for (var i = 0, li = this.rectangles2Count; i < li; i+=6) {
        var x1 = rectangles2[i],
            y1 = rectangles2[i+1],
            x2 = rectangles2[i+2],
            y2 = rectangles2[i+3],
            z = rectangles2[i+4],
            subjob = rectangles2[i+5];

        this.addRectangle(x1, y1, x2, y2, z, subjob);
    }

    this.rectangles2Count = 0;

    for (i = 0, li = this.rectanglesCount; i < li; i+=6) {
        var subjob = rectangles[i+5];

        if (subjob) {
            if (subjob[0].hysteresis) {
                renderer.jobHBuffer[subjob[0].id] = subjob[0];
            } else {
                draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, subjob, null);
            }
        }
    }

    this.clear();
};

export default RendererRMap;

