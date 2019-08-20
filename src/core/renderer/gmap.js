

function processGMap(gpu, gl, renderer, screenPixelSize, draw) {
    if (!renderer.config.mapFeaturesReduceParams) {
        return;
    }

    var tileCount = renderer.config.mapFeaturesReduceParams[1]; //31; //labelGridCells
    var featuresPerSquareInch = renderer.config.mapFeaturesReduceParams[0]; //0.6614; //labelsPerSquareInch
    var ppi = 96 * (window.devicePixelRatio || 1);
    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var featureCount = Math.ceil((screenLX/ppi)*(screenLY/ppi)*featuresPerSquareInch); 
    var i, li, top = renderer.config.mapFeaturesSortByTop;

    if (tileCount <= 0) {
        tileCount = featureCount * 2; //31; //labelGridCells
    } else {
        tileCount = tileCount;
    }

    //renderer.debugStr = '<br>featuresPerScr: ' + featureCount + '<br>gridCells: ' + tileCount + '';

    //get top features
    var featureCache = renderer.gmap;
    var featureCacheSize = renderer.gmapIndex;
    var topFeatures = renderer.gmapTop;
    var featureCount2 = featureCount;

    if (featureCount > featureCacheSize) {
        featureCount2 = featureCacheSize;
    }

    //distribute top features
    var tileSize = Math.floor(Math.sqrt((screenLX*screenLY) / tileCount));
    var hitMap = renderer.gmapHit, usedFeatures = 0;
    var tileFeatures, count, feature, job;
    var drawAllLabels = renderer.drawAllLabels;

    var colors = [
        [0, 0, 255, 255],
        [128, 0, 255, 255],
        [255, 0, 0, 255],
        [255, 128, 0, 255],
        [0, 255, 0, 255],
        [0, 255, 128, 255],
        [128, 255, 128, 255]
    ];

    var colorIndex = 0;

    do {
        var a,b,c,d,ix,iy,is,pp,tx,ty,mx,my,v,index,o,j;

        ix = screenLX / tileSize;
        iy = screenLY / tileSize;
        is = ix * iy;
        mx = Math.floor(ix);
        my = Math.floor(iy);
        ix = ix - mx;
        iy = iy - my;

        a = 1 / is;
        b = ix / is;
        c = iy / is;
        d = (ix*iy) / is;

        a = Math.floor(a * featureCount);
        b = Math.floor(b * featureCount);
        c = Math.floor(c * featureCount);
        d = Math.floor(d * featureCount);

        var hitMap = renderer.gmapStore;
        var hitMapCount = renderer.gmapHit;

        if (renderer.drawGridCells) {
            gpu.setState(renderer.lineLabelState);

            var x = 0, y = 0, j, lj;

            for (j = 0, lj = (my + 1); j < lj; j++) {
                for (i = 0, li = (mx + 1); i < li; i++) {
                    x = tileSize * i;
                    y = tileSize * j;

                    v = a;

                    if (i >= mx) {
                        if (j >= my) {
                            v =d;
                        } else {
                            v = b;
                        }

                    } else {
                        if (j >= my) {
                            v = b;
                        }
                    }

                    draw.drawLineString([[x, y, 0.5], [x+tileSize, y, 0.5],
                                         [x+tileSize, y+tileSize, 0.5], [x, y+tileSize, 0.5]], true, 1, colors[colorIndex], null, true, null, null, null);

                    draw.drawText(Math.round(x+5), Math.round(y + 5 + colorIndex * 15), 10, '' + v, colors[colorIndex], 0.5);
                }
            }

        }


        //clear hit-map
        for (i = 0, li = (mx+1) * (my+1); i < li; i++) {
            hitMap[i] = null;
        }

        for (i = 0, li = featureCacheSize; i < li; i++) {
            feature = featureCache[i];
            if (!feature) {
                continue;
            }

            pp = feature[5];

            if (pp[0] < 30 || pp[0] >= (screenLX-30) || pp[1] < 30 || pp[1] >= (screenLY-30)) {
                featureCache[i] = null;
                continue;
            }

            tx = pp[0] / tileSize;
            ty = pp[1] / tileSize;

            if (tx > mx) {
                if (ty > my) {
                    v = d;
                } else {
                    v = b;
                }
            } else if (ty > my) {
                v = c;
            } else {
                v = a;
            }

            if (v > 0) {
                index = Math.floor(tx) + Math.floor(ty) * (mx + 1);

                tileFeatures = hitMap[index];

                if (tileFeatures) {
                    hitMap[index].push(i);
                } else {
                    hitMap[index] = [i];
                    hitMapCount[index] = v;
                }
            }
        }

        for (i = 0, li = (mx+1) * (my+1); i < li; i++) {
            tileFeatures = hitMap[i];

            if (tileFeatures && tileFeatures.length) {
                count = hitMapCount[i];

                if (count > tileFeatures.length) {
                    count = tileFeatures.length;
                }

                sortFeatures(tileFeatures, top, count, renderer);

                for (j = 0; j < count; j++){
                    index = topFeatures[j]
                    feature = featureCache[index];
                    topFeatures[j] = null;
                    featureCache[index] = null;
                    job = feature[0];

                    //render job
                    if (!drawAllLabels && feature[6]) { //no-overlap 
                        pp = feature[5];
                        o = feature[8];

                        if (!renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob)) {
                        }

                        if (job.type == VTS_JOB_LINE_LABEL) {
                            if (renderer.rmap.addLineLabel(job.lastSubJob, depthParams)) {
                                //renderer.rmap.storeRemovedLineLabel(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob);
                            }
                        } else {
                            if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], job.lastSubJob, true, depthParams)) {
                                renderer.rmap.storeRemovedRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob);
                            }
                        }

                    } else {
                        if (job.hysteresis) {
                            renderer.jobHBuffer[job.id] = job;
                        } else {
                            renderer.drawnJobs++;

                            if (job.type == VTS_JOB_LINE_LABEL) {
                                draw.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            } else {
                                draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            }
                        }
                    }
                }

            }
        }

        a *= mx * my;
        b *= mx;
        c *= my;

        usedFeatures += a + b + c + d;
        featureCount -= a + b + c + d;
        tileSize *= 2;

        colorIndex++;

    } while(usedFeatures < featureCount2);

}


function sortFeatures(features, top, count, renderer) {
    var value, feature;
    var currentIndex = 0;
    var currentValue2 = top ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    var topFeatures = renderer.gmapTop;
    var topFeaturesIndex = 0;
    var topFeaturesIndex2 = 0;

    //remove feature from cache
    var featureCache = renderer.gmap, index;


    do {
        var currentValue = top ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        topFeaturesIndex2 = topFeaturesIndex;

        for (var i = 0, li = features.length; i < li; i++) {
            index = features[i];
            feature = featureCache[index];
            value = feature[0].reduce[1];

            if (((top && value >= currentValue && value < currentValue2) || (value <= currentValue && value > currentValue2)) ) {
                if (currentValue != value) {
                    topFeaturesIndex = topFeaturesIndex2;
                }

                topFeatures[topFeaturesIndex] = index;
                topFeaturesIndex++;
                currentValue = value;
            }
        }

        currentValue2 = currentValue;
        currentIndex++;

    } while(currentIndex < count);

}

function storeFeatureToHitmap(id, feature, ix, iy, mx, my, hitMap, hcache, hcacheSize) {
    var x1 = ix - 1, y1 = iy - 1, x,
        x2 = ix + 1, y2 = iy + 1, index, blockFeatures;

    if (x1 < 0) x1 = 0;
    if (y1 < 0) y1 = 0;
    if (x2 > mx) x2 = mx;
    if (y2 > my) y2 = my;

    for (; y1 <= y2; y1++) {
        for (x = x1; x <= x2; x++) {
            index = (y1 * mx + x) * 2;
            blockFeatures = hitMap[index];

            if (!hitMap[index]) {
                hitMap[index] = hcacheSize;
                hitMap[index+1] = hcacheSize+1;
                hcache[hcacheSize] = feature;
                hcache[hcacheSize+1] = 0;
                hcacheSize +=2;
            } else {
                hcache[hitMap[index+1]] = hcacheSize;
                hitMap[index+1] = hcacheSize+1;
                hcache[hcacheSize] = feature;
                hcache[hcacheSize+1] = 0;
                hcacheSize +=2;
            }
        }
    }

    return hcacheSize;
}


function processGMap4(gpu, gl, renderer, screenPixelSize, draw) {
    if (!renderer.config.mapFeaturesReduceParams) {
        return;
    }

    var ppi = 96 * (window.devicePixelRatio || 1);

    var maxRadius = renderer.config.mapFeaturesReduceParams[0] * ppi; //mapFeatureRadius
    var maxHitcount = renderer.config.mapFeaturesReduceParams[1]; //0.6614; //mapFeatureMaxOverlays

    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var i, li, top = renderer.config.mapFeaturesSortByTop, tmp;
    var feature, feature2, pp, pp2, o, job;
    var drawAllLabels = renderer.drawAllLabels;

    //get top features
    var featureCache = renderer.gmap;
    var featureCacheSize = renderer.gmapIndex;

    var hcache = renderer.gmap2;
    var hcacheSize = 1;
    var hmap = renderer.gmap3;
    var hmapSize = renderer.gmap3Size;
    var hmap = renderer.gmap3;


    var hmin = 10000;
    var hmax = 0, h, r;

    var divByDist = (renderer.config.mapFeaturesReduceFactor >= 1);

    if (divByDist) { // imp / dists
        if (renderer.fmaxDist == Number.NEGATIVE_INFINITY || renderer.fminDist == Number.POSITIVE_INFINITY) {
            return;
        }

        var ub = 1 - Math.log(renderer.fminDist) / Math.log(101);
        var lb = -Math.log(renderer.fmaxDist) / Math.log(101); 
    }

    //filter features and sort them by importance
    for (i = 0, li = featureCacheSize; i < li; i++) {
        feature = featureCache[i];
        if (!feature) {
            continue;
        }

        pp = feature[5];

        if (divByDist) {
            r = feature[0].reduce;
            h = Math.round(-5000 + ( ( Math.log(r[1]+1) - Math.log(r[4]) ) / Math.log(101) - lb ) / ( ub-lb ) * 10000) + 5000;
            r[5] = h; //for debug
        } else {
            h = Math.round(feature[0].reduce[1]);            
        }

        if (h < 0) h = 0;
        if (h >= 10000) h = 9999;
        if (h < hmin) hmin = h;
        if (h > hmax) hmax = h;

        hmap[h][hmapSize[h]++] = feature;
    }

    var invMaxRadius = 1 / maxRadius, index, ix, iy, features;
    var mx = Math.floor(screenLX * invMaxRadius);
    var my = Math.floor(screenLY * invMaxRadius);

    var hitMap = renderer.gmapStore;
    var hitMapCount = renderer.gmapHit;

    //clear hit-map
    for (i = 0, li = (mx+1) * (my+1) * 2; i < li; i+=2) {
        hitMap[i] = 0;
    }

    //var hitCache = renderer.gmapHit2;
    var hitCacheSize = 0, j, lj, k, lk, hitCount, dx, dy, blockFeatures;

    maxRadius *= maxRadius;

    for (i = hmax, li = hmin; i >= 0; i--) {

        if (hmapSize[i] > 0) {
            var features = hmap[i];

            for (j = 0, lj = hmapSize[i]; j < lj; j++) {
                feature = features[j];
                job = feature[0];

                hitCount = 0;
                pp = feature[5];

                //check area
                ix = Math.floor(pp[0] * invMaxRadius);
                iy = Math.floor(pp[1] * invMaxRadius);
                index = ((iy * mx) + ix) * 2;
                //blockFeatures = hitMap[index];

                //check
                if (hitMap[index]) {
                    index = hitMap[index];
                    do {
                        feature2 = hcache[index];
                        pp2 = feature2[5];

                        dx = pp[0] - pp2[0];
                        dy = pp[1] - pp2[1];

                        if ((dx*dx+dy*dy) < maxRadius) {
                            hitCount++;
                            if (hitCount > maxHitcount) {
                                break;
                            }
                        }

                        index = hcache[index+1];
                    } while (index);
                }

                // check                
                if (hitCount <= maxHitcount) {
                    index = hitCacheSize;

                    //render job
                    if (!drawAllLabels && feature[6]) { //no-overlap 
                        pp = feature[5];
                        o = feature[8];

                        if (job.type == VTS_JOB_LINE_LABEL) {
                            if (renderer.rmap.addLineLabel(job.lastSubJob, null)) {
                                hitCacheSize++;
                            }
                        } else {
                            if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], job.lastSubJob, true, null)) {
                                hitCacheSize++;
                            }
                        }

                    } else {
                        if (job.hysteresis) {
                            renderer.jobHBuffer[job.id] = job;
                        } else {
                            renderer.drawnJobs++;

                            if (job.type == VTS_JOB_LINE_LABEL) {
                                draw.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            } else {
                                draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            }
                        }

                        //hitCache[hitCacheSize] = feature;
                        hitCacheSize++;
                    }

                    //store to hitmap
                    if (index != hitCacheSize) {
                        hcacheSize = storeFeatureToHitmap(index, feature, ix, iy, mx, my, hitMap, hcache, hcacheSize);
                    }
                }

            }

            hmapSize[i] = 0;  //zero size
        }
    }
}

function processGMap5(gpu, gl, renderer, screenPixelSize, draw) {
    if (!renderer.config.mapFeaturesReduceParams) {
        return;
    }

    var ppi = 96 * (window.devicePixelRatio || 1);

    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var i, li, top = renderer.config.mapFeaturesSortByTop, tmp;
    var feature, feature2, pp, pp2, o, job;
    var drawAllLabels = renderer.drawAllLabels;

    //get top features
    var featureCache = renderer.gmap;
    var featureCacheSize = renderer.gmapIndex;

    var hcache = renderer.gmap2;
    var hcacheSize = 1;
    var hmap = renderer.gmap3;
    var hmapSize = renderer.gmap3Size;
    var hmap = renderer.gmap3;


    var hmin = 10000;
    var hmax = 0, h, r;

    var divByDist = (renderer.config.mapFeaturesReduceFactor >= 1);

    if (divByDist) { // imp / dists
        if (renderer.fmaxDist == Number.NEGATIVE_INFINITY || renderer.fminDist == Number.POSITIVE_INFINITY) {
            return;
        }

        var ub = 1 - Math.log(renderer.fminDist) / Math.log(101);
        var lb = -Math.log(renderer.fmaxDist) / Math.log(101); 
    }

    //filter features and sort them by importance
    for (i = 0, li = featureCacheSize; i < li; i++) {
        feature = featureCache[i];
        if (!feature) {
            continue;
        }

        pp = feature[5];

        if (divByDist) {
            r = feature[0].reduce;
            h = Math.round(-5000 + ( ( Math.log(r[1]+1) - Math.log(r[4]) ) / Math.log(101) - lb ) / ( ub-lb ) * 10000) + 5000;
            r[5] = h; //for debug
        } else {
            h = Math.round(feature[0].reduce[1]);            
        }

        if (h < 0) h = 0;
        if (h >= 10000) h = 9999;
        if (h < hmin) hmin = h;
        if (h > hmax) hmax = h;

        hmap[h][hmapSize[h]++] = feature;
    }

    var j, lj;

    for (i = hmax, li = hmin; i >= 0; i--) {

        if (hmapSize[i] > 0) {
            var features = hmap[i];

            for (j = 0, lj = hmapSize[i]; j < lj; j++) {
                feature = features[j];
                job = feature[0];
                pp = feature[5];

                // check                

                //render job
                if (!drawAllLabels && feature[6]) { //no-overlap is always enabled
                    pp = feature[5];
                    o = feature[8];

                    if (job.type == VTS_JOB_LINE_LABEL) {
                        if (renderer.rmap.addLineLabel(job.lastSubJob, null)) {
                            //hitCache[hitCacheSize] = feature;
                        }
                    } else {
                        if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], job.lastSubJob, true, null)) {
                            //hitCache[hitCacheSize] = feature;
                        }
                    }

                } else {
                    if (job.hysteresis) {
                        renderer.jobHBuffer[job.id] = job;
                    } else {
                        renderer.drawnJobs++;

                        if (job.type == VTS_JOB_LINE_LABEL) {
                            draw.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                        } else {
                            draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                        }
                    }
                }
            }

            hmapSize[i] = 0;  //zero size
        }
    }
}


function radixSortFeatures(renderer, input, inputSize, tmp, depthOnly) {
    var count = inputSize < (1 << 16) ? renderer.radixCountBuffer16 : renderer.radixCountBuffer32; 
    var item, val, bunit32 = renderer.buffUint32, bfloat32 = renderer.buffFloat32, i, r, pp;
    var distanceFactor = renderer.config.mapFeaturesReduceFactor;
    //var screenDistanceFactor = renderer.config.mapFeaturesReduceFactor2 * 0.5, e100 = 1.0/Math.exp(100);
    //var centerOffset = renderer.config.mapFeaturesReduceFactor3;

    var depthTest = true;

    var sx = renderer.curSize[0], sy = renderer.curSize[1];
    var cx = sx * 0.5, cy = sy * 0.5;
    var invcx = 1.0 / (cx+0.0001), invcy = 1.0 / (cy+0.0001), dx, dy, yy;
    var invsy = 1.0 / (sy+0.0001);

    if (count.fill) {
        count.fill(0);
    } else { //IE fallback
        for (i = 0; i < (256*4); i++) {
            count[i] = 0;
        }
    }

    // count all bytes in one pass
    for (i = 0; i < inputSize; i++) {
        item = input[i];
        r = item[0].reduce;

        // optical center
        //pp = item[5]; 
        //yy = Math.pow(pp[1] * invsy, centerOffset) * sy;
        //dx = (cx - pp[0]) * invcx;
        //dy = (cy - yy) * invcx;

        val = r[3] - distanceFactor * Math.log(r[4]); // - screenDistanceFactor * Math.log(dx*dx + dy*dy + e100);
        r[6] = val;
        val += 10000;
        if (val < 0) val = 0;
        bfloat32[0] = val;
        val = bunit32[0];
        r[5] = val;
        count[val & 0xFF]++;
        count[((val >> 8) & 0xFF) + 256]++;
        count[((val >> 16) & 0xFF) + 512]++;
        count[((val >> 24) & 0xFF) + 768]++;
    }

    // create summed array
    for (var j = 0; j < 4; j++) {
        var t = 0, sum = 0, offset = j * 256;

        for (i = 0; i < 256; i++) {
            t = count[i + offset];
            count[i + offset] = sum;
            sum += t;
        }
    }

    for (i = 0; i < inputSize; i++) {
        item = input[i];
        val = item[0].reduce[5];
        tmp[count[val & 0xFF]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = tmp[i];
        val = item[0].reduce[5];
        input[count[((val >> 8) & 0xFF) + 256]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = input[i];
        val = item[0].reduce[5];
        tmp[count[((val >> 16) & 0xFF) + 512]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = tmp[i];
        val = item[0].reduce[5];
        input[count[((val >> 24) & 0xFF) + 768]++] = item;
    }

    if (i == -123) { //debug
        for (i = 0; i < inputSize; i++) {
            val = input[i][0].reduce[5];
            console.log('' + val +  ' ' + input[i][0].id);
        }
    }

    return input;
}

//used for scr-count7
function processGMap6(gpu, gl, renderer, screenPixelSize, draw) {
    if (!renderer.config.mapFeaturesReduceParams) {
        return;
    }

    var featuresPerSquareInch = renderer.config.mapFeaturesReduceParams[1]; //0.6614; //labelsPerSquareInch
    var ppi = 96 * (window.devicePixelRatio || 1);
    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var maxFeatures = Math.ceil((screenLX/ppi)*(screenLY/ppi)*featuresPerSquareInch); 
    var i, li, top = renderer.config.mapFeaturesSortByTop, tmp, job;
    var feature, feature2, pp, pp2, o, featureCount = 0;
    var drawAllLabels = renderer.drawAllLabels;

    var depthTest = (renderer.config.mapFeaturesReduceFactor2 != 0);
    var depthOffset = -renderer.config.mapFeaturesReduceFactor3;
    var depthParams = null;

    renderer.debugStr = '<br>featuresPerScr: ' + maxFeatures;

    //get top features
    var featureCache = renderer.gmap;
    var featureCacheSize = renderer.gmapIndex;
    var featureCache2 = renderer.gmap2;

    if (drawAllLabels) {
        maxFeatures = featureCacheSize;
    }

    //filter features and sort them by importance
    radixSortFeatures(renderer, featureCache, featureCacheSize, featureCache2);

    for (i = featureCacheSize - 1; i >= 0; i--) {
        feature = featureCache[i];
        job = feature[0];

        // check                

        //render job
        if (!drawAllLabels && feature[6]) { //no-overlap is always enabled
            pp = feature[5];
            o = feature[8];
            
            depthParams = depthTest ? [pp[0],pp[1]+feature[1],job.reduce,depthOffset] : null;

            if (job.type == VTS_JOB_LINE_LABEL) {
                if (renderer.rmap.addLineLabel(job.lastSubJob, depthParams)) {
                    featureCount++;
                }
            } else {
                if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], job.lastSubJob, true, depthParams)) {
                    featureCount++;
                }
            }

            if (featureCount >= maxFeatures) {
                return;
            }

        } else {
            if (job.hysteresis) {
                renderer.jobHBuffer[job.id] = job;
            } else {
                renderer.drawnJobs++;

                if (job.type == VTS_JOB_LINE_LABEL) {
                    draw.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                } else {
                    draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                }
            }
        }
    }

}


function radixDepthSortFeatures(renderer, input, inputSize, tmp) {
    var count = inputSize < (1 << 16) ? renderer.radixCountBuffer16 : renderer.radixCountBuffer32; 
    var item, val, bunit32 = renderer.buffUint32, bfloat32 = renderer.buffFloat32, i, r, pp;
    var distanceFactor = renderer.config.mapFeaturesReduceFactor;
    //var screenDistanceFactor = renderer.config.mapFeaturesReduceFactor2 * 0.5, e100 = 1.0/Math.exp(100);
    //var centerOffset = renderer.config.mapFeaturesReduceFactor3;

    var depthTest = true;

    if (count.fill) {
        count.fill(0);
    } else { //IE fallback
        for (i = 0; i < (256*4); i++) {
            count[i] = 0;
        }
    }

    // count all bytes in one pass
    for (i = 0; i < inputSize; i++) {
        item = input[i];
        val = 1 - item.lastSubJob[5][2];
        bfloat32[0] = val;
        val = bunit32[0];
        item.depth = val;
        count[val & 0xFF]++;
        count[((val >> 8) & 0xFF) + 256]++;
        count[((val >> 16) & 0xFF) + 512]++;
        count[((val >> 24) & 0xFF) + 768]++;
    }

    // create summed array
    for (var j = 0; j < 4; j++) {
        var t = 0, sum = 0, offset = j * 256;

        for (i = 0; i < 256; i++) {
            t = count[i + offset];
            count[i + offset] = sum;
            sum += t;
        }
    }

    for (i = 0; i < inputSize; i++) {
        item = input[i];
        val = item.depth;
        tmp[count[val & 0xFF]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = tmp[i];
        val = item.depth;
        input[count[((val >> 8) & 0xFF) + 256]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = input[i];
        val = item.depth;
        tmp[count[((val >> 16) & 0xFF) + 512]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = tmp[i];
        val = item.depth;
        input[count[((val >> 24) & 0xFF) + 768]++] = item;
    }

    /*if (i == -123) { //debug
        for (i = 0; i < inputSize; i++) {
            item = input[i];
            val = item.depth;
            console.log('' + val +  ' ' + item.lastSubJob[0].id);
        }
    }*/

    return input;
}


function fillVMapHoles(vmap, mx, my) {
    var holesCount = 0, v;
    var x0, y0, x1, y1, x2, y2;
    var maxX = mx - 1;
    var maxY = my - 1;

    for (var j = 0, lj = my; j < lj; j++) {
        for (var i = 0, li = mx; i < li; i++) {

            v = vmap[j*mx+i];

            if (v === null) {

                //find 
                x0 = i - 1;
                y0 = j - 1;

                x1 = i;
                y1 = j;

                x2 = i + 1;
                y2 = j + 1;

                if (x0 < 0) x0 = 0;
                if (y0 < 0) y0 = 0;

                if (x2 > maxX) x2 = maxX;
                if (y2 > maxY) y2 = maxY;

                var vv = [vmap[y0*mx+x0],
                          vmap[y0*mx+x1],
                          vmap[y0*mx+x2],
                          vmap[y1*mx+x0],
                          vmap[y1*mx+x2],
                          vmap[y2*mx+x0],
                          vmap[y2*mx+x1],
                          vmap[y2*mx+x2]];

                var vcount = 0;
                var vsum = 0;

                for (var k= 0; k < 8; k++) {
                    if (vv[k] !== null) {
                        vcount++;
                        vsum += vv[k];
                    }
                }

                if (vcount != 0) {
                    vmap[j*mx+i] = vsum / vcount;
                } else {
                    holesCount++;
                }
            }
        }
    }

    if (holesCount != 0 && holesCount != (mx * my)) {
        fillVMapHoles(vmap, mx, my);
    }
}


function getVMapValue(vmap, x, y, mx, my) {
    x -= 0.5;
    y -= 0.5;

    var maxX = mx - 1;
    var maxY = my - 1;

    if (x < 0) { x = 0; }
    if (y < 0) { y = 0; }
    if (x > maxX) { x = maxX; }
    if (y > maxY) { y = maxY; }

    var ix = Math.floor(x);
    var iy = Math.floor(y);
    var fx = x - ix;
    var fy = y - iy;

    var index = iy * mx;
    var index2 = (iy == maxY) ? index : index + mx;
    var ix2 = (ix == maxX) ? ix : ix + 1; 
    var v00 = vmap[index + ix];
    var v01 = vmap[index + ix2];
    var v10 = vmap[index2 + ix];
    var v11 = vmap[index2 + ix2];
    var w0 = (v00 + (v01 - v00)*fx);
    var w1 = (v10 + (v11 - v10)*fx);
   
    return (w0 + (w1 - w0)*fy);
}


function radixDeltaSortFeatures(renderer, input, inputSize, tmp) {
    var count = inputSize < (1 << 16) ? renderer.radixCountBuffer16 : renderer.radixCountBuffer32; 
    var item, val, bunit32 = renderer.buffUint32, bfloat32 = renderer.buffFloat32, i, r, pp;

    if (count.fill) {
        count.fill(0);
    } else { //IE fallback
        for (i = 0; i < (256*4); i++) {
            count[i] = 0;
        }
    }

    // count all bytes in one pass
    for (i = 0; i < inputSize; i++) {
        item = input[i];
        //val = 1 - item.lastSubJob[5][2];
        bfloat32[0] = item[0].delta;
        val = bunit32[0];
        item[0].delta = val;
        count[val & 0xFF]++;
        count[((val >> 8) & 0xFF) + 256]++;
        count[((val >> 16) & 0xFF) + 512]++;
        count[((val >> 24) & 0xFF) + 768]++;
    }

    // create summed array
    for (var j = 0; j < 4; j++) {
        var t = 0, sum = 0, offset = j * 256;

        for (i = 0; i < 256; i++) {
            t = count[i + offset];
            count[i + offset] = sum;
            sum += t;
        }
    }

    for (i = 0; i < inputSize; i++) {
        item = input[i];
        val = item[0].delta;
        tmp[count[val & 0xFF]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = tmp[i];
        val = item[0].delta;
        input[count[((val >> 8) & 0xFF) + 256]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = input[i];
        val = item[0].delta;
        tmp[count[((val >> 16) & 0xFF) + 512]++] = item;
    }
    for (i = 0; i < inputSize; i++) {
        item = tmp[i];
        val = item[0].delta;
        input[count[((val >> 24) & 0xFF) + 768]++] = item;
    }

    /*if (i == -123) { //debug
        for (i = 0; i < inputSize; i++) {
            item = input[i];
            val = item.depth;
            console.log('' + val +  ' ' + item.lastSubJob[0].id);
        }
    }*/

    return input;
}


//used for scr-count8
function processGMap7(gpu, gl, renderer, screenPixelSize, draw) {
    if (!renderer.config.mapFeaturesReduceParams) {
        return;
    }

    var tileCount = renderer.config.mapFeaturesReduceParams[5];
    var featuresPerSquareInch = renderer.config.mapFeaturesReduceParams[1];
    var ppi = 96 * (window.devicePixelRatio || 1);
    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var maxFeatures = Math.ceil((screenLX/ppi)*(screenLY/ppi)*featuresPerSquareInch); 
    var featuresPerTile = maxFeatures / (tileCount * tileCount); 
    var featuresPerTileInt = Math.floor(featuresPerTile); 
    var featuresPerTileFract = featuresPerTile - featuresPerTileInt; 
    var tileSizeX = screenLX / tileCount;
    var tileSizeY = screenLY / tileCount;

    renderer.debugStr = '<br>featuresPerScr: ' + maxFeatures + '<br>featuresPerTile: ' + featuresPerTile.toFixed(2);

    var i, li, top = renderer.config.mapFeaturesSortByTop, tmp, job, featureCount = 0;
    //var feature, feature2, pp, pp2, o, featureCount = 0;
    //var drawAllLabels = renderer.drawAllLabels;

    var depthTest = (renderer.config.mapFeaturesReduceFactor2 != 0);
    var depthOffset = -renderer.config.mapFeaturesReduceFactor3;
    var depthParams = null;

    //get top features
    var featureCache = renderer.gmap;
    var featureCacheSize = renderer.gmapIndex;
    var featureCache2 = renderer.gmap2;
    var featureCacheSize2 = 0;
    var vmap = renderer.gmap4;
    var drawAllLabels = renderer.drawAllLabels;

    if (drawAllLabels) {
        maxFeatures = featureCacheSize;
    }

    if (featureCacheSize > 0) {

        //filter features and sort them by importance
        radixSortFeatures(renderer, featureCache, featureCacheSize, featureCache2);

        if (drawAllLabels) {

            for (i = featureCacheSize - 1; i >= 0; i--) {
                feature = featureCache[i];
                job = feature[0];

                if (feature[0].hysteresis) {
                    renderer.jobHBuffer[feature[0].id] = job;
                } else {
                    renderer.drawnJobs++;
                    job = feature[0];
                    if (job.type == VTS_JOB_LINE_LABEL) {
                        draw.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                    } else {
                        draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                    }
                }
            }

        } else {

            //distribute top features
            var hitMap = renderer.gmapHit, usedFeatures = 0;
            var tileFeatures, count, feature;

            var ix,iy,is,pp,tx,ty,mx,my,v,v2,index,o,j;

            ix = screenLX / tileSizeX;
            iy = screenLY / tileSizeY;
            mx = Math.round(ix);
            my = Math.round(iy);
            //ix = ix - mx;
            //iy = iy - my;

            var hitMap = renderer.gmapStore;
            var hitMapCount = renderer.gmapHit;

            //clear hit-map
            for (i = 0, li = mx * my; i < li; i++) {
                hitMap[i] = null;
                vmap[i] = null;
            }

            for (i = featureCacheSize - 1; i >= 0; i--) {

                feature = featureCache[i];
                if (!feature) {
                    continue;
                }

                pp = feature[5];

                if (pp[0] < 30 || pp[0] >= (screenLX-30) || pp[1] < 30 || pp[1] >= (screenLY-30)) {
                    featureCache[i] = null;
                    continue;
                }

                tx = pp[0] / tileSizeX;
                ty = pp[1] / tileSizeY;

                index = Math.floor(tx) + Math.floor(ty) * (mx);

                tileFeatures = hitMap[index];

                if (tileFeatures) {
                    hitMap[index].push(i);
                } else {
                    hitMap[index] = [i];
                    //hitMapCount[index] = v;
                }
            }


            for (i = 0, li = (mx) * (my); i < li; i++) {
                tileFeatures = hitMap[i];

                if (tileFeatures && tileFeatures.length) {
                    count = tileFeatures.length;

                    if (count == 0) {
                        vmap[i] = null;
                    } else {
                        if (count > featuresPerTileInt) {
                            count = featuresPerTileInt;

                            index = tileFeatures[count];
                            feature = featureCache[index];
                            v = feature[0].reduce[6];

                            if (tileFeatures.length > count+1) {
                                index = tileFeatures[count+1];
                                feature = featureCache[index];
                                v2 = feature[0].reduce[6];
                                v = v + (v2 - v) * featuresPerTileFract;
                            }
                        } else {
                            index = tileFeatures[count - 1];
                            feature = featureCache[index];
                            v = feature[0].reduce[6];
                        }

                        vmap[i] = v;
                    }
                }
            }

            fillVMapHoles(vmap, mx, my);

            for (i = featureCacheSize - 1; i >= 0; i--) {
                feature = featureCache[i];
                if (!feature) {
                    continue;
                }

                job = feature[0];
                v = job.reduce[6];
                pp = feature[5];

                var vmax = getVMapValue(vmap, pp[0] / tileSizeX, pp[1] / tileSizeY, mx, my);

                if (v >= vmax) {

                    //render job
                    if (/*!drawAllLabels &&*/ feature[6]) { //no-overlap is always enabled
                        pp = feature[5];
                        o = feature[8];

                        depthParams = depthTest ? [pp[0],pp[1]+feature[1],job.reduce,depthOffset] : null;
                        
                        if (job.type == VTS_JOB_LINE_LABEL) {
                            if (renderer.rmap.addLineLabel(job.lastSubJob, depthParams)) {
                                featureCount++;
                            }
                        } else {
                            if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], job.lastSubJob, true, depthParams)) {
                                featureCount++;
                            }
                        }


                    } else {
                        if (job.hysteresis) {
                            renderer.jobHBuffer[job.id] = job;
                        } else {
                            renderer.drawnJobs++;

                            if (job.type == VTS_JOB_LINE_LABEL) {
                                draw.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            } else {
                                draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            }
                        }
                    }
                } else {
                    //store v delta
                    feature[0].delta = Math.abs(vmax - v);
                    featureCache2[featureCacheSize2] = feature; 
                    featureCacheSize2++;
                }
            }

            if (featureCount < maxFeatures && featureCacheSize2 > 0) {
                //sort deltas
                radixDeltaSortFeatures(renderer, featureCache2, featureCacheSize2, featureCache);

                for (i = featureCacheSize2 - 1; i >= 0; i--) {
                    feature = featureCache2[i];
                    job = feature[0];

                    //render job
                    if (/*!drawAllLabels &&*/ feature[6]) { //no-overlap is always enabled
                        pp = feature[5];
                        o = feature[8];

                        depthParams = depthTest ? [pp[0],pp[1]+feature[1],job.reduce,depthOffset] : null;
                        
                        if (job.type == VTS_JOB_LINE_LABEL) {
                            if (renderer.rmap.addLineLabel(job.lastSubJob, depthParams)) {
                                featureCount++;
                            }
                        } else {
                            if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], job.lastSubJob, true, depthParams)) {
                                featureCount++;
                            }
                        }

                    } else {
                        if (job.hysteresis) {
                            renderer.jobHBuffer[job.id] = job;
                        } else {
                            renderer.drawnJobs++;

                            if (job.type == VTS_JOB_LINE_LABEL) {
                                draw.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            } else {
                                draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, null);
                            }
                        }
                    }

                    if (featureCount >= maxFeatures) {
                        break;
                    }
                }
            }
        }
    }


    if (renderer.drawGridCells) {
        gpu.setState(renderer.lineLabelState);

        var x = 0, y = 0, j, lj;

        for (j = 0, lj = my; j < lj; j++) {
            for (i = 0, li = mx; i < li; i++) {
                x = tileSizeX * i;
                y = tileSizeY * j;

                var v = vmap[j*mx+i];

                draw.drawLineString([[x, y, 0.5], [x+tileSizeX, y, 0.5],
                                     [x+tileSizeX, y+tileSizeY, 0.5], [x, y+tileSizeY, 0.5]], true, 1, [0,0,255,255], null, true, null, null, null);

                if (v) {
                    draw.drawText(Math.round(x+5), Math.round(y + 5), 11, '' + v.toFixed(2), [255,255,255,255], 0.5);
                }
            }
        }
    }

}


export {processGMap, processGMap4, processGMap5, processGMap6, processGMap7, radixDepthSortFeatures};

