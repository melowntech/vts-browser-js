

function processGMap(gpu, gl, renderer, screenPixelSize) {

    var tileCount = renderer.config.mapFeatureGridCells; //31; //labelGridCells
    var featuresPerSquareInch = renderer.config.mapFeaturesPerSquareInch; //0.6614; //labelsPerSquareInch
    var ppi = 96 * (window.devicePixelRatio || 1);
    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var featureCount = (screenLX/ppi)*(screenLY/ppi)*featuresPerSquareInch; 
    var i, li, top = false;

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

            if (pp[0] < 0 || pp[0] >= screenLX || pp[1] < 0 || pp[1] >= screenLY) {
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
        tileSize *= 2;

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

export {processGMap};

