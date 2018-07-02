

function processGMap(gpu, gl, renderer, screenPixelSize) {

    var tileCount = 31;                   //labelGridCells
    var featuresPerSquareInch = 0.6614;   //labelsPerSquareInch
    var ppi = 96 * (window.devicePixelRatio || 1);
    var screenLX = renderer.curSize[0];
    var screenLY = renderer.curSize[1];
    var featureCount = (screenLX/ppi)*(screenLY/ppi)*featuresPerSquareInch; 
    var i, li;


    //get top features
    var featureCache = renderer.gmap;
    var featureCacheSize = renderer.gmapIndex;
    var topFeatures = renderer.gmapTop;
    var topFeaturesIndex = 0;
    var topFeaturesIndex2 = 0;
    var featureCount2 = featureCount;

    if (featureCount > featureCacheSize) {
        featureCount2 = featureCacheSize;
    }

    var top = false, value, feature;
    var currentIndex = 0;
    var currentValue2 = top ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

    do {
        var currentValue = top ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
        topFeaturesIndex2 = topFeaturesIndex;

        for (i = 0, li = featureCacheSize; i < li; i++) {
            feature = featureCache[i];
            value = feature[0].reduce[1];

            if (((top && value >= currentValue && value < currentValue2) || (value <= currentValue && value > currentValue2)) ) {
                if (currentValue != value) {
                    topFeaturesIndex = topFeaturesIndex2;
                }

                topFeatures[topFeaturesIndex] = feature;
                topFeaturesIndex++;
                currentValue = value;
            }
        }

        currentValue2 = currentValue;
        currentIndex++;

    } while(currentIndex < featureCount2);


    //distribute top features
    var tileSize = Math.floor(Math.sqrt((screenLX*screenLY) / tileCount));
    var hitMap = renderer.gmapHit, usedFeatures = 0;

    do {
        var a,b,c,d,ix,iy,is,pp,tx,ty,mx,my,v,index,o;

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

        //clear hit-map
        for (i = 0, li = (mx+1) * (my+1); i < li; i++) {
            hitMap[i] = 0;
        }

        for (i = 0, li = featureCount2; i < li; i++) {
            feature = topFeatures[i];
            if (!feature) {
                continue;
            }

            pp = feature[5];

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

                if (hitMap[index] < v) {
                    hitMap[index]++;

                    //render job
                    if (feature[6]) { //no-overlap 
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

                    //remove feature from cache
                    topFeatures[i] = null;
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


export {processGMap};

