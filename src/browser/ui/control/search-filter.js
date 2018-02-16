
import {math as math_} from '../../../core/utils/math';

//get rid of compiler mess
var math = math_;

// Deduplication of hits, that have the same display_name
// and are subsequent in a result set. 
function dedupe(hits) {
    var hit, result = [], dupes = [];

    // Helper function, that takes set of duplicities
    // and returns just one hit.
    //
    // we return first populated place  - if exist
    // or if not exist we return just first one 
    var filterHits = (function(dupes){
        for (var j = 0; j < dupes.length; j++) {
            switch (dupes[j].type) {
                case 'hamlet':
                case 'village':
                case 'town':
                case 'city':
                    return dupes[j];
            }
        }

        return dupes[0];
    });

    // We go through all hits and separate results 
    // and duplicities
    for (var i = 0; i < hits.length - 1; i++) {
        hit = hits[i];

        if (hit.display_name === hits[ i + 1 ].display_name) {
            dupes.push(hit);
        } else {
            if (dupes.length > 0) {
                dupes.push(hit);
                result.push(filterHits(dupes));
                dupes.length = 0;
            } else {
                result.push(hit);
            }
        }
    }

    // Make sure filterHits is called
    if (dupes.length) {
        result.push(filterHits(dupes));
    }

    return result;
}

function getDistance(lon1, lat1, lon2, lat2) {
    var r = 6371e3; // metres
    var l1 = math.radians(lat1);
    var l2 = math.radians(lat2);
    var dlat = math.radians(lat2-lat1);
    var dlon = math.radians(lon2-lon1);

    var a = Math.sin(dlat/2) * Math.sin(dlat/2) +
            Math.cos(l1) * Math.cos(l2) *
            Math.sin(dlon/2) * Math.sin(dlon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return r * c;
}

// Stupid unprecise comparsion of two points, if 
// they lay close to each other (less than 10km)
function layClose(A, B) {
    //return ruler.distance([ A.lon, A.lat ], [ B.lon, B.lat ] ) < 10
    var diff = 0.1;

    return ( +B.lat > +A.lat - diff ) && ( +B.lat < +A.lat + diff )
        && ( +B.lon > +A.lon - diff ) && ( +B.lon < +A.lon + diff );
}

// Hits with low importance can be reshaked by its distance
function reshakeHits(hits) {
    var maxDiff = 0.06;
    var maxRank = 0.4;
    var temp, done;

    do {
        done = true;

        for (var i = 0; i < hits.length - 1; i++ ) {
            var h1 = hits[i];
            var h2 = hits[i + 1];

            if (( h1.rank < maxRank && h2.rank < maxRank ) // both hits have lowRank
                && ( Math.abs( h1.rank - h2.rank ) < maxDiff ) // ...and diff in their rank is small
                && ( h1.distance > h2.distance ) // ...and h1 has bigger distance
                ) {

                // Switch both hits
                h1.note = 'reshaked-down'
                h2.note = 'reshaked-up'

                temp = h1;
                hits[i] = h2;
                hits[i + 1] = temp;
                done = false;
            }
        }
    } while (!done);
}

function nofilterSearch(data, lon, lat) {
    var rtrn = [];
    var hits = data;
    var hasLocation = lat && lon;
    var rtrnHit, hit;

    //Cycle each hit and reduce uts size
    for (var i = 0; i < hits.length; i++) {
        hit = hits[i];

        rtrnHit = { 
            lat: +hit.lat, 
            lon: +hit.lon,  
            title: hit.display_name,
            rank: hit.importance || 1,
            country: '', 
            region: '',
            state: '',
            cc: '',
            type: '', 
            bounds: hit.boundingbox,
            polygon : [],
            bbox : hit.boundingbox
        }

        // Calculate distance
        if (hasLocation) {
            rtrnHit.distance = getDistance(lon, lat, rtrnHit.lon, rtrnHit.lat);
        }

        rtrn.push(rtrnHit);
    }

    return rtrn;
}

// Return Promise, that resolves nice deduplicated results from 
// Nominatim (on particular keyword)
function filterSearch(data, lon, lat) {
    var rtrn = [];
    var hasLocation = lat && lon;
    var hits = data;

    /*
    // Should we search ZIP code? 
    var querySubString = ( /^\d{3,5}$/.test( query ) ) ? 
                            `postalcode=${  query }` : `q=${ encodeURIComponent( query ) }`

    var url = `${ searchServer }search.php?format=json&limit=20&addressdetails=1&${ querySubString }&accept-language=${lang}`;      

    if( program.dev ) log.info(url);
    */

    var rtrnHit, hit, adr, region, county, display, bounds;

    // Deduplication number 1: Deduplicate consequent 
    // results with same name
    if( hits.length > 1) {
        hits = dedupe( hits );
    }

    //Cycle each hit and reduce uts size
    for (var i = 0; i < hits.length; i++) {

        // Shortcuts
        hit = hits[i];

        bounds = hit.boundingbox;

        adr = hit.address;

        display = hit.display_name.replace(/,.*/,'');

        region = adr.state && adr.state 
                    || ( adr.state_district && adr.state_district ||
                            ( adr.county && adr.county || '' ) );

        county = adr.county && adr.county 
                    || ( adr.state_district && adr.state_district || region );

        // If county is same as title, find 
        // something better         
        if (county === display) {
            county = adr.state_district && adr.state_district || region;
        }

        // Deduplication number 2: Simple process of throwing away hits
        // that have lower importance, and lay in vicinity
        // of previous hit
        if (rtrnHit && layClose(rtrnHit, hit)) continue;

        // Filter out results with low, low low importance
        // but only if there is more results
        if (hit.importance < 0.01 && i > 5) continue;

        // Rewrite these types of regions
        // "Graubünden - Grigioni - Grischun" --> "Graubunder"
        if (new RegExp(/ - /).test( region )) {
            region = region.replace(/ -.*/,'');
        }

        // Should we display bounds instead of dot in a map?            
        if (hit.type === 'archipelago'  || 
            ( hit.type === 'administrative' && 
            (display === adr.country || display === region ))) {            

            // Repair undefined lon values in bounds
            if( bounds[2] === '-180' ) {
                bounds[2] = bounds[3] = hit.lon;
            }

        } else {
            bounds = null;
        }

        // Changes display name in adress querries like "Kopeckeho 27"
        if (display === adr.house_number && adr.road ) {
            display = adr.road;
        }

        rtrnHit = { 
            lat: +hit.lat, 
            lon: +hit.lon,  
            title: display,

            rank: hit.importance,

            // for US we use State as country 
            country: adr.country_code === 'us' ? region : ( adr.country && adr.country.replace(/,.*/,'')  ), 

            display: hit.display_name,
            region: county || '',
            state: region || '',
            cc: adr.country_code,
            type: hit.type, 
            bounds: bounds,
            polygon : hit.polygonpoints || [],
            bbox : hit.boundingbox
        }

        // Calculate distance
        if (hasLocation) {
            rtrnHit.distance = getDistance(lon, lat, rtrnHit.lon, rtrnHit.lat);
        }


        rtrn.push(rtrnHit)
    }

    // Reshake hits by distance
    if (hasLocation) { 
        reshakeHits(rtrn);
    }

    return rtrn;
}   

// return query on reverse search
/*
function geoSearch = ( { lat,lon,zoom,lang } ) => {
    var url = `${ searchServer }reverse.php?format=json&lat=${ lat }&lon=${ lon }&zoom=${ zoom }&addressdetails=1&accept-language=${ lang }`
    return rp.get(url,{ timeout: 3000, json: true })
} 
*/              

export {filterSearch, nofilterSearch};
