

function processGMap(gpu, gl, renderer, screenPixelSize, draw) {
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

    renderer.debugStr = "<br>featuresPerScr: " + featureCount + "<br>gridCells: " + tileCount;

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
    var tileFeatures, count, feature;

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

                    //render job
                    if (feature[6]) { //no-overlap 
                        pp = feature[5];
                        o = feature[8];
                        if (!renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob)) {
                            renderer.rmap.storeRemovedRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob);
                        }
                    } else {
                        if (feature[0].hysteresis) {
                            renderer.jobHBuffer[feature[0].id] = feature[0];
                        } else {
                            draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, subjob, null);
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


function processGMap2(gpu, gl, renderer, screenPixelSize, draw) {
    //var maxRadius = 200; 
    //var maxHitcount = 2; 

    var ppi = 96 * (window.devicePixelRatio || 1);

    var maxRadius = renderer.config.mapFeaturesReduceParams[0] * ppi; //mapFeatureRadius
    var maxHitcount = renderer.config.mapFeaturesReduceParams[1]; //0.6614; //mapFeatureMaxOverlays

    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var i, li, top = renderer.config.mapFeaturesSortByTop, tmp;
    var feature, feature2, pp, pp2, o, r;

    //get top features
    var featureCache = renderer.gmap;
    var featureCache2 = renderer.gmap2;
    var featureCacheSize = renderer.gmapIndex;
    var featureCacheSize2 = 0;

    var divByDist = (renderer.config.mapFeaturesReduceFactor == 1);

    renderer.debugStr = "<br>: " + featureCount + "<br>gridCells: " + tileCount;


    //filter features before sort
    for (i = 0, li = featureCacheSize; i < li; i++) {
        feature = featureCache[i];
        if (!feature) {
            continue;
        }

        pp = feature[5];
        
        if (divByDist) {
            r = feature[0].reduce;
            r[1] = r[2] / r[4];
        }

        featureCache2[featureCacheSize2] = feature;
        featureCacheSize2++;
    }

    //sort features by prominence

    do {

        var hit = false;

        if (top) {
            for (i = 0, li = featureCacheSize2 - 1; i < li; i++) {
                if (featureCache2[i][0].reduce[1] < featureCache2[i+1][0].reduce[1]) {
                    tmp = featureCache2[i];
                    featureCache2[i] = featureCache2[i+1];
                    featureCache2[i+1] = tmp;
                    hit = true;
                }
            }
        } else {
            for (i = 0, li = featureCacheSize2 - 1; i < li; i++) {
                if (featureCache2[i][0].reduce[1] > featureCache2[i+1][0].reduce[1]) {
                    tmp = featureCache2[i];
                    featureCache2[i] = featureCache2[i+1];
                    featureCache2[i+1] = tmp;
                    hit = true;
                }
            }
        }

    } while(hit);


    var hitCache = renderer.gmapHit;
    var hitCacheSize = 0, j, lj, hitCount, dx, dy;

    maxRadius *= maxRadius;

    for (i = 0, li = featureCacheSize2; i < li; i++) {
        hitCount = 0;

        feature = featureCache2[i];
        pp = feature[5];

        for (j = 0, lj = hitCacheSize; j < lj; j++) {
            feature2 = hitCache[j];
            pp2 = feature2[5];

            dx = pp[0] - pp2[0];
            dy = pp[1] - pp2[1];

            if ((dx*dx+dy*dy) < maxRadius) {
                hitCount++;
                if (hitCount > maxHitcount) {
                    break;
                }
            }
        }

        if (hitCount <= maxHitcount) {
            //render job
            if (feature[6]) { //no-overlap 
                pp = feature[5];
                o = feature[8];
                if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob, true)) {
                    hitCache[hitCacheSize] = feature;
                    hitCacheSize++;
                }
            } else {
                if (feature[0].hysteresis) {
                    renderer.jobHBuffer[feature[0].id] = feature[0];
                } else {
                    renderer.drawnJobs++;
                    draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, subjob, null);
                }

                hitCache[hitCacheSize] = feature;
                hitCacheSize++;
            }
        }
    }
}


function processGMap3(gpu, gl, renderer, screenPixelSize, draw) {
    //var maxRadius = 200; 
    //var maxHitcount = 2; 

    var ppi = 96 * (window.devicePixelRatio || 1);

    var maxRadius = renderer.config.mapFeaturesReduceParams[0] * ppi; //mapFeatureRadius
    var maxHitcount = renderer.config.mapFeaturesReduceParams[1]; //0.6614; //mapFeatureMaxOverlays

    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var i, li, top = renderer.config.mapFeaturesSortByTop, tmp;
    var feature, feature2, pp, pp2, o;

    //get top features
    var featureCache = renderer.gmap;
    var featureCacheSize = renderer.gmapIndex;

    var hmap = renderer.gmap3;
    var hmapSize = renderer.gmap3Size;

    var hmin = 10000;
    var hmax = 0, h, r;

    var divByDist = (renderer.config.mapFeaturesReduceFactor == 1);

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
        } else {
            h = feature[0].reduce[1];            
        }

        if (h < 0) h = 0;
        if (h >= 10000) h = 9999;
        if (h < hmin) hmin = h;
        if (h > hmax) hmax = h;

        hmap[h][hmapSize[h]++] = feature;
    }


    var hitCache = renderer.gmapHit;
    var hitCacheSize = 0, j, lj, k, lk, hitCount, dx, dy;

    maxRadius *= maxRadius;

//    for (i = hmin, li = hmax; i < li; i++) {
    for (i = hmax, li = hmin; i >= 0; i--) {

        if (hmapSize[i] > 0) {
            var features = hmap[i];

            for (j = 0, lj = hmapSize[i]; j < lj; j++) {
                feature = features[j];

                hitCount = 0;
                pp = feature[5];

                for (k = 0, lk = hitCacheSize; k < lk; k++) {
                    feature2 = hitCache[k];
                    pp2 = feature2[5];

                    dx = pp[0] - pp2[0];
                    dy = pp[1] - pp2[1];

                    if ((dx*dx+dy*dy) < maxRadius) {
                        hitCount++;
                        if (hitCount > maxHitcount) {
                            break;
                        }
                    }
                }

                if (hitCount <= maxHitcount) {
                    //render job
                    if (feature[6]) { //no-overlap 
                        pp = feature[5];
                        o = feature[8];
                        if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob, true)) {
                            hitCache[hitCacheSize] = feature;
                            hitCacheSize++;
                        }
                    } else {
                        if (feature[0].hysteresis) {
                            renderer.jobHBuffer[feature[0].id] = feature[0];
                        } else {
                            renderer.drawnJobs++;
                            draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, subjob, null);
                        }

                        hitCache[hitCacheSize] = feature;
                        hitCacheSize++;
                    }
                }
            }

            hmapSize[i] = 0;  //zero size
        }

    }
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
    //var maxRadius = 200; 
    //var maxHitcount = 2; 

    var ppi = 96 * (window.devicePixelRatio || 1);

    var maxRadius = renderer.config.mapFeaturesReduceParams[0] * ppi; //mapFeatureRadius
    var maxHitcount = renderer.config.mapFeaturesReduceParams[1]; //0.6614; //mapFeatureMaxOverlays

    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var i, li, top = renderer.config.mapFeaturesSortByTop, tmp;
    var feature, feature2, pp, pp2, o;

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

    var divByDist = (renderer.config.mapFeaturesReduceFactor == 1);

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
        } else {
            h = feature[0].reduce[1];            
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
                    if (feature[6]) { //no-overlap 
                        pp = feature[5];
                        o = feature[8];
                        if (renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], feature[7], feature[0].lastSubJob, true)) {
                            //hitCache[hitCacheSize] = feature;
                            hitCacheSize++;
                        }
                    } else {
                        if (feature[0].hysteresis) {
                            renderer.jobHBuffer[feature[0].id] = feature[0];
                        } else {
                            renderer.drawnJobs++;
                            draw.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, feature[0].lastSubJob, null);
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


export {processGMap, processGMap2, processGMap3, processGMap4};

