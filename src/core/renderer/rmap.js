

var RendererRMap = function(renderer, blockSize, maxBlockRectangles) {
    this.renderer = renderer;
    this.maxBlockRectangles = maxBlockRectangles || 50;
    this.blockSize = blockSize;
    this.blockSizeFactor = 1/blockSize;
    this.blocks = [];
    this.blocksRCount = [];
    this.lx = 1;
    this.ly = 1;
    this.counter = 0;
    this.allocatedBlocks = 0;
};


RendererRMap.prototype.clear = function() {
    this.lx = Math.floor(this.renderer.curSize[0] * this.blockSizeFactor) + 1;
    this.ly = Math.floor(this.renderer.curSize[1] * this.blockSizeFactor) + 1;

    var totalNeeded = this.ly * this.lx;

    for (var i = 0; i < totalNeeded; i++) { //check if all rectangles are preallocated and reset coutner
        if (!this.blocks[i]) {
            var rectangles = new Array(this.maxBlockRectangles); //preallocate empty rectangles
            for (var j = 0, lj = this.maxBlockRectangles; j < lj; j++) {
                rectangles[j] = [0,0,0,0];
            }
            this.blocks[i] = rectangles;
        }

        this.blocksRCount[i] = 0;
    }

    this.allocatedBlocks = totalNeeded;
    this.counter = this.renderer.geoRenderCounter;
};

RendererRMap.prototype.addRectangle = function(x1, y1, x2, y2) {
    var x, y, i, li, index, rectangles, rec, t, rcount;

    if (this.counter != this.renderer.geoRenderCounter) {
        this.clear();
    }

    if (x1 > x2) { t = x1; x1 = x2; x2 = t; }
    if (y1 > y2) { t = y1; y1 = y2; y2 = t; }

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

    //test collision
    for (y = 0; y < ly; y++) {
        for (x = 0; x < lx; x++) {
            index = (yy1 + y)*this.lx + (xx1 + x);

            if (index >= this.allocatedBlocks) {
                index = index;
            }

            rectangles = this.blocks[index];
            rcount = this.blocksRCount[index];

            if ((rcount + 1) >= this.maxBlockRectangles) {
                return false;
            }

            for (i = 0, li = rcount; i < li; i++) {
                rec = rectangles[i];

                if (x1 < rec[2] && x2 > rec[0] &&
                    y1 < rec[3] && y2 > rec[1]) {

                    return false;
                }
            }
        }
    }

    //there is no collision so we can store rectangle
    for (y = 0; y < ly; y++) {
        for (x = 0; x < lx; x++) {
            index = (yy1 + y)*this.lx + (xx1 + x);

            if (index >= this.allocatedBlocks) {
                index = index;
            }

            rectangles = this.blocks[index];
            rcount = this.blocksRCount[index];

            if (!rectangles) {
                index = index;
            }

            rec = rectangles[rcount];
            rec[0] = x1, rec[1] = y1;
            rec[2] = x2, rec[3] = y2;

            this.blocksRCount[index] = rcount + 1;
        }
    }

    return true;
};


export default RendererRMap;
