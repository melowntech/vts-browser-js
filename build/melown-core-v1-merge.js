!function(a){if("object"==typeof exports)module.exports=a();else if("function"==typeof define&&define.amd)define(a);else{var b;"undefined"!=typeof window?b=window:"undefined"!=typeof global?b=global:"undefined"!=typeof self&&(b=self),b._mproj4_=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){function Point(a,b,c){if(!(this instanceof Point))return new Point(a,b,c);if(Array.isArray(a))this.x=a[0],this.y=a[1],this.z=a[2]||0;else if("object"==typeof a)this.x=a.x,this.y=a.y,this.z=a.z||0;else if("string"==typeof a&&"undefined"==typeof b){var d=a.split(",");this.x=parseFloat(d[0],10),this.y=parseFloat(d[1],10),this.z=parseFloat(d[2],10)||0}else this.x=a,this.y=b,this.z=c||0;console.warn("_mproj4_.Point will be removed in version 3, use _mproj4_.toPoint")}var d=a("mgrs");Point.fromMGRS=function(a){return new Point(d.toPoint(a))},Point.prototype.toMGRS=function(a){return d.forward([this.x,this.y],a)},b.exports=Point},{mgrs:68}],2:[function(a,b,c){function Projection(a,b){if(!(this instanceof Projection))return new Projection(a);b=b||function(a){if(a)throw a};var c=d(a);if("object"!=typeof c)return void b(a);var f=g(c),h=Projection.projections.get(f.projName);h?(e(this,f),e(this,h),this.init(),b(null,this)):b(a)}var d=a("./parseCode"),e=a("./extend"),f=a("./projections"),g=a("./deriveConstants");Projection.projections=f,Projection.projections.start(),b.exports=Projection},{"./deriveConstants":33,"./extend":34,"./parseCode":37,"./projections":39}],3:[function(a,b,c){b.exports=function(a,b,c){var d,e,f,g=c.x,h=c.y,i=c.z||0;for(f=0;3>f;f++)if(!b||2!==f||void 0!==c.z)switch(0===f?(d=g,e="x"):1===f?(d=h,e="y"):(d=i,e="z"),a.axis[f]){case"e":c[e]=d;break;case"w":c[e]=-d;break;case"n":c[e]=d;break;case"s":c[e]=-d;break;case"u":void 0!==c[e]&&(c.z=d);break;case"d":void 0!==c[e]&&(c.z=-d);break;default:return null}return c}},{}],4:[function(a,b,c){var d=Math.PI/2,e=a("./sign");b.exports=function(a){return Math.abs(a)<d?a:a-e(a)*Math.PI}},{"./sign":21}],5:[function(a,b,c){var d=2*Math.PI,e=3.14159265359,f=a("./sign");b.exports=function(a){return Math.abs(a)<=e?a:a-f(a)*d}},{"./sign":21}],6:[function(a,b,c){b.exports=function(a){return Math.abs(a)>1&&(a=a>1?1:-1),Math.asin(a)}},{}],7:[function(a,b,c){b.exports=function(a){return 1-.25*a*(1+a/16*(3+1.25*a))}},{}],8:[function(a,b,c){b.exports=function(a){return.375*a*(1+.25*a*(1+.46875*a))}},{}],9:[function(a,b,c){b.exports=function(a){return.05859375*a*a*(1+.75*a)}},{}],10:[function(a,b,c){b.exports=function(a){return a*a*a*(35/3072)}},{}],11:[function(a,b,c){b.exports=function(a,b,c){var d=b*c;return a/Math.sqrt(1-d*d)}},{}],12:[function(a,b,c){b.exports=function(a,b,c,d,e){var f,g;f=a/b;for(var h=0;15>h;h++)if(g=(a-(b*f-c*Math.sin(2*f)+d*Math.sin(4*f)-e*Math.sin(6*f)))/(b-2*c*Math.cos(2*f)+4*d*Math.cos(4*f)-6*e*Math.cos(6*f)),f+=g,Math.abs(g)<=1e-10)return f;return NaN}},{}],13:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b){var c=1-(1-a*a)/(2*a)*Math.log((1-a)/(1+a));if(Math.abs(Math.abs(b)-c)<1e-6)return 0>b?-1*d:d;for(var e,f,g,h,i=Math.asin(.5*b),j=0;30>j;j++)if(f=Math.sin(i),g=Math.cos(i),h=a*f,e=Math.pow(1-h*h,2)/(2*g)*(b/(1-a*a)-f/(1-h*h)+.5/a*Math.log((1-h)/(1+h))),i+=e,Math.abs(e)<=1e-10)return i;return NaN}},{}],14:[function(a,b,c){b.exports=function(a,b,c,d,e){return a*e-b*Math.sin(2*e)+c*Math.sin(4*e)-d*Math.sin(6*e)}},{}],15:[function(a,b,c){b.exports=function(a,b,c){var d=a*b;return c/Math.sqrt(1-d*d)}},{}],16:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b){for(var c,e,f=.5*a,g=d-2*Math.atan(b),h=0;15>=h;h++)if(c=a*Math.sin(g),e=d-2*Math.atan(b*Math.pow((1-c)/(1+c),f))-g,g+=e,Math.abs(e)<=1e-10)return g;return-9999}},{}],17:[function(a,b,c){var d=1,e=.25,f=.046875,g=.01953125,h=.01068115234375,i=.75,j=.46875,k=.013020833333333334,l=.007120768229166667,m=.3645833333333333,n=.005696614583333333,o=.3076171875;b.exports=function(a){var b=[];b[0]=d-a*(e+a*(f+a*(g+a*h))),b[1]=a*(i-a*(f+a*(g+a*h)));var c=a*a;return b[2]=c*(j-a*(k+a*l)),c*=a,b[3]=c*(m-a*n),b[4]=c*a*o,b}},{}],18:[function(a,b,c){var d=a("./pj_mlfn"),e=1e-10,f=20;b.exports=function(a,b,c){for(var g=1/(1-b),h=a,i=f;i;--i){var j=Math.sin(h),k=1-b*j*j;if(k=(d(h,j,Math.cos(h),c)-a)*(k*Math.sqrt(k))*g,h-=k,Math.abs(k)<e)return h}return h}},{"./pj_mlfn":19}],19:[function(a,b,c){b.exports=function(a,b,c,d){return c*=b,b*=b,d[0]*a-c*(d[1]+b*(d[2]+b*(d[3]+b*d[4])))}},{}],20:[function(a,b,c){b.exports=function(a,b){var c;return a>1e-7?(c=a*b,(1-a*a)*(b/(1-c*c)-.5/a*Math.log((1-c)/(1+c)))):2*b}},{}],21:[function(a,b,c){b.exports=function(a){return 0>a?-1:1}},{}],22:[function(a,b,c){b.exports=function(a,b){return Math.pow((1-a)/(1+a),b)}},{}],23:[function(a,b,c){b.exports=function(a){var b={x:a[0],y:a[1]};return a.length>2&&(b.z=a[2]),a.length>3&&(b.m=a[3]),b}},{}],24:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b,c){var e=a*c,f=.5*a;return e=Math.pow((1-e)/(1+e),f),Math.tan(.5*(d-b))/e}},{}],25:[function(a,b,c){c.wgs84={towgs84:"0,0,0",ellipse:"WGS84",datumName:"WGS84"},c.ch1903={towgs84:"674.374,15.056,405.346",ellipse:"bessel",datumName:"swiss"},c.ggrs87={towgs84:"-199.87,74.79,246.62",ellipse:"GRS80",datumName:"Greek_Geodetic_Reference_System_1987"},c.nad83={towgs84:"0,0,0",ellipse:"GRS80",datumName:"North_American_Datum_1983"},c.nad27={nadgrids:"@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",ellipse:"clrk66",datumName:"North_American_Datum_1927"},c.potsdam={towgs84:"606.0,23.0,413.0",ellipse:"bessel",datumName:"Potsdam Rauenberg 1950 DHDN"},c.carthage={towgs84:"-263.0,6.0,431.0",ellipse:"clark80",datumName:"Carthage 1934 Tunisia"},c.hermannskogel={towgs84:"653.0,-212.0,449.0",ellipse:"bessel",datumName:"Hermannskogel"},c.ire65={towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"mod_airy",datumName:"Ireland 1965"},c.rassadiran={towgs84:"-133.63,-157.5,-158.62",ellipse:"intl",datumName:"Rassadiran"},c.nzgd49={towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",ellipse:"intl",datumName:"New Zealand Geodetic Datum 1949"},c.osgb36={towgs84:"446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",ellipse:"airy",datumName:"Airy 1830"},c.s_jtsk={towgs84:"589,76,480",ellipse:"bessel",datumName:"S-JTSK (Ferro)"},c.beduaram={towgs84:"-106,-87,188",ellipse:"clrk80",datumName:"Beduaram"},c.gunung_segara={towgs84:"-403,684,41",ellipse:"bessel",datumName:"Gunung Segara Jakarta"},c.rnb72={towgs84:"106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",ellipse:"intl",datumName:"Reseau National Belge 1972"}},{}],26:[function(a,b,c){c.MERIT={a:6378137,rf:298.257,ellipseName:"MERIT 1983"},c.SGS85={a:6378136,rf:298.257,ellipseName:"Soviet Geodetic System 85"},c.GRS80={a:6378137,rf:298.257222101,ellipseName:"GRS 1980(IUGG, 1980)"},c.IAU76={a:6378140,rf:298.257,ellipseName:"IAU 1976"},c.airy={a:6377563.396,b:6356256.91,ellipseName:"Airy 1830"},c.APL4={a:6378137,rf:298.25,ellipseName:"Appl. Physics. 1965"},c.NWL9D={a:6378145,rf:298.25,ellipseName:"Naval Weapons Lab., 1965"},c.mod_airy={a:6377340.189,b:6356034.446,ellipseName:"Modified Airy"},c.andrae={a:6377104.43,rf:300,ellipseName:"Andrae 1876 (Den., Iclnd.)"},c.aust_SA={a:6378160,rf:298.25,ellipseName:"Australian Natl & S. Amer. 1969"},c.GRS67={a:6378160,rf:298.247167427,ellipseName:"GRS 67(IUGG 1967)"},c.bessel={a:6377397.155,rf:299.1528128,ellipseName:"Bessel 1841"},c.bess_nam={a:6377483.865,rf:299.1528128,ellipseName:"Bessel 1841 (Namibia)"},c.clrk66={a:6378206.4,b:6356583.8,ellipseName:"Clarke 1866"},c.clrk80={a:6378249.145,rf:293.4663,ellipseName:"Clarke 1880 mod."},c.clrk58={a:6378293.645208759,rf:294.2606763692654,ellipseName:"Clarke 1858"},c.CPM={a:6375738.7,rf:334.29,ellipseName:"Comm. des Poids et Mesures 1799"},c.delmbr={a:6376428,rf:311.5,ellipseName:"Delambre 1810 (Belgium)"},c.engelis={a:6378136.05,rf:298.2566,ellipseName:"Engelis 1985"},c.evrst30={a:6377276.345,rf:300.8017,ellipseName:"Everest 1830"},c.evrst48={a:6377304.063,rf:300.8017,ellipseName:"Everest 1948"},c.evrst56={a:6377301.243,rf:300.8017,ellipseName:"Everest 1956"},c.evrst69={a:6377295.664,rf:300.8017,ellipseName:"Everest 1969"},c.evrstSS={a:6377298.556,rf:300.8017,ellipseName:"Everest (Sabah & Sarawak)"},c.fschr60={a:6378166,rf:298.3,ellipseName:"Fischer (Mercury Datum) 1960"},c.fschr60m={a:6378155,rf:298.3,ellipseName:"Fischer 1960"},c.fschr68={a:6378150,rf:298.3,ellipseName:"Fischer 1968"},c.helmert={a:6378200,rf:298.3,ellipseName:"Helmert 1906"},c.hough={a:6378270,rf:297,ellipseName:"Hough"},c.intl={a:6378388,rf:297,ellipseName:"International 1909 (Hayford)"},c.kaula={a:6378163,rf:298.24,ellipseName:"Kaula 1961"},c.lerch={a:6378139,rf:298.257,ellipseName:"Lerch 1979"},c.mprts={a:6397300,rf:191,ellipseName:"Maupertius 1738"},c.new_intl={a:6378157.5,b:6356772.2,ellipseName:"New International 1967"},c.plessis={a:6376523,rf:6355863,ellipseName:"Plessis 1817 (France)"},c.krass={a:6378245,rf:298.3,ellipseName:"Krassovsky, 1942"},c.SEasia={a:6378155,b:6356773.3205,ellipseName:"Southeast Asia"},c.walbeck={a:6376896,b:6355834.8467,ellipseName:"Walbeck"},c.WGS60={a:6378165,rf:298.3,ellipseName:"WGS 60"},c.WGS66={a:6378145,rf:298.25,ellipseName:"WGS 66"},c.WGS7={a:6378135,rf:298.26,ellipseName:"WGS 72"},c.WGS84={a:6378137,rf:298.257223563,ellipseName:"WGS 84"},c.sphere={a:6370997,b:6370997,ellipseName:"Normal Sphere (r=6370997)"}},{}],27:[function(a,b,c){c.greenwich=0,c.lisbon=-9.131906111111,c.paris=2.337229166667,c.bogota=-74.080916666667,c.madrid=-3.687938888889,c.rome=12.452333333333,c.bern=7.439583333333,c.jakarta=106.807719444444,c.ferro=-17.666666666667,c.brussels=4.367975,c.stockholm=18.058277777778,c.athens=23.7163375,c.oslo=10.722916666667},{}],28:[function(a,b,c){c.ft={to_meter:.3048},c["us-ft"]={to_meter:1200/3937}},{}],29:[function(a,b,c){function d(a,b,c){var d;return Array.isArray(c)?(d=g(a,b,c),3===c.length?[d.x,d.y,d.z]:[d.x,d.y]):g(a,b,c)}function e(a){return a instanceof f?a:a.oProj?a.oProj:f(a)}function _mproj4_(a,b,c){a=e(a);var f,g=!1;return"undefined"==typeof b?(b=a,a=h,g=!0):("undefined"!=typeof b.x||Array.isArray(b))&&(c=b,b=a,a=h,g=!0),b=e(b),c?d(a,b,c):(f={forward:function(c){return d(a,b,c)},inverse:function(c){return d(b,a,c)},info:function(){return{a:b.a,b:b.b,ra:b.R_A,"proj-name":b.projName}}},g&&(f.oProj=b),f)}var f=a("./Proj"),g=a("./transform"),h=f("WGS84");b.exports=_mproj4_},{"./Proj":2,"./transform":66}],30:[function(a,b,c){var d=Math.PI/2,e=1,f=2,g=3,h=4,i=5,j=484813681109536e-20,k=1.0026,l=.3826834323650898,m=function(a){if(!(this instanceof m))return new m(a);if(this.datum_type=h,a){if(a.datumCode&&"none"===a.datumCode&&(this.datum_type=i),a.datum_params){for(var b=0;b<a.datum_params.length;b++)a.datum_params[b]=parseFloat(a.datum_params[b]);(0!==a.datum_params[0]||0!==a.datum_params[1]||0!==a.datum_params[2])&&(this.datum_type=e),a.datum_params.length>3&&(0!==a.datum_params[3]||0!==a.datum_params[4]||0!==a.datum_params[5]||0!==a.datum_params[6])&&(this.datum_type=f,a.datum_params[3]*=j,a.datum_params[4]*=j,a.datum_params[5]*=j,a.datum_params[6]=a.datum_params[6]/1e6+1)}this.datum_type=a.grids?g:this.datum_type,this.a=a.a,this.b=a.b,this.es=a.es,this.ep2=a.ep2,this.datum_params=a.datum_params,this.datum_type===g&&(this.grids=a.grids)}};m.prototype={compare_datums:function(a){return this.datum_type!==a.datum_type?!1:this.a!==a.a||Math.abs(this.es-a.es)>5e-11?!1:this.datum_type===e?this.datum_params[0]===a.datum_params[0]&&this.datum_params[1]===a.datum_params[1]&&this.datum_params[2]===a.datum_params[2]:this.datum_type===f?this.datum_params[0]===a.datum_params[0]&&this.datum_params[1]===a.datum_params[1]&&this.datum_params[2]===a.datum_params[2]&&this.datum_params[3]===a.datum_params[3]&&this.datum_params[4]===a.datum_params[4]&&this.datum_params[5]===a.datum_params[5]&&this.datum_params[6]===a.datum_params[6]:this.datum_type===g||a.datum_type===g?this.nadgrids===a.nadgrids:!0},geodetic_to_geocentric:function(a){var b,c,e,f,g,h,i,j=a.x,k=a.y,l=a.z?a.z:0,m=0;if(-d>k&&k>-1.001*d)k=-d;else if(k>d&&1.001*d>k)k=d;else if(-d>k||k>d)return null;return j>Math.PI&&(j-=2*Math.PI),g=Math.sin(k),i=Math.cos(k),h=g*g,f=this.a/Math.sqrt(1-this.es*h),b=(f+l)*i*Math.cos(j),c=(f+l)*i*Math.sin(j),e=(f*(1-this.es)+l)*g,a.x=b,a.y=c,a.z=e,m},geocentric_to_geodetic:function(a){var b,c,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t=1e-12,u=t*t,v=30,w=a.x,x=a.y,y=a.z?a.z:0;if(o=!1,b=Math.sqrt(w*w+x*x),c=Math.sqrt(w*w+x*x+y*y),b/this.a<t){if(o=!0,q=0,c/this.a<t)return r=d,void(s=-this.b)}else q=Math.atan2(x,w);e=y/c,f=b/c,g=1/Math.sqrt(1-this.es*(2-this.es)*f*f),j=f*(1-this.es)*g,k=e*g,p=0;do p++,i=this.a/Math.sqrt(1-this.es*k*k),s=b*j+y*k-i*(1-this.es*k*k),h=this.es*i/(i+s),g=1/Math.sqrt(1-h*(2-h)*f*f),l=f*(1-h)*g,m=e*g,n=m*j-l*k,j=l,k=m;while(n*n>u&&v>p);return r=Math.atan(m/Math.abs(l)),a.x=q,a.y=r,a.z=s,a},geocentric_to_geodetic_noniter:function(a){var b,c,e,f,g,h,i,j,m,n,o,p,q,r,s,t,u,v=a.x,w=a.y,x=a.z?a.z:0;if(v=parseFloat(v),w=parseFloat(w),x=parseFloat(x),u=!1,0!==v)b=Math.atan2(w,v);else if(w>0)b=d;else if(0>w)b=-d;else if(u=!0,b=0,x>0)c=d;else{if(!(0>x))return c=d,void(e=-this.b);c=-d}return g=v*v+w*w,f=Math.sqrt(g),h=x*k,j=Math.sqrt(h*h+g),n=h/j,p=f/j,o=n*n*n,i=x+this.b*this.ep2*o,t=f-this.a*this.es*p*p*p,m=Math.sqrt(i*i+t*t),q=i/m,r=t/m,s=this.a/Math.sqrt(1-this.es*q*q),e=r>=l?f/r-s:-l>=r?f/-r-s:x/q+s*(this.es-1),u===!1&&(c=Math.atan(q/r)),a.x=b,a.y=c,a.z=e,a},geocentric_to_wgs84:function(a){if(this.datum_type===e)a.x+=this.datum_params[0],a.y+=this.datum_params[1],a.z+=this.datum_params[2];else if(this.datum_type===f){var b=this.datum_params[0],c=this.datum_params[1],d=this.datum_params[2],g=this.datum_params[3],h=this.datum_params[4],i=this.datum_params[5],j=this.datum_params[6],k=j*(a.x-i*a.y+h*a.z)+b,l=j*(i*a.x+a.y-g*a.z)+c,m=j*(-h*a.x+g*a.y+a.z)+d;a.x=k,a.y=l,a.z=m}},geocentric_from_wgs84:function(a){if(this.datum_type===e)a.x-=this.datum_params[0],a.y-=this.datum_params[1],a.z-=this.datum_params[2];else if(this.datum_type===f){var b=this.datum_params[0],c=this.datum_params[1],d=this.datum_params[2],g=this.datum_params[3],h=this.datum_params[4],i=this.datum_params[5],j=this.datum_params[6],k=(a.x-b)/j,l=(a.y-c)/j,m=(a.z-d)/j;a.x=k+i*l-h*m,a.y=-i*k+l+g*m,a.z=h*k-g*l+m}}},b.exports=m},{}],31:[function(a,b,c){var d=1,e=2,f=3,g=5,h=6378137,i=.006694379990141316;b.exports=function(a,b,c){function j(a){return a===d||a===e}var k,l,m;if(a.compare_datums(b))return c;if(a.datum_type===g||b.datum_type===g)return c;var n=a.a,o=a.es,p=b.a,q=b.es,r=a.datum_type;if(r===f)if(0===this.apply_gridshift(a,0,c))a.a=h,a.es=i;else{if(!a.datum_params)return a.a=n,a.es=a.es,c;for(k=1,l=0,m=a.datum_params.length;m>l;l++)k*=a.datum_params[l];if(0===k)return a.a=n,a.es=a.es,c;r=a.datum_params.length>3?e:d}return b.datum_type===f&&(b.a=h,b.es=i),(a.es!==b.es||a.a!==b.a||j(r)||j(b.datum_type))&&(a.geodetic_to_geocentric(c),j(a.datum_type)&&a.geocentric_to_wgs84(c),j(b.datum_type)&&b.geocentric_from_wgs84(c),b.geocentric_to_geodetic(c)),b.datum_type===f&&this.apply_gridshift(b,1,c),a.a=n,a.es=o,b.a=p,b.es=q,c}},{}],32:[function(a,b,c){function d(a){var b=this;if(2===arguments.length){var c=arguments[1];"string"==typeof c?"+"===c.charAt(0)?d[a]=f(arguments[1]):d[a]=g(arguments[1]):d[a]=c}else if(1===arguments.length){if(Array.isArray(a))return a.map(function(a){Array.isArray(a)?d.apply(b,a):d(a)});if("string"==typeof a){if(a in d)return d[a]}else"EPSG"in a?d["EPSG:"+a.EPSG]=a:"ESRI"in a?d["ESRI:"+a.ESRI]=a:"IAU2000"in a?d["IAU2000:"+a.IAU2000]=a:console.log(a);return}}var e=a("./global"),f=a("./projString"),g=a("./wkt");e(d),b.exports=d},{"./global":35,"./projString":38,"./wkt":67}],33:[function(a,b,c){var d=a("./constants/Datum"),e=a("./constants/Ellipsoid"),f=a("./extend"),g=a("./datum"),h=1e-10,i=.16666666666666666,j=.04722222222222222,k=.022156084656084655;b.exports=function(a){if(a.datumCode&&"none"!==a.datumCode){var b=d[a.datumCode];b&&(a.datum_params=b.towgs84?b.towgs84.split(","):null,a.ellps=b.ellipse,a.datumName=b.datumName?b.datumName:a.datumCode)}if(!a.a){var c=e[a.ellps]?e[a.ellps]:e.WGS84;f(a,c)}return a.rf&&!a.b&&(a.b=(1-1/a.rf)*a.a),(0===a.rf||Math.abs(a.a-a.b)<h)&&(a.sphere=!0,a.b=a.a),a.a2=a.a*a.a,a.b2=a.b*a.b,a.es=(a.a2-a.b2)/a.a2,a.e=Math.sqrt(a.es),a.R_A&&(a.a*=1-a.es*(i+a.es*(j+a.es*k)),a.a2=a.a*a.a,a.b2=a.b*a.b,a.es=0),a.ep2=(a.a2-a.b2)/a.b2,a.k0||(a.k0=1),a.axis||(a.axis="enu"),a.datum||(a.datum=g(a)),a}},{"./constants/Datum":25,"./constants/Ellipsoid":26,"./datum":30,"./extend":34}],34:[function(a,b,c){b.exports=function(a,b){a=a||{};var c,d;if(!b)return a;for(d in b)c=b[d],void 0!==c&&(a[d]=c);return a}},{}],35:[function(a,b,c){b.exports=function(a){a("EPSG:4326","+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"),a("EPSG:4269","+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"),a("EPSG:3857","+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"),a.WGS84=a["EPSG:4326"],a["EPSG:3785"]=a["EPSG:3857"],a.GOOGLE=a["EPSG:3857"],a["EPSG:900913"]=a["EPSG:3857"],a["EPSG:102113"]=a["EPSG:3857"]}},{}],36:[function(a,b,c){var _mproj4_=a("./core");_mproj4_.defaultDatum="WGS84",_mproj4_.Proj=a("./Proj"),_mproj4_.WGS84=new _mproj4_.Proj("WGS84"),_mproj4_.Point=a("./Point"),_mproj4_.toPoint=a("./common/toPoint"),_mproj4_.defs=a("./defs"),_mproj4_.transform=a("./transform"),_mproj4_.mgrs=a("mgrs"),_mproj4_.version=a("../package.json").version,a("./includedProjections")(_mproj4_),b.exports=_mproj4_},{"../package.json":69,"./Point":1,"./Proj":2,"./common/toPoint":23,"./core":29,"./defs":32,"./includedProjections":"Pk/iAZ","./transform":66,mgrs:68}],37:[function(a,b,c){function d(a){return"string"==typeof a}function e(a){return a in i}function f(a){var b=["GEOGCS","GEOCCS","PROJCS","LOCAL_CS"];return b.reduce(function(b,c){return b+1+a.indexOf(c)},0)}function g(a){return"+"===a[0]}function h(a){return d(a)?e(a)?i[a]:f(a)?j(a):g(a)?k(a):void 0:a}var i=a("./defs"),j=a("./wkt"),k=a("./projString");b.exports=h},{"./defs":32,"./projString":38,"./wkt":67}],38:[function(a,b,c){var d=.017453292519943295,e=a("./constants/PrimeMeridian"),f=a("./constants/units");b.exports=function(a){var b={},c={};a.split("+").map(function(a){return a.trim()}).filter(function(a){return a}).forEach(function(a){var b=a.split("=");b.push(!0),c[b[0].toLowerCase()]=b[1]});var g,h,i,j={proj:"projName",datum:"datumCode",rf:function(a){b.rf=parseFloat(a)},lat_0:function(a){b.lat0=a*d},lat_1:function(a){b.lat1=a*d},lat_2:function(a){b.lat2=a*d},lat_ts:function(a){b.lat_ts=a*d},lon_0:function(a){b.long0=a*d},lon_1:function(a){b.long1=a*d},lon_2:function(a){b.long2=a*d},alpha:function(a){b.alpha=parseFloat(a)*d},lonc:function(a){b.longc=a*d},x_0:function(a){b.x0=parseFloat(a)},y_0:function(a){b.y0=parseFloat(a)},k_0:function(a){b.k0=parseFloat(a)},k:function(a){b.k0=parseFloat(a)},a:function(a){b.a=parseFloat(a)},b:function(a){b.b=parseFloat(a)},r_a:function(){b.R_A=!0},zone:function(a){b.zone=parseInt(a,10)},south:function(){b.utmSouth=!0},towgs84:function(a){b.datum_params=a.split(",").map(function(a){return parseFloat(a)})},to_meter:function(a){b.to_meter=parseFloat(a)},units:function(a){b.units=a,f[a]&&(b.to_meter=f[a].to_meter)},from_greenwich:function(a){b.from_greenwich=a*d},pm:function(a){b.from_greenwich=(e[a]?e[a]:parseFloat(a))*d},nadgrids:function(a){"@null"===a?b.datumCode="none":b.nadgrids=a},axis:function(a){var c="ewnsud";3===a.length&&-1!==c.indexOf(a.substr(0,1))&&-1!==c.indexOf(a.substr(1,1))&&-1!==c.indexOf(a.substr(2,1))&&(b.axis=a)}};for(g in c)h=c[g],g in j?(i=j[g],"function"==typeof i?i(h):b[i]=h):b[g]=h;return"string"==typeof b.datumCode&&"WGS84"!==b.datumCode&&(b.datumCode=b.datumCode.toLowerCase()),b}},{"./constants/PrimeMeridian":27,"./constants/units":28}],39:[function(a,b,c){function d(a,b){var c=g.length;return a.names?(g[c]=a,a.names.forEach(function(a){f[a.toLowerCase()]=c}),this):(console.log(b),!0)}var e=[a("./projections/merc"),a("./projections/longlat")],f={},g=[];c.add=d,c.get=function(a){if(!a)return!1;var b=a.toLowerCase();return"undefined"!=typeof f[b]&&g[f[b]]?g[f[b]]:void 0},c.start=function(){e.forEach(d)}},{"./projections/longlat":52,"./projections/merc":53}],40:[function(a,b,c){var d=1e-10,e=a("../common/msfnz"),f=a("../common/qsfnz"),g=a("../common/adjust_lon"),h=a("../common/asinz");c.init=function(){Math.abs(this.lat1+this.lat2)<d||(this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e3=Math.sqrt(this.es),this.sin_po=Math.sin(this.lat1),this.cos_po=Math.cos(this.lat1),this.t1=this.sin_po,this.con=this.sin_po,this.ms1=e(this.e3,this.sin_po,this.cos_po),this.qs1=f(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat2),this.cos_po=Math.cos(this.lat2),this.t2=this.sin_po,this.ms2=e(this.e3,this.sin_po,this.cos_po),this.qs2=f(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat0),this.cos_po=Math.cos(this.lat0),this.t3=this.sin_po,this.qs0=f(this.e3,this.sin_po,this.cos_po),Math.abs(this.lat1-this.lat2)>d?this.ns0=(this.ms1*this.ms1-this.ms2*this.ms2)/(this.qs2-this.qs1):this.ns0=this.con,this.c=this.ms1*this.ms1+this.ns0*this.qs1,this.rh=this.a*Math.sqrt(this.c-this.ns0*this.qs0)/this.ns0)},c.forward=function(a){var b=a.x,c=a.y;this.sin_phi=Math.sin(c),this.cos_phi=Math.cos(c);var d=f(this.e3,this.sin_phi,this.cos_phi),e=this.a*Math.sqrt(this.c-this.ns0*d)/this.ns0,h=this.ns0*g(b-this.long0),i=e*Math.sin(h)+this.x0,j=this.rh-e*Math.cos(h)+this.y0;return a.x=i,a.y=j,a},c.inverse=function(a){var b,c,d,e,f,h;return a.x-=this.x0,a.y=this.rh-a.y+this.y0,this.ns0>=0?(b=Math.sqrt(a.x*a.x+a.y*a.y),d=1):(b=-Math.sqrt(a.x*a.x+a.y*a.y),d=-1),e=0,0!==b&&(e=Math.atan2(d*a.x,d*a.y)),d=b*this.ns0/this.a,this.sphere?h=Math.asin((this.c-d*d)/(2*this.ns0)):(c=(this.c-d*d)/this.ns0,h=this.phi1z(this.e3,c)),f=g(e/this.ns0+this.long0),a.x=f,a.y=h,a},c.phi1z=function(a,b){var c,e,f,g,i,j=h(.5*b);if(d>a)return j;for(var k=a*a,l=1;25>=l;l++)if(c=Math.sin(j),e=Math.cos(j),f=a*c,g=1-f*f,i=.5*g*g/e*(b/(1-k)-c/g+.5/a*Math.log((1-f)/(1+f))),j+=i,Math.abs(i)<=1e-7)return j;return null},c.names=["Albers_Conic_Equal_Area","Albers","aea"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/msfnz":15,"../common/qsfnz":20}],41:[function(a,b,c){var d=a("../common/adjust_lon"),e=Math.PI/2,f=1e-10,g=a("../common/mlfn"),h=a("../common/e0fn"),i=a("../common/e1fn"),j=a("../common/e2fn"),k=a("../common/e3fn"),l=a("../common/gN"),m=a("../common/asinz"),n=a("../common/imlfn");c.init=function(){this.sin_p12=Math.sin(this.lat0),this.cos_p12=Math.cos(this.lat0)},c.forward=function(a){var b,c,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H=a.x,I=a.y,J=Math.sin(a.y),K=Math.cos(a.y),L=d(H-this.long0);return this.sphere?Math.abs(this.sin_p12-1)<=f?(a.x=this.x0+this.a*(e-I)*Math.sin(L),a.y=this.y0-this.a*(e-I)*Math.cos(L),a):Math.abs(this.sin_p12+1)<=f?(a.x=this.x0+this.a*(e+I)*Math.sin(L),a.y=this.y0+this.a*(e+I)*Math.cos(L),a):(B=this.sin_p12*J+this.cos_p12*K*Math.cos(L),z=Math.acos(B),A=z/Math.sin(z),a.x=this.x0+this.a*A*K*Math.sin(L),a.y=this.y0+this.a*A*(this.cos_p12*J-this.sin_p12*K*Math.cos(L)),a):(b=h(this.es),c=i(this.es),m=j(this.es),n=k(this.es),Math.abs(this.sin_p12-1)<=f?(o=this.a*g(b,c,m,n,e),p=this.a*g(b,c,m,n,I),a.x=this.x0+(o-p)*Math.sin(L),a.y=this.y0-(o-p)*Math.cos(L),a):Math.abs(this.sin_p12+1)<=f?(o=this.a*g(b,c,m,n,e),p=this.a*g(b,c,m,n,I),a.x=this.x0+(o+p)*Math.sin(L),a.y=this.y0+(o+p)*Math.cos(L),a):(q=J/K,r=l(this.a,this.e,this.sin_p12),s=l(this.a,this.e,J),t=Math.atan((1-this.es)*q+this.es*r*this.sin_p12/(s*K)),u=Math.atan2(Math.sin(L),this.cos_p12*Math.tan(t)-this.sin_p12*Math.cos(L)),C=0===u?Math.asin(this.cos_p12*Math.sin(t)-this.sin_p12*Math.cos(t)):Math.abs(Math.abs(u)-Math.PI)<=f?-Math.asin(this.cos_p12*Math.sin(t)-this.sin_p12*Math.cos(t)):Math.asin(Math.sin(L)*Math.cos(t)/Math.sin(u)),v=this.e*this.sin_p12/Math.sqrt(1-this.es),w=this.e*this.cos_p12*Math.cos(u)/Math.sqrt(1-this.es),x=v*w,y=w*w,D=C*C,E=D*C,F=E*C,G=F*C,z=r*C*(1-D*y*(1-y)/6+E/8*x*(1-2*y)+F/120*(y*(4-7*y)-3*v*v*(1-7*y))-G/48*x),a.x=this.x0+z*Math.sin(u),a.y=this.y0+z*Math.cos(u),a))},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I;if(this.sphere){if(b=Math.sqrt(a.x*a.x+a.y*a.y),b>2*e*this.a)return;return c=b/this.a,o=Math.sin(c),p=Math.cos(c),q=this.long0,Math.abs(b)<=f?r=this.lat0:(r=m(p*this.sin_p12+a.y*o*this.cos_p12/b),s=Math.abs(this.lat0)-e,q=d(Math.abs(s)<=f?this.lat0>=0?this.long0+Math.atan2(a.x,-a.y):this.long0-Math.atan2(-a.x,a.y):this.long0+Math.atan2(a.x*o,b*this.cos_p12*p-a.y*this.sin_p12*o))),a.x=q,a.y=r,a}return t=h(this.es),u=i(this.es),v=j(this.es),w=k(this.es),Math.abs(this.sin_p12-1)<=f?(x=this.a*g(t,u,v,w,e),b=Math.sqrt(a.x*a.x+a.y*a.y),y=x-b,r=n(y/this.a,t,u,v,w),q=d(this.long0+Math.atan2(a.x,-1*a.y)),a.x=q,a.y=r,a):Math.abs(this.sin_p12+1)<=f?(x=this.a*g(t,u,v,w,e),b=Math.sqrt(a.x*a.x+a.y*a.y),y=b-x,r=n(y/this.a,t,u,v,w),q=d(this.long0+Math.atan2(a.x,a.y)),a.x=q,a.y=r,a):(b=Math.sqrt(a.x*a.x+a.y*a.y),B=Math.atan2(a.x,a.y),z=l(this.a,this.e,this.sin_p12),C=Math.cos(B),D=this.e*this.cos_p12*C,E=-D*D/(1-this.es),F=3*this.es*(1-E)*this.sin_p12*this.cos_p12*C/(1-this.es),G=b/z,H=G-E*(1+E)*Math.pow(G,3)/6-F*(1+3*E)*Math.pow(G,4)/24,I=1-E*H*H/2-G*H*H*H/6,A=Math.asin(this.sin_p12*Math.cos(H)+this.cos_p12*Math.sin(H)*C),q=d(this.long0+Math.asin(Math.sin(B)*Math.sin(H)/Math.cos(A))),r=Math.atan((1-this.es*I*this.sin_p12/Math.sin(A))*Math.tan(A)/(1-this.es)),a.x=q,a.y=r,a)},c.names=["Azimuthal_Equidistant","aeqd"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/imlfn":12,"../common/mlfn":14}],42:[function(a,b,c){var d=a("../common/mlfn"),e=a("../common/e0fn"),f=a("../common/e1fn"),g=a("../common/e2fn"),h=a("../common/e3fn"),i=a("../common/gN"),j=a("../common/adjust_lon"),k=a("../common/adjust_lat"),l=a("../common/imlfn"),m=Math.PI/2,n=1e-10;c.init=function(){this.sphere||(this.e0=e(this.es),this.e1=f(this.es),this.e2=g(this.es),this.e3=h(this.es),this.ml0=this.a*d(this.e0,this.e1,this.e2,this.e3,this.lat0))},c.forward=function(a){var b,c,e=a.x,f=a.y;if(e=j(e-this.long0),this.sphere)b=this.a*Math.asin(Math.cos(f)*Math.sin(e)),c=this.a*(Math.atan2(Math.tan(f),Math.cos(e))-this.lat0);else{var g=Math.sin(f),h=Math.cos(f),k=i(this.a,this.e,g),l=Math.tan(f)*Math.tan(f),m=e*Math.cos(f),n=m*m,o=this.es*h*h/(1-this.es),p=this.a*d(this.e0,this.e1,this.e2,this.e3,f);b=k*m*(1-n*l*(1/6-(8-l+8*o)*n/120)),c=p-this.ml0+k*g/h*n*(.5+(5-l+6*o)*n/24)}return a.x=b+this.x0,a.y=c+this.y0,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,d=a.x/this.a,e=a.y/this.a;if(this.sphere){var f=e+this.lat0;b=Math.asin(Math.sin(f)*Math.cos(d)),c=Math.atan2(Math.tan(d),Math.cos(f))}else{var g=this.ml0/this.a+e,h=l(g,this.e0,this.e1,this.e2,this.e3);if(Math.abs(Math.abs(h)-m)<=n)return a.x=this.long0,a.y=m,0>e&&(a.y*=-1),a;var o=i(this.a,this.e,Math.sin(h)),p=o*o*o/this.a/this.a*(1-this.es),q=Math.pow(Math.tan(h),2),r=d*this.a/o,s=r*r;b=h-o*Math.tan(h)/p*r*r*(.5-(1+3*q)*r*r/24),c=r*(1-s*(q/3+(1+3*q)*q*s/15))/Math.cos(h)}return a.x=j(c+this.long0),a.y=k(b),a},c.names=["Cassini","Cassini_Soldner","cass"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/imlfn":12,"../common/mlfn":14}],43:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/qsfnz"),f=a("../common/msfnz"),g=a("../common/iqsfnz");c.init=function(){this.sphere||(this.k0=f(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)))},c.forward=function(a){var b,c,f=a.x,g=a.y,h=d(f-this.long0);if(this.sphere)b=this.x0+this.a*h*Math.cos(this.lat_ts),c=this.y0+this.a*Math.sin(g)/Math.cos(this.lat_ts);else{var i=e(this.e,Math.sin(g));b=this.x0+this.a*this.k0*h,c=this.y0+this.a*i*.5/this.k0}return a.x=b,a.y=c,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c;return this.sphere?(b=d(this.long0+a.x/this.a/Math.cos(this.lat_ts)),c=Math.asin(a.y/this.a*Math.cos(this.lat_ts))):(c=g(this.e,2*a.y*this.k0/this.a),b=d(this.long0+a.x/(this.a*this.k0))),a.x=b,a.y=c,a},c.names=["cea"]},{"../common/adjust_lon":5,"../common/iqsfnz":13,"../common/msfnz":15,"../common/qsfnz":20}],44:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/adjust_lat");c.init=function(){this.x0=this.x0||0,this.y0=this.y0||0,this.lat0=this.lat0||0,this.long0=this.long0||0,this.lat_ts=this.lat_ts||0,this.title=this.title||"Equidistant Cylindrical (Plate Carre)",this.rc=Math.cos(this.lat_ts)},c.forward=function(a){var b=a.x,c=a.y,f=d(b-this.long0),g=e(c-this.lat0);return a.x=this.x0+this.a*f*this.rc,a.y=this.y0+this.a*g,a},c.inverse=function(a){var b=a.x,c=a.y;return a.x=d(this.long0+(b-this.x0)/(this.a*this.rc)),a.y=e(this.lat0+(c-this.y0)/this.a),a},c.names=["Equirectangular","Equidistant_Cylindrical","eqc"]},{"../common/adjust_lat":4,"../common/adjust_lon":5}],45:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/msfnz"),i=a("../common/mlfn"),j=a("../common/adjust_lon"),k=a("../common/adjust_lat"),l=a("../common/imlfn"),m=1e-10;c.init=function(){Math.abs(this.lat1+this.lat2)<m||(this.lat2=this.lat2||this.lat1,this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.sinphi=Math.sin(this.lat1),this.cosphi=Math.cos(this.lat1),this.ms1=h(this.e,this.sinphi,this.cosphi),this.ml1=i(this.e0,this.e1,this.e2,this.e3,this.lat1),Math.abs(this.lat1-this.lat2)<m?this.ns=this.sinphi:(this.sinphi=Math.sin(this.lat2),this.cosphi=Math.cos(this.lat2),this.ms2=h(this.e,this.sinphi,this.cosphi),this.ml2=i(this.e0,this.e1,this.e2,this.e3,this.lat2),this.ns=(this.ms1-this.ms2)/(this.ml2-this.ml1)),this.g=this.ml1+this.ms1/this.ns,this.ml0=i(this.e0,this.e1,this.e2,this.e3,this.lat0),this.rh=this.a*(this.g-this.ml0))},c.forward=function(a){var b,c=a.x,d=a.y;if(this.sphere)b=this.a*(this.g-d);else{var e=i(this.e0,this.e1,this.e2,this.e3,d);b=this.a*(this.g-e)}var f=this.ns*j(c-this.long0),g=this.x0+b*Math.sin(f),h=this.y0+this.rh-b*Math.cos(f);return a.x=g,a.y=h,a},c.inverse=function(a){a.x-=this.x0,a.y=this.rh-a.y+this.y0;var b,c,d,e;this.ns>=0?(c=Math.sqrt(a.x*a.x+a.y*a.y),b=1):(c=-Math.sqrt(a.x*a.x+a.y*a.y),b=-1);var f=0;if(0!==c&&(f=Math.atan2(b*a.x,b*a.y)),this.sphere)return e=j(this.long0+f/this.ns),d=k(this.g-c/this.a),a.x=e,a.y=d,a;var g=this.g-c/this.a;return d=l(g,this.e0,this.e1,this.e2,this.e3),e=j(this.long0+f/this.ns),a.x=e,a.y=d,a},c.names=["Equidistant_Conic","eqdc"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/imlfn":12,"../common/mlfn":14,"../common/msfnz":15}],46:[function(a,b,c){var d=Math.PI/4,e=a("../common/srat"),f=Math.PI/2,g=20;c.init=function(){var a=Math.sin(this.lat0),b=Math.cos(this.lat0);b*=b,this.rc=Math.sqrt(1-this.es)/(1-this.es*a*a),this.C=Math.sqrt(1+this.es*b*b/(1-this.es)),this.phic0=Math.asin(a/this.C),this.ratexp=.5*this.C*this.e,this.K=Math.tan(.5*this.phic0+d)/(Math.pow(Math.tan(.5*this.lat0+d),this.C)*e(this.e*a,this.ratexp))},c.forward=function(a){var b=a.x,c=a.y;return a.y=2*Math.atan(this.K*Math.pow(Math.tan(.5*c+d),this.C)*e(this.e*Math.sin(c),this.ratexp))-f,a.x=this.C*b,a},c.inverse=function(a){for(var b=1e-14,c=a.x/this.C,h=a.y,i=Math.pow(Math.tan(.5*h+d)/this.K,1/this.C),j=g;j>0&&(h=2*Math.atan(i*e(this.e*Math.sin(a.y),-.5*this.e))-f,!(Math.abs(h-a.y)<b));--j)a.y=h;return j?(a.x=c,a.y=h,a):null},c.names=["gauss"]},{"../common/srat":22}],47:[function(a,b,c){function d(a){return a;
}c.init=function(){this.isGeocent=!0},c.forward=d,c.inverse=d,c.names=["geocent"]},{}],48:[function(a,b,c){var d=a("../common/adjust_lon"),e=1e-10,f=a("../common/asinz");c.init=function(){this.sin_p14=Math.sin(this.lat0),this.cos_p14=Math.cos(this.lat0),this.infinity_dist=1e3*this.a,this.rc=1},c.forward=function(a){var b,c,f,g,h,i,j,k,l=a.x,m=a.y;return f=d(l-this.long0),b=Math.sin(m),c=Math.cos(m),g=Math.cos(f),i=this.sin_p14*b+this.cos_p14*c*g,h=1,i>0||Math.abs(i)<=e?(j=this.x0+this.a*h*c*Math.sin(f)/i,k=this.y0+this.a*h*(this.cos_p14*b-this.sin_p14*c*g)/i):(j=this.x0+this.infinity_dist*c*Math.sin(f),k=this.y0+this.infinity_dist*(this.cos_p14*b-this.sin_p14*c*g)),a.x=j,a.y=k,a},c.inverse=function(a){var b,c,e,g,h,i;return a.x=(a.x-this.x0)/this.a,a.y=(a.y-this.y0)/this.a,a.x/=this.k0,a.y/=this.k0,(b=Math.sqrt(a.x*a.x+a.y*a.y))?(g=Math.atan2(b,this.rc),c=Math.sin(g),e=Math.cos(g),i=f(e*this.sin_p14+a.y*c*this.cos_p14/b),h=Math.atan2(a.x*c,b*this.cos_p14*e-a.y*this.sin_p14*c),h=d(this.long0+h)):(i=this.phic0,h=0),a.x=h,a.y=i,a},c.names=["gnom"]},{"../common/adjust_lon":5,"../common/asinz":6}],49:[function(a,b,c){var d=a("../common/adjust_lon");c.init=function(){this.a=6377397.155,this.es=.006674372230614,this.e=Math.sqrt(this.es),this.lat0||(this.lat0=.863937979737193),this.long0||(this.long0=.4334234309119251),this.k0||(this.k0=.9999),this.s45=.785398163397448,this.s90=2*this.s45,this.fi0=this.lat0,this.e2=this.es,this.e=Math.sqrt(this.e2),this.alfa=Math.sqrt(1+this.e2*Math.pow(Math.cos(this.fi0),4)/(1-this.e2)),this.uq=1.04216856380474,this.u0=Math.asin(Math.sin(this.fi0)/this.alfa),this.g=Math.pow((1+this.e*Math.sin(this.fi0))/(1-this.e*Math.sin(this.fi0)),this.alfa*this.e/2),this.k=Math.tan(this.u0/2+this.s45)/Math.pow(Math.tan(this.fi0/2+this.s45),this.alfa)*this.g,this.k1=this.k0,this.n0=this.a*Math.sqrt(1-this.e2)/(1-this.e2*Math.pow(Math.sin(this.fi0),2)),this.s0=1.37008346281555,this.n=Math.sin(this.s0),this.ro0=this.k1*this.n0/Math.tan(this.s0),this.ad=this.s90-this.uq},c.forward=function(a){var b,c,e,f,g,h,i,j=a.x,k=a.y,l=d(j-this.long0);return b=Math.pow((1+this.e*Math.sin(k))/(1-this.e*Math.sin(k)),this.alfa*this.e/2),c=2*(Math.atan(this.k*Math.pow(Math.tan(k/2+this.s45),this.alfa)/b)-this.s45),e=-l*this.alfa,f=Math.asin(Math.cos(this.ad)*Math.sin(c)+Math.sin(this.ad)*Math.cos(c)*Math.cos(e)),g=Math.asin(Math.cos(c)*Math.sin(e)/Math.cos(f)),h=this.n*g,i=this.ro0*Math.pow(Math.tan(this.s0/2+this.s45),this.n)/Math.pow(Math.tan(f/2+this.s45),this.n),a.y=i*Math.cos(h)/1,a.x=i*Math.sin(h)/1,this.czech||(a.y*=-1,a.x*=-1),a},c.inverse=function(a){var b,c,d,e,f,g,h,i,j=a.x;a.x=a.y,a.y=j,this.czech||(a.y*=-1,a.x*=-1),g=Math.sqrt(a.x*a.x+a.y*a.y),f=Math.atan2(a.y,a.x),e=f/Math.sin(this.s0),d=2*(Math.atan(Math.pow(this.ro0/g,1/this.n)*Math.tan(this.s0/2+this.s45))-this.s45),b=Math.asin(Math.cos(this.ad)*Math.sin(d)-Math.sin(this.ad)*Math.cos(d)*Math.cos(e)),c=Math.asin(Math.cos(d)*Math.sin(e)/Math.cos(b)),a.x=this.long0-c/this.alfa,h=b,i=0;var k=0;do a.y=2*(Math.atan(Math.pow(this.k,-1/this.alfa)*Math.pow(Math.tan(b/2+this.s45),1/this.alfa)*Math.pow((1+this.e*Math.sin(h))/(1-this.e*Math.sin(h)),this.e/2))-this.s45),Math.abs(h-a.y)<1e-10&&(i=1),h=a.y,k+=1;while(0===i&&15>k);return k>=15?null:a},c.names=["Krovak","krovak"]},{"../common/adjust_lon":5}],50:[function(a,b,c){var d=Math.PI/2,e=Math.PI/4,f=1e-10,g=a("../common/qsfnz"),h=a("../common/adjust_lon");c.S_POLE=1,c.N_POLE=2,c.EQUIT=3,c.OBLIQ=4,c.init=function(){var a=Math.abs(this.lat0);if(Math.abs(a-d)<f?this.mode=this.lat0<0?this.S_POLE:this.N_POLE:Math.abs(a)<f?this.mode=this.EQUIT:this.mode=this.OBLIQ,this.es>0){var b;switch(this.qp=g(this.e,1),this.mmf=.5/(1-this.es),this.apa=this.authset(this.es),this.mode){case this.N_POLE:this.dd=1;break;case this.S_POLE:this.dd=1;break;case this.EQUIT:this.rq=Math.sqrt(.5*this.qp),this.dd=1/this.rq,this.xmf=1,this.ymf=.5*this.qp;break;case this.OBLIQ:this.rq=Math.sqrt(.5*this.qp),b=Math.sin(this.lat0),this.sinb1=g(this.e,b)/this.qp,this.cosb1=Math.sqrt(1-this.sinb1*this.sinb1),this.dd=Math.cos(this.lat0)/(Math.sqrt(1-this.es*b*b)*this.rq*this.cosb1),this.ymf=(this.xmf=this.rq)/this.dd,this.xmf*=this.dd}}else this.mode===this.OBLIQ&&(this.sinph0=Math.sin(this.lat0),this.cosph0=Math.cos(this.lat0))},c.forward=function(a){var b,c,i,j,k,l,m,n,o,p,q=a.x,r=a.y;if(q=h(q-this.long0),this.sphere){if(k=Math.sin(r),p=Math.cos(r),i=Math.cos(q),this.mode===this.OBLIQ||this.mode===this.EQUIT){if(c=this.mode===this.EQUIT?1+p*i:1+this.sinph0*k+this.cosph0*p*i,f>=c)return null;c=Math.sqrt(2/c),b=c*p*Math.sin(q),c*=this.mode===this.EQUIT?k:this.cosph0*k-this.sinph0*p*i}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(i=-i),Math.abs(r+this.phi0)<f)return null;c=e-.5*r,c=2*(this.mode===this.S_POLE?Math.cos(c):Math.sin(c)),b=c*Math.sin(q),c*=i}}else{switch(m=0,n=0,o=0,i=Math.cos(q),j=Math.sin(q),k=Math.sin(r),l=g(this.e,k),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(m=l/this.qp,n=Math.sqrt(1-m*m)),this.mode){case this.OBLIQ:o=1+this.sinb1*m+this.cosb1*n*i;break;case this.EQUIT:o=1+n*i;break;case this.N_POLE:o=d+r,l=this.qp-l;break;case this.S_POLE:o=r-d,l=this.qp+l}if(Math.abs(o)<f)return null;switch(this.mode){case this.OBLIQ:case this.EQUIT:o=Math.sqrt(2/o),c=this.mode===this.OBLIQ?this.ymf*o*(this.cosb1*m-this.sinb1*n*i):(o=Math.sqrt(2/(1+n*i)))*m*this.ymf,b=this.xmf*o*n*j;break;case this.N_POLE:case this.S_POLE:l>=0?(b=(o=Math.sqrt(l))*j,c=i*(this.mode===this.S_POLE?o:-o)):b=c=0}}return a.x=this.a*b+this.x0,a.y=this.a*c+this.y0,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,e,g,i,j,k,l=a.x/this.a,m=a.y/this.a;if(this.sphere){var n,o=0,p=0;if(n=Math.sqrt(l*l+m*m),c=.5*n,c>1)return null;switch(c=2*Math.asin(c),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(p=Math.sin(c),o=Math.cos(c)),this.mode){case this.EQUIT:c=Math.abs(n)<=f?0:Math.asin(m*p/n),l*=p,m=o*n;break;case this.OBLIQ:c=Math.abs(n)<=f?this.phi0:Math.asin(o*this.sinph0+m*p*this.cosph0/n),l*=p*this.cosph0,m=(o-Math.sin(c)*this.sinph0)*n;break;case this.N_POLE:m=-m,c=d-c;break;case this.S_POLE:c-=d}b=0!==m||this.mode!==this.EQUIT&&this.mode!==this.OBLIQ?Math.atan2(l,m):0}else{if(k=0,this.mode===this.OBLIQ||this.mode===this.EQUIT){if(l/=this.dd,m*=this.dd,j=Math.sqrt(l*l+m*m),f>j)return a.x=0,a.y=this.phi0,a;g=2*Math.asin(.5*j/this.rq),e=Math.cos(g),l*=g=Math.sin(g),this.mode===this.OBLIQ?(k=e*this.sinb1+m*g*this.cosb1/j,i=this.qp*k,m=j*this.cosb1*e-m*this.sinb1*g):(k=m*g/j,i=this.qp*k,m=j*e)}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(m=-m),i=l*l+m*m,!i)return a.x=0,a.y=this.phi0,a;k=1-i/this.qp,this.mode===this.S_POLE&&(k=-k)}b=Math.atan2(l,m),c=this.authlat(Math.asin(k),this.apa)}return a.x=h(this.long0+b),a.y=c,a},c.P00=.3333333333333333,c.P01=.17222222222222222,c.P02=.10257936507936508,c.P10=.06388888888888888,c.P11=.0664021164021164,c.P20=.016415012942191543,c.authset=function(a){var b,c=[];return c[0]=a*this.P00,b=a*a,c[0]+=b*this.P01,c[1]=b*this.P10,b*=a,c[0]+=b*this.P02,c[1]+=b*this.P11,c[2]=b*this.P20,c},c.authlat=function(a,b){var c=a+a;return a+b[0]*Math.sin(c)+b[1]*Math.sin(c+c)+b[2]*Math.sin(c+c+c)},c.names=["Lambert Azimuthal Equal Area","Lambert_Azimuthal_Equal_Area","laea"]},{"../common/adjust_lon":5,"../common/qsfnz":20}],51:[function(a,b,c){var d=1e-10,e=a("../common/msfnz"),f=a("../common/tsfnz"),g=Math.PI/2,h=a("../common/sign"),i=a("../common/adjust_lon"),j=a("../common/phi2z");c.init=function(){if(this.lat2||(this.lat2=this.lat1),this.k0||(this.k0=1),this.x0=this.x0||0,this.y0=this.y0||0,!(Math.abs(this.lat1+this.lat2)<d)){var a=this.b/this.a;this.e=Math.sqrt(1-a*a);var b=Math.sin(this.lat1),c=Math.cos(this.lat1),g=e(this.e,b,c),h=f(this.e,this.lat1,b),i=Math.sin(this.lat2),j=Math.cos(this.lat2),k=e(this.e,i,j),l=f(this.e,this.lat2,i),m=f(this.e,this.lat0,Math.sin(this.lat0));Math.abs(this.lat1-this.lat2)>d?this.ns=Math.log(g/k)/Math.log(h/l):this.ns=b,isNaN(this.ns)&&(this.ns=b),this.f0=g/(this.ns*Math.pow(h,this.ns)),this.rh=this.a*this.f0*Math.pow(m,this.ns),this.title||(this.title="Lambert Conformal Conic")}},c.forward=function(a){var b=a.x,c=a.y;Math.abs(2*Math.abs(c)-Math.PI)<=d&&(c=h(c)*(g-2*d));var e,j,k=Math.abs(Math.abs(c)-g);if(k>d)e=f(this.e,c,Math.sin(c)),j=this.a*this.f0*Math.pow(e,this.ns);else{if(k=c*this.ns,0>=k)return null;j=0}var l=this.ns*i(b-this.long0);return a.x=this.k0*(j*Math.sin(l))+this.x0,a.y=this.k0*(this.rh-j*Math.cos(l))+this.y0,a},c.inverse=function(a){var b,c,d,e,f,h=(a.x-this.x0)/this.k0,k=this.rh-(a.y-this.y0)/this.k0;this.ns>0?(b=Math.sqrt(h*h+k*k),c=1):(b=-Math.sqrt(h*h+k*k),c=-1);var l=0;if(0!==b&&(l=Math.atan2(c*h,c*k)),0!==b||this.ns>0){if(c=1/this.ns,d=Math.pow(b/(this.a*this.f0),c),e=j(this.e,d),-9999===e)return null}else e=-g;return f=i(l/this.ns+this.long0),a.x=f,a.y=e,a},c.names=["Lambert Tangential Conformal Conic Projection","Lambert_Conformal_Conic","Lambert_Conformal_Conic_2SP","lcc"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/sign":21,"../common/tsfnz":24}],52:[function(a,b,c){function d(a){return a}c.init=function(){},c.forward=d,c.inverse=d,c.names=["longlat","identity"]},{}],53:[function(a,b,c){var d=a("../common/msfnz"),e=Math.PI/2,f=1e-10,g=57.29577951308232,h=a("../common/adjust_lon"),i=Math.PI/4,j=a("../common/tsfnz"),k=a("../common/phi2z");c.init=function(){var a=this.b/this.a;this.es=1-a*a,"x0"in this||(this.x0=0),"y0"in this||(this.y0=0),this.e=Math.sqrt(this.es),this.lat_ts?this.sphere?this.k0=Math.cos(this.lat_ts):this.k0=d(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)):this.k0||(this.k?this.k0=this.k:this.k0=1)},c.forward=function(a){var b=a.x,c=a.y;if(c*g>90&&-90>c*g&&b*g>180&&-180>b*g)return null;var d,k;if(Math.abs(Math.abs(c)-e)<=f)return null;if(this.sphere)d=this.x0+this.a*this.k0*h(b-this.long0),k=this.y0+this.a*this.k0*Math.log(Math.tan(i+.5*c));else{var l=Math.sin(c),m=j(this.e,c,l);d=this.x0+this.a*this.k0*h(b-this.long0),k=this.y0-this.a*this.k0*Math.log(m)}return a.x=d,a.y=k,a},c.inverse=function(a){var b,c,d=a.x-this.x0,f=a.y-this.y0;if(this.sphere)c=e-2*Math.atan(Math.exp(-f/(this.a*this.k0)));else{var g=Math.exp(-f/(this.a*this.k0));if(c=k(this.e,g),-9999===c)return null}return b=h(this.long0+d/(this.a*this.k0)),a.x=b,a.y=c,a},c.names=["Mercator","Popular Visualisation Pseudo Mercator","Mercator_1SP","Mercator_Auxiliary_Sphere","merc"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/tsfnz":24}],54:[function(a,b,c){var d=a("../common/adjust_lon");c.init=function(){},c.forward=function(a){var b=a.x,c=a.y,e=d(b-this.long0),f=this.x0+this.a*e,g=this.y0+this.a*Math.log(Math.tan(Math.PI/4+c/2.5))*1.25;return a.x=f,a.y=g,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b=d(this.long0+a.x/this.a),c=2.5*(Math.atan(Math.exp(.8*a.y/this.a))-Math.PI/4);return a.x=b,a.y=c,a},c.names=["Miller_Cylindrical","mill"]},{"../common/adjust_lon":5}],55:[function(a,b,c){var d=a("../common/adjust_lon"),e=1e-10;c.init=function(){},c.forward=function(a){for(var b=a.x,c=a.y,f=d(b-this.long0),g=c,h=Math.PI*Math.sin(c),i=0;!0;i++){var j=-(g+Math.sin(g)-h)/(1+Math.cos(g));if(g+=j,Math.abs(j)<e)break}g/=2,Math.PI/2-Math.abs(c)<e&&(f=0);var k=.900316316158*this.a*f*Math.cos(g)+this.x0,l=1.4142135623731*this.a*Math.sin(g)+this.y0;return a.x=k,a.y=l,a},c.inverse=function(a){var b,c;a.x-=this.x0,a.y-=this.y0,c=a.y/(1.4142135623731*this.a),Math.abs(c)>.999999999999&&(c=.999999999999),b=Math.asin(c);var e=d(this.long0+a.x/(.900316316158*this.a*Math.cos(b)));e<-Math.PI&&(e=-Math.PI),e>Math.PI&&(e=Math.PI),c=(2*b+Math.sin(2*b))/Math.PI,Math.abs(c)>1&&(c=1);var f=Math.asin(c);return a.x=e,a.y=f,a},c.names=["Mollweide","moll"]},{"../common/adjust_lon":5}],56:[function(a,b,c){var d=484813681109536e-20;c.iterations=1,c.init=function(){this.A=[],this.A[1]=.6399175073,this.A[2]=-.1358797613,this.A[3]=.063294409,this.A[4]=-.02526853,this.A[5]=.0117879,this.A[6]=-.0055161,this.A[7]=.0026906,this.A[8]=-.001333,this.A[9]=67e-5,this.A[10]=-34e-5,this.B_re=[],this.B_im=[],this.B_re[1]=.7557853228,this.B_im[1]=0,this.B_re[2]=.249204646,this.B_im[2]=.003371507,this.B_re[3]=-.001541739,this.B_im[3]=.04105856,this.B_re[4]=-.10162907,this.B_im[4]=.01727609,this.B_re[5]=-.26623489,this.B_im[5]=-.36249218,this.B_re[6]=-.6870983,this.B_im[6]=-1.1651967,this.C_re=[],this.C_im=[],this.C_re[1]=1.3231270439,this.C_im[1]=0,this.C_re[2]=-.577245789,this.C_im[2]=-.007809598,this.C_re[3]=.508307513,this.C_im[3]=-.112208952,this.C_re[4]=-.15094762,this.C_im[4]=.18200602,this.C_re[5]=1.01418179,this.C_im[5]=1.64497696,this.C_re[6]=1.9660549,this.C_im[6]=2.5127645,this.D=[],this.D[1]=1.5627014243,this.D[2]=.5185406398,this.D[3]=-.03333098,this.D[4]=-.1052906,this.D[5]=-.0368594,this.D[6]=.007317,this.D[7]=.0122,this.D[8]=.00394,this.D[9]=-.0013},c.forward=function(a){var b,c=a.x,e=a.y,f=e-this.lat0,g=c-this.long0,h=f/d*1e-5,i=g,j=1,k=0;for(b=1;10>=b;b++)j*=h,k+=this.A[b]*j;var l,m,n=k,o=i,p=1,q=0,r=0,s=0;for(b=1;6>=b;b++)l=p*n-q*o,m=q*n+p*o,p=l,q=m,r=r+this.B_re[b]*p-this.B_im[b]*q,s=s+this.B_im[b]*p+this.B_re[b]*q;return a.x=s*this.a+this.x0,a.y=r*this.a+this.y0,a},c.inverse=function(a){var b,c,e,f=a.x,g=a.y,h=f-this.x0,i=g-this.y0,j=i/this.a,k=h/this.a,l=1,m=0,n=0,o=0;for(b=1;6>=b;b++)c=l*j-m*k,e=m*j+l*k,l=c,m=e,n=n+this.C_re[b]*l-this.C_im[b]*m,o=o+this.C_im[b]*l+this.C_re[b]*m;for(var p=0;p<this.iterations;p++){var q,r,s=n,t=o,u=j,v=k;for(b=2;6>=b;b++)q=s*n-t*o,r=t*n+s*o,s=q,t=r,u+=(b-1)*(this.B_re[b]*s-this.B_im[b]*t),v+=(b-1)*(this.B_im[b]*s+this.B_re[b]*t);s=1,t=0;var w=this.B_re[1],x=this.B_im[1];for(b=2;6>=b;b++)q=s*n-t*o,r=t*n+s*o,s=q,t=r,w+=b*(this.B_re[b]*s-this.B_im[b]*t),x+=b*(this.B_im[b]*s+this.B_re[b]*t);var y=w*w+x*x;n=(u*w+v*x)/y,o=(v*w-u*x)/y}var z=n,A=o,B=1,C=0;for(b=1;9>=b;b++)B*=z,C+=this.D[b]*B;var D=this.lat0+C*d*1e5,E=this.long0+A;return a.x=E,a.y=D,a},c.names=["New_Zealand_Map_Grid","nzmg"]},{}],57:[function(a,b,c){var d=a("../common/tsfnz"),e=a("../common/adjust_lon"),f=a("../common/phi2z"),g=Math.PI/2,h=Math.PI/4,i=1e-10;c.init=function(){this.no_off=this.no_off||!1,this.no_rot=this.no_rot||!1,isNaN(this.k0)&&(this.k0=1);var a=Math.sin(this.lat0),b=Math.cos(this.lat0),c=this.e*a;this.bl=Math.sqrt(1+this.es/(1-this.es)*Math.pow(b,4)),this.al=this.a*this.bl*this.k0*Math.sqrt(1-this.es)/(1-c*c);var f=d(this.e,this.lat0,a),g=this.bl/b*Math.sqrt((1-this.es)/(1-c*c));1>g*g&&(g=1);var h,i;if(isNaN(this.longc)){var j=d(this.e,this.lat1,Math.sin(this.lat1)),k=d(this.e,this.lat2,Math.sin(this.lat2));this.lat0>=0?this.el=(g+Math.sqrt(g*g-1))*Math.pow(f,this.bl):this.el=(g-Math.sqrt(g*g-1))*Math.pow(f,this.bl);var l=Math.pow(j,this.bl),m=Math.pow(k,this.bl);h=this.el/l,i=.5*(h-1/h);var n=(this.el*this.el-m*l)/(this.el*this.el+m*l),o=(m-l)/(m+l),p=e(this.long1-this.long2);this.long0=.5*(this.long1+this.long2)-Math.atan(n*Math.tan(.5*this.bl*p)/o)/this.bl,this.long0=e(this.long0);var q=e(this.long1-this.long0);this.gamma0=Math.atan(Math.sin(this.bl*q)/i),this.alpha=Math.asin(g*Math.sin(this.gamma0))}else h=this.lat0>=0?g+Math.sqrt(g*g-1):g-Math.sqrt(g*g-1),this.el=h*Math.pow(f,this.bl),i=.5*(h-1/h),this.gamma0=Math.asin(Math.sin(this.alpha)/g),this.long0=this.longc-Math.asin(i*Math.tan(this.gamma0))/this.bl;this.no_off?this.uc=0:this.lat0>=0?this.uc=this.al/this.bl*Math.atan2(Math.sqrt(g*g-1),Math.cos(this.alpha)):this.uc=-1*this.al/this.bl*Math.atan2(Math.sqrt(g*g-1),Math.cos(this.alpha))},c.forward=function(a){var b,c,f,j=a.x,k=a.y,l=e(j-this.long0);if(Math.abs(Math.abs(k)-g)<=i)f=k>0?-1:1,c=this.al/this.bl*Math.log(Math.tan(h+f*this.gamma0*.5)),b=-1*f*g*this.al/this.bl;else{var m=d(this.e,k,Math.sin(k)),n=this.el/Math.pow(m,this.bl),o=.5*(n-1/n),p=.5*(n+1/n),q=Math.sin(this.bl*l),r=(o*Math.sin(this.gamma0)-q*Math.cos(this.gamma0))/p;c=Math.abs(Math.abs(r)-1)<=i?Number.POSITIVE_INFINITY:.5*this.al*Math.log((1-r)/(1+r))/this.bl,b=Math.abs(Math.cos(this.bl*l))<=i?this.al*this.bl*l:this.al*Math.atan2(o*Math.cos(this.gamma0)+q*Math.sin(this.gamma0),Math.cos(this.bl*l))/this.bl}return this.no_rot?(a.x=this.x0+b,a.y=this.y0+c):(b-=this.uc,a.x=this.x0+c*Math.cos(this.alpha)+b*Math.sin(this.alpha),a.y=this.y0+b*Math.cos(this.alpha)-c*Math.sin(this.alpha)),a},c.inverse=function(a){var b,c;this.no_rot?(c=a.y-this.y0,b=a.x-this.x0):(c=(a.x-this.x0)*Math.cos(this.alpha)-(a.y-this.y0)*Math.sin(this.alpha),b=(a.y-this.y0)*Math.cos(this.alpha)+(a.x-this.x0)*Math.sin(this.alpha),b+=this.uc);var d=Math.exp(-1*this.bl*c/this.al),h=.5*(d-1/d),j=.5*(d+1/d),k=Math.sin(this.bl*b/this.al),l=(k*Math.cos(this.gamma0)+h*Math.sin(this.gamma0))/j,m=Math.pow(this.el/Math.sqrt((1+l)/(1-l)),1/this.bl);return Math.abs(l-1)<i?(a.x=this.long0,a.y=g):Math.abs(l+1)<i?(a.x=this.long0,a.y=-1*g):(a.y=f(this.e,m),a.x=e(this.long0-Math.atan2(h*Math.cos(this.gamma0)-k*Math.sin(this.gamma0),Math.cos(this.bl*b/this.al))/this.bl)),a},c.names=["Hotine_Oblique_Mercator","Hotine Oblique Mercator","Hotine_Oblique_Mercator_Azimuth_Natural_Origin","Hotine_Oblique_Mercator_Azimuth_Center","omerc"]},{"../common/adjust_lon":5,"../common/phi2z":16,"../common/tsfnz":24}],58:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/adjust_lon"),i=a("../common/adjust_lat"),j=a("../common/mlfn"),k=1e-10,l=a("../common/gN"),m=20;c.init=function(){this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.ml0=this.a*j(this.e0,this.e1,this.e2,this.e3,this.lat0)},c.forward=function(a){var b,c,d,e=a.x,f=a.y,g=h(e-this.long0);if(d=g*Math.sin(f),this.sphere)Math.abs(f)<=k?(b=this.a*g,c=-1*this.a*this.lat0):(b=this.a*Math.sin(d)/Math.tan(f),c=this.a*(i(f-this.lat0)+(1-Math.cos(d))/Math.tan(f)));else if(Math.abs(f)<=k)b=this.a*g,c=-1*this.ml0;else{var m=l(this.a,this.e,Math.sin(f))/Math.tan(f);b=m*Math.sin(d),c=this.a*j(this.e0,this.e1,this.e2,this.e3,f)-this.ml0+m*(1-Math.cos(d))}return a.x=b+this.x0,a.y=c+this.y0,a},c.inverse=function(a){var b,c,d,e,f,g,i,l,n;if(d=a.x-this.x0,e=a.y-this.y0,this.sphere)if(Math.abs(e+this.a*this.lat0)<=k)b=h(d/this.a+this.long0),c=0;else{g=this.lat0+e/this.a,i=d*d/this.a/this.a+g*g,l=g;var o;for(f=m;f;--f)if(o=Math.tan(l),n=-1*(g*(l*o+1)-l-.5*(l*l+i)*o)/((l-g)/o-1),l+=n,Math.abs(n)<=k){c=l;break}b=h(this.long0+Math.asin(d*Math.tan(l)/this.a)/Math.sin(c))}else if(Math.abs(e+this.ml0)<=k)c=0,b=h(this.long0+d/this.a);else{g=(this.ml0+e)/this.a,i=d*d/this.a/this.a+g*g,l=g;var p,q,r,s,t;for(f=m;f;--f)if(t=this.e*Math.sin(l),p=Math.sqrt(1-t*t)*Math.tan(l),q=this.a*j(this.e0,this.e1,this.e2,this.e3,l),r=this.e0-2*this.e1*Math.cos(2*l)+4*this.e2*Math.cos(4*l)-6*this.e3*Math.cos(6*l),s=q/this.a,n=(g*(p*s+1)-s-.5*p*(s*s+i))/(this.es*Math.sin(2*l)*(s*s+i-2*g*s)/(4*p)+(g-s)*(p*r-2/Math.sin(2*l))-r),l-=n,Math.abs(n)<=k){c=l;break}p=Math.sqrt(1-this.es*Math.pow(Math.sin(c),2))*Math.tan(c),b=h(this.long0+Math.asin(d*p/this.a)/Math.sin(c))}return a.x=b,a.y=c,a},c.names=["Polyconic","poly"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/mlfn":14}],59:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/adjust_lat"),f=a("../common/pj_enfn"),g=20,h=a("../common/pj_mlfn"),i=a("../common/pj_inv_mlfn"),j=Math.PI/2,k=1e-10,l=a("../common/asinz");c.init=function(){this.sphere?(this.n=1,this.m=0,this.es=0,this.C_y=Math.sqrt((this.m+1)/this.n),this.C_x=this.C_y/(this.m+1)):this.en=f(this.es)},c.forward=function(a){var b,c,e=a.x,f=a.y;if(e=d(e-this.long0),this.sphere){if(this.m)for(var i=this.n*Math.sin(f),j=g;j;--j){var l=(this.m*f+Math.sin(f)-i)/(this.m+Math.cos(f));if(f-=l,Math.abs(l)<k)break}else f=1!==this.n?Math.asin(this.n*Math.sin(f)):f;b=this.a*this.C_x*e*(this.m+Math.cos(f)),c=this.a*this.C_y*f}else{var m=Math.sin(f),n=Math.cos(f);c=this.a*h(f,m,n,this.en),b=this.a*e*n/Math.sqrt(1-this.es*m*m)}return a.x=b,a.y=c,a},c.inverse=function(a){var b,c,f,g;return a.x-=this.x0,f=a.x/this.a,a.y-=this.y0,b=a.y/this.a,this.sphere?(b/=this.C_y,f/=this.C_x*(this.m+Math.cos(b)),this.m?b=l((this.m*b+Math.sin(b))/this.n):1!==this.n&&(b=l(Math.sin(b)/this.n)),f=d(f+this.long0),b=e(b)):(b=i(a.y/this.a,this.es,this.en),g=Math.abs(b),j>g?(g=Math.sin(b),c=this.long0+a.x*Math.sqrt(1-this.es*g*g)/(this.a*Math.cos(b)),f=d(c)):j>g-k&&(f=this.long0)),a.x=f,a.y=b,a},c.names=["Sinusoidal","sinu"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/asinz":6,"../common/pj_enfn":17,"../common/pj_inv_mlfn":18,"../common/pj_mlfn":19}],60:[function(a,b,c){c.init=function(){var a=this.lat0;this.lambda0=this.long0;var b=Math.sin(a),c=this.a,d=this.rf,e=1/d,f=2*e-Math.pow(e,2),g=this.e=Math.sqrt(f);this.R=this.k0*c*Math.sqrt(1-f)/(1-f*Math.pow(b,2)),this.alpha=Math.sqrt(1+f/(1-f)*Math.pow(Math.cos(a),4)),this.b0=Math.asin(b/this.alpha);var h=Math.log(Math.tan(Math.PI/4+this.b0/2)),i=Math.log(Math.tan(Math.PI/4+a/2)),j=Math.log((1+g*b)/(1-g*b));this.K=h-this.alpha*i+this.alpha*g/2*j},c.forward=function(a){var b=Math.log(Math.tan(Math.PI/4-a.y/2)),c=this.e/2*Math.log((1+this.e*Math.sin(a.y))/(1-this.e*Math.sin(a.y))),d=-this.alpha*(b+c)+this.K,e=2*(Math.atan(Math.exp(d))-Math.PI/4),f=this.alpha*(a.x-this.lambda0),g=Math.atan(Math.sin(f)/(Math.sin(this.b0)*Math.tan(e)+Math.cos(this.b0)*Math.cos(f))),h=Math.asin(Math.cos(this.b0)*Math.sin(e)-Math.sin(this.b0)*Math.cos(e)*Math.cos(f));return a.y=this.R/2*Math.log((1+Math.sin(h))/(1-Math.sin(h)))+this.y0,a.x=this.R*g+this.x0,a},c.inverse=function(a){for(var b=a.x-this.x0,c=a.y-this.y0,d=b/this.R,e=2*(Math.atan(Math.exp(c/this.R))-Math.PI/4),f=Math.asin(Math.cos(this.b0)*Math.sin(e)+Math.sin(this.b0)*Math.cos(e)*Math.cos(d)),g=Math.atan(Math.sin(d)/(Math.cos(this.b0)*Math.cos(d)-Math.sin(this.b0)*Math.tan(e))),h=this.lambda0+g/this.alpha,i=0,j=f,k=-1e3,l=0;Math.abs(j-k)>1e-7;){if(++l>20)return;i=1/this.alpha*(Math.log(Math.tan(Math.PI/4+f/2))-this.K)+this.e*Math.log(Math.tan(Math.PI/4+Math.asin(this.e*Math.sin(j))/2)),k=j,j=2*Math.atan(Math.exp(i))-Math.PI/2}return a.x=h,a.y=j,a},c.names=["somerc"]},{}],61:[function(a,b,c){var d=Math.PI/2,e=1e-10,f=a("../common/sign"),g=a("../common/msfnz"),h=a("../common/tsfnz"),i=a("../common/phi2z"),j=a("../common/adjust_lon");c.ssfn_=function(a,b,c){return b*=c,Math.tan(.5*(d+a))*Math.pow((1-b)/(1+b),.5*c)},c.init=function(){this.coslat0=Math.cos(this.lat0),this.sinlat0=Math.sin(this.lat0),this.sphere?1===this.k0&&!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=e&&(this.k0=.5*(1+f(this.lat0)*Math.sin(this.lat_ts))):(Math.abs(this.coslat0)<=e&&(this.lat0>0?this.con=1:this.con=-1),this.cons=Math.sqrt(Math.pow(1+this.e,1+this.e)*Math.pow(1-this.e,1-this.e)),1===this.k0&&!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=e&&(this.k0=.5*this.cons*g(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts))/h(this.e,this.con*this.lat_ts,this.con*Math.sin(this.lat_ts))),this.ms1=g(this.e,this.sinlat0,this.coslat0),this.X0=2*Math.atan(this.ssfn_(this.lat0,this.sinlat0,this.e))-d,this.cosX0=Math.cos(this.X0),this.sinX0=Math.sin(this.X0))},c.forward=function(a){var b,c,f,g,i,k,l=a.x,m=a.y,n=Math.sin(m),o=Math.cos(m),p=j(l-this.long0);return Math.abs(Math.abs(l-this.long0)-Math.PI)<=e&&Math.abs(m+this.lat0)<=e?(a.x=NaN,a.y=NaN,a):this.sphere?(b=2*this.k0/(1+this.sinlat0*n+this.coslat0*o*Math.cos(p)),a.x=this.a*b*o*Math.sin(p)+this.x0,a.y=this.a*b*(this.coslat0*n-this.sinlat0*o*Math.cos(p))+this.y0,a):(c=2*Math.atan(this.ssfn_(m,n,this.e))-d,g=Math.cos(c),f=Math.sin(c),Math.abs(this.coslat0)<=e?(i=h(this.e,m*this.con,this.con*n),k=2*this.a*this.k0*i/this.cons,a.x=this.x0+k*Math.sin(l-this.long0),a.y=this.y0-this.con*k*Math.cos(l-this.long0),a):(Math.abs(this.sinlat0)<e?(b=2*this.a*this.k0/(1+g*Math.cos(p)),a.y=b*f):(b=2*this.a*this.k0*this.ms1/(this.cosX0*(1+this.sinX0*f+this.cosX0*g*Math.cos(p))),a.y=b*(this.cosX0*f-this.sinX0*g*Math.cos(p))+this.y0),a.x=b*g*Math.sin(p)+this.x0,a))},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,f,g,h,k=Math.sqrt(a.x*a.x+a.y*a.y);if(this.sphere){var l=2*Math.atan(k/(.5*this.a*this.k0));return b=this.long0,c=this.lat0,e>=k?(a.x=b,a.y=c,a):(c=Math.asin(Math.cos(l)*this.sinlat0+a.y*Math.sin(l)*this.coslat0/k),b=j(Math.abs(this.coslat0)<e?this.lat0>0?this.long0+Math.atan2(a.x,-1*a.y):this.long0+Math.atan2(a.x,a.y):this.long0+Math.atan2(a.x*Math.sin(l),k*this.coslat0*Math.cos(l)-a.y*this.sinlat0*Math.sin(l))),a.x=b,a.y=c,a)}if(Math.abs(this.coslat0)<=e){if(e>=k)return c=this.lat0,b=this.long0,a.x=b,a.y=c,a;a.x*=this.con,a.y*=this.con,f=k*this.cons/(2*this.a*this.k0),c=this.con*i(this.e,f),b=this.con*j(this.con*this.long0+Math.atan2(a.x,-1*a.y))}else g=2*Math.atan(k*this.cosX0/(2*this.a*this.k0*this.ms1)),b=this.long0,e>=k?h=this.X0:(h=Math.asin(Math.cos(g)*this.sinX0+a.y*Math.sin(g)*this.cosX0/k),b=j(this.long0+Math.atan2(a.x*Math.sin(g),k*this.cosX0*Math.cos(g)-a.y*this.sinX0*Math.sin(g)))),c=-1*i(this.e,Math.tan(.5*(d+h)));return a.x=b,a.y=c,a},c.names=["stere","Stereographic_South_Pole","Polar Stereographic (variant B)"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/sign":21,"../common/tsfnz":24}],62:[function(a,b,c){var d=a("./gauss"),e=a("../common/adjust_lon");c.init=function(){d.init.apply(this),this.rc&&(this.sinc0=Math.sin(this.phic0),this.cosc0=Math.cos(this.phic0),this.R2=2*this.rc,this.title||(this.title="Oblique Stereographic Alternative"))},c.forward=function(a){var b,c,f,g;return a.x=e(a.x-this.long0),d.forward.apply(this,[a]),b=Math.sin(a.y),c=Math.cos(a.y),f=Math.cos(a.x),g=this.k0*this.R2/(1+this.sinc0*b+this.cosc0*c*f),a.x=g*c*Math.sin(a.x),a.y=g*(this.cosc0*b-this.sinc0*c*f),a.x=this.a*a.x+this.x0,a.y=this.a*a.y+this.y0,a},c.inverse=function(a){var b,c,f,g,h;if(a.x=(a.x-this.x0)/this.a,a.y=(a.y-this.y0)/this.a,a.x/=this.k0,a.y/=this.k0,h=Math.sqrt(a.x*a.x+a.y*a.y)){var i=2*Math.atan2(h,this.R2);b=Math.sin(i),c=Math.cos(i),g=Math.asin(c*this.sinc0+a.y*b*this.cosc0/h),f=Math.atan2(a.x*b,h*this.cosc0*c-a.y*this.sinc0*b)}else g=this.phic0,f=0;return a.x=f,a.y=g,d.inverse.apply(this,[a]),a.x=e(a.x+this.long0),a},c.names=["Stereographic_North_Pole","Oblique_Stereographic","Polar_Stereographic","sterea","Oblique Stereographic Alternative"]},{"../common/adjust_lon":5,"./gauss":46}],63:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/mlfn"),i=a("../common/adjust_lon"),j=Math.PI/2,k=1e-10,l=a("../common/sign"),m=a("../common/asinz");c.init=function(){this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.ml0=this.a*h(this.e0,this.e1,this.e2,this.e3,this.lat0)},c.forward=function(a){var b,c,d,e=a.x,f=a.y,g=i(e-this.long0),j=Math.sin(f),k=Math.cos(f);if(this.sphere){var l=k*Math.sin(g);if(Math.abs(Math.abs(l)-1)<1e-10)return 93;c=.5*this.a*this.k0*Math.log((1+l)/(1-l)),b=Math.acos(k*Math.cos(g)/Math.sqrt(1-l*l)),0>f&&(b=-b),d=this.a*this.k0*(b-this.lat0)}else{var m=k*g,n=Math.pow(m,2),o=this.ep2*Math.pow(k,2),p=Math.tan(f),q=Math.pow(p,2);b=1-this.es*Math.pow(j,2);var r=this.a/Math.sqrt(b),s=this.a*h(this.e0,this.e1,this.e2,this.e3,f);c=this.k0*r*m*(1+n/6*(1-q+o+n/20*(5-18*q+Math.pow(q,2)+72*o-58*this.ep2)))+this.x0,d=this.k0*(s-this.ml0+r*p*(n*(.5+n/24*(5-q+9*o+4*Math.pow(o,2)+n/30*(61-58*q+Math.pow(q,2)+600*o-330*this.ep2)))))+this.y0}return a.x=c,a.y=d,a},c.inverse=function(a){var b,c,d,e,f,g,h=6;if(this.sphere){var n=Math.exp(a.x/(this.a*this.k0)),o=.5*(n-1/n),p=this.lat0+a.y/(this.a*this.k0),q=Math.cos(p);b=Math.sqrt((1-q*q)/(1+o*o)),f=m(b),0>p&&(f=-f),g=0===o&&0===q?this.long0:i(Math.atan2(o,q)+this.long0)}else{var r=a.x-this.x0,s=a.y-this.y0;for(b=(this.ml0+s/this.k0)/this.a,c=b,e=0;!0&&(d=(b+this.e1*Math.sin(2*c)-this.e2*Math.sin(4*c)+this.e3*Math.sin(6*c))/this.e0-c,c+=d,!(Math.abs(d)<=k));e++)if(e>=h)return 95;if(Math.abs(c)<j){var t=Math.sin(c),u=Math.cos(c),v=Math.tan(c),w=this.ep2*Math.pow(u,2),x=Math.pow(w,2),y=Math.pow(v,2),z=Math.pow(y,2);b=1-this.es*Math.pow(t,2);var A=this.a/Math.sqrt(b),B=A*(1-this.es)/b,C=r/(A*this.k0),D=Math.pow(C,2);f=c-A*v*D/B*(.5-D/24*(5+3*y+10*w-4*x-9*this.ep2-D/30*(61+90*y+298*w+45*z-252*this.ep2-3*x))),g=i(this.long0+C*(1-D/6*(1+2*y+w-D/20*(5-2*w+28*y-3*x+8*this.ep2+24*z)))/u)}else f=j*l(s),g=this.long0}return a.x=g,a.y=f,a},c.names=["Transverse_Mercator","Transverse Mercator","tmerc"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/mlfn":14,"../common/sign":21}],64:[function(a,b,c){var d=.017453292519943295,e=a("./tmerc");c.dependsOn="tmerc",c.init=function(){this.zone&&(this.lat0=0,this.long0=(6*Math.abs(this.zone)-183)*d,this.x0=5e5,this.y0=this.utmSouth?1e7:0,this.k0=.9996,e.init.apply(this),this.forward=e.forward,this.inverse=e.inverse)},c.names=["Universal Transverse Mercator System","utm"]},{"./tmerc":63}],65:[function(a,b,c){var d=a("../common/adjust_lon"),e=Math.PI/2,f=1e-10,g=a("../common/asinz");c.init=function(){this.R=this.a},c.forward=function(a){var b,c,h=a.x,i=a.y,j=d(h-this.long0);Math.abs(i)<=f&&(b=this.x0+this.R*j,c=this.y0);var k=g(2*Math.abs(i/Math.PI));(Math.abs(j)<=f||Math.abs(Math.abs(i)-e)<=f)&&(b=this.x0,c=i>=0?this.y0+Math.PI*this.R*Math.tan(.5*k):this.y0+Math.PI*this.R*-Math.tan(.5*k));var l=.5*Math.abs(Math.PI/j-j/Math.PI),m=l*l,n=Math.sin(k),o=Math.cos(k),p=o/(n+o-1),q=p*p,r=p*(2/n-1),s=r*r,t=Math.PI*this.R*(l*(p-s)+Math.sqrt(m*(p-s)*(p-s)-(s+m)*(q-s)))/(s+m);0>j&&(t=-t),b=this.x0+t;var u=m+p;return t=Math.PI*this.R*(r*u-l*Math.sqrt((s+m)*(m+1)-u*u))/(s+m),c=i>=0?this.y0+t:this.y0-t,a.x=b,a.y=c,a},c.inverse=function(a){var b,c,e,g,h,i,j,k,l,m,n,o,p;return a.x-=this.x0,a.y-=this.y0,n=Math.PI*this.R,e=a.x/n,g=a.y/n,h=e*e+g*g,i=-Math.abs(g)*(1+h),j=i-2*g*g+e*e,k=-2*i+1+2*g*g+h*h,p=g*g/k+(2*j*j*j/k/k/k-9*i*j/k/k)/27,l=(i-j*j/3/k)/k,m=2*Math.sqrt(-l/3),n=3*p/l/m,Math.abs(n)>1&&(n=n>=0?1:-1),o=Math.acos(n)/3,c=a.y>=0?(-m*Math.cos(o+Math.PI/3)-j/3/k)*Math.PI:-(-m*Math.cos(o+Math.PI/3)-j/3/k)*Math.PI,b=Math.abs(e)<f?this.long0:d(this.long0+Math.PI*(h-1+Math.sqrt(1+2*(e*e-g*g)+h*h))/2/e),a.x=b,a.y=c,a},c.names=["Van_der_Grinten_I","VanDerGrinten","vandg"]},{"../common/adjust_lon":5,"../common/asinz":6}],66:[function(a,b,c){var d=.017453292519943295,e=57.29577951308232,f=1,g=2,h=a("./datum_transform"),i=a("./adjust_axis"),j=a("./Proj"),k=a("./common/toPoint");b.exports=function l(a,b,c){function m(a,b){return(a.datum.datum_type===f||a.datum.datum_type===g)&&"WGS84"!==b.datumCode}var n;return Array.isArray(c)&&(c=k(c)),a.datum&&b.datum&&(m(a,b)||m(b,a))&&(n=new j("WGS84"),l(a,n,c),a=n),"enu"!==a.axis&&i(a,!1,c),"longlat"===a.projName?(c.x*=d,c.y*=d):a.isGeocent?(a.to_meter&&(c.x*=a.to_meter,c.y*=a.to_meter,c.z*=a.to_meter),b.datum.geocentric_to_geodetic_noniter(c)):(a.to_meter&&(c.x*=a.to_meter,c.y*=a.to_meter),a.inverse(c)),a.from_greenwich&&(c.x+=a.from_greenwich),c=h(a.datum,b.datum,c),b.from_greenwich&&(c.x-=b.from_greenwich),"longlat"===b.projName?(c.x*=e,c.y*=e):b.isGeocent?(b.datum.geodetic_to_geocentric(c),b.to_meter&&(c.x/=b.to_meter,c.y/=b.to_meter,c.z/=b.to_meter)):(b.forward(c),b.to_meter&&(c.x/=b.to_meter,c.y/=b.to_meter)),"enu"!==b.axis&&i(b,!0,c),c}},{"./Proj":2,"./adjust_axis":3,"./common/toPoint":23,"./datum_transform":31}],67:[function(a,b,c){function d(a,b,c){a[b]=c.map(function(a){var b={};return e(a,b),b}).reduce(function(a,b){return j(a,b)},{})}function e(a,b){var c;return Array.isArray(a)?(c=a.shift(),"PARAMETER"===c&&(c=a.shift()),1===a.length?Array.isArray(a[0])?(b[c]={},e(a[0],b[c])):b[c]=a[0]:a.length?"TOWGS84"===c?b[c]=a:(b[c]={},["UNIT","PRIMEM","VERT_DATUM"].indexOf(c)>-1?(b[c]={name:a[0].toLowerCase(),convert:a[1]},3===a.length&&(b[c].auth=a[2])):"SPHEROID"===c?(b[c]={name:a[0],a:a[1],rf:a[2]},4===a.length&&(b[c].auth=a[3])):["GEOGCS","GEOCCS","DATUM","VERT_CS","COMPD_CS","LOCAL_CS","FITTED_CS","LOCAL_DATUM"].indexOf(c)>-1?(a[0]=["name",a[0]],d(b,c,a)):a.every(function(a){return Array.isArray(a)})?d(b,c,a):e(a,b[c])):b[c]=!0,
void 0):void(b[a]=!0)}function f(a,b){var c=b[0],d=b[1];!(c in a)&&d in a&&(a[c]=a[d],3===b.length&&(a[c]=b[2](a[c])))}function g(a){return a*i}function h(a){function b(b){var c=a.to_meter||1;return parseFloat(b,10)*c}"GEOGCS"===a.type?a.projName="longlat":"LOCAL_CS"===a.type?(a.projName="identity",a.local=!0):"object"==typeof a.PROJECTION?a.projName=Object.keys(a.PROJECTION)[0]:a.projName=a.PROJECTION,a.UNIT&&(a.units=a.UNIT.name.toLowerCase(),"metre"===a.units&&(a.units="meter"),a.UNIT.convert&&(a.to_meter=parseFloat(a.UNIT.convert,10))),a.GEOGCS&&(a.GEOGCS.DATUM?a.datumCode=a.GEOGCS.DATUM.name.toLowerCase():a.datumCode=a.GEOGCS.name.toLowerCase(),"d_"===a.datumCode.slice(0,2)&&(a.datumCode=a.datumCode.slice(2)),("new_zealand_geodetic_datum_1949"===a.datumCode||"new_zealand_1949"===a.datumCode)&&(a.datumCode="nzgd49"),"wgs_1984"===a.datumCode&&("Mercator_Auxiliary_Sphere"===a.PROJECTION&&(a.sphere=!0),a.datumCode="wgs84"),"_ferro"===a.datumCode.slice(-6)&&(a.datumCode=a.datumCode.slice(0,-6)),"_jakarta"===a.datumCode.slice(-8)&&(a.datumCode=a.datumCode.slice(0,-8)),~a.datumCode.indexOf("belge")&&(a.datumCode="rnb72"),a.GEOGCS.DATUM&&a.GEOGCS.DATUM.SPHEROID&&(a.ellps=a.GEOGCS.DATUM.SPHEROID.name.replace("_19","").replace(/[Cc]larke\_18/,"clrk"),"international"===a.ellps.toLowerCase().slice(0,13)&&(a.ellps="intl"),a.a=a.GEOGCS.DATUM.SPHEROID.a,a.rf=parseFloat(a.GEOGCS.DATUM.SPHEROID.rf,10)),~a.datumCode.indexOf("osgb_1936")&&(a.datumCode="osgb36")),a.b&&!isFinite(a.b)&&(a.b=a.a);var c=function(b){return f(a,b)},d=[["standard_parallel_1","Standard_Parallel_1"],["standard_parallel_2","Standard_Parallel_2"],["false_easting","False_Easting"],["false_northing","False_Northing"],["central_meridian","Central_Meridian"],["latitude_of_origin","Latitude_Of_Origin"],["latitude_of_origin","Central_Parallel"],["scale_factor","Scale_Factor"],["k0","scale_factor"],["latitude_of_center","Latitude_of_center"],["lat0","latitude_of_center",g],["longitude_of_center","Longitude_Of_Center"],["longc","longitude_of_center",g],["x0","false_easting",b],["y0","false_northing",b],["long0","central_meridian",g],["lat0","latitude_of_origin",g],["lat0","standard_parallel_1",g],["lat1","standard_parallel_1",g],["lat2","standard_parallel_2",g],["alpha","azimuth",g],["srsCode","name"]];d.forEach(c),a.long0||!a.longc||"Albers_Conic_Equal_Area"!==a.projName&&"Lambert_Azimuthal_Equal_Area"!==a.projName||(a.long0=a.longc),a.lat_ts||!a.lat1||"Stereographic_South_Pole"!==a.projName&&"Polar Stereographic (variant B)"!==a.projName||(a.lat0=g(a.lat1>0?90:-90),a.lat_ts=a.lat1)}var i=.017453292519943295,j=a("./extend");b.exports=function(a,b){var c=JSON.parse((","+a).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g,',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g,',"$1"]').replace(/,\["VERTCS".+/,"")),d=c.shift(),f=c.shift();c.unshift(["name",f]),c.unshift(["type",d]),c.unshift("output");var g={};return e(c,g),h(g.output),j(b,g.output)}},{"./extend":34}],68:[function(a,b,c){function d(a){return a*(Math.PI/180)}function e(a){return 180*(a/Math.PI)}function f(a){var b,c,e,f,g,i,j,k,l,m=a.lat,n=a.lon,o=6378137,p=.00669438,q=.9996,r=d(m),s=d(n);l=Math.floor((n+180)/6)+1,180===n&&(l=60),m>=56&&64>m&&n>=3&&12>n&&(l=32),m>=72&&84>m&&(n>=0&&9>n?l=31:n>=9&&21>n?l=33:n>=21&&33>n?l=35:n>=33&&42>n&&(l=37)),b=6*(l-1)-180+3,k=d(b),c=p/(1-p),e=o/Math.sqrt(1-p*Math.sin(r)*Math.sin(r)),f=Math.tan(r)*Math.tan(r),g=c*Math.cos(r)*Math.cos(r),i=Math.cos(r)*(s-k),j=o*((1-p/4-3*p*p/64-5*p*p*p/256)*r-(3*p/8+3*p*p/32+45*p*p*p/1024)*Math.sin(2*r)+(15*p*p/256+45*p*p*p/1024)*Math.sin(4*r)-35*p*p*p/3072*Math.sin(6*r));var t=q*e*(i+(1-f+g)*i*i*i/6+(5-18*f+f*f+72*g-58*c)*i*i*i*i*i/120)+5e5,u=q*(j+e*Math.tan(r)*(i*i/2+(5-f+9*g+4*g*g)*i*i*i*i/24+(61-58*f+f*f+600*g-330*c)*i*i*i*i*i*i/720));return 0>m&&(u+=1e7),{northing:Math.round(u),easting:Math.round(t),zoneNumber:l,zoneLetter:h(m)}}function g(a){var b=a.northing,c=a.easting,d=a.zoneLetter,f=a.zoneNumber;if(0>f||f>60)return null;var h,i,j,k,l,m,n,o,p,q,r=.9996,s=6378137,t=.00669438,u=(1-Math.sqrt(1-t))/(1+Math.sqrt(1-t)),v=c-5e5,w=b;"N">d&&(w-=1e7),o=6*(f-1)-180+3,h=t/(1-t),n=w/r,p=n/(s*(1-t/4-3*t*t/64-5*t*t*t/256)),q=p+(3*u/2-27*u*u*u/32)*Math.sin(2*p)+(21*u*u/16-55*u*u*u*u/32)*Math.sin(4*p)+151*u*u*u/96*Math.sin(6*p),i=s/Math.sqrt(1-t*Math.sin(q)*Math.sin(q)),j=Math.tan(q)*Math.tan(q),k=h*Math.cos(q)*Math.cos(q),l=s*(1-t)/Math.pow(1-t*Math.sin(q)*Math.sin(q),1.5),m=v/(i*r);var x=q-i*Math.tan(q)/l*(m*m/2-(5+3*j+10*k-4*k*k-9*h)*m*m*m*m/24+(61+90*j+298*k+45*j*j-252*h-3*k*k)*m*m*m*m*m*m/720);x=e(x);var y=(m-(1+2*j+k)*m*m*m/6+(5-2*k+28*j-3*k*k+8*h+24*j*j)*m*m*m*m*m/120)/Math.cos(q);y=o+e(y);var z;if(a.accuracy){var A=g({northing:a.northing+a.accuracy,easting:a.easting+a.accuracy,zoneLetter:a.zoneLetter,zoneNumber:a.zoneNumber});z={top:A.lat,right:A.lon,bottom:x,left:y}}else z={lat:x,lon:y};return z}function h(a){var b="Z";return 84>=a&&a>=72?b="X":72>a&&a>=64?b="W":64>a&&a>=56?b="V":56>a&&a>=48?b="U":48>a&&a>=40?b="T":40>a&&a>=32?b="S":32>a&&a>=24?b="R":24>a&&a>=16?b="Q":16>a&&a>=8?b="P":8>a&&a>=0?b="N":0>a&&a>=-8?b="M":-8>a&&a>=-16?b="L":-16>a&&a>=-24?b="K":-24>a&&a>=-32?b="J":-32>a&&a>=-40?b="H":-40>a&&a>=-48?b="G":-48>a&&a>=-56?b="F":-56>a&&a>=-64?b="E":-64>a&&a>=-72?b="D":-72>a&&a>=-80&&(b="C"),b}function i(a,b){var c=""+a.easting,d=""+a.northing;return a.zoneNumber+a.zoneLetter+j(a.easting,a.northing,a.zoneNumber)+c.substr(c.length-5,b)+d.substr(d.length-5,b)}function j(a,b,c){var d=k(c),e=Math.floor(a/1e5),f=Math.floor(b/1e5)%20;return l(e,f,d)}function k(a){var b=a%q;return 0===b&&(b=q),b}function l(a,b,c){var d=c-1,e=r.charCodeAt(d),f=s.charCodeAt(d),g=e+a-1,h=f+b,i=!1;g>x&&(g=g-x+t-1,i=!0),(g===u||u>e&&g>u||(g>u||u>e)&&i)&&g++,(g===v||v>e&&g>v||(g>v||v>e)&&i)&&(g++,g===u&&g++),g>x&&(g=g-x+t-1),h>w?(h=h-w+t-1,i=!0):i=!1,(h===u||u>f&&h>u||(h>u||u>f)&&i)&&h++,(h===v||v>f&&h>v||(h>v||v>f)&&i)&&(h++,h===u&&h++),h>w&&(h=h-w+t-1);var j=String.fromCharCode(g)+String.fromCharCode(h);return j}function m(a){if(a&&0===a.length)throw"MGRSPoint coverting from nothing";for(var b,c=a.length,d=null,e="",f=0;!/[A-Z]/.test(b=a.charAt(f));){if(f>=2)throw"MGRSPoint bad conversion from: "+a;e+=b,f++}var g=parseInt(e,10);if(0===f||f+3>c)throw"MGRSPoint bad conversion from: "+a;var h=a.charAt(f++);if("A">=h||"B"===h||"Y"===h||h>="Z"||"I"===h||"O"===h)throw"MGRSPoint zone letter "+h+" not handled: "+a;d=a.substring(f,f+=2);for(var i=k(g),j=n(d.charAt(0),i),l=o(d.charAt(1),i);l<p(h);)l+=2e6;var m=c-f;if(m%2!==0)throw"MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters"+a;var q,r,s,t,u,v=m/2,w=0,x=0;return v>0&&(q=1e5/Math.pow(10,v),r=a.substring(f,f+v),w=parseFloat(r)*q,s=a.substring(f+v),x=parseFloat(s)*q),t=w+j,u=x+l,{easting:t,northing:u,zoneLetter:h,zoneNumber:g,accuracy:q}}function n(a,b){for(var c=r.charCodeAt(b-1),d=1e5,e=!1;c!==a.charCodeAt(0);){if(c++,c===u&&c++,c===v&&c++,c>x){if(e)throw"Bad character: "+a;c=t,e=!0}d+=1e5}return d}function o(a,b){if(a>"V")throw"MGRSPoint given invalid Northing "+a;for(var c=s.charCodeAt(b-1),d=0,e=!1;c!==a.charCodeAt(0);){if(c++,c===u&&c++,c===v&&c++,c>w){if(e)throw"Bad character: "+a;c=t,e=!0}d+=1e5}return d}function p(a){var b;switch(a){case"C":b=11e5;break;case"D":b=2e6;break;case"E":b=28e5;break;case"F":b=37e5;break;case"G":b=46e5;break;case"H":b=55e5;break;case"J":b=64e5;break;case"K":b=73e5;break;case"L":b=82e5;break;case"M":b=91e5;break;case"N":b=0;break;case"P":b=8e5;break;case"Q":b=17e5;break;case"R":b=26e5;break;case"S":b=35e5;break;case"T":b=44e5;break;case"U":b=53e5;break;case"V":b=62e5;break;case"W":b=7e6;break;case"X":b=79e5;break;default:b=-1}if(b>=0)return b;throw"Invalid zone letter: "+a}var q=6,r="AJSAJS",s="AFAFAF",t=65,u=73,v=79,w=86,x=90;c.forward=function(a,b){return b=b||5,i(f({lat:a[1],lon:a[0]}),b)},c.inverse=function(a){var b=g(m(a.toUpperCase()));return[b.left,b.bottom,b.right,b.top]},c.toPoint=function(a){var b=c.inverse(a);return[(b[2]+b[0])/2,(b[3]+b[1])/2]}},{}],69:[function(a,b,c){b.exports={name:"_mproj4_",version:"2.3.7-alpha",description:"Proj4js is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations.",main:"lib/index.js",directories:{test:"test",doc:"docs"},scripts:{test:"./node_modules/istanbul/lib/cli.js test ./node_modules/mocha/bin/_mocha test/test.js"},repository:{type:"git",url:"git://github.com/_mproj4_js/_mproj4_js.git"},author:"",license:"MIT",jam:{main:"dist/_mproj4_.js",include:["dist/_mproj4_.js","README.md","AUTHORS","LICENSE.md"]},devDependencies:{"grunt-cli":"~0.1.13",grunt:"~0.4.2","grunt-contrib-connect":"~0.6.0","grunt-contrib-jshint":"~0.8.0",chai:"~1.8.1",mocha:"~1.17.1","grunt-mocha-phantomjs":"~0.4.0",browserify:"~3.24.5","grunt-browserify":"~1.3.0","grunt-contrib-uglify":"~0.3.2",curl:"git://github.com/cujojs/curl.git",istanbul:"~0.2.4",tin:"~0.4.0"},dependencies:{mgrs:"0.0.0"}}},{}],"./includedProjections":[function(a,b,c){b.exports=a("Pk/iAZ")},{}],"Pk/iAZ":[function(a,b,c){var d=[a("./lib/projections/tmerc"),a("./lib/projections/utm"),a("./lib/projections/sterea"),a("./lib/projections/stere"),a("./lib/projections/somerc"),a("./lib/projections/omerc"),a("./lib/projections/lcc"),a("./lib/projections/krovak"),a("./lib/projections/cass"),a("./lib/projections/laea"),a("./lib/projections/aea"),a("./lib/projections/gnom"),a("./lib/projections/cea"),a("./lib/projections/eqc"),a("./lib/projections/poly"),a("./lib/projections/nzmg"),a("./lib/projections/mill"),a("./lib/projections/sinu"),a("./lib/projections/moll"),a("./lib/projections/eqdc"),a("./lib/projections/vandg"),a("./lib/projections/aeqd"),a("./lib/projections/geocent")];b.exports=function(_mproj4_){d.forEach(function(a){_mproj4_.Proj.projections.add(a)})}},{"./lib/projections/aea":40,"./lib/projections/aeqd":41,"./lib/projections/cass":42,"./lib/projections/cea":43,"./lib/projections/eqc":44,"./lib/projections/eqdc":45,"./lib/projections/geocent":47,"./lib/projections/gnom":48,"./lib/projections/krovak":49,"./lib/projections/laea":50,"./lib/projections/lcc":51,"./lib/projections/mill":54,"./lib/projections/moll":55,"./lib/projections/nzmg":56,"./lib/projections/omerc":57,"./lib/projections/poly":58,"./lib/projections/sinu":59,"./lib/projections/somerc":60,"./lib/projections/stere":61,"./lib/projections/sterea":62,"./lib/projections/tmerc":63,"./lib/projections/utm":64,"./lib/projections/vandg":65}]},{},[36])(36)});/** @define {boolean} */
var Melown_MERGE = false;

/** @define {boolean} */
var SEZNAMCZ = false;

var Melown = {};

//prevent minification
window["Melown"] = Melown;!function(a){if("object"==typeof exports)module.exports=a();else if("function"==typeof define&&define.amd)define(a);else{var b;"undefined"!=typeof window?b=window:"undefined"!=typeof global?b=global:"undefined"!=typeof self&&(b=self),b._mproj4_=a()}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var j=c[g]={exports:{}};b[g][0].call(j.exports,function(a){var c=b[g][1][a];return e(c?c:a)},j,j.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){function Point(a,b,c){if(!(this instanceof Point))return new Point(a,b,c);if(Array.isArray(a))this.x=a[0],this.y=a[1],this.z=a[2]||0;else if("object"==typeof a)this.x=a.x,this.y=a.y,this.z=a.z||0;else if("string"==typeof a&&"undefined"==typeof b){var d=a.split(",");this.x=parseFloat(d[0],10),this.y=parseFloat(d[1],10),this.z=parseFloat(d[2],10)||0}else this.x=a,this.y=b,this.z=c||0;console.warn("_mproj4_.Point will be removed in version 3, use _mproj4_.toPoint")}var d=a("mgrs");Point.fromMGRS=function(a){return new Point(d.toPoint(a))},Point.prototype.toMGRS=function(a){return d.forward([this.x,this.y],a)},b.exports=Point},{mgrs:68}],2:[function(a,b,c){function Projection(a,b){if(!(this instanceof Projection))return new Projection(a);b=b||function(a){if(a)throw a};var c=d(a);if("object"!=typeof c)return void b(a);var f=g(c),h=Projection.projections.get(f.projName);h?(e(this,f),e(this,h),this.init(),b(null,this)):b(a)}var d=a("./parseCode"),e=a("./extend"),f=a("./projections"),g=a("./deriveConstants");Projection.projections=f,Projection.projections.start(),b.exports=Projection},{"./deriveConstants":33,"./extend":34,"./parseCode":37,"./projections":39}],3:[function(a,b,c){b.exports=function(a,b,c){var d,e,f,g=c.x,h=c.y,i=c.z||0;for(f=0;3>f;f++)if(!b||2!==f||void 0!==c.z)switch(0===f?(d=g,e="x"):1===f?(d=h,e="y"):(d=i,e="z"),a.axis[f]){case"e":c[e]=d;break;case"w":c[e]=-d;break;case"n":c[e]=d;break;case"s":c[e]=-d;break;case"u":void 0!==c[e]&&(c.z=d);break;case"d":void 0!==c[e]&&(c.z=-d);break;default:return null}return c}},{}],4:[function(a,b,c){var d=Math.PI/2,e=a("./sign");b.exports=function(a){return Math.abs(a)<d?a:a-e(a)*Math.PI}},{"./sign":21}],5:[function(a,b,c){var d=2*Math.PI,e=3.14159265359,f=a("./sign");b.exports=function(a){return Math.abs(a)<=e?a:a-f(a)*d}},{"./sign":21}],6:[function(a,b,c){b.exports=function(a){return Math.abs(a)>1&&(a=a>1?1:-1),Math.asin(a)}},{}],7:[function(a,b,c){b.exports=function(a){return 1-.25*a*(1+a/16*(3+1.25*a))}},{}],8:[function(a,b,c){b.exports=function(a){return.375*a*(1+.25*a*(1+.46875*a))}},{}],9:[function(a,b,c){b.exports=function(a){return.05859375*a*a*(1+.75*a)}},{}],10:[function(a,b,c){b.exports=function(a){return a*a*a*(35/3072)}},{}],11:[function(a,b,c){b.exports=function(a,b,c){var d=b*c;return a/Math.sqrt(1-d*d)}},{}],12:[function(a,b,c){b.exports=function(a,b,c,d,e){var f,g;f=a/b;for(var h=0;15>h;h++)if(g=(a-(b*f-c*Math.sin(2*f)+d*Math.sin(4*f)-e*Math.sin(6*f)))/(b-2*c*Math.cos(2*f)+4*d*Math.cos(4*f)-6*e*Math.cos(6*f)),f+=g,Math.abs(g)<=1e-10)return f;return NaN}},{}],13:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b){var c=1-(1-a*a)/(2*a)*Math.log((1-a)/(1+a));if(Math.abs(Math.abs(b)-c)<1e-6)return 0>b?-1*d:d;for(var e,f,g,h,i=Math.asin(.5*b),j=0;30>j;j++)if(f=Math.sin(i),g=Math.cos(i),h=a*f,e=Math.pow(1-h*h,2)/(2*g)*(b/(1-a*a)-f/(1-h*h)+.5/a*Math.log((1-h)/(1+h))),i+=e,Math.abs(e)<=1e-10)return i;return NaN}},{}],14:[function(a,b,c){b.exports=function(a,b,c,d,e){return a*e-b*Math.sin(2*e)+c*Math.sin(4*e)-d*Math.sin(6*e)}},{}],15:[function(a,b,c){b.exports=function(a,b,c){var d=a*b;return c/Math.sqrt(1-d*d)}},{}],16:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b){for(var c,e,f=.5*a,g=d-2*Math.atan(b),h=0;15>=h;h++)if(c=a*Math.sin(g),e=d-2*Math.atan(b*Math.pow((1-c)/(1+c),f))-g,g+=e,Math.abs(e)<=1e-10)return g;return-9999}},{}],17:[function(a,b,c){var d=1,e=.25,f=.046875,g=.01953125,h=.01068115234375,i=.75,j=.46875,k=.013020833333333334,l=.007120768229166667,m=.3645833333333333,n=.005696614583333333,o=.3076171875;b.exports=function(a){var b=[];b[0]=d-a*(e+a*(f+a*(g+a*h))),b[1]=a*(i-a*(f+a*(g+a*h)));var c=a*a;return b[2]=c*(j-a*(k+a*l)),c*=a,b[3]=c*(m-a*n),b[4]=c*a*o,b}},{}],18:[function(a,b,c){var d=a("./pj_mlfn"),e=1e-10,f=20;b.exports=function(a,b,c){for(var g=1/(1-b),h=a,i=f;i;--i){var j=Math.sin(h),k=1-b*j*j;if(k=(d(h,j,Math.cos(h),c)-a)*(k*Math.sqrt(k))*g,h-=k,Math.abs(k)<e)return h}return h}},{"./pj_mlfn":19}],19:[function(a,b,c){b.exports=function(a,b,c,d){return c*=b,b*=b,d[0]*a-c*(d[1]+b*(d[2]+b*(d[3]+b*d[4])))}},{}],20:[function(a,b,c){b.exports=function(a,b){var c;return a>1e-7?(c=a*b,(1-a*a)*(b/(1-c*c)-.5/a*Math.log((1-c)/(1+c)))):2*b}},{}],21:[function(a,b,c){b.exports=function(a){return 0>a?-1:1}},{}],22:[function(a,b,c){b.exports=function(a,b){return Math.pow((1-a)/(1+a),b)}},{}],23:[function(a,b,c){b.exports=function(a){var b={x:a[0],y:a[1]};return a.length>2&&(b.z=a[2]),a.length>3&&(b.m=a[3]),b}},{}],24:[function(a,b,c){var d=Math.PI/2;b.exports=function(a,b,c){var e=a*c,f=.5*a;return e=Math.pow((1-e)/(1+e),f),Math.tan(.5*(d-b))/e}},{}],25:[function(a,b,c){c.wgs84={towgs84:"0,0,0",ellipse:"WGS84",datumName:"WGS84"},c.ch1903={towgs84:"674.374,15.056,405.346",ellipse:"bessel",datumName:"swiss"},c.ggrs87={towgs84:"-199.87,74.79,246.62",ellipse:"GRS80",datumName:"Greek_Geodetic_Reference_System_1987"},c.nad83={towgs84:"0,0,0",ellipse:"GRS80",datumName:"North_American_Datum_1983"},c.nad27={nadgrids:"@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",ellipse:"clrk66",datumName:"North_American_Datum_1927"},c.potsdam={towgs84:"606.0,23.0,413.0",ellipse:"bessel",datumName:"Potsdam Rauenberg 1950 DHDN"},c.carthage={towgs84:"-263.0,6.0,431.0",ellipse:"clark80",datumName:"Carthage 1934 Tunisia"},c.hermannskogel={towgs84:"653.0,-212.0,449.0",ellipse:"bessel",datumName:"Hermannskogel"},c.ire65={towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"mod_airy",datumName:"Ireland 1965"},c.rassadiran={towgs84:"-133.63,-157.5,-158.62",ellipse:"intl",datumName:"Rassadiran"},c.nzgd49={towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",ellipse:"intl",datumName:"New Zealand Geodetic Datum 1949"},c.osgb36={towgs84:"446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",ellipse:"airy",datumName:"Airy 1830"},c.s_jtsk={towgs84:"589,76,480",ellipse:"bessel",datumName:"S-JTSK (Ferro)"},c.beduaram={towgs84:"-106,-87,188",ellipse:"clrk80",datumName:"Beduaram"},c.gunung_segara={towgs84:"-403,684,41",ellipse:"bessel",datumName:"Gunung Segara Jakarta"},c.rnb72={towgs84:"106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",ellipse:"intl",datumName:"Reseau National Belge 1972"}},{}],26:[function(a,b,c){c.MERIT={a:6378137,rf:298.257,ellipseName:"MERIT 1983"},c.SGS85={a:6378136,rf:298.257,ellipseName:"Soviet Geodetic System 85"},c.GRS80={a:6378137,rf:298.257222101,ellipseName:"GRS 1980(IUGG, 1980)"},c.IAU76={a:6378140,rf:298.257,ellipseName:"IAU 1976"},c.airy={a:6377563.396,b:6356256.91,ellipseName:"Airy 1830"},c.APL4={a:6378137,rf:298.25,ellipseName:"Appl. Physics. 1965"},c.NWL9D={a:6378145,rf:298.25,ellipseName:"Naval Weapons Lab., 1965"},c.mod_airy={a:6377340.189,b:6356034.446,ellipseName:"Modified Airy"},c.andrae={a:6377104.43,rf:300,ellipseName:"Andrae 1876 (Den., Iclnd.)"},c.aust_SA={a:6378160,rf:298.25,ellipseName:"Australian Natl & S. Amer. 1969"},c.GRS67={a:6378160,rf:298.247167427,ellipseName:"GRS 67(IUGG 1967)"},c.bessel={a:6377397.155,rf:299.1528128,ellipseName:"Bessel 1841"},c.bess_nam={a:6377483.865,rf:299.1528128,ellipseName:"Bessel 1841 (Namibia)"},c.clrk66={a:6378206.4,b:6356583.8,ellipseName:"Clarke 1866"},c.clrk80={a:6378249.145,rf:293.4663,ellipseName:"Clarke 1880 mod."},c.clrk58={a:6378293.645208759,rf:294.2606763692654,ellipseName:"Clarke 1858"},c.CPM={a:6375738.7,rf:334.29,ellipseName:"Comm. des Poids et Mesures 1799"},c.delmbr={a:6376428,rf:311.5,ellipseName:"Delambre 1810 (Belgium)"},c.engelis={a:6378136.05,rf:298.2566,ellipseName:"Engelis 1985"},c.evrst30={a:6377276.345,rf:300.8017,ellipseName:"Everest 1830"},c.evrst48={a:6377304.063,rf:300.8017,ellipseName:"Everest 1948"},c.evrst56={a:6377301.243,rf:300.8017,ellipseName:"Everest 1956"},c.evrst69={a:6377295.664,rf:300.8017,ellipseName:"Everest 1969"},c.evrstSS={a:6377298.556,rf:300.8017,ellipseName:"Everest (Sabah & Sarawak)"},c.fschr60={a:6378166,rf:298.3,ellipseName:"Fischer (Mercury Datum) 1960"},c.fschr60m={a:6378155,rf:298.3,ellipseName:"Fischer 1960"},c.fschr68={a:6378150,rf:298.3,ellipseName:"Fischer 1968"},c.helmert={a:6378200,rf:298.3,ellipseName:"Helmert 1906"},c.hough={a:6378270,rf:297,ellipseName:"Hough"},c.intl={a:6378388,rf:297,ellipseName:"International 1909 (Hayford)"},c.kaula={a:6378163,rf:298.24,ellipseName:"Kaula 1961"},c.lerch={a:6378139,rf:298.257,ellipseName:"Lerch 1979"},c.mprts={a:6397300,rf:191,ellipseName:"Maupertius 1738"},c.new_intl={a:6378157.5,b:6356772.2,ellipseName:"New International 1967"},c.plessis={a:6376523,rf:6355863,ellipseName:"Plessis 1817 (France)"},c.krass={a:6378245,rf:298.3,ellipseName:"Krassovsky, 1942"},c.SEasia={a:6378155,b:6356773.3205,ellipseName:"Southeast Asia"},c.walbeck={a:6376896,b:6355834.8467,ellipseName:"Walbeck"},c.WGS60={a:6378165,rf:298.3,ellipseName:"WGS 60"},c.WGS66={a:6378145,rf:298.25,ellipseName:"WGS 66"},c.WGS7={a:6378135,rf:298.26,ellipseName:"WGS 72"},c.WGS84={a:6378137,rf:298.257223563,ellipseName:"WGS 84"},c.sphere={a:6370997,b:6370997,ellipseName:"Normal Sphere (r=6370997)"}},{}],27:[function(a,b,c){c.greenwich=0,c.lisbon=-9.131906111111,c.paris=2.337229166667,c.bogota=-74.080916666667,c.madrid=-3.687938888889,c.rome=12.452333333333,c.bern=7.439583333333,c.jakarta=106.807719444444,c.ferro=-17.666666666667,c.brussels=4.367975,c.stockholm=18.058277777778,c.athens=23.7163375,c.oslo=10.722916666667},{}],28:[function(a,b,c){c.ft={to_meter:.3048},c["us-ft"]={to_meter:1200/3937}},{}],29:[function(a,b,c){function d(a,b,c){var d;return Array.isArray(c)?(d=g(a,b,c),3===c.length?[d.x,d.y,d.z]:[d.x,d.y]):g(a,b,c)}function e(a){return a instanceof f?a:a.oProj?a.oProj:f(a)}function _mproj4_(a,b,c){a=e(a);var f,g=!1;return"undefined"==typeof b?(b=a,a=h,g=!0):("undefined"!=typeof b.x||Array.isArray(b))&&(c=b,b=a,a=h,g=!0),b=e(b),c?d(a,b,c):(f={forward:function(c){return d(a,b,c)},inverse:function(c){return d(b,a,c)},info:function(){return{a:b.a,b:b.b,ra:b.R_A,"proj-name":b.projName}}},g&&(f.oProj=b),f)}var f=a("./Proj"),g=a("./transform"),h=f("WGS84");b.exports=_mproj4_},{"./Proj":2,"./transform":66}],30:[function(a,b,c){var d=Math.PI/2,e=1,f=2,g=3,h=4,i=5,j=484813681109536e-20,k=1.0026,l=.3826834323650898,m=function(a){if(!(this instanceof m))return new m(a);if(this.datum_type=h,a){if(a.datumCode&&"none"===a.datumCode&&(this.datum_type=i),a.datum_params){for(var b=0;b<a.datum_params.length;b++)a.datum_params[b]=parseFloat(a.datum_params[b]);(0!==a.datum_params[0]||0!==a.datum_params[1]||0!==a.datum_params[2])&&(this.datum_type=e),a.datum_params.length>3&&(0!==a.datum_params[3]||0!==a.datum_params[4]||0!==a.datum_params[5]||0!==a.datum_params[6])&&(this.datum_type=f,a.datum_params[3]*=j,a.datum_params[4]*=j,a.datum_params[5]*=j,a.datum_params[6]=a.datum_params[6]/1e6+1)}this.datum_type=a.grids?g:this.datum_type,this.a=a.a,this.b=a.b,this.es=a.es,this.ep2=a.ep2,this.datum_params=a.datum_params,this.datum_type===g&&(this.grids=a.grids)}};m.prototype={compare_datums:function(a){return this.datum_type!==a.datum_type?!1:this.a!==a.a||Math.abs(this.es-a.es)>5e-11?!1:this.datum_type===e?this.datum_params[0]===a.datum_params[0]&&this.datum_params[1]===a.datum_params[1]&&this.datum_params[2]===a.datum_params[2]:this.datum_type===f?this.datum_params[0]===a.datum_params[0]&&this.datum_params[1]===a.datum_params[1]&&this.datum_params[2]===a.datum_params[2]&&this.datum_params[3]===a.datum_params[3]&&this.datum_params[4]===a.datum_params[4]&&this.datum_params[5]===a.datum_params[5]&&this.datum_params[6]===a.datum_params[6]:this.datum_type===g||a.datum_type===g?this.nadgrids===a.nadgrids:!0},geodetic_to_geocentric:function(a){var b,c,e,f,g,h,i,j=a.x,k=a.y,l=a.z?a.z:0,m=0;if(-d>k&&k>-1.001*d)k=-d;else if(k>d&&1.001*d>k)k=d;else if(-d>k||k>d)return null;return j>Math.PI&&(j-=2*Math.PI),g=Math.sin(k),i=Math.cos(k),h=g*g,f=this.a/Math.sqrt(1-this.es*h),b=(f+l)*i*Math.cos(j),c=(f+l)*i*Math.sin(j),e=(f*(1-this.es)+l)*g,a.x=b,a.y=c,a.z=e,m},geocentric_to_geodetic:function(a){var b,c,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t=1e-12,u=t*t,v=30,w=a.x,x=a.y,y=a.z?a.z:0;if(o=!1,b=Math.sqrt(w*w+x*x),c=Math.sqrt(w*w+x*x+y*y),b/this.a<t){if(o=!0,q=0,c/this.a<t)return r=d,void(s=-this.b)}else q=Math.atan2(x,w);e=y/c,f=b/c,g=1/Math.sqrt(1-this.es*(2-this.es)*f*f),j=f*(1-this.es)*g,k=e*g,p=0;do p++,i=this.a/Math.sqrt(1-this.es*k*k),s=b*j+y*k-i*(1-this.es*k*k),h=this.es*i/(i+s),g=1/Math.sqrt(1-h*(2-h)*f*f),l=f*(1-h)*g,m=e*g,n=m*j-l*k,j=l,k=m;while(n*n>u&&v>p);return r=Math.atan(m/Math.abs(l)),a.x=q,a.y=r,a.z=s,a},geocentric_to_geodetic_noniter:function(a){var b,c,e,f,g,h,i,j,m,n,o,p,q,r,s,t,u,v=a.x,w=a.y,x=a.z?a.z:0;if(v=parseFloat(v),w=parseFloat(w),x=parseFloat(x),u=!1,0!==v)b=Math.atan2(w,v);else if(w>0)b=d;else if(0>w)b=-d;else if(u=!0,b=0,x>0)c=d;else{if(!(0>x))return c=d,void(e=-this.b);c=-d}return g=v*v+w*w,f=Math.sqrt(g),h=x*k,j=Math.sqrt(h*h+g),n=h/j,p=f/j,o=n*n*n,i=x+this.b*this.ep2*o,t=f-this.a*this.es*p*p*p,m=Math.sqrt(i*i+t*t),q=i/m,r=t/m,s=this.a/Math.sqrt(1-this.es*q*q),e=r>=l?f/r-s:-l>=r?f/-r-s:x/q+s*(this.es-1),u===!1&&(c=Math.atan(q/r)),a.x=b,a.y=c,a.z=e,a},geocentric_to_wgs84:function(a){if(this.datum_type===e)a.x+=this.datum_params[0],a.y+=this.datum_params[1],a.z+=this.datum_params[2];else if(this.datum_type===f){var b=this.datum_params[0],c=this.datum_params[1],d=this.datum_params[2],g=this.datum_params[3],h=this.datum_params[4],i=this.datum_params[5],j=this.datum_params[6],k=j*(a.x-i*a.y+h*a.z)+b,l=j*(i*a.x+a.y-g*a.z)+c,m=j*(-h*a.x+g*a.y+a.z)+d;a.x=k,a.y=l,a.z=m}},geocentric_from_wgs84:function(a){if(this.datum_type===e)a.x-=this.datum_params[0],a.y-=this.datum_params[1],a.z-=this.datum_params[2];else if(this.datum_type===f){var b=this.datum_params[0],c=this.datum_params[1],d=this.datum_params[2],g=this.datum_params[3],h=this.datum_params[4],i=this.datum_params[5],j=this.datum_params[6],k=(a.x-b)/j,l=(a.y-c)/j,m=(a.z-d)/j;a.x=k+i*l-h*m,a.y=-i*k+l+g*m,a.z=h*k-g*l+m}}},b.exports=m},{}],31:[function(a,b,c){var d=1,e=2,f=3,g=5,h=6378137,i=.006694379990141316;b.exports=function(a,b,c){function j(a){return a===d||a===e}var k,l,m;if(a.compare_datums(b))return c;if(a.datum_type===g||b.datum_type===g)return c;var n=a.a,o=a.es,p=b.a,q=b.es,r=a.datum_type;if(r===f)if(0===this.apply_gridshift(a,0,c))a.a=h,a.es=i;else{if(!a.datum_params)return a.a=n,a.es=a.es,c;for(k=1,l=0,m=a.datum_params.length;m>l;l++)k*=a.datum_params[l];if(0===k)return a.a=n,a.es=a.es,c;r=a.datum_params.length>3?e:d}return b.datum_type===f&&(b.a=h,b.es=i),(a.es!==b.es||a.a!==b.a||j(r)||j(b.datum_type))&&(a.geodetic_to_geocentric(c),j(a.datum_type)&&a.geocentric_to_wgs84(c),j(b.datum_type)&&b.geocentric_from_wgs84(c),b.geocentric_to_geodetic(c)),b.datum_type===f&&this.apply_gridshift(b,1,c),a.a=n,a.es=o,b.a=p,b.es=q,c}},{}],32:[function(a,b,c){function d(a){var b=this;if(2===arguments.length){var c=arguments[1];"string"==typeof c?"+"===c.charAt(0)?d[a]=f(arguments[1]):d[a]=g(arguments[1]):d[a]=c}else if(1===arguments.length){if(Array.isArray(a))return a.map(function(a){Array.isArray(a)?d.apply(b,a):d(a)});if("string"==typeof a){if(a in d)return d[a]}else"EPSG"in a?d["EPSG:"+a.EPSG]=a:"ESRI"in a?d["ESRI:"+a.ESRI]=a:"IAU2000"in a?d["IAU2000:"+a.IAU2000]=a:console.log(a);return}}var e=a("./global"),f=a("./projString"),g=a("./wkt");e(d),b.exports=d},{"./global":35,"./projString":38,"./wkt":67}],33:[function(a,b,c){var d=a("./constants/Datum"),e=a("./constants/Ellipsoid"),f=a("./extend"),g=a("./datum"),h=1e-10,i=.16666666666666666,j=.04722222222222222,k=.022156084656084655;b.exports=function(a){if(a.datumCode&&"none"!==a.datumCode){var b=d[a.datumCode];b&&(a.datum_params=b.towgs84?b.towgs84.split(","):null,a.ellps=b.ellipse,a.datumName=b.datumName?b.datumName:a.datumCode)}if(!a.a){var c=e[a.ellps]?e[a.ellps]:e.WGS84;f(a,c)}return a.rf&&!a.b&&(a.b=(1-1/a.rf)*a.a),(0===a.rf||Math.abs(a.a-a.b)<h)&&(a.sphere=!0,a.b=a.a),a.a2=a.a*a.a,a.b2=a.b*a.b,a.es=(a.a2-a.b2)/a.a2,a.e=Math.sqrt(a.es),a.R_A&&(a.a*=1-a.es*(i+a.es*(j+a.es*k)),a.a2=a.a*a.a,a.b2=a.b*a.b,a.es=0),a.ep2=(a.a2-a.b2)/a.b2,a.k0||(a.k0=1),a.axis||(a.axis="enu"),a.datum||(a.datum=g(a)),a}},{"./constants/Datum":25,"./constants/Ellipsoid":26,"./datum":30,"./extend":34}],34:[function(a,b,c){b.exports=function(a,b){a=a||{};var c,d;if(!b)return a;for(d in b)c=b[d],void 0!==c&&(a[d]=c);return a}},{}],35:[function(a,b,c){b.exports=function(a){a("EPSG:4326","+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"),a("EPSG:4269","+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"),a("EPSG:3857","+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"),a.WGS84=a["EPSG:4326"],a["EPSG:3785"]=a["EPSG:3857"],a.GOOGLE=a["EPSG:3857"],a["EPSG:900913"]=a["EPSG:3857"],a["EPSG:102113"]=a["EPSG:3857"]}},{}],36:[function(a,b,c){var _mproj4_=a("./core");_mproj4_.defaultDatum="WGS84",_mproj4_.Proj=a("./Proj"),_mproj4_.WGS84=new _mproj4_.Proj("WGS84"),_mproj4_.Point=a("./Point"),_mproj4_.toPoint=a("./common/toPoint"),_mproj4_.defs=a("./defs"),_mproj4_.transform=a("./transform"),_mproj4_.mgrs=a("mgrs"),_mproj4_.version=a("../package.json").version,a("./includedProjections")(_mproj4_),b.exports=_mproj4_},{"../package.json":69,"./Point":1,"./Proj":2,"./common/toPoint":23,"./core":29,"./defs":32,"./includedProjections":"Pk/iAZ","./transform":66,mgrs:68}],37:[function(a,b,c){function d(a){return"string"==typeof a}function e(a){return a in i}function f(a){var b=["GEOGCS","GEOCCS","PROJCS","LOCAL_CS"];return b.reduce(function(b,c){return b+1+a.indexOf(c)},0)}function g(a){return"+"===a[0]}function h(a){return d(a)?e(a)?i[a]:f(a)?j(a):g(a)?k(a):void 0:a}var i=a("./defs"),j=a("./wkt"),k=a("./projString");b.exports=h},{"./defs":32,"./projString":38,"./wkt":67}],38:[function(a,b,c){var d=.017453292519943295,e=a("./constants/PrimeMeridian"),f=a("./constants/units");b.exports=function(a){var b={},c={};a.split("+").map(function(a){return a.trim()}).filter(function(a){return a}).forEach(function(a){var b=a.split("=");b.push(!0),c[b[0].toLowerCase()]=b[1]});var g,h,i,j={proj:"projName",datum:"datumCode",rf:function(a){b.rf=parseFloat(a)},lat_0:function(a){b.lat0=a*d},lat_1:function(a){b.lat1=a*d},lat_2:function(a){b.lat2=a*d},lat_ts:function(a){b.lat_ts=a*d},lon_0:function(a){b.long0=a*d},lon_1:function(a){b.long1=a*d},lon_2:function(a){b.long2=a*d},alpha:function(a){b.alpha=parseFloat(a)*d},lonc:function(a){b.longc=a*d},x_0:function(a){b.x0=parseFloat(a)},y_0:function(a){b.y0=parseFloat(a)},k_0:function(a){b.k0=parseFloat(a)},k:function(a){b.k0=parseFloat(a)},a:function(a){b.a=parseFloat(a)},b:function(a){b.b=parseFloat(a)},r_a:function(){b.R_A=!0},zone:function(a){b.zone=parseInt(a,10)},south:function(){b.utmSouth=!0},towgs84:function(a){b.datum_params=a.split(",").map(function(a){return parseFloat(a)})},to_meter:function(a){b.to_meter=parseFloat(a)},units:function(a){b.units=a,f[a]&&(b.to_meter=f[a].to_meter)},from_greenwich:function(a){b.from_greenwich=a*d},pm:function(a){b.from_greenwich=(e[a]?e[a]:parseFloat(a))*d},nadgrids:function(a){"@null"===a?b.datumCode="none":b.nadgrids=a},axis:function(a){var c="ewnsud";3===a.length&&-1!==c.indexOf(a.substr(0,1))&&-1!==c.indexOf(a.substr(1,1))&&-1!==c.indexOf(a.substr(2,1))&&(b.axis=a)}};for(g in c)h=c[g],g in j?(i=j[g],"function"==typeof i?i(h):b[i]=h):b[g]=h;return"string"==typeof b.datumCode&&"WGS84"!==b.datumCode&&(b.datumCode=b.datumCode.toLowerCase()),b}},{"./constants/PrimeMeridian":27,"./constants/units":28}],39:[function(a,b,c){function d(a,b){var c=g.length;return a.names?(g[c]=a,a.names.forEach(function(a){f[a.toLowerCase()]=c}),this):(console.log(b),!0)}var e=[a("./projections/merc"),a("./projections/longlat")],f={},g=[];c.add=d,c.get=function(a){if(!a)return!1;var b=a.toLowerCase();return"undefined"!=typeof f[b]&&g[f[b]]?g[f[b]]:void 0},c.start=function(){e.forEach(d)}},{"./projections/longlat":52,"./projections/merc":53}],40:[function(a,b,c){var d=1e-10,e=a("../common/msfnz"),f=a("../common/qsfnz"),g=a("../common/adjust_lon"),h=a("../common/asinz");c.init=function(){Math.abs(this.lat1+this.lat2)<d||(this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e3=Math.sqrt(this.es),this.sin_po=Math.sin(this.lat1),this.cos_po=Math.cos(this.lat1),this.t1=this.sin_po,this.con=this.sin_po,this.ms1=e(this.e3,this.sin_po,this.cos_po),this.qs1=f(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat2),this.cos_po=Math.cos(this.lat2),this.t2=this.sin_po,this.ms2=e(this.e3,this.sin_po,this.cos_po),this.qs2=f(this.e3,this.sin_po,this.cos_po),this.sin_po=Math.sin(this.lat0),this.cos_po=Math.cos(this.lat0),this.t3=this.sin_po,this.qs0=f(this.e3,this.sin_po,this.cos_po),Math.abs(this.lat1-this.lat2)>d?this.ns0=(this.ms1*this.ms1-this.ms2*this.ms2)/(this.qs2-this.qs1):this.ns0=this.con,this.c=this.ms1*this.ms1+this.ns0*this.qs1,this.rh=this.a*Math.sqrt(this.c-this.ns0*this.qs0)/this.ns0)},c.forward=function(a){var b=a.x,c=a.y;this.sin_phi=Math.sin(c),this.cos_phi=Math.cos(c);var d=f(this.e3,this.sin_phi,this.cos_phi),e=this.a*Math.sqrt(this.c-this.ns0*d)/this.ns0,h=this.ns0*g(b-this.long0),i=e*Math.sin(h)+this.x0,j=this.rh-e*Math.cos(h)+this.y0;return a.x=i,a.y=j,a},c.inverse=function(a){var b,c,d,e,f,h;return a.x-=this.x0,a.y=this.rh-a.y+this.y0,this.ns0>=0?(b=Math.sqrt(a.x*a.x+a.y*a.y),d=1):(b=-Math.sqrt(a.x*a.x+a.y*a.y),d=-1),e=0,0!==b&&(e=Math.atan2(d*a.x,d*a.y)),d=b*this.ns0/this.a,this.sphere?h=Math.asin((this.c-d*d)/(2*this.ns0)):(c=(this.c-d*d)/this.ns0,h=this.phi1z(this.e3,c)),f=g(e/this.ns0+this.long0),a.x=f,a.y=h,a},c.phi1z=function(a,b){var c,e,f,g,i,j=h(.5*b);if(d>a)return j;for(var k=a*a,l=1;25>=l;l++)if(c=Math.sin(j),e=Math.cos(j),f=a*c,g=1-f*f,i=.5*g*g/e*(b/(1-k)-c/g+.5/a*Math.log((1-f)/(1+f))),j+=i,Math.abs(i)<=1e-7)return j;return null},c.names=["Albers_Conic_Equal_Area","Albers","aea"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/msfnz":15,"../common/qsfnz":20}],41:[function(a,b,c){var d=a("../common/adjust_lon"),e=Math.PI/2,f=1e-10,g=a("../common/mlfn"),h=a("../common/e0fn"),i=a("../common/e1fn"),j=a("../common/e2fn"),k=a("../common/e3fn"),l=a("../common/gN"),m=a("../common/asinz"),n=a("../common/imlfn");c.init=function(){this.sin_p12=Math.sin(this.lat0),this.cos_p12=Math.cos(this.lat0)},c.forward=function(a){var b,c,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H=a.x,I=a.y,J=Math.sin(a.y),K=Math.cos(a.y),L=d(H-this.long0);return this.sphere?Math.abs(this.sin_p12-1)<=f?(a.x=this.x0+this.a*(e-I)*Math.sin(L),a.y=this.y0-this.a*(e-I)*Math.cos(L),a):Math.abs(this.sin_p12+1)<=f?(a.x=this.x0+this.a*(e+I)*Math.sin(L),a.y=this.y0+this.a*(e+I)*Math.cos(L),a):(B=this.sin_p12*J+this.cos_p12*K*Math.cos(L),z=Math.acos(B),A=z/Math.sin(z),a.x=this.x0+this.a*A*K*Math.sin(L),a.y=this.y0+this.a*A*(this.cos_p12*J-this.sin_p12*K*Math.cos(L)),a):(b=h(this.es),c=i(this.es),m=j(this.es),n=k(this.es),Math.abs(this.sin_p12-1)<=f?(o=this.a*g(b,c,m,n,e),p=this.a*g(b,c,m,n,I),a.x=this.x0+(o-p)*Math.sin(L),a.y=this.y0-(o-p)*Math.cos(L),a):Math.abs(this.sin_p12+1)<=f?(o=this.a*g(b,c,m,n,e),p=this.a*g(b,c,m,n,I),a.x=this.x0+(o+p)*Math.sin(L),a.y=this.y0+(o+p)*Math.cos(L),a):(q=J/K,r=l(this.a,this.e,this.sin_p12),s=l(this.a,this.e,J),t=Math.atan((1-this.es)*q+this.es*r*this.sin_p12/(s*K)),u=Math.atan2(Math.sin(L),this.cos_p12*Math.tan(t)-this.sin_p12*Math.cos(L)),C=0===u?Math.asin(this.cos_p12*Math.sin(t)-this.sin_p12*Math.cos(t)):Math.abs(Math.abs(u)-Math.PI)<=f?-Math.asin(this.cos_p12*Math.sin(t)-this.sin_p12*Math.cos(t)):Math.asin(Math.sin(L)*Math.cos(t)/Math.sin(u)),v=this.e*this.sin_p12/Math.sqrt(1-this.es),w=this.e*this.cos_p12*Math.cos(u)/Math.sqrt(1-this.es),x=v*w,y=w*w,D=C*C,E=D*C,F=E*C,G=F*C,z=r*C*(1-D*y*(1-y)/6+E/8*x*(1-2*y)+F/120*(y*(4-7*y)-3*v*v*(1-7*y))-G/48*x),a.x=this.x0+z*Math.sin(u),a.y=this.y0+z*Math.cos(u),a))},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I;if(this.sphere){if(b=Math.sqrt(a.x*a.x+a.y*a.y),b>2*e*this.a)return;return c=b/this.a,o=Math.sin(c),p=Math.cos(c),q=this.long0,Math.abs(b)<=f?r=this.lat0:(r=m(p*this.sin_p12+a.y*o*this.cos_p12/b),s=Math.abs(this.lat0)-e,q=d(Math.abs(s)<=f?this.lat0>=0?this.long0+Math.atan2(a.x,-a.y):this.long0-Math.atan2(-a.x,a.y):this.long0+Math.atan2(a.x*o,b*this.cos_p12*p-a.y*this.sin_p12*o))),a.x=q,a.y=r,a}return t=h(this.es),u=i(this.es),v=j(this.es),w=k(this.es),Math.abs(this.sin_p12-1)<=f?(x=this.a*g(t,u,v,w,e),b=Math.sqrt(a.x*a.x+a.y*a.y),y=x-b,r=n(y/this.a,t,u,v,w),q=d(this.long0+Math.atan2(a.x,-1*a.y)),a.x=q,a.y=r,a):Math.abs(this.sin_p12+1)<=f?(x=this.a*g(t,u,v,w,e),b=Math.sqrt(a.x*a.x+a.y*a.y),y=b-x,r=n(y/this.a,t,u,v,w),q=d(this.long0+Math.atan2(a.x,a.y)),a.x=q,a.y=r,a):(b=Math.sqrt(a.x*a.x+a.y*a.y),B=Math.atan2(a.x,a.y),z=l(this.a,this.e,this.sin_p12),C=Math.cos(B),D=this.e*this.cos_p12*C,E=-D*D/(1-this.es),F=3*this.es*(1-E)*this.sin_p12*this.cos_p12*C/(1-this.es),G=b/z,H=G-E*(1+E)*Math.pow(G,3)/6-F*(1+3*E)*Math.pow(G,4)/24,I=1-E*H*H/2-G*H*H*H/6,A=Math.asin(this.sin_p12*Math.cos(H)+this.cos_p12*Math.sin(H)*C),q=d(this.long0+Math.asin(Math.sin(B)*Math.sin(H)/Math.cos(A))),r=Math.atan((1-this.es*I*this.sin_p12/Math.sin(A))*Math.tan(A)/(1-this.es)),a.x=q,a.y=r,a)},c.names=["Azimuthal_Equidistant","aeqd"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/imlfn":12,"../common/mlfn":14}],42:[function(a,b,c){var d=a("../common/mlfn"),e=a("../common/e0fn"),f=a("../common/e1fn"),g=a("../common/e2fn"),h=a("../common/e3fn"),i=a("../common/gN"),j=a("../common/adjust_lon"),k=a("../common/adjust_lat"),l=a("../common/imlfn"),m=Math.PI/2,n=1e-10;c.init=function(){this.sphere||(this.e0=e(this.es),this.e1=f(this.es),this.e2=g(this.es),this.e3=h(this.es),this.ml0=this.a*d(this.e0,this.e1,this.e2,this.e3,this.lat0))},c.forward=function(a){var b,c,e=a.x,f=a.y;if(e=j(e-this.long0),this.sphere)b=this.a*Math.asin(Math.cos(f)*Math.sin(e)),c=this.a*(Math.atan2(Math.tan(f),Math.cos(e))-this.lat0);else{var g=Math.sin(f),h=Math.cos(f),k=i(this.a,this.e,g),l=Math.tan(f)*Math.tan(f),m=e*Math.cos(f),n=m*m,o=this.es*h*h/(1-this.es),p=this.a*d(this.e0,this.e1,this.e2,this.e3,f);b=k*m*(1-n*l*(1/6-(8-l+8*o)*n/120)),c=p-this.ml0+k*g/h*n*(.5+(5-l+6*o)*n/24)}return a.x=b+this.x0,a.y=c+this.y0,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,d=a.x/this.a,e=a.y/this.a;if(this.sphere){var f=e+this.lat0;b=Math.asin(Math.sin(f)*Math.cos(d)),c=Math.atan2(Math.tan(d),Math.cos(f))}else{var g=this.ml0/this.a+e,h=l(g,this.e0,this.e1,this.e2,this.e3);if(Math.abs(Math.abs(h)-m)<=n)return a.x=this.long0,a.y=m,0>e&&(a.y*=-1),a;var o=i(this.a,this.e,Math.sin(h)),p=o*o*o/this.a/this.a*(1-this.es),q=Math.pow(Math.tan(h),2),r=d*this.a/o,s=r*r;b=h-o*Math.tan(h)/p*r*r*(.5-(1+3*q)*r*r/24),c=r*(1-s*(q/3+(1+3*q)*q*s/15))/Math.cos(h)}return a.x=j(c+this.long0),a.y=k(b),a},c.names=["Cassini","Cassini_Soldner","cass"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/imlfn":12,"../common/mlfn":14}],43:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/qsfnz"),f=a("../common/msfnz"),g=a("../common/iqsfnz");c.init=function(){this.sphere||(this.k0=f(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)))},c.forward=function(a){var b,c,f=a.x,g=a.y,h=d(f-this.long0);if(this.sphere)b=this.x0+this.a*h*Math.cos(this.lat_ts),c=this.y0+this.a*Math.sin(g)/Math.cos(this.lat_ts);else{var i=e(this.e,Math.sin(g));b=this.x0+this.a*this.k0*h,c=this.y0+this.a*i*.5/this.k0}return a.x=b,a.y=c,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c;return this.sphere?(b=d(this.long0+a.x/this.a/Math.cos(this.lat_ts)),c=Math.asin(a.y/this.a*Math.cos(this.lat_ts))):(c=g(this.e,2*a.y*this.k0/this.a),b=d(this.long0+a.x/(this.a*this.k0))),a.x=b,a.y=c,a},c.names=["cea"]},{"../common/adjust_lon":5,"../common/iqsfnz":13,"../common/msfnz":15,"../common/qsfnz":20}],44:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/adjust_lat");c.init=function(){this.x0=this.x0||0,this.y0=this.y0||0,this.lat0=this.lat0||0,this.long0=this.long0||0,this.lat_ts=this.lat_ts||0,this.title=this.title||"Equidistant Cylindrical (Plate Carre)",this.rc=Math.cos(this.lat_ts)},c.forward=function(a){var b=a.x,c=a.y,f=d(b-this.long0),g=e(c-this.lat0);return a.x=this.x0+this.a*f*this.rc,a.y=this.y0+this.a*g,a},c.inverse=function(a){var b=a.x,c=a.y;return a.x=d(this.long0+(b-this.x0)/(this.a*this.rc)),a.y=e(this.lat0+(c-this.y0)/this.a),a},c.names=["Equirectangular","Equidistant_Cylindrical","eqc"]},{"../common/adjust_lat":4,"../common/adjust_lon":5}],45:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/msfnz"),i=a("../common/mlfn"),j=a("../common/adjust_lon"),k=a("../common/adjust_lat"),l=a("../common/imlfn"),m=1e-10;c.init=function(){Math.abs(this.lat1+this.lat2)<m||(this.lat2=this.lat2||this.lat1,this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.sinphi=Math.sin(this.lat1),this.cosphi=Math.cos(this.lat1),this.ms1=h(this.e,this.sinphi,this.cosphi),this.ml1=i(this.e0,this.e1,this.e2,this.e3,this.lat1),Math.abs(this.lat1-this.lat2)<m?this.ns=this.sinphi:(this.sinphi=Math.sin(this.lat2),this.cosphi=Math.cos(this.lat2),this.ms2=h(this.e,this.sinphi,this.cosphi),this.ml2=i(this.e0,this.e1,this.e2,this.e3,this.lat2),this.ns=(this.ms1-this.ms2)/(this.ml2-this.ml1)),this.g=this.ml1+this.ms1/this.ns,this.ml0=i(this.e0,this.e1,this.e2,this.e3,this.lat0),this.rh=this.a*(this.g-this.ml0))},c.forward=function(a){var b,c=a.x,d=a.y;if(this.sphere)b=this.a*(this.g-d);else{var e=i(this.e0,this.e1,this.e2,this.e3,d);b=this.a*(this.g-e)}var f=this.ns*j(c-this.long0),g=this.x0+b*Math.sin(f),h=this.y0+this.rh-b*Math.cos(f);return a.x=g,a.y=h,a},c.inverse=function(a){a.x-=this.x0,a.y=this.rh-a.y+this.y0;var b,c,d,e;this.ns>=0?(c=Math.sqrt(a.x*a.x+a.y*a.y),b=1):(c=-Math.sqrt(a.x*a.x+a.y*a.y),b=-1);var f=0;if(0!==c&&(f=Math.atan2(b*a.x,b*a.y)),this.sphere)return e=j(this.long0+f/this.ns),d=k(this.g-c/this.a),a.x=e,a.y=d,a;var g=this.g-c/this.a;return d=l(g,this.e0,this.e1,this.e2,this.e3),e=j(this.long0+f/this.ns),a.x=e,a.y=d,a},c.names=["Equidistant_Conic","eqdc"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/imlfn":12,"../common/mlfn":14,"../common/msfnz":15}],46:[function(a,b,c){var d=Math.PI/4,e=a("../common/srat"),f=Math.PI/2,g=20;c.init=function(){var a=Math.sin(this.lat0),b=Math.cos(this.lat0);b*=b,this.rc=Math.sqrt(1-this.es)/(1-this.es*a*a),this.C=Math.sqrt(1+this.es*b*b/(1-this.es)),this.phic0=Math.asin(a/this.C),this.ratexp=.5*this.C*this.e,this.K=Math.tan(.5*this.phic0+d)/(Math.pow(Math.tan(.5*this.lat0+d),this.C)*e(this.e*a,this.ratexp))},c.forward=function(a){var b=a.x,c=a.y;return a.y=2*Math.atan(this.K*Math.pow(Math.tan(.5*c+d),this.C)*e(this.e*Math.sin(c),this.ratexp))-f,a.x=this.C*b,a},c.inverse=function(a){for(var b=1e-14,c=a.x/this.C,h=a.y,i=Math.pow(Math.tan(.5*h+d)/this.K,1/this.C),j=g;j>0&&(h=2*Math.atan(i*e(this.e*Math.sin(a.y),-.5*this.e))-f,!(Math.abs(h-a.y)<b));--j)a.y=h;return j?(a.x=c,a.y=h,a):null},c.names=["gauss"]},{"../common/srat":22}],47:[function(a,b,c){function d(a){return a;
}c.init=function(){this.isGeocent=!0},c.forward=d,c.inverse=d,c.names=["geocent"]},{}],48:[function(a,b,c){var d=a("../common/adjust_lon"),e=1e-10,f=a("../common/asinz");c.init=function(){this.sin_p14=Math.sin(this.lat0),this.cos_p14=Math.cos(this.lat0),this.infinity_dist=1e3*this.a,this.rc=1},c.forward=function(a){var b,c,f,g,h,i,j,k,l=a.x,m=a.y;return f=d(l-this.long0),b=Math.sin(m),c=Math.cos(m),g=Math.cos(f),i=this.sin_p14*b+this.cos_p14*c*g,h=1,i>0||Math.abs(i)<=e?(j=this.x0+this.a*h*c*Math.sin(f)/i,k=this.y0+this.a*h*(this.cos_p14*b-this.sin_p14*c*g)/i):(j=this.x0+this.infinity_dist*c*Math.sin(f),k=this.y0+this.infinity_dist*(this.cos_p14*b-this.sin_p14*c*g)),a.x=j,a.y=k,a},c.inverse=function(a){var b,c,e,g,h,i;return a.x=(a.x-this.x0)/this.a,a.y=(a.y-this.y0)/this.a,a.x/=this.k0,a.y/=this.k0,(b=Math.sqrt(a.x*a.x+a.y*a.y))?(g=Math.atan2(b,this.rc),c=Math.sin(g),e=Math.cos(g),i=f(e*this.sin_p14+a.y*c*this.cos_p14/b),h=Math.atan2(a.x*c,b*this.cos_p14*e-a.y*this.sin_p14*c),h=d(this.long0+h)):(i=this.phic0,h=0),a.x=h,a.y=i,a},c.names=["gnom"]},{"../common/adjust_lon":5,"../common/asinz":6}],49:[function(a,b,c){var d=a("../common/adjust_lon");c.init=function(){this.a=6377397.155,this.es=.006674372230614,this.e=Math.sqrt(this.es),this.lat0||(this.lat0=.863937979737193),this.long0||(this.long0=.4334234309119251),this.k0||(this.k0=.9999),this.s45=.785398163397448,this.s90=2*this.s45,this.fi0=this.lat0,this.e2=this.es,this.e=Math.sqrt(this.e2),this.alfa=Math.sqrt(1+this.e2*Math.pow(Math.cos(this.fi0),4)/(1-this.e2)),this.uq=1.04216856380474,this.u0=Math.asin(Math.sin(this.fi0)/this.alfa),this.g=Math.pow((1+this.e*Math.sin(this.fi0))/(1-this.e*Math.sin(this.fi0)),this.alfa*this.e/2),this.k=Math.tan(this.u0/2+this.s45)/Math.pow(Math.tan(this.fi0/2+this.s45),this.alfa)*this.g,this.k1=this.k0,this.n0=this.a*Math.sqrt(1-this.e2)/(1-this.e2*Math.pow(Math.sin(this.fi0),2)),this.s0=1.37008346281555,this.n=Math.sin(this.s0),this.ro0=this.k1*this.n0/Math.tan(this.s0),this.ad=this.s90-this.uq},c.forward=function(a){var b,c,e,f,g,h,i,j=a.x,k=a.y,l=d(j-this.long0);return b=Math.pow((1+this.e*Math.sin(k))/(1-this.e*Math.sin(k)),this.alfa*this.e/2),c=2*(Math.atan(this.k*Math.pow(Math.tan(k/2+this.s45),this.alfa)/b)-this.s45),e=-l*this.alfa,f=Math.asin(Math.cos(this.ad)*Math.sin(c)+Math.sin(this.ad)*Math.cos(c)*Math.cos(e)),g=Math.asin(Math.cos(c)*Math.sin(e)/Math.cos(f)),h=this.n*g,i=this.ro0*Math.pow(Math.tan(this.s0/2+this.s45),this.n)/Math.pow(Math.tan(f/2+this.s45),this.n),a.y=i*Math.cos(h)/1,a.x=i*Math.sin(h)/1,this.czech||(a.y*=-1,a.x*=-1),a},c.inverse=function(a){var b,c,d,e,f,g,h,i,j=a.x;a.x=a.y,a.y=j,this.czech||(a.y*=-1,a.x*=-1),g=Math.sqrt(a.x*a.x+a.y*a.y),f=Math.atan2(a.y,a.x),e=f/Math.sin(this.s0),d=2*(Math.atan(Math.pow(this.ro0/g,1/this.n)*Math.tan(this.s0/2+this.s45))-this.s45),b=Math.asin(Math.cos(this.ad)*Math.sin(d)-Math.sin(this.ad)*Math.cos(d)*Math.cos(e)),c=Math.asin(Math.cos(d)*Math.sin(e)/Math.cos(b)),a.x=this.long0-c/this.alfa,h=b,i=0;var k=0;do a.y=2*(Math.atan(Math.pow(this.k,-1/this.alfa)*Math.pow(Math.tan(b/2+this.s45),1/this.alfa)*Math.pow((1+this.e*Math.sin(h))/(1-this.e*Math.sin(h)),this.e/2))-this.s45),Math.abs(h-a.y)<1e-10&&(i=1),h=a.y,k+=1;while(0===i&&15>k);return k>=15?null:a},c.names=["Krovak","krovak"]},{"../common/adjust_lon":5}],50:[function(a,b,c){var d=Math.PI/2,e=Math.PI/4,f=1e-10,g=a("../common/qsfnz"),h=a("../common/adjust_lon");c.S_POLE=1,c.N_POLE=2,c.EQUIT=3,c.OBLIQ=4,c.init=function(){var a=Math.abs(this.lat0);if(Math.abs(a-d)<f?this.mode=this.lat0<0?this.S_POLE:this.N_POLE:Math.abs(a)<f?this.mode=this.EQUIT:this.mode=this.OBLIQ,this.es>0){var b;switch(this.qp=g(this.e,1),this.mmf=.5/(1-this.es),this.apa=this.authset(this.es),this.mode){case this.N_POLE:this.dd=1;break;case this.S_POLE:this.dd=1;break;case this.EQUIT:this.rq=Math.sqrt(.5*this.qp),this.dd=1/this.rq,this.xmf=1,this.ymf=.5*this.qp;break;case this.OBLIQ:this.rq=Math.sqrt(.5*this.qp),b=Math.sin(this.lat0),this.sinb1=g(this.e,b)/this.qp,this.cosb1=Math.sqrt(1-this.sinb1*this.sinb1),this.dd=Math.cos(this.lat0)/(Math.sqrt(1-this.es*b*b)*this.rq*this.cosb1),this.ymf=(this.xmf=this.rq)/this.dd,this.xmf*=this.dd}}else this.mode===this.OBLIQ&&(this.sinph0=Math.sin(this.lat0),this.cosph0=Math.cos(this.lat0))},c.forward=function(a){var b,c,i,j,k,l,m,n,o,p,q=a.x,r=a.y;if(q=h(q-this.long0),this.sphere){if(k=Math.sin(r),p=Math.cos(r),i=Math.cos(q),this.mode===this.OBLIQ||this.mode===this.EQUIT){if(c=this.mode===this.EQUIT?1+p*i:1+this.sinph0*k+this.cosph0*p*i,f>=c)return null;c=Math.sqrt(2/c),b=c*p*Math.sin(q),c*=this.mode===this.EQUIT?k:this.cosph0*k-this.sinph0*p*i}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(i=-i),Math.abs(r+this.phi0)<f)return null;c=e-.5*r,c=2*(this.mode===this.S_POLE?Math.cos(c):Math.sin(c)),b=c*Math.sin(q),c*=i}}else{switch(m=0,n=0,o=0,i=Math.cos(q),j=Math.sin(q),k=Math.sin(r),l=g(this.e,k),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(m=l/this.qp,n=Math.sqrt(1-m*m)),this.mode){case this.OBLIQ:o=1+this.sinb1*m+this.cosb1*n*i;break;case this.EQUIT:o=1+n*i;break;case this.N_POLE:o=d+r,l=this.qp-l;break;case this.S_POLE:o=r-d,l=this.qp+l}if(Math.abs(o)<f)return null;switch(this.mode){case this.OBLIQ:case this.EQUIT:o=Math.sqrt(2/o),c=this.mode===this.OBLIQ?this.ymf*o*(this.cosb1*m-this.sinb1*n*i):(o=Math.sqrt(2/(1+n*i)))*m*this.ymf,b=this.xmf*o*n*j;break;case this.N_POLE:case this.S_POLE:l>=0?(b=(o=Math.sqrt(l))*j,c=i*(this.mode===this.S_POLE?o:-o)):b=c=0}}return a.x=this.a*b+this.x0,a.y=this.a*c+this.y0,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,e,g,i,j,k,l=a.x/this.a,m=a.y/this.a;if(this.sphere){var n,o=0,p=0;if(n=Math.sqrt(l*l+m*m),c=.5*n,c>1)return null;switch(c=2*Math.asin(c),(this.mode===this.OBLIQ||this.mode===this.EQUIT)&&(p=Math.sin(c),o=Math.cos(c)),this.mode){case this.EQUIT:c=Math.abs(n)<=f?0:Math.asin(m*p/n),l*=p,m=o*n;break;case this.OBLIQ:c=Math.abs(n)<=f?this.phi0:Math.asin(o*this.sinph0+m*p*this.cosph0/n),l*=p*this.cosph0,m=(o-Math.sin(c)*this.sinph0)*n;break;case this.N_POLE:m=-m,c=d-c;break;case this.S_POLE:c-=d}b=0!==m||this.mode!==this.EQUIT&&this.mode!==this.OBLIQ?Math.atan2(l,m):0}else{if(k=0,this.mode===this.OBLIQ||this.mode===this.EQUIT){if(l/=this.dd,m*=this.dd,j=Math.sqrt(l*l+m*m),f>j)return a.x=0,a.y=this.phi0,a;g=2*Math.asin(.5*j/this.rq),e=Math.cos(g),l*=g=Math.sin(g),this.mode===this.OBLIQ?(k=e*this.sinb1+m*g*this.cosb1/j,i=this.qp*k,m=j*this.cosb1*e-m*this.sinb1*g):(k=m*g/j,i=this.qp*k,m=j*e)}else if(this.mode===this.N_POLE||this.mode===this.S_POLE){if(this.mode===this.N_POLE&&(m=-m),i=l*l+m*m,!i)return a.x=0,a.y=this.phi0,a;k=1-i/this.qp,this.mode===this.S_POLE&&(k=-k)}b=Math.atan2(l,m),c=this.authlat(Math.asin(k),this.apa)}return a.x=h(this.long0+b),a.y=c,a},c.P00=.3333333333333333,c.P01=.17222222222222222,c.P02=.10257936507936508,c.P10=.06388888888888888,c.P11=.0664021164021164,c.P20=.016415012942191543,c.authset=function(a){var b,c=[];return c[0]=a*this.P00,b=a*a,c[0]+=b*this.P01,c[1]=b*this.P10,b*=a,c[0]+=b*this.P02,c[1]+=b*this.P11,c[2]=b*this.P20,c},c.authlat=function(a,b){var c=a+a;return a+b[0]*Math.sin(c)+b[1]*Math.sin(c+c)+b[2]*Math.sin(c+c+c)},c.names=["Lambert Azimuthal Equal Area","Lambert_Azimuthal_Equal_Area","laea"]},{"../common/adjust_lon":5,"../common/qsfnz":20}],51:[function(a,b,c){var d=1e-10,e=a("../common/msfnz"),f=a("../common/tsfnz"),g=Math.PI/2,h=a("../common/sign"),i=a("../common/adjust_lon"),j=a("../common/phi2z");c.init=function(){if(this.lat2||(this.lat2=this.lat1),this.k0||(this.k0=1),this.x0=this.x0||0,this.y0=this.y0||0,!(Math.abs(this.lat1+this.lat2)<d)){var a=this.b/this.a;this.e=Math.sqrt(1-a*a);var b=Math.sin(this.lat1),c=Math.cos(this.lat1),g=e(this.e,b,c),h=f(this.e,this.lat1,b),i=Math.sin(this.lat2),j=Math.cos(this.lat2),k=e(this.e,i,j),l=f(this.e,this.lat2,i),m=f(this.e,this.lat0,Math.sin(this.lat0));Math.abs(this.lat1-this.lat2)>d?this.ns=Math.log(g/k)/Math.log(h/l):this.ns=b,isNaN(this.ns)&&(this.ns=b),this.f0=g/(this.ns*Math.pow(h,this.ns)),this.rh=this.a*this.f0*Math.pow(m,this.ns),this.title||(this.title="Lambert Conformal Conic")}},c.forward=function(a){var b=a.x,c=a.y;Math.abs(2*Math.abs(c)-Math.PI)<=d&&(c=h(c)*(g-2*d));var e,j,k=Math.abs(Math.abs(c)-g);if(k>d)e=f(this.e,c,Math.sin(c)),j=this.a*this.f0*Math.pow(e,this.ns);else{if(k=c*this.ns,0>=k)return null;j=0}var l=this.ns*i(b-this.long0);return a.x=this.k0*(j*Math.sin(l))+this.x0,a.y=this.k0*(this.rh-j*Math.cos(l))+this.y0,a},c.inverse=function(a){var b,c,d,e,f,h=(a.x-this.x0)/this.k0,k=this.rh-(a.y-this.y0)/this.k0;this.ns>0?(b=Math.sqrt(h*h+k*k),c=1):(b=-Math.sqrt(h*h+k*k),c=-1);var l=0;if(0!==b&&(l=Math.atan2(c*h,c*k)),0!==b||this.ns>0){if(c=1/this.ns,d=Math.pow(b/(this.a*this.f0),c),e=j(this.e,d),-9999===e)return null}else e=-g;return f=i(l/this.ns+this.long0),a.x=f,a.y=e,a},c.names=["Lambert Tangential Conformal Conic Projection","Lambert_Conformal_Conic","Lambert_Conformal_Conic_2SP","lcc"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/sign":21,"../common/tsfnz":24}],52:[function(a,b,c){function d(a){return a}c.init=function(){},c.forward=d,c.inverse=d,c.names=["longlat","identity"]},{}],53:[function(a,b,c){var d=a("../common/msfnz"),e=Math.PI/2,f=1e-10,g=57.29577951308232,h=a("../common/adjust_lon"),i=Math.PI/4,j=a("../common/tsfnz"),k=a("../common/phi2z");c.init=function(){var a=this.b/this.a;this.es=1-a*a,"x0"in this||(this.x0=0),"y0"in this||(this.y0=0),this.e=Math.sqrt(this.es),this.lat_ts?this.sphere?this.k0=Math.cos(this.lat_ts):this.k0=d(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts)):this.k0||(this.k?this.k0=this.k:this.k0=1)},c.forward=function(a){var b=a.x,c=a.y;if(c*g>90&&-90>c*g&&b*g>180&&-180>b*g)return null;var d,k;if(Math.abs(Math.abs(c)-e)<=f)return null;if(this.sphere)d=this.x0+this.a*this.k0*h(b-this.long0),k=this.y0+this.a*this.k0*Math.log(Math.tan(i+.5*c));else{var l=Math.sin(c),m=j(this.e,c,l);d=this.x0+this.a*this.k0*h(b-this.long0),k=this.y0-this.a*this.k0*Math.log(m)}return a.x=d,a.y=k,a},c.inverse=function(a){var b,c,d=a.x-this.x0,f=a.y-this.y0;if(this.sphere)c=e-2*Math.atan(Math.exp(-f/(this.a*this.k0)));else{var g=Math.exp(-f/(this.a*this.k0));if(c=k(this.e,g),-9999===c)return null}return b=h(this.long0+d/(this.a*this.k0)),a.x=b,a.y=c,a},c.names=["Mercator","Popular Visualisation Pseudo Mercator","Mercator_1SP","Mercator_Auxiliary_Sphere","merc"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/tsfnz":24}],54:[function(a,b,c){var d=a("../common/adjust_lon");c.init=function(){},c.forward=function(a){var b=a.x,c=a.y,e=d(b-this.long0),f=this.x0+this.a*e,g=this.y0+this.a*Math.log(Math.tan(Math.PI/4+c/2.5))*1.25;return a.x=f,a.y=g,a},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b=d(this.long0+a.x/this.a),c=2.5*(Math.atan(Math.exp(.8*a.y/this.a))-Math.PI/4);return a.x=b,a.y=c,a},c.names=["Miller_Cylindrical","mill"]},{"../common/adjust_lon":5}],55:[function(a,b,c){var d=a("../common/adjust_lon"),e=1e-10;c.init=function(){},c.forward=function(a){for(var b=a.x,c=a.y,f=d(b-this.long0),g=c,h=Math.PI*Math.sin(c),i=0;!0;i++){var j=-(g+Math.sin(g)-h)/(1+Math.cos(g));if(g+=j,Math.abs(j)<e)break}g/=2,Math.PI/2-Math.abs(c)<e&&(f=0);var k=.900316316158*this.a*f*Math.cos(g)+this.x0,l=1.4142135623731*this.a*Math.sin(g)+this.y0;return a.x=k,a.y=l,a},c.inverse=function(a){var b,c;a.x-=this.x0,a.y-=this.y0,c=a.y/(1.4142135623731*this.a),Math.abs(c)>.999999999999&&(c=.999999999999),b=Math.asin(c);var e=d(this.long0+a.x/(.900316316158*this.a*Math.cos(b)));e<-Math.PI&&(e=-Math.PI),e>Math.PI&&(e=Math.PI),c=(2*b+Math.sin(2*b))/Math.PI,Math.abs(c)>1&&(c=1);var f=Math.asin(c);return a.x=e,a.y=f,a},c.names=["Mollweide","moll"]},{"../common/adjust_lon":5}],56:[function(a,b,c){var d=484813681109536e-20;c.iterations=1,c.init=function(){this.A=[],this.A[1]=.6399175073,this.A[2]=-.1358797613,this.A[3]=.063294409,this.A[4]=-.02526853,this.A[5]=.0117879,this.A[6]=-.0055161,this.A[7]=.0026906,this.A[8]=-.001333,this.A[9]=67e-5,this.A[10]=-34e-5,this.B_re=[],this.B_im=[],this.B_re[1]=.7557853228,this.B_im[1]=0,this.B_re[2]=.249204646,this.B_im[2]=.003371507,this.B_re[3]=-.001541739,this.B_im[3]=.04105856,this.B_re[4]=-.10162907,this.B_im[4]=.01727609,this.B_re[5]=-.26623489,this.B_im[5]=-.36249218,this.B_re[6]=-.6870983,this.B_im[6]=-1.1651967,this.C_re=[],this.C_im=[],this.C_re[1]=1.3231270439,this.C_im[1]=0,this.C_re[2]=-.577245789,this.C_im[2]=-.007809598,this.C_re[3]=.508307513,this.C_im[3]=-.112208952,this.C_re[4]=-.15094762,this.C_im[4]=.18200602,this.C_re[5]=1.01418179,this.C_im[5]=1.64497696,this.C_re[6]=1.9660549,this.C_im[6]=2.5127645,this.D=[],this.D[1]=1.5627014243,this.D[2]=.5185406398,this.D[3]=-.03333098,this.D[4]=-.1052906,this.D[5]=-.0368594,this.D[6]=.007317,this.D[7]=.0122,this.D[8]=.00394,this.D[9]=-.0013},c.forward=function(a){var b,c=a.x,e=a.y,f=e-this.lat0,g=c-this.long0,h=f/d*1e-5,i=g,j=1,k=0;for(b=1;10>=b;b++)j*=h,k+=this.A[b]*j;var l,m,n=k,o=i,p=1,q=0,r=0,s=0;for(b=1;6>=b;b++)l=p*n-q*o,m=q*n+p*o,p=l,q=m,r=r+this.B_re[b]*p-this.B_im[b]*q,s=s+this.B_im[b]*p+this.B_re[b]*q;return a.x=s*this.a+this.x0,a.y=r*this.a+this.y0,a},c.inverse=function(a){var b,c,e,f=a.x,g=a.y,h=f-this.x0,i=g-this.y0,j=i/this.a,k=h/this.a,l=1,m=0,n=0,o=0;for(b=1;6>=b;b++)c=l*j-m*k,e=m*j+l*k,l=c,m=e,n=n+this.C_re[b]*l-this.C_im[b]*m,o=o+this.C_im[b]*l+this.C_re[b]*m;for(var p=0;p<this.iterations;p++){var q,r,s=n,t=o,u=j,v=k;for(b=2;6>=b;b++)q=s*n-t*o,r=t*n+s*o,s=q,t=r,u+=(b-1)*(this.B_re[b]*s-this.B_im[b]*t),v+=(b-1)*(this.B_im[b]*s+this.B_re[b]*t);s=1,t=0;var w=this.B_re[1],x=this.B_im[1];for(b=2;6>=b;b++)q=s*n-t*o,r=t*n+s*o,s=q,t=r,w+=b*(this.B_re[b]*s-this.B_im[b]*t),x+=b*(this.B_im[b]*s+this.B_re[b]*t);var y=w*w+x*x;n=(u*w+v*x)/y,o=(v*w-u*x)/y}var z=n,A=o,B=1,C=0;for(b=1;9>=b;b++)B*=z,C+=this.D[b]*B;var D=this.lat0+C*d*1e5,E=this.long0+A;return a.x=E,a.y=D,a},c.names=["New_Zealand_Map_Grid","nzmg"]},{}],57:[function(a,b,c){var d=a("../common/tsfnz"),e=a("../common/adjust_lon"),f=a("../common/phi2z"),g=Math.PI/2,h=Math.PI/4,i=1e-10;c.init=function(){this.no_off=this.no_off||!1,this.no_rot=this.no_rot||!1,isNaN(this.k0)&&(this.k0=1);var a=Math.sin(this.lat0),b=Math.cos(this.lat0),c=this.e*a;this.bl=Math.sqrt(1+this.es/(1-this.es)*Math.pow(b,4)),this.al=this.a*this.bl*this.k0*Math.sqrt(1-this.es)/(1-c*c);var f=d(this.e,this.lat0,a),g=this.bl/b*Math.sqrt((1-this.es)/(1-c*c));1>g*g&&(g=1);var h,i;if(isNaN(this.longc)){var j=d(this.e,this.lat1,Math.sin(this.lat1)),k=d(this.e,this.lat2,Math.sin(this.lat2));this.lat0>=0?this.el=(g+Math.sqrt(g*g-1))*Math.pow(f,this.bl):this.el=(g-Math.sqrt(g*g-1))*Math.pow(f,this.bl);var l=Math.pow(j,this.bl),m=Math.pow(k,this.bl);h=this.el/l,i=.5*(h-1/h);var n=(this.el*this.el-m*l)/(this.el*this.el+m*l),o=(m-l)/(m+l),p=e(this.long1-this.long2);this.long0=.5*(this.long1+this.long2)-Math.atan(n*Math.tan(.5*this.bl*p)/o)/this.bl,this.long0=e(this.long0);var q=e(this.long1-this.long0);this.gamma0=Math.atan(Math.sin(this.bl*q)/i),this.alpha=Math.asin(g*Math.sin(this.gamma0))}else h=this.lat0>=0?g+Math.sqrt(g*g-1):g-Math.sqrt(g*g-1),this.el=h*Math.pow(f,this.bl),i=.5*(h-1/h),this.gamma0=Math.asin(Math.sin(this.alpha)/g),this.long0=this.longc-Math.asin(i*Math.tan(this.gamma0))/this.bl;this.no_off?this.uc=0:this.lat0>=0?this.uc=this.al/this.bl*Math.atan2(Math.sqrt(g*g-1),Math.cos(this.alpha)):this.uc=-1*this.al/this.bl*Math.atan2(Math.sqrt(g*g-1),Math.cos(this.alpha))},c.forward=function(a){var b,c,f,j=a.x,k=a.y,l=e(j-this.long0);if(Math.abs(Math.abs(k)-g)<=i)f=k>0?-1:1,c=this.al/this.bl*Math.log(Math.tan(h+f*this.gamma0*.5)),b=-1*f*g*this.al/this.bl;else{var m=d(this.e,k,Math.sin(k)),n=this.el/Math.pow(m,this.bl),o=.5*(n-1/n),p=.5*(n+1/n),q=Math.sin(this.bl*l),r=(o*Math.sin(this.gamma0)-q*Math.cos(this.gamma0))/p;c=Math.abs(Math.abs(r)-1)<=i?Number.POSITIVE_INFINITY:.5*this.al*Math.log((1-r)/(1+r))/this.bl,b=Math.abs(Math.cos(this.bl*l))<=i?this.al*this.bl*l:this.al*Math.atan2(o*Math.cos(this.gamma0)+q*Math.sin(this.gamma0),Math.cos(this.bl*l))/this.bl}return this.no_rot?(a.x=this.x0+b,a.y=this.y0+c):(b-=this.uc,a.x=this.x0+c*Math.cos(this.alpha)+b*Math.sin(this.alpha),a.y=this.y0+b*Math.cos(this.alpha)-c*Math.sin(this.alpha)),a},c.inverse=function(a){var b,c;this.no_rot?(c=a.y-this.y0,b=a.x-this.x0):(c=(a.x-this.x0)*Math.cos(this.alpha)-(a.y-this.y0)*Math.sin(this.alpha),b=(a.y-this.y0)*Math.cos(this.alpha)+(a.x-this.x0)*Math.sin(this.alpha),b+=this.uc);var d=Math.exp(-1*this.bl*c/this.al),h=.5*(d-1/d),j=.5*(d+1/d),k=Math.sin(this.bl*b/this.al),l=(k*Math.cos(this.gamma0)+h*Math.sin(this.gamma0))/j,m=Math.pow(this.el/Math.sqrt((1+l)/(1-l)),1/this.bl);return Math.abs(l-1)<i?(a.x=this.long0,a.y=g):Math.abs(l+1)<i?(a.x=this.long0,a.y=-1*g):(a.y=f(this.e,m),a.x=e(this.long0-Math.atan2(h*Math.cos(this.gamma0)-k*Math.sin(this.gamma0),Math.cos(this.bl*b/this.al))/this.bl)),a},c.names=["Hotine_Oblique_Mercator","Hotine Oblique Mercator","Hotine_Oblique_Mercator_Azimuth_Natural_Origin","Hotine_Oblique_Mercator_Azimuth_Center","omerc"]},{"../common/adjust_lon":5,"../common/phi2z":16,"../common/tsfnz":24}],58:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/adjust_lon"),i=a("../common/adjust_lat"),j=a("../common/mlfn"),k=1e-10,l=a("../common/gN"),m=20;c.init=function(){this.temp=this.b/this.a,this.es=1-Math.pow(this.temp,2),this.e=Math.sqrt(this.es),this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.ml0=this.a*j(this.e0,this.e1,this.e2,this.e3,this.lat0)},c.forward=function(a){var b,c,d,e=a.x,f=a.y,g=h(e-this.long0);if(d=g*Math.sin(f),this.sphere)Math.abs(f)<=k?(b=this.a*g,c=-1*this.a*this.lat0):(b=this.a*Math.sin(d)/Math.tan(f),c=this.a*(i(f-this.lat0)+(1-Math.cos(d))/Math.tan(f)));else if(Math.abs(f)<=k)b=this.a*g,c=-1*this.ml0;else{var m=l(this.a,this.e,Math.sin(f))/Math.tan(f);b=m*Math.sin(d),c=this.a*j(this.e0,this.e1,this.e2,this.e3,f)-this.ml0+m*(1-Math.cos(d))}return a.x=b+this.x0,a.y=c+this.y0,a},c.inverse=function(a){var b,c,d,e,f,g,i,l,n;if(d=a.x-this.x0,e=a.y-this.y0,this.sphere)if(Math.abs(e+this.a*this.lat0)<=k)b=h(d/this.a+this.long0),c=0;else{g=this.lat0+e/this.a,i=d*d/this.a/this.a+g*g,l=g;var o;for(f=m;f;--f)if(o=Math.tan(l),n=-1*(g*(l*o+1)-l-.5*(l*l+i)*o)/((l-g)/o-1),l+=n,Math.abs(n)<=k){c=l;break}b=h(this.long0+Math.asin(d*Math.tan(l)/this.a)/Math.sin(c))}else if(Math.abs(e+this.ml0)<=k)c=0,b=h(this.long0+d/this.a);else{g=(this.ml0+e)/this.a,i=d*d/this.a/this.a+g*g,l=g;var p,q,r,s,t;for(f=m;f;--f)if(t=this.e*Math.sin(l),p=Math.sqrt(1-t*t)*Math.tan(l),q=this.a*j(this.e0,this.e1,this.e2,this.e3,l),r=this.e0-2*this.e1*Math.cos(2*l)+4*this.e2*Math.cos(4*l)-6*this.e3*Math.cos(6*l),s=q/this.a,n=(g*(p*s+1)-s-.5*p*(s*s+i))/(this.es*Math.sin(2*l)*(s*s+i-2*g*s)/(4*p)+(g-s)*(p*r-2/Math.sin(2*l))-r),l-=n,Math.abs(n)<=k){c=l;break}p=Math.sqrt(1-this.es*Math.pow(Math.sin(c),2))*Math.tan(c),b=h(this.long0+Math.asin(d*p/this.a)/Math.sin(c))}return a.x=b,a.y=c,a},c.names=["Polyconic","poly"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/gN":11,"../common/mlfn":14}],59:[function(a,b,c){var d=a("../common/adjust_lon"),e=a("../common/adjust_lat"),f=a("../common/pj_enfn"),g=20,h=a("../common/pj_mlfn"),i=a("../common/pj_inv_mlfn"),j=Math.PI/2,k=1e-10,l=a("../common/asinz");c.init=function(){this.sphere?(this.n=1,this.m=0,this.es=0,this.C_y=Math.sqrt((this.m+1)/this.n),this.C_x=this.C_y/(this.m+1)):this.en=f(this.es)},c.forward=function(a){var b,c,e=a.x,f=a.y;if(e=d(e-this.long0),this.sphere){if(this.m)for(var i=this.n*Math.sin(f),j=g;j;--j){var l=(this.m*f+Math.sin(f)-i)/(this.m+Math.cos(f));if(f-=l,Math.abs(l)<k)break}else f=1!==this.n?Math.asin(this.n*Math.sin(f)):f;b=this.a*this.C_x*e*(this.m+Math.cos(f)),c=this.a*this.C_y*f}else{var m=Math.sin(f),n=Math.cos(f);c=this.a*h(f,m,n,this.en),b=this.a*e*n/Math.sqrt(1-this.es*m*m)}return a.x=b,a.y=c,a},c.inverse=function(a){var b,c,f,g;return a.x-=this.x0,f=a.x/this.a,a.y-=this.y0,b=a.y/this.a,this.sphere?(b/=this.C_y,f/=this.C_x*(this.m+Math.cos(b)),this.m?b=l((this.m*b+Math.sin(b))/this.n):1!==this.n&&(b=l(Math.sin(b)/this.n)),f=d(f+this.long0),b=e(b)):(b=i(a.y/this.a,this.es,this.en),g=Math.abs(b),j>g?(g=Math.sin(b),c=this.long0+a.x*Math.sqrt(1-this.es*g*g)/(this.a*Math.cos(b)),f=d(c)):j>g-k&&(f=this.long0)),a.x=f,a.y=b,a},c.names=["Sinusoidal","sinu"]},{"../common/adjust_lat":4,"../common/adjust_lon":5,"../common/asinz":6,"../common/pj_enfn":17,"../common/pj_inv_mlfn":18,"../common/pj_mlfn":19}],60:[function(a,b,c){c.init=function(){var a=this.lat0;this.lambda0=this.long0;var b=Math.sin(a),c=this.a,d=this.rf,e=1/d,f=2*e-Math.pow(e,2),g=this.e=Math.sqrt(f);this.R=this.k0*c*Math.sqrt(1-f)/(1-f*Math.pow(b,2)),this.alpha=Math.sqrt(1+f/(1-f)*Math.pow(Math.cos(a),4)),this.b0=Math.asin(b/this.alpha);var h=Math.log(Math.tan(Math.PI/4+this.b0/2)),i=Math.log(Math.tan(Math.PI/4+a/2)),j=Math.log((1+g*b)/(1-g*b));this.K=h-this.alpha*i+this.alpha*g/2*j},c.forward=function(a){var b=Math.log(Math.tan(Math.PI/4-a.y/2)),c=this.e/2*Math.log((1+this.e*Math.sin(a.y))/(1-this.e*Math.sin(a.y))),d=-this.alpha*(b+c)+this.K,e=2*(Math.atan(Math.exp(d))-Math.PI/4),f=this.alpha*(a.x-this.lambda0),g=Math.atan(Math.sin(f)/(Math.sin(this.b0)*Math.tan(e)+Math.cos(this.b0)*Math.cos(f))),h=Math.asin(Math.cos(this.b0)*Math.sin(e)-Math.sin(this.b0)*Math.cos(e)*Math.cos(f));return a.y=this.R/2*Math.log((1+Math.sin(h))/(1-Math.sin(h)))+this.y0,a.x=this.R*g+this.x0,a},c.inverse=function(a){for(var b=a.x-this.x0,c=a.y-this.y0,d=b/this.R,e=2*(Math.atan(Math.exp(c/this.R))-Math.PI/4),f=Math.asin(Math.cos(this.b0)*Math.sin(e)+Math.sin(this.b0)*Math.cos(e)*Math.cos(d)),g=Math.atan(Math.sin(d)/(Math.cos(this.b0)*Math.cos(d)-Math.sin(this.b0)*Math.tan(e))),h=this.lambda0+g/this.alpha,i=0,j=f,k=-1e3,l=0;Math.abs(j-k)>1e-7;){if(++l>20)return;i=1/this.alpha*(Math.log(Math.tan(Math.PI/4+f/2))-this.K)+this.e*Math.log(Math.tan(Math.PI/4+Math.asin(this.e*Math.sin(j))/2)),k=j,j=2*Math.atan(Math.exp(i))-Math.PI/2}return a.x=h,a.y=j,a},c.names=["somerc"]},{}],61:[function(a,b,c){var d=Math.PI/2,e=1e-10,f=a("../common/sign"),g=a("../common/msfnz"),h=a("../common/tsfnz"),i=a("../common/phi2z"),j=a("../common/adjust_lon");c.ssfn_=function(a,b,c){return b*=c,Math.tan(.5*(d+a))*Math.pow((1-b)/(1+b),.5*c)},c.init=function(){this.coslat0=Math.cos(this.lat0),this.sinlat0=Math.sin(this.lat0),this.sphere?1===this.k0&&!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=e&&(this.k0=.5*(1+f(this.lat0)*Math.sin(this.lat_ts))):(Math.abs(this.coslat0)<=e&&(this.lat0>0?this.con=1:this.con=-1),this.cons=Math.sqrt(Math.pow(1+this.e,1+this.e)*Math.pow(1-this.e,1-this.e)),1===this.k0&&!isNaN(this.lat_ts)&&Math.abs(this.coslat0)<=e&&(this.k0=.5*this.cons*g(this.e,Math.sin(this.lat_ts),Math.cos(this.lat_ts))/h(this.e,this.con*this.lat_ts,this.con*Math.sin(this.lat_ts))),this.ms1=g(this.e,this.sinlat0,this.coslat0),this.X0=2*Math.atan(this.ssfn_(this.lat0,this.sinlat0,this.e))-d,this.cosX0=Math.cos(this.X0),this.sinX0=Math.sin(this.X0))},c.forward=function(a){var b,c,f,g,i,k,l=a.x,m=a.y,n=Math.sin(m),o=Math.cos(m),p=j(l-this.long0);return Math.abs(Math.abs(l-this.long0)-Math.PI)<=e&&Math.abs(m+this.lat0)<=e?(a.x=NaN,a.y=NaN,a):this.sphere?(b=2*this.k0/(1+this.sinlat0*n+this.coslat0*o*Math.cos(p)),a.x=this.a*b*o*Math.sin(p)+this.x0,a.y=this.a*b*(this.coslat0*n-this.sinlat0*o*Math.cos(p))+this.y0,a):(c=2*Math.atan(this.ssfn_(m,n,this.e))-d,g=Math.cos(c),f=Math.sin(c),Math.abs(this.coslat0)<=e?(i=h(this.e,m*this.con,this.con*n),k=2*this.a*this.k0*i/this.cons,a.x=this.x0+k*Math.sin(l-this.long0),a.y=this.y0-this.con*k*Math.cos(l-this.long0),a):(Math.abs(this.sinlat0)<e?(b=2*this.a*this.k0/(1+g*Math.cos(p)),a.y=b*f):(b=2*this.a*this.k0*this.ms1/(this.cosX0*(1+this.sinX0*f+this.cosX0*g*Math.cos(p))),a.y=b*(this.cosX0*f-this.sinX0*g*Math.cos(p))+this.y0),a.x=b*g*Math.sin(p)+this.x0,a))},c.inverse=function(a){a.x-=this.x0,a.y-=this.y0;var b,c,f,g,h,k=Math.sqrt(a.x*a.x+a.y*a.y);if(this.sphere){var l=2*Math.atan(k/(.5*this.a*this.k0));return b=this.long0,c=this.lat0,e>=k?(a.x=b,a.y=c,a):(c=Math.asin(Math.cos(l)*this.sinlat0+a.y*Math.sin(l)*this.coslat0/k),b=j(Math.abs(this.coslat0)<e?this.lat0>0?this.long0+Math.atan2(a.x,-1*a.y):this.long0+Math.atan2(a.x,a.y):this.long0+Math.atan2(a.x*Math.sin(l),k*this.coslat0*Math.cos(l)-a.y*this.sinlat0*Math.sin(l))),a.x=b,a.y=c,a)}if(Math.abs(this.coslat0)<=e){if(e>=k)return c=this.lat0,b=this.long0,a.x=b,a.y=c,a;a.x*=this.con,a.y*=this.con,f=k*this.cons/(2*this.a*this.k0),c=this.con*i(this.e,f),b=this.con*j(this.con*this.long0+Math.atan2(a.x,-1*a.y))}else g=2*Math.atan(k*this.cosX0/(2*this.a*this.k0*this.ms1)),b=this.long0,e>=k?h=this.X0:(h=Math.asin(Math.cos(g)*this.sinX0+a.y*Math.sin(g)*this.cosX0/k),b=j(this.long0+Math.atan2(a.x*Math.sin(g),k*this.cosX0*Math.cos(g)-a.y*this.sinX0*Math.sin(g)))),c=-1*i(this.e,Math.tan(.5*(d+h)));return a.x=b,a.y=c,a},c.names=["stere","Stereographic_South_Pole","Polar Stereographic (variant B)"]},{"../common/adjust_lon":5,"../common/msfnz":15,"../common/phi2z":16,"../common/sign":21,"../common/tsfnz":24}],62:[function(a,b,c){var d=a("./gauss"),e=a("../common/adjust_lon");c.init=function(){d.init.apply(this),this.rc&&(this.sinc0=Math.sin(this.phic0),this.cosc0=Math.cos(this.phic0),this.R2=2*this.rc,this.title||(this.title="Oblique Stereographic Alternative"))},c.forward=function(a){var b,c,f,g;return a.x=e(a.x-this.long0),d.forward.apply(this,[a]),b=Math.sin(a.y),c=Math.cos(a.y),f=Math.cos(a.x),g=this.k0*this.R2/(1+this.sinc0*b+this.cosc0*c*f),a.x=g*c*Math.sin(a.x),a.y=g*(this.cosc0*b-this.sinc0*c*f),a.x=this.a*a.x+this.x0,a.y=this.a*a.y+this.y0,a},c.inverse=function(a){var b,c,f,g,h;if(a.x=(a.x-this.x0)/this.a,a.y=(a.y-this.y0)/this.a,a.x/=this.k0,a.y/=this.k0,h=Math.sqrt(a.x*a.x+a.y*a.y)){var i=2*Math.atan2(h,this.R2);b=Math.sin(i),c=Math.cos(i),g=Math.asin(c*this.sinc0+a.y*b*this.cosc0/h),f=Math.atan2(a.x*b,h*this.cosc0*c-a.y*this.sinc0*b)}else g=this.phic0,f=0;return a.x=f,a.y=g,d.inverse.apply(this,[a]),a.x=e(a.x+this.long0),a},c.names=["Stereographic_North_Pole","Oblique_Stereographic","Polar_Stereographic","sterea","Oblique Stereographic Alternative"]},{"../common/adjust_lon":5,"./gauss":46}],63:[function(a,b,c){var d=a("../common/e0fn"),e=a("../common/e1fn"),f=a("../common/e2fn"),g=a("../common/e3fn"),h=a("../common/mlfn"),i=a("../common/adjust_lon"),j=Math.PI/2,k=1e-10,l=a("../common/sign"),m=a("../common/asinz");c.init=function(){this.e0=d(this.es),this.e1=e(this.es),this.e2=f(this.es),this.e3=g(this.es),this.ml0=this.a*h(this.e0,this.e1,this.e2,this.e3,this.lat0)},c.forward=function(a){var b,c,d,e=a.x,f=a.y,g=i(e-this.long0),j=Math.sin(f),k=Math.cos(f);if(this.sphere){var l=k*Math.sin(g);if(Math.abs(Math.abs(l)-1)<1e-10)return 93;c=.5*this.a*this.k0*Math.log((1+l)/(1-l)),b=Math.acos(k*Math.cos(g)/Math.sqrt(1-l*l)),0>f&&(b=-b),d=this.a*this.k0*(b-this.lat0)}else{var m=k*g,n=Math.pow(m,2),o=this.ep2*Math.pow(k,2),p=Math.tan(f),q=Math.pow(p,2);b=1-this.es*Math.pow(j,2);var r=this.a/Math.sqrt(b),s=this.a*h(this.e0,this.e1,this.e2,this.e3,f);c=this.k0*r*m*(1+n/6*(1-q+o+n/20*(5-18*q+Math.pow(q,2)+72*o-58*this.ep2)))+this.x0,d=this.k0*(s-this.ml0+r*p*(n*(.5+n/24*(5-q+9*o+4*Math.pow(o,2)+n/30*(61-58*q+Math.pow(q,2)+600*o-330*this.ep2)))))+this.y0}return a.x=c,a.y=d,a},c.inverse=function(a){var b,c,d,e,f,g,h=6;if(this.sphere){var n=Math.exp(a.x/(this.a*this.k0)),o=.5*(n-1/n),p=this.lat0+a.y/(this.a*this.k0),q=Math.cos(p);b=Math.sqrt((1-q*q)/(1+o*o)),f=m(b),0>p&&(f=-f),g=0===o&&0===q?this.long0:i(Math.atan2(o,q)+this.long0)}else{var r=a.x-this.x0,s=a.y-this.y0;for(b=(this.ml0+s/this.k0)/this.a,c=b,e=0;!0&&(d=(b+this.e1*Math.sin(2*c)-this.e2*Math.sin(4*c)+this.e3*Math.sin(6*c))/this.e0-c,c+=d,!(Math.abs(d)<=k));e++)if(e>=h)return 95;if(Math.abs(c)<j){var t=Math.sin(c),u=Math.cos(c),v=Math.tan(c),w=this.ep2*Math.pow(u,2),x=Math.pow(w,2),y=Math.pow(v,2),z=Math.pow(y,2);b=1-this.es*Math.pow(t,2);var A=this.a/Math.sqrt(b),B=A*(1-this.es)/b,C=r/(A*this.k0),D=Math.pow(C,2);f=c-A*v*D/B*(.5-D/24*(5+3*y+10*w-4*x-9*this.ep2-D/30*(61+90*y+298*w+45*z-252*this.ep2-3*x))),g=i(this.long0+C*(1-D/6*(1+2*y+w-D/20*(5-2*w+28*y-3*x+8*this.ep2+24*z)))/u)}else f=j*l(s),g=this.long0}return a.x=g,a.y=f,a},c.names=["Transverse_Mercator","Transverse Mercator","tmerc"]},{"../common/adjust_lon":5,"../common/asinz":6,"../common/e0fn":7,"../common/e1fn":8,"../common/e2fn":9,"../common/e3fn":10,"../common/mlfn":14,"../common/sign":21}],64:[function(a,b,c){var d=.017453292519943295,e=a("./tmerc");c.dependsOn="tmerc",c.init=function(){this.zone&&(this.lat0=0,this.long0=(6*Math.abs(this.zone)-183)*d,this.x0=5e5,this.y0=this.utmSouth?1e7:0,this.k0=.9996,e.init.apply(this),this.forward=e.forward,this.inverse=e.inverse)},c.names=["Universal Transverse Mercator System","utm"]},{"./tmerc":63}],65:[function(a,b,c){var d=a("../common/adjust_lon"),e=Math.PI/2,f=1e-10,g=a("../common/asinz");c.init=function(){this.R=this.a},c.forward=function(a){var b,c,h=a.x,i=a.y,j=d(h-this.long0);Math.abs(i)<=f&&(b=this.x0+this.R*j,c=this.y0);var k=g(2*Math.abs(i/Math.PI));(Math.abs(j)<=f||Math.abs(Math.abs(i)-e)<=f)&&(b=this.x0,c=i>=0?this.y0+Math.PI*this.R*Math.tan(.5*k):this.y0+Math.PI*this.R*-Math.tan(.5*k));var l=.5*Math.abs(Math.PI/j-j/Math.PI),m=l*l,n=Math.sin(k),o=Math.cos(k),p=o/(n+o-1),q=p*p,r=p*(2/n-1),s=r*r,t=Math.PI*this.R*(l*(p-s)+Math.sqrt(m*(p-s)*(p-s)-(s+m)*(q-s)))/(s+m);0>j&&(t=-t),b=this.x0+t;var u=m+p;return t=Math.PI*this.R*(r*u-l*Math.sqrt((s+m)*(m+1)-u*u))/(s+m),c=i>=0?this.y0+t:this.y0-t,a.x=b,a.y=c,a},c.inverse=function(a){var b,c,e,g,h,i,j,k,l,m,n,o,p;return a.x-=this.x0,a.y-=this.y0,n=Math.PI*this.R,e=a.x/n,g=a.y/n,h=e*e+g*g,i=-Math.abs(g)*(1+h),j=i-2*g*g+e*e,k=-2*i+1+2*g*g+h*h,p=g*g/k+(2*j*j*j/k/k/k-9*i*j/k/k)/27,l=(i-j*j/3/k)/k,m=2*Math.sqrt(-l/3),n=3*p/l/m,Math.abs(n)>1&&(n=n>=0?1:-1),o=Math.acos(n)/3,c=a.y>=0?(-m*Math.cos(o+Math.PI/3)-j/3/k)*Math.PI:-(-m*Math.cos(o+Math.PI/3)-j/3/k)*Math.PI,b=Math.abs(e)<f?this.long0:d(this.long0+Math.PI*(h-1+Math.sqrt(1+2*(e*e-g*g)+h*h))/2/e),a.x=b,a.y=c,a},c.names=["Van_der_Grinten_I","VanDerGrinten","vandg"]},{"../common/adjust_lon":5,"../common/asinz":6}],66:[function(a,b,c){var d=.017453292519943295,e=57.29577951308232,f=1,g=2,h=a("./datum_transform"),i=a("./adjust_axis"),j=a("./Proj"),k=a("./common/toPoint");b.exports=function l(a,b,c){function m(a,b){return(a.datum.datum_type===f||a.datum.datum_type===g)&&"WGS84"!==b.datumCode}var n;return Array.isArray(c)&&(c=k(c)),a.datum&&b.datum&&(m(a,b)||m(b,a))&&(n=new j("WGS84"),l(a,n,c),a=n),"enu"!==a.axis&&i(a,!1,c),"longlat"===a.projName?(c.x*=d,c.y*=d):a.isGeocent?(a.to_meter&&(c.x*=a.to_meter,c.y*=a.to_meter,c.z*=a.to_meter),b.datum.geocentric_to_geodetic_noniter(c)):(a.to_meter&&(c.x*=a.to_meter,c.y*=a.to_meter),a.inverse(c)),a.from_greenwich&&(c.x+=a.from_greenwich),c=h(a.datum,b.datum,c),b.from_greenwich&&(c.x-=b.from_greenwich),"longlat"===b.projName?(c.x*=e,c.y*=e):b.isGeocent?(b.datum.geodetic_to_geocentric(c),b.to_meter&&(c.x/=b.to_meter,c.y/=b.to_meter,c.z/=b.to_meter)):(b.forward(c),b.to_meter&&(c.x/=b.to_meter,c.y/=b.to_meter)),"enu"!==b.axis&&i(b,!0,c),c}},{"./Proj":2,"./adjust_axis":3,"./common/toPoint":23,"./datum_transform":31}],67:[function(a,b,c){function d(a,b,c){a[b]=c.map(function(a){var b={};return e(a,b),b}).reduce(function(a,b){return j(a,b)},{})}function e(a,b){var c;return Array.isArray(a)?(c=a.shift(),"PARAMETER"===c&&(c=a.shift()),1===a.length?Array.isArray(a[0])?(b[c]={},e(a[0],b[c])):b[c]=a[0]:a.length?"TOWGS84"===c?b[c]=a:(b[c]={},["UNIT","PRIMEM","VERT_DATUM"].indexOf(c)>-1?(b[c]={name:a[0].toLowerCase(),convert:a[1]},3===a.length&&(b[c].auth=a[2])):"SPHEROID"===c?(b[c]={name:a[0],a:a[1],rf:a[2]},4===a.length&&(b[c].auth=a[3])):["GEOGCS","GEOCCS","DATUM","VERT_CS","COMPD_CS","LOCAL_CS","FITTED_CS","LOCAL_DATUM"].indexOf(c)>-1?(a[0]=["name",a[0]],d(b,c,a)):a.every(function(a){return Array.isArray(a)})?d(b,c,a):e(a,b[c])):b[c]=!0,
void 0):void(b[a]=!0)}function f(a,b){var c=b[0],d=b[1];!(c in a)&&d in a&&(a[c]=a[d],3===b.length&&(a[c]=b[2](a[c])))}function g(a){return a*i}function h(a){function b(b){var c=a.to_meter||1;return parseFloat(b,10)*c}"GEOGCS"===a.type?a.projName="longlat":"LOCAL_CS"===a.type?(a.projName="identity",a.local=!0):"object"==typeof a.PROJECTION?a.projName=Object.keys(a.PROJECTION)[0]:a.projName=a.PROJECTION,a.UNIT&&(a.units=a.UNIT.name.toLowerCase(),"metre"===a.units&&(a.units="meter"),a.UNIT.convert&&(a.to_meter=parseFloat(a.UNIT.convert,10))),a.GEOGCS&&(a.GEOGCS.DATUM?a.datumCode=a.GEOGCS.DATUM.name.toLowerCase():a.datumCode=a.GEOGCS.name.toLowerCase(),"d_"===a.datumCode.slice(0,2)&&(a.datumCode=a.datumCode.slice(2)),("new_zealand_geodetic_datum_1949"===a.datumCode||"new_zealand_1949"===a.datumCode)&&(a.datumCode="nzgd49"),"wgs_1984"===a.datumCode&&("Mercator_Auxiliary_Sphere"===a.PROJECTION&&(a.sphere=!0),a.datumCode="wgs84"),"_ferro"===a.datumCode.slice(-6)&&(a.datumCode=a.datumCode.slice(0,-6)),"_jakarta"===a.datumCode.slice(-8)&&(a.datumCode=a.datumCode.slice(0,-8)),~a.datumCode.indexOf("belge")&&(a.datumCode="rnb72"),a.GEOGCS.DATUM&&a.GEOGCS.DATUM.SPHEROID&&(a.ellps=a.GEOGCS.DATUM.SPHEROID.name.replace("_19","").replace(/[Cc]larke\_18/,"clrk"),"international"===a.ellps.toLowerCase().slice(0,13)&&(a.ellps="intl"),a.a=a.GEOGCS.DATUM.SPHEROID.a,a.rf=parseFloat(a.GEOGCS.DATUM.SPHEROID.rf,10)),~a.datumCode.indexOf("osgb_1936")&&(a.datumCode="osgb36")),a.b&&!isFinite(a.b)&&(a.b=a.a);var c=function(b){return f(a,b)},d=[["standard_parallel_1","Standard_Parallel_1"],["standard_parallel_2","Standard_Parallel_2"],["false_easting","False_Easting"],["false_northing","False_Northing"],["central_meridian","Central_Meridian"],["latitude_of_origin","Latitude_Of_Origin"],["latitude_of_origin","Central_Parallel"],["scale_factor","Scale_Factor"],["k0","scale_factor"],["latitude_of_center","Latitude_of_center"],["lat0","latitude_of_center",g],["longitude_of_center","Longitude_Of_Center"],["longc","longitude_of_center",g],["x0","false_easting",b],["y0","false_northing",b],["long0","central_meridian",g],["lat0","latitude_of_origin",g],["lat0","standard_parallel_1",g],["lat1","standard_parallel_1",g],["lat2","standard_parallel_2",g],["alpha","azimuth",g],["srsCode","name"]];d.forEach(c),a.long0||!a.longc||"Albers_Conic_Equal_Area"!==a.projName&&"Lambert_Azimuthal_Equal_Area"!==a.projName||(a.long0=a.longc),a.lat_ts||!a.lat1||"Stereographic_South_Pole"!==a.projName&&"Polar Stereographic (variant B)"!==a.projName||(a.lat0=g(a.lat1>0?90:-90),a.lat_ts=a.lat1)}var i=.017453292519943295,j=a("./extend");b.exports=function(a,b){var c=JSON.parse((","+a).replace(/\s*\,\s*([A-Z_0-9]+?)(\[)/g,',["$1",').slice(1).replace(/\s*\,\s*([A-Z_0-9]+?)\]/g,',"$1"]').replace(/,\["VERTCS".+/,"")),d=c.shift(),f=c.shift();c.unshift(["name",f]),c.unshift(["type",d]),c.unshift("output");var g={};return e(c,g),h(g.output),j(b,g.output)}},{"./extend":34}],68:[function(a,b,c){function d(a){return a*(Math.PI/180)}function e(a){return 180*(a/Math.PI)}function f(a){var b,c,e,f,g,i,j,k,l,m=a.lat,n=a.lon,o=6378137,p=.00669438,q=.9996,r=d(m),s=d(n);l=Math.floor((n+180)/6)+1,180===n&&(l=60),m>=56&&64>m&&n>=3&&12>n&&(l=32),m>=72&&84>m&&(n>=0&&9>n?l=31:n>=9&&21>n?l=33:n>=21&&33>n?l=35:n>=33&&42>n&&(l=37)),b=6*(l-1)-180+3,k=d(b),c=p/(1-p),e=o/Math.sqrt(1-p*Math.sin(r)*Math.sin(r)),f=Math.tan(r)*Math.tan(r),g=c*Math.cos(r)*Math.cos(r),i=Math.cos(r)*(s-k),j=o*((1-p/4-3*p*p/64-5*p*p*p/256)*r-(3*p/8+3*p*p/32+45*p*p*p/1024)*Math.sin(2*r)+(15*p*p/256+45*p*p*p/1024)*Math.sin(4*r)-35*p*p*p/3072*Math.sin(6*r));var t=q*e*(i+(1-f+g)*i*i*i/6+(5-18*f+f*f+72*g-58*c)*i*i*i*i*i/120)+5e5,u=q*(j+e*Math.tan(r)*(i*i/2+(5-f+9*g+4*g*g)*i*i*i*i/24+(61-58*f+f*f+600*g-330*c)*i*i*i*i*i*i/720));return 0>m&&(u+=1e7),{northing:Math.round(u),easting:Math.round(t),zoneNumber:l,zoneLetter:h(m)}}function g(a){var b=a.northing,c=a.easting,d=a.zoneLetter,f=a.zoneNumber;if(0>f||f>60)return null;var h,i,j,k,l,m,n,o,p,q,r=.9996,s=6378137,t=.00669438,u=(1-Math.sqrt(1-t))/(1+Math.sqrt(1-t)),v=c-5e5,w=b;"N">d&&(w-=1e7),o=6*(f-1)-180+3,h=t/(1-t),n=w/r,p=n/(s*(1-t/4-3*t*t/64-5*t*t*t/256)),q=p+(3*u/2-27*u*u*u/32)*Math.sin(2*p)+(21*u*u/16-55*u*u*u*u/32)*Math.sin(4*p)+151*u*u*u/96*Math.sin(6*p),i=s/Math.sqrt(1-t*Math.sin(q)*Math.sin(q)),j=Math.tan(q)*Math.tan(q),k=h*Math.cos(q)*Math.cos(q),l=s*(1-t)/Math.pow(1-t*Math.sin(q)*Math.sin(q),1.5),m=v/(i*r);var x=q-i*Math.tan(q)/l*(m*m/2-(5+3*j+10*k-4*k*k-9*h)*m*m*m*m/24+(61+90*j+298*k+45*j*j-252*h-3*k*k)*m*m*m*m*m*m/720);x=e(x);var y=(m-(1+2*j+k)*m*m*m/6+(5-2*k+28*j-3*k*k+8*h+24*j*j)*m*m*m*m*m/120)/Math.cos(q);y=o+e(y);var z;if(a.accuracy){var A=g({northing:a.northing+a.accuracy,easting:a.easting+a.accuracy,zoneLetter:a.zoneLetter,zoneNumber:a.zoneNumber});z={top:A.lat,right:A.lon,bottom:x,left:y}}else z={lat:x,lon:y};return z}function h(a){var b="Z";return 84>=a&&a>=72?b="X":72>a&&a>=64?b="W":64>a&&a>=56?b="V":56>a&&a>=48?b="U":48>a&&a>=40?b="T":40>a&&a>=32?b="S":32>a&&a>=24?b="R":24>a&&a>=16?b="Q":16>a&&a>=8?b="P":8>a&&a>=0?b="N":0>a&&a>=-8?b="M":-8>a&&a>=-16?b="L":-16>a&&a>=-24?b="K":-24>a&&a>=-32?b="J":-32>a&&a>=-40?b="H":-40>a&&a>=-48?b="G":-48>a&&a>=-56?b="F":-56>a&&a>=-64?b="E":-64>a&&a>=-72?b="D":-72>a&&a>=-80&&(b="C"),b}function i(a,b){var c=""+a.easting,d=""+a.northing;return a.zoneNumber+a.zoneLetter+j(a.easting,a.northing,a.zoneNumber)+c.substr(c.length-5,b)+d.substr(d.length-5,b)}function j(a,b,c){var d=k(c),e=Math.floor(a/1e5),f=Math.floor(b/1e5)%20;return l(e,f,d)}function k(a){var b=a%q;return 0===b&&(b=q),b}function l(a,b,c){var d=c-1,e=r.charCodeAt(d),f=s.charCodeAt(d),g=e+a-1,h=f+b,i=!1;g>x&&(g=g-x+t-1,i=!0),(g===u||u>e&&g>u||(g>u||u>e)&&i)&&g++,(g===v||v>e&&g>v||(g>v||v>e)&&i)&&(g++,g===u&&g++),g>x&&(g=g-x+t-1),h>w?(h=h-w+t-1,i=!0):i=!1,(h===u||u>f&&h>u||(h>u||u>f)&&i)&&h++,(h===v||v>f&&h>v||(h>v||v>f)&&i)&&(h++,h===u&&h++),h>w&&(h=h-w+t-1);var j=String.fromCharCode(g)+String.fromCharCode(h);return j}function m(a){if(a&&0===a.length)throw"MGRSPoint coverting from nothing";for(var b,c=a.length,d=null,e="",f=0;!/[A-Z]/.test(b=a.charAt(f));){if(f>=2)throw"MGRSPoint bad conversion from: "+a;e+=b,f++}var g=parseInt(e,10);if(0===f||f+3>c)throw"MGRSPoint bad conversion from: "+a;var h=a.charAt(f++);if("A">=h||"B"===h||"Y"===h||h>="Z"||"I"===h||"O"===h)throw"MGRSPoint zone letter "+h+" not handled: "+a;d=a.substring(f,f+=2);for(var i=k(g),j=n(d.charAt(0),i),l=o(d.charAt(1),i);l<p(h);)l+=2e6;var m=c-f;if(m%2!==0)throw"MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters"+a;var q,r,s,t,u,v=m/2,w=0,x=0;return v>0&&(q=1e5/Math.pow(10,v),r=a.substring(f,f+v),w=parseFloat(r)*q,s=a.substring(f+v),x=parseFloat(s)*q),t=w+j,u=x+l,{easting:t,northing:u,zoneLetter:h,zoneNumber:g,accuracy:q}}function n(a,b){for(var c=r.charCodeAt(b-1),d=1e5,e=!1;c!==a.charCodeAt(0);){if(c++,c===u&&c++,c===v&&c++,c>x){if(e)throw"Bad character: "+a;c=t,e=!0}d+=1e5}return d}function o(a,b){if(a>"V")throw"MGRSPoint given invalid Northing "+a;for(var c=s.charCodeAt(b-1),d=0,e=!1;c!==a.charCodeAt(0);){if(c++,c===u&&c++,c===v&&c++,c>w){if(e)throw"Bad character: "+a;c=t,e=!0}d+=1e5}return d}function p(a){var b;switch(a){case"C":b=11e5;break;case"D":b=2e6;break;case"E":b=28e5;break;case"F":b=37e5;break;case"G":b=46e5;break;case"H":b=55e5;break;case"J":b=64e5;break;case"K":b=73e5;break;case"L":b=82e5;break;case"M":b=91e5;break;case"N":b=0;break;case"P":b=8e5;break;case"Q":b=17e5;break;case"R":b=26e5;break;case"S":b=35e5;break;case"T":b=44e5;break;case"U":b=53e5;break;case"V":b=62e5;break;case"W":b=7e6;break;case"X":b=79e5;break;default:b=-1}if(b>=0)return b;throw"Invalid zone letter: "+a}var q=6,r="AJSAJS",s="AFAFAF",t=65,u=73,v=79,w=86,x=90;c.forward=function(a,b){return b=b||5,i(f({lat:a[1],lon:a[0]}),b)},c.inverse=function(a){var b=g(m(a.toUpperCase()));return[b.left,b.bottom,b.right,b.top]},c.toPoint=function(a){var b=c.inverse(a);return[(b[2]+b[0])/2,(b[3]+b[1])/2]}},{}],69:[function(a,b,c){b.exports={name:"_mproj4_",version:"2.3.7-alpha",description:"Proj4js is a JavaScript library to transform point coordinates from one coordinate system to another, including datum transformations.",main:"lib/index.js",directories:{test:"test",doc:"docs"},scripts:{test:"./node_modules/istanbul/lib/cli.js test ./node_modules/mocha/bin/_mocha test/test.js"},repository:{type:"git",url:"git://github.com/_mproj4_js/_mproj4_js.git"},author:"",license:"MIT",jam:{main:"dist/_mproj4_.js",include:["dist/_mproj4_.js","README.md","AUTHORS","LICENSE.md"]},devDependencies:{"grunt-cli":"~0.1.13",grunt:"~0.4.2","grunt-contrib-connect":"~0.6.0","grunt-contrib-jshint":"~0.8.0",chai:"~1.8.1",mocha:"~1.17.1","grunt-mocha-phantomjs":"~0.4.0",browserify:"~3.24.5","grunt-browserify":"~1.3.0","grunt-contrib-uglify":"~0.3.2",curl:"git://github.com/cujojs/curl.git",istanbul:"~0.2.4",tin:"~0.4.0"},dependencies:{mgrs:"0.0.0"}}},{}],"./includedProjections":[function(a,b,c){b.exports=a("Pk/iAZ")},{}],"Pk/iAZ":[function(a,b,c){var d=[a("./lib/projections/tmerc"),a("./lib/projections/utm"),a("./lib/projections/sterea"),a("./lib/projections/stere"),a("./lib/projections/somerc"),a("./lib/projections/omerc"),a("./lib/projections/lcc"),a("./lib/projections/krovak"),a("./lib/projections/cass"),a("./lib/projections/laea"),a("./lib/projections/aea"),a("./lib/projections/gnom"),a("./lib/projections/cea"),a("./lib/projections/eqc"),a("./lib/projections/poly"),a("./lib/projections/nzmg"),a("./lib/projections/mill"),a("./lib/projections/sinu"),a("./lib/projections/moll"),a("./lib/projections/eqdc"),a("./lib/projections/vandg"),a("./lib/projections/aeqd"),a("./lib/projections/geocent")];b.exports=function(_mproj4_){d.forEach(function(a){_mproj4_.Proj.projections.add(a)})}},{"./lib/projections/aea":40,"./lib/projections/aeqd":41,"./lib/projections/cass":42,"./lib/projections/cea":43,"./lib/projections/eqc":44,"./lib/projections/eqdc":45,"./lib/projections/geocent":47,"./lib/projections/gnom":48,"./lib/projections/krovak":49,"./lib/projections/laea":50,"./lib/projections/lcc":51,"./lib/projections/mill":54,"./lib/projections/moll":55,"./lib/projections/nzmg":56,"./lib/projections/omerc":57,"./lib/projections/poly":58,"./lib/projections/sinu":59,"./lib/projections/somerc":60,"./lib/projections/stere":61,"./lib/projections/sterea":62,"./lib/projections/tmerc":63,"./lib/projections/utm":64,"./lib/projections/vandg":65}]},{},[36])(36)});/*
 * Math.js
 * Transcription of Math.hpp, Constants.hpp, and Accumulator.hpp into
 * JavaScript.
 *
 * Copyright (c) Charles Karney (2011-2015) <charles@karney.com> and licensed
 * under the MIT/X11 License.  For more information, see
 * http://geographiclib.sourceforge.net/
 */

/**
 * @namespace GeographicLib
 * @description The parent namespace for the following modules:
 * - {@link module:GeographicLib/Geodesic GeographicLib/Geodesic} The main
 *   engine for solving geodesic problems via the
 *   {@link module:GeographicLib/Geodesic.Geodesic Geodesic} class.
 * - {@link module:GeographicLib/GeodesicLine GeographicLib/GeodesicLine}
 *   computes points along a single geodesic line via the
 *   {@link module:GeographicLib/GeodesicLine.GeodesicLine GeodesicLine}
 *   class.
 * - {@link module:GeographicLib/PolygonArea GeographicLib/PolygonArea}
 *   computes the area of a geodesic polygon via the
 *   {@link module:GeographicLib/PolygonArea.PolygonArea PolygonArea}
 *   class.
 * - {@link module:GeographicLib/DMS GeographicLib/DMS} handles the decoding
 *   and encoding of angles in degree, minutes, and seconds, via static
 *   functions in this module.
 * - {@link module:GeographicLib/Constants GeographicLib/Constants} defines
 *   constants specifying the version numbers and the parameters for the WGS84
 *   ellipsoid.
 *
 * The following modules are used internally by the package:
 * - {@link module:GeographicLib/Math GeographicLib/Math} defines various
 *   mathematical functions.
 * - {@link module:GeographicLib/Accumulator GeographicLib/Accumulator}
 *   interally used by
 *   {@link module:GeographicLib/PolygonArea.PolygonArea PolygonArea} (via the
 *   {@link module:GeographicLib/Accumulator.Accumulator Accumulator} class)
 *   for summing the contributions to the area of a polygon.
 */
var GeographicLib = {};
GeographicLib.Constants = {};
GeographicLib.Math = {};
GeographicLib.Accumulator = {};

(function(
  /**
   * @exports GeographicLib/Constants
   * @description Define constants defining the version and WGS84 parameters.
   */
  c) {
  "use strict";

  /**
   * @constant
   * @summary WGS84 parameters.
   * @property {number} a the equatorial radius (meters).
   * @property {number} f the flattening.
   */
  c.WGS84 = { a: 6378137, f: 1/298.257223563 };
  /**
   * @constant
   * @summary an array of version numbers.
   * @property {number} major the major version number.
   * @property {number} minor the minor version number.
   * @property {number} patch the patch number.
   */
  c.version = { major: 1, minor: 45, patch: 0 };
  /**
   * @constant
   * @summary version string
   */
  c.version_string = "1.45";
})(GeographicLib.Constants);

(function(
  /**
   * @exports GeographicLib/Math
   * @description Some useful mathematical constants and functions (mainly for
   *   internal use).
   */
  m) {
  "use strict";

  /**
   * @summary The number of digits of precision in floating-point numbers.
   * @constant {number}
   */
  m.digits = 53;
  /**
   * @summary The machine epsilon.
   * @constant {number}
   */
  m.epsilon = Math.pow(0.5, m.digits - 1);
  /**
   * @summary The factor to convert degrees to radians.
   * @constant {number}
   */
  m.degree = Math.PI/180;

  /**
   * @summary Square a number.
   * @param {number} x the number.
   * @returns {number} the square.
   */
  m.sq = function(x) { return x * x; };

  /**
   * @summary The hypotenuse function.
   * @param {number} x the first side.
   * @param {number} y the second side.
   * @returns {number} the hypotenuse.
   */
  m.hypot = function(x, y) {
    var a, b;
    x = Math.abs(x);
    y = Math.abs(y);
    a = Math.max(x, y); b = Math.min(x, y) / (a ? a : 1);
    return a * Math.sqrt(1 + b * b);
  };

  /**
   * @summary Cube root function.
   * @param {number} x the argument.
   * @returns {number} the real cube root.
   */
  m.cbrt = function(x) {
    var y = Math.pow(Math.abs(x), 1/3);
    return x < 0 ? -y : y;
  };

  /**
   * @summary The log1p function.
   * @param {number} x the argument.
   * @returns {number} log(1 + x).
   */
  m.log1p = function(x) {
    var y = 1 + x,
        z = y - 1;
    // Here's the explanation for this magic: y = 1 + z, exactly, and z
    // approx x, thus log(y)/z (which is nearly constant near z = 0) returns
    // a good approximation to the true log(1 + x)/x.  The multiplication x *
    // (log(y)/z) introduces little additional error.
    return z === 0 ? x : x * Math.log(y) / z;
  };

  /**
   * @summary Inverse hyperbolic tangent.
   * @param {number} x the argument.
   * @returns {number} tanh<sup>&minus;1</sup> x.
   */
  m.atanh = function(x) {
    var y = Math.abs(x);          // Enforce odd parity
    y = m.log1p(2 * y/(1 - y))/2;
    return x < 0 ? -y : y;
  };

  /**
   * @summary An error-free sum.
   * @param {number} u
   * @param {number} v
   * @returns {object} sum with sum.s = round(u + v) and sum.t is u + v &minus;
   *   round(u + v)
   */
  m.sum = function(u, v) {
    var s = u + v,
        up = s - v,
        vpp = s - up,
        t;
    up -= u;
    vpp -= v;
    t = -(up + vpp);
    // u + v =       s      + t
    //       = round(u + v) + t
    return {s: s, t: t};
  };

  /**
   * @summary Evaluate a polynomial.
   * @param {integer} N the order of the polynomial.
   * @param {array} p the coefficient array (of size N + 1) (leading
   *   order coefficient first)
   * @param {number} x the variable.
   * @returns {number} the value of the polynomial.
   */
  m.polyval = function(N, p, s, x) {
    var y = N < 0 ? 0 : p[s++];
    while (--N >= 0) y = y * x + p[s++];
    return y;
  };

  /**
   * @summary Coarsen a value close to zero.
   * @param {number} x
   * @returns {number} the coarsened value.
   */
  m.AngRound = function(x) {
    // The makes the smallest gap in x = 1/16 - nextafter(1/16, 0) = 1/2^57 for
    // reals = 0.7 pm on the earth if x is an angle in degrees.  (This is about
    // 1000 times more resolution than we get with angles around 90 degrees.)
    // We use this to avoid having to deal with near singular cases when x is
    // non-zero but tiny (e.g., 1.0e-200).  This also converts -0 to +0.
    var z = 1/16,
        y = Math.abs(x);
    // The compiler mustn't "simplify" z - (z - y) to y
    y = y < z ? z - (z - y) : y;
    return x < 0 ? 0 - y : y;
  };

  /**
   * @summary Normalize an angle.
   * @param {number} x the angle in degrees.
   * @returns {number} the angle reduced to the range [&minus;180&deg;,
   *   180&deg;).
   */
  m.AngNormalize = function(x) {
    // Place angle in [-180, 180).
    x = x % 360;
    return x < -180 ? x + 360 : (x < 180 ? x : x - 360);
  };

  /**
   * @summary Normalize a latitude.
   * @param {number} x the angle in degrees.
   * @returns {number} x if it is in the range [&minus;90&deg;, 90&deg;],
   *   otherwise return NaN.
   */
  m.LatFix = function(x) {
    // Replace angle with NaN if outside [-90, 90].
    return Math.abs(x) > 90 ? Number.NaN : x;
  };

  /**
   * @summary Difference of two angles reduced to [&minus;180&deg;,
   *   180&deg;]
   * @param {number} x the first angle in degrees.
   * @param {number} y the second angle in degrees.
   * @return {number} y &minus; x, reduced to the range [&minus;180&deg;,
   *   180&deg;].
   */
  m.AngDiff = function(x, y) {
    // Compute y - x and reduce to [-180,180] accurately.
    var r = m.sum(m.AngNormalize(x), m.AngNormalize(-y)),
        d = - m.AngNormalize(r.s),
        t = r.t;
    return (d == 180 && t < 0 ? -180 : d) - t;
  };

  /**
   * @summary Evaluate the sine and cosine function with the argument in
   *   degrees
   * @param {number} x in degrees.
   * @returns {object} r with r.s = sin(x) and r.c = cos(x).
   */
  m.sincosd = function(x) {
    // In order to minimize round-off errors, this function exactly reduces
    // the argument to the range [-45, 45] before converting it to radians.
    var r, q, s, c, sinx, cosx;
    r = x % 360;
    q = Math.floor(r / 90 + 0.5);
    r -= 90 * q;
    // now abs(r) <= 45
    r *= this.degree;
    // Possibly could call the gnu extension sincos
    s = Math.sin(r); c = Math.cos(r);
    switch (q & 3) {
    case  0: sinx =     s; cosx =     c; break;
    case  1: sinx =     c; cosx = 0 - s; break;
    case  2: sinx = 0 - s; cosx = 0 - c; break;
    default: sinx = 0 - c; cosx =     s; break; // case 3
    }
    return {s: sinx, c: cosx};
  };

  /**
   * @summary Evaluate the atan2 function with the result in degrees
   * @param {number} y
   * @param {number} x
   * @returns atan2(y, x) in degrees, in the range [&minus;180&deg;
   *   180&deg;).
   */
  m.atan2d = function(y, x) {
    // In order to minimize round-off errors, this function rearranges the
    // arguments so that result of atan2 is in the range [-pi/4, pi/4] before
    // converting it to degrees and mapping the result to the correct
    // quadrant.
    var q = 0, t, ang;
    if (Math.abs(y) > Math.abs(x)) { t = x; x = y; y = t; q = 2; }
    if (x < 0) { x = -x; ++q; }
    // here x >= 0 and x >= abs(y), so angle is in [-pi/4, pi/4]
    ang = Math.atan2(y, x) / this.degree;
    switch (q) {
      // Note that atan2d(-0.0, 1.0) will return -0.  However, we expect that
      // atan2d will not be called with y = -0.  If need be, include
      //
      //   case 0: ang = 0 + ang; break;
      //
      // and handle mpfr as in AngRound.
    case 1: ang = (y > 0 ? 180 : -180) - ang; break;
    case 2: ang =  90 - ang; break;
    case 3: ang = -90 + ang; break;
    }
    return ang;
  };
})(GeographicLib.Math);

(function(
  /**
   * @exports GeographicLib/Accumulator
   * @description Accurate summation via the
   *   {@link module:GeographicLib/Accumulator.Accumulator Accumulator} class
   *   (mainly for internal use).
   */
  a, m) {
  "use strict";

  /**
   * @class
   * @summary Accurate summation of many numbers.
   * @classdesc This allows many numbers to be added together with twice the
   *   normal precision.  In the documentation of the member functions, sum
   *   stands for the value currently held in the accumulator.
   * @param {number | Accumulator} [y = 0]  set sum = y.
   */
  a.Accumulator = function(y) {
    this.Set(y);
  };

  /**
   * @summary Set the accumulator to a number.
   * @param {number | Accumulator} [y = 0] set sum = y.
   */
  a.Accumulator.prototype.Set = function(y) {
    if (!y) y = 0;
    if (y.constructor === a.Accumulator) {
      this._s = y._s;
      this._t = y._t;
    } else {
      this._s = y;
      this._t = 0;
    }
  };

  /**
   * @summary Add a number to the accumulator.
   * @param {number} [y = 0] set sum += y.
   */
  a.Accumulator.prototype.Add = function(y) {
    // Here's Shewchuk's solution...
    // Accumulate starting at least significant end
    var u = m.sum(y, this._t),
        v = m.sum(u.s, this._s);
    u = u.t;
    this._s = v.s;
    this._t = v.t;
    // Start is _s, _t decreasing and non-adjacent.  Sum is now (s + t + u)
    // exactly with s, t, u non-adjacent and in decreasing order (except
    // for possible zeros).  The following code tries to normalize the
    // result.  Ideally, we want _s = round(s+t+u) and _u = round(s+t+u -
    // _s).  The follow does an approximate job (and maintains the
    // decreasing non-adjacent property).  Here are two "failures" using
    // 3-bit floats:
    //
    // Case 1: _s is not equal to round(s+t+u) -- off by 1 ulp
    // [12, -1] - 8 -> [4, 0, -1] -> [4, -1] = 3 should be [3, 0] = 3
    //
    // Case 2: _s+_t is not as close to s+t+u as it shold be
    // [64, 5] + 4 -> [64, 8, 1] -> [64,  8] = 72 (off by 1)
    //                    should be [80, -7] = 73 (exact)
    //
    // "Fixing" these problems is probably not worth the expense.  The
    // representation inevitably leads to small errors in the accumulated
    // values.  The additional errors illustrated here amount to 1 ulp of
    // the less significant word during each addition to the Accumulator
    // and an additional possible error of 1 ulp in the reported sum.
    //
    // Incidentally, the "ideal" representation described above is not
    // canonical, because _s = round(_s + _t) may not be true.  For
    // example, with 3-bit floats:
    //
    // [128, 16] + 1 -> [160, -16] -- 160 = round(145).
    // But [160, 0] - 16 -> [128, 16] -- 128 = round(144).
    //
    if (this._s === 0)          // This implies t == 0,
      this._s = u;              // so result is u
    else
      this._t += u;             // otherwise just accumulate u to t.
  };

  /**
   * @summary Return the result of adding a number to sum (but
   *   don't change sum).
   * @param {number} [y = 0] the number to be added to the sum.
   * @return sum + y.
   */
  a.Accumulator.prototype.Sum = function(y) {
    var b;
    if (!y)
      return this._s;
    else {
      b = new a.Accumulator(this);
      b.Add(y);
      return b._s;
    }
  };

  /**
   * @summary Set sum = &minus;sum.
   */
  a.Accumulator.prototype.Negate = function() {
    this._s *= -1;
    this._t *= -1;
  };
})(GeographicLib.Accumulator, GeographicLib.Math);


/*
 * DMS.js
 * Transcription of DMS.[ch]pp into JavaScript.
 *
 * See the documentation for the C++ class.  The conversion is a literal
 * conversion from C++.
 *
 * Copyright (c) Charles Karney (2011-2015) <charles@karney.com> and licensed
 * under the MIT/X11 License.  For more information, see
 * http://geographiclib.sourceforge.net/
 */

GeographicLib.DMS = {};

(function(
  /**
   * @exports GeographicLib/DMS
   * @description Decode/Encode angles expressed as degrees, minutes, and
   *   seconds.  This module defines several constants:
   *   - hemisphere indicator (returned by
   *       {@link module:GeographicLib/DMS.Decode Decode}) and a formatting
   *       indicator (used by
   *       {@link module:GeographicLib/DMS.Encode Encode})
   *     - NONE = 0, no designator and format as plain angle;
   *     - LATITUDE = 1, a N/S designator and format as latitude;
   *     - LONGITUDE = 2, an E/W designator and format as longitude;
   *     - AZIMUTH = 3, format as azimuth;
   *   - the specification of the trailing component in
   *       {@link module:GeographicLib/DMS.Encode Encode}
   *     - DEGREE;
   *     - MINUTE;
   *     - SECOND.
   */
  d) {
  "use strict";

  var lookup, zerofill, InternalDecode, NumMatch,
      hemispheres_ = "SNWE",
      signs_ = "-+",
      digits_ = "0123456789",
      dmsindicators_ = "D'\":",
      // dmsindicatorsu_ = "\u00b0\u2032\u2033"; // Unicode variants
      dmsindicatorsu_ = "\u00b0'\"", // Use degree symbol
      components_ = ["degrees", "minutes", "seconds"];
  lookup = function(s, c) {
    return s.indexOf(c.toUpperCase());
  };
  zerofill = function(s, n) {
    return String("0000").substr(0, Math.max(0, Math.min(4, n-s.length))) +
      s;
  };
  d.NONE = 0;
  d.LATITUDE = 1;
  d.LONGITUDE = 2;
  d.AZIMUTH = 3;
  d.DEGREE = 0;
  d.MINUTE = 1;
  d.SECOND = 2;

  /**
   * @summary Decode a DMS string.
   * @description The interpretation of the string is given in the
   *   documentation of the corresponding function, Decode(string&, flag&)
   *   in the {@link
   *   http://geographiclib.sourceforge.net/html/classGeographicLib_1_1DMS.html
   *   C++ DMS class}
   * @param {string} dms the string.
   * @returns {object} r where r.val is the decoded value (degrees) and r.ind
   *   is a hemisphere designator, one of NONE, LATITUDE, LONGITUDE.
   * @throws an error if the string is illegal.
   */
  d.Decode = function(dms) {
    var dmsa = dms, end,
        v = 0, i = 0, mi, pi, vals,
        ind1 = d.NONE, ind2, p, pa, pb;
    dmsa = dmsa.replace(/\u00b0/g, 'd')
          .replace(/\u00ba/g, 'd')
          .replace(/\u2070/g, 'd')
          .replace(/\u02da/g, 'd')
          .replace(/\u2032/g, '\'')
          .replace(/\u00b4/g, '\'')
          .replace(/\u2019/g, '\'')
          .replace(/\u2033/g, '"')
          .replace(/\u201d/g, '"')
          .replace(/\u2212/g, '-')
          .replace(/''/g, '"')
          .trim();
    end = dmsa.length;
    // p is pointer to the next piece that needs decoding
    for (p = 0; p < end; p = pb, ++i) {
      pa = p;
      // Skip over initial hemisphere letter (for i == 0)
      if (i === 0 && lookup(hemispheres_, dmsa.charAt(pa)) >= 0)
        ++pa;
      // Skip over initial sign (checking for it if i == 0)
      if (i > 0 || (pa < end && lookup(signs_, dmsa.charAt(pa)) >= 0))
        ++pa;
      // Find next sign
      mi = dmsa.substr(pa, end - pa).indexOf('-');
      pi = dmsa.substr(pa, end - pa).indexOf('+');
      if (mi < 0) mi = end; else mi += pa;
      if (pi < 0) pi = end; else pi += pa;
      pb = Math.min(mi, pi);
      vals = InternalDecode(dmsa.substr(p, pb - p));
      v += vals.val; ind2 = vals.ind;
      if (ind1 == d.NONE)
        ind1 = ind2;
      else if (!(ind2 == d.NONE || ind1 == ind2))
        throw new Error("Incompatible hemisphere specifies in " +
                        dmsa.substr(0, pb));
    }
    if (i === 0)
      throw new Error("Empty or incomplete DMS string " + dmsa);
    return {val: v, ind: ind1};
  };

  InternalDecode = function(dmsa) {
    var vals = {}, errormsg = "",
        sign, beg, end, ind1, k,
        ipieces, fpieces, npiece,
        icurrent, fcurrent, ncurrent, p,
        pointseen,
        digcount, intcount,
        x;
    do {                       // Executed once (provides the ability to break)
      sign = 1;
      beg = 0; end = dmsa.length;
      ind1 = d.NONE;
      k = -1;
      if (end > beg && (k = lookup(hemispheres_, dmsa.charAt(beg))) >= 0) {
        ind1 = (k & 2) ? d.LONGITUDE : d.LATITUDE;
        sign = (k & 1) ? 1 : -1;
        ++beg;
      }
      if (end > beg &&
          (k = lookup(hemispheres_, dmsa.charAt(end-1))) >= 0) {
        if (k >= 0) {
          if (ind1 !== d.NONE) {
            if (dmsa.charAt(beg - 1).toUpperCase() ===
                dmsa.charAt(end - 1).toUpperCase())
              errormsg = "Repeated hemisphere indicators " +
              dmsa.charAt(beg - 1) + " in " +
              dmsa.substr(beg - 1, end - beg + 1);
            else
              errormsg = "Contradictory hemisphere indicators " +
              dmsa.charAt(beg - 1) + " and " + dmsa.charAt(end - 1) + " in " +
              dmsa.substr(beg - 1, end - beg + 1);
            break;
          }
          ind1 = (k & 2) ? d.LONGITUDE : d.LATITUDE;
          sign = (k & 1) ? 1 : -1;
          --end;
        }
      }
      if (end > beg && (k = lookup(signs_, dmsa.charAt(beg))) >= 0) {
        if (k >= 0) {
          sign *= k ? 1 : -1;
          ++beg;
        }
      }
      if (end === beg) {
        errormsg = "Empty or incomplete DMS string " + dmsa;
        break;
      }
      ipieces = [0, 0, 0];
      fpieces = [0, 0, 0];
      npiece = 0;
      icurrent = 0;
      fcurrent = 0;
      ncurrent = 0;
      p = beg;
      pointseen = false;
      digcount = 0;
      intcount = 0;
      while (p < end) {
        x = dmsa.charAt(p++);
        if ((k = lookup(digits_, x)) >= 0) {
          ++ncurrent;
          if (digcount > 0) {
            ++digcount;         // Count of decimal digits
          } else {
            icurrent = 10 * icurrent + k;
            ++intcount;
          }
        } else if (x === '.') {
          if (pointseen) {
            errormsg = "Multiple decimal points in " +
              dmsa.substr(beg, end - beg);
            break;
          }
          pointseen = true;
          digcount = 1;
        } else if ((k = lookup(dmsindicators_, x)) >= 0) {
          if (k >= 3) {
            if (p === end) {
              errormsg = "Illegal for colon to appear at the end of " +
                dmsa.substr(beg, end - beg);
              break;
            }
            k = npiece;
          }
          if (k === npiece - 1) {
            errormsg = "Repeated " + components_[k] +
              " component in " + dmsa.substr(beg, end - beg);
            break;
          } else if (k < npiece) {
            errormsg = components_[k] + " component follows " +
              components_[npiece - 1] + " component in " +
              dmsa.substr(beg, end - beg);
            break;
          }
          if (ncurrent === 0) {
            errormsg = "Missing numbers in " + components_[k] +
              " component of " + dmsa.substr(beg, end - beg);
            break;
          }
          if (digcount > 0) {
            fcurrent = parseFloat(dmsa.substr(p - intcount - digcount - 1,
                                              intcount + digcount));
            icurrent = 0;
          }
          ipieces[k] = icurrent;
          fpieces[k] = icurrent + fcurrent;
          if (p < end) {
            npiece = k + 1;
            icurrent = fcurrent = 0;
            ncurrent = digcount = intcount = 0;
          }
        } else if (lookup(signs_, x) >= 0) {
          errormsg = "Internal sign in DMS string " +
            dmsa.substr(beg, end - beg);
          break;
        } else {
          errormsg = "Illegal character " + x + " in DMS string " +
            dmsa.substr(beg, end - beg);
          break;
        }
      }
      if (errormsg.length)
        break;
      if (lookup(dmsindicators_, dmsa.charAt(p - 1)) < 0) {
        if (npiece >= 3) {
          errormsg = "Extra text following seconds in DMS string " +
            dmsa.substr(beg, end - beg);
          break;
        }
        if (ncurrent === 0) {
          errormsg = "Missing numbers in trailing component of " +
            dmsa.substr(beg, end - beg);
          break;
        }
        if (digcount > 0) {
          fcurrent = parseFloat(dmsa.substr(p - intcount - digcount,
                                            intcount + digcount));
          icurrent = 0;
        }
        ipieces[npiece] = icurrent;
        fpieces[npiece] = icurrent + fcurrent;
      }
      if (pointseen && digcount === 0) {
        errormsg = "Decimal point in non-terminal component of " +
          dmsa.substr(beg, end - beg);
        break;
      }
      // Note that we accept 59.999999... even though it rounds to 60.
      if (ipieces[1] >= 60 || fpieces[1] > 60) {
        errormsg = "Minutes " + fpieces[1] + " not in range [0,60)";
        break;
      }
      if (ipieces[2] >= 60 || fpieces[2] > 60) {
        errormsg = "Seconds " + fpieces[2] + " not in range [0,60)";
        break;
      }
      vals.ind = ind1;
      // Assume check on range of result is made by calling routine (which
      // might be able to offer a better diagnostic).
      vals.val = sign *
        ( fpieces[2] ? (60*(60*fpieces[0] + fpieces[1]) + fpieces[2]) / 3600 :
          ( fpieces[1] ? (60*fpieces[0] + fpieces[1]) / 60 : fpieces[0] ) );
      return vals;
    } while (false);
    vals.val = NumMatch(dmsa);
    if (vals.val === 0)
      throw new Error(errormsg);
    else
      vals.ind = d.NONE;
    return vals;
  };

  NumMatch = function(s) {
    var t, sign, p0, p1;
    if (s.length < 3)
      return 0;
    t = s.toUpperCase().replace(/0+$/,"");
    sign = t.charAt(0) === '-' ? -1 : 1;
    p0 = t.charAt(0) === '-' || t.charAt(0) === '+' ? 1 : 0;
    p1 = t.length - 1;
    if (p1 + 1 < p0 + 3)
      return 0;
    // Strip off sign and trailing 0s
    t = t.substr(p0, p1 + 1 - p0); // Length at least 3
    if (t === "NAN" || t === "1.#QNAN" || t === "1.#SNAN" || t === "1.#IND" ||
        t === "1.#R")
      return Number.NaN;
    else if (t === "INF" || t === "1.#INF")
      return sign * Number.POSITIVE_INFINITY;
    return 0;
  };

  /**
   * @summary Decode two DMS strings interpreting them as a latitude/longitude
   *   pair.
   * @param {string} stra the first string.
   * @param {string} strb the first string.
   * @param {bool} [longfirst = false] if true assume then longitude is given
   *   first (in the absense of any hemisphere indicators).
   * @returns {object} r where r.lat is the decoded latitude and r.lon is the
   *   decoded longitude (both in degrees).
   * @throws an error if the strings are illegal.
   */
  d.DecodeLatLon = function(stra, strb, longfirst) {
    var vals = {},
        valsa = d.Decode(stra),
        valsb = d.Decode(strb),
        a = valsa.val, ia = valsa.ind,
        b = valsb.val, ib = valsb.ind,
        lat, lon;
    if (!longfirst) longfirst = false;
    if (ia === d.NONE && ib === d.NONE) {
      // Default to lat, long unless longfirst
      ia = longfirst ? d.LONGITUDE : d.LATITUDE;
      ib = longfirst ? d.LATITUDE : d.LONGITUDE;
    } else if (ia === d.NONE)
      ia = d.LATITUDE + d.LONGITUDE - ib;
    else if (ib === d.NONE)
      ib = d.LATITUDE + d.LONGITUDE - ia;
    if (ia === ib)
      throw new Error("Both " + stra + " and " + strb + " interpreted as " +
                      (ia === d.LATITUDE ? "latitudes" : "longitudes"));
    lat = ia === d.LATITUDE ? a : b;
    lon = ia === d.LATITUDE ? b : a;
    if (Math.abs(lat) > 90)
      throw new Error("Latitude " + lat + " not in [-90,90]");
    vals.lat = lat;
    vals.lon = lon;
    return vals;
  };

  /**
   * @summary Decode a DMS string interpreting it as an arc length.
   * @param {string} angstr the string (this must not include a hemisphere
   *   indicator).
   * @returns {number} the arc length (degrees).
   * @throws an error if the string is illegal.
   */
  d.DecodeAngle = function(angstr) {
    var vals = d.Decode(angstr),
        ang = vals.val, ind = vals.ind;
    if (ind !== d.NONE)
      throw new Error("Arc angle " + angstr + " includes a hemisphere N/E/W/S");
    return ang;
  };

  /**
   * @summary Decode a DMS string interpreting it as an azimuth.
   * @param {string} azistr the string (this may include an E/W hemisphere
   *   indicator).
   * @returns {number} the azimuth (degrees).
   * @throws an error if the string is illegal.
   */
  d.DecodeAzimuth = function(azistr) {
    var vals = d.Decode(azistr),
        azi = vals.val, ind = vals.ind;
    if (ind === d.LATITUDE)
      throw new Error("Azimuth " + azistr + " has a latitude hemisphere N/S");
    return azi;
  };

  /**
   * @summary Convert angle (in degrees) into a DMS string (using &deg;, ',
   *  and &quot;).
   * @param {number} angle input angle (degrees).
   * @param {number} trailing one of DEGREE, MINUTE, or SECOND to indicate
   *   the trailing component of the string (this component is given as a
   *   decimal number if necessary).
   * @param {number} prec the number of digits after the decimal point for
   *   the trailing component.
   * @param {number} [ind = NONE] a formatting indicator, one of NONE,
   *   LATITUDE, LONGITUDE, AZIMUTH.
   * @returns {string} the resulting string formatted as follows:
   *   * NONE, signed result no leading zeros on degrees except in the units
   *     place, e.g., -8&deg;03'.
   *   * LATITUDE, trailing N or S hemisphere designator, no sign, pad
   *     degrees to 2 digits, e.g., 08&deg;03'S.
   *   * LONGITUDE, trailing E or W hemisphere designator, no sign, pad
   *     degrees to 3 digits, e.g., 008&deg;03'W.
   *   * AZIMUTH, convert to the range [0, 360&deg;), no sign, pad degrees to
   *     3 digits, e.g., 351&deg;57'.
   */
  d.Encode = function(angle, trailing, prec, ind) {
    // Assume check on range of input angle has been made by calling
    // routine (which might be able to offer a better diagnostic).
    var scale = 1, i, sign,
        idegree, fdegree, f, pieces, ip, fp, s;
    if (!ind) ind = d.NONE;
    if (!isFinite(angle))
      return angle < 0 ? String("-inf") :
      (angle > 0 ? String("inf") : String("nan"));

    // 15 - 2 * trailing = ceiling(log10(2^53/90/60^trailing)).
    // This suffices to give full real precision for numbers in [-90,90]
    prec = Math.min(15 - 2 * trailing, prec);
    for (i = 0; i < trailing; ++i)
      scale *= 60;
    for (i = 0; i < prec; ++i)
      scale *= 10;
    if (ind === d.AZIMUTH)
      angle -= Math.floor(angle/360) * 360;
    sign = angle < 0 ? -1 : 1;
    angle *= sign;

    // Break off integer part to preserve precision in manipulation of
    // fractional part.
    idegree = Math.floor(angle);
    fdegree = (angle - idegree) * scale + 0.5;
    f = Math.floor(fdegree);
    // Implement the "round ties to even" rule
    fdegree = (f == fdegree && (f & 1)) ? f - 1 : f;
    fdegree /= scale;

    fdegree = Math.floor((angle - idegree) * scale + 0.5) / scale;
    if (fdegree >= 1) {
      idegree += 1;
      fdegree -= 1;
    }
    pieces = [fdegree, 0, 0];
    for (i = 1; i <= trailing; ++i) {
      ip = Math.floor(pieces[i - 1]);
      fp = pieces[i - 1] - ip;
      pieces[i] = fp * 60;
      pieces[i - 1] = ip;
    }
    pieces[0] += idegree;
    s = "";
    if (ind === d.NONE && sign < 0)
      s += '-';
    switch (trailing) {
    case d.DEGREE:
      s += zerofill(pieces[0].toFixed(prec),
                    ind === d.NONE ? 0 :
                    1 + Math.min(ind, 2) + prec + (prec ? 1 : 0)) +
        dmsindicatorsu_.charAt(0);
      break;
    default:
      s += zerofill(pieces[0].toFixed(0),
                    ind === d.NONE ? 0 : 1 + Math.min(ind, 2)) +
        dmsindicatorsu_.charAt(0);
      switch (trailing) {
      case d.MINUTE:
        s += zerofill(pieces[1].toFixed(prec), 2 + prec + (prec ? 1 : 0)) +
          dmsindicatorsu_.charAt(1);
        break;
      case d.SECOND:
        s += zerofill(pieces[1].toFixed(0), 2) + dmsindicatorsu_.charAt(1);
        s += zerofill(pieces[2].toFixed(prec), 2 + prec + (prec ? 1 : 0)) +
          dmsindicatorsu_.charAt(2);
        break;
      default:
        break;
      }
    }
    if (ind !== d.NONE && ind !== d.AZIMUTH)
      s += hemispheres_.charAt((ind === d.LATITUDE ? 0 : 2) +
                               (sign < 0 ? 0 : 1));
    return s;
  };
})(GeographicLib.DMS);

/*
 * Geodesic.js
 * Transcription of Geodesic.[ch]pp into JavaScript.
 *
 * See the documentation for the C++ class.  The conversion is a literal
 * conversion from C++.
 *
 * The algorithms are derived in
 *
 *    Charles F. F. Karney,
 *    Algorithms for geodesics, J. Geodesy 87, 43-55 (2013);
 *    https://dx.doi.org/10.1007/s00190-012-0578-z
 *    Addenda: http://geographiclib.sf.net/geod-addenda.html
 *
 * Copyright (c) Charles Karney (2011-2015) <charles@karney.com> and licensed
 * under the MIT/X11 License.  For more information, see
 * http://geographiclib.sourceforge.net/
 */

// Load AFTER Math.js

GeographicLib.Geodesic = {};
GeographicLib.GeodesicLine = {};
GeographicLib.PolygonArea = {};

(function(
  /**
   * @exports GeographicLib/Geodesic
   * @description Solve geodesic problems via the
   *   {@link module:GeographicLib/Geodesic.Geodesic Geodesic} class.
   */
  g, l, p, m, c) {
  "use strict";

  var GEOGRAPHICLIB_GEODESIC_ORDER = 6,
      nA1_ = GEOGRAPHICLIB_GEODESIC_ORDER,
      nA2_ = GEOGRAPHICLIB_GEODESIC_ORDER,
      nA3_ = GEOGRAPHICLIB_GEODESIC_ORDER,
      nA3x_ = nA3_,
      nC3x_, nC4x_,
      maxit1_ = 20,
      maxit2_ = maxit1_ + m.digits + 10,
      tol0_ = m.epsilon,
      tol1_ = 200 * tol0_,
      tol2_ = Math.sqrt(tol0_),
      tolb_ = tol0_ * tol1_,
      xthresh_ = 1000 * tol2_,
      CAP_NONE = 0,
      CAP_ALL  = 0x1F,
      CAP_MASK = CAP_ALL,
      OUT_ALL  = 0x7F80,
      Astroid,
      A1m1f_coeff, C1f_coeff, C1pf_coeff,
      A2m1f_coeff, C2f_coeff,
      A3_coeff, C3_coeff, C4_coeff;

  g.tiny_ = Math.sqrt(Number.MIN_VALUE);
  g.nC1_ = GEOGRAPHICLIB_GEODESIC_ORDER;
  g.nC1p_ = GEOGRAPHICLIB_GEODESIC_ORDER;
  g.nC2_ = GEOGRAPHICLIB_GEODESIC_ORDER;
  g.nC3_ = GEOGRAPHICLIB_GEODESIC_ORDER;
  g.nC4_ = GEOGRAPHICLIB_GEODESIC_ORDER;
  nC3x_ = (g.nC3_ * (g.nC3_ - 1)) / 2;
  nC4x_ = (g.nC4_ * (g.nC4_ + 1)) / 2,
  g.CAP_C1   = 1<<0;
  g.CAP_C1p  = 1<<1;
  g.CAP_C2   = 1<<2;
  g.CAP_C3   = 1<<3;
  g.CAP_C4   = 1<<4;

  g.NONE          = 0;
  g.LATITUDE      = 1<<7  | CAP_NONE;
  g.LONGITUDE     = 1<<8  | g.CAP_C3;
  g.AZIMUTH       = 1<<9  | CAP_NONE;
  g.DISTANCE      = 1<<10 | g.CAP_C1;
  g.STANDARD      = g.LATITUDE | g.LONGITUDE | g.AZIMUTH | g.DISTANCE;
  g.DISTANCE_IN   = 1<<11 | g.CAP_C1 | g.CAP_C1p;
  g.REDUCEDLENGTH = 1<<12 | g.CAP_C1 | g.CAP_C2;
  g.GEODESICSCALE = 1<<13 | g.CAP_C1 | g.CAP_C2;
  g.AREA          = 1<<14 | g.CAP_C4;
  g.ALL           = OUT_ALL| CAP_ALL;
  g.LONG_UNROLL   = 1<<15;
  g.OUT_MASK      = OUT_ALL| g.LONG_UNROLL;

  g.SinCosSeries = function(sinp, sinx, cosx, c) {
    // Evaluate
    // y = sinp ? sum(c[i] * sin( 2*i    * x), i, 1, n) :
    //            sum(c[i] * cos((2*i+1) * x), i, 0, n-1)
    // using Clenshaw summation.  N.B. c[0] is unused for sin series
    // Approx operation count = (n + 5) mult and (2 * n + 2) add
    var k = c.length,           // Point to one beyond last element
        n = k - (sinp ? 1 : 0),
        ar = 2 * (cosx - sinx) * (cosx + sinx), // 2 * cos(2 * x)
        y0 = n & 1 ? c[--k] : 0, y1 = 0;        // accumulators for sum
    // Now n is even
    n = Math.floor(n/2);
    while (n--) {
      // Unroll loop x 2, so accumulators return to their original role
      y1 = ar * y0 - y1 + c[--k];
      y0 = ar * y1 - y0 + c[--k];
    }
    return (sinp ? 2 * sinx * cosx * y0 : // sin(2 * x) * y0
            cosx * (y0 - y1));            // cos(x) * (y0 - y1)
  };

  Astroid = function(x, y) {
    // Solve k^4+2*k^3-(x^2+y^2-1)*k^2-2*y^2*k-y^2 = 0 for positive
    // root k.  This solution is adapted from Geocentric::Reverse.
    var k,
        p = m.sq(x),
        q = m.sq(y),
        r = (p + q - 1) / 6,
        S, r2, r3, disc, u, T3, T, ang, v, uv, w;
    if ( !(q === 0 && r <= 0) ) {
      // Avoid possible division by zero when r = 0 by multiplying
      // equations for s and t by r^3 and r, resp.
      S = p * q / 4;            // S = r^3 * s
      r2 = m.sq(r);
      r3 = r * r2
      // The discriminant of the quadratic equation for T3.  This is
      // zero on the evolute curve p^(1/3)+q^(1/3) = 1
      disc = S * (S + 2 * r3);
      u = r;
      if (disc >= 0) {
        T3 = S + r3;
        // Pick the sign on the sqrt to maximize abs(T3).  This
        // minimizes loss of precision due to cancellation.  The
        // result is unchanged because of the way the T is used
        // in definition of u.
        T3 += T3 < 0 ? -Math.sqrt(disc) : Math.sqrt(disc);    // T3 = (r * t)^3
        // N.B. cbrt always returns the real root.  cbrt(-8) = -2.
        T = m.cbrt(T3);     // T = r * t
        // T can be zero; but then r2 / T -> 0.
        u += T + (T !== 0 ? r2 / T : 0);
      } else {
        // T is complex, but the way u is defined the result is real.
        ang = Math.atan2(Math.sqrt(-disc), -(S + r3));
        // There are three possible cube roots.  We choose the
        // root which avoids cancellation.  Note that disc < 0
        // implies that r < 0.
        u += 2 * r * Math.cos(ang / 3);
      }
      v = Math.sqrt(m.sq(u) + q);       // guaranteed positive
      // Avoid loss of accuracy when u < 0.
      uv = u < 0 ? q / (v - u) : u + v; // u+v, guaranteed positive
      w = (uv - q) / (2 * v);           // positive?
      // Rearrange expression for k to avoid loss of accuracy due to
      // subtraction.  Division by 0 not possible because uv > 0, w >= 0.
      k = uv / (Math.sqrt(uv + m.sq(w)) + w); // guaranteed positive
    } else {                                  // q == 0 && r <= 0
      // y = 0 with |x| <= 1.  Handle this case directly.
      // for y small, positive root is k = abs(y)/sqrt(1-x^2)
      k = 0;
    }
    return k;
  };

  A1m1f_coeff = [
    // (1-eps)*A1-1, polynomial in eps2 of order 3
      +1, 4, 64, 0, 256
  ];

  // The scale factor A1-1 = mean value of (d/dsigma)I1 - 1
  g.A1m1f = function(eps) {
    var p = Math.floor(nA1_/2),
        t = m.polyval(p, A1m1f_coeff, 0, m.sq(eps)) / A1m1f_coeff[p + 1];
    return (t + eps) / (1 - eps);
  };

  C1f_coeff = [
    // C1[1]/eps^1, polynomial in eps2 of order 2
      -1, 6, -16, 32,
    // C1[2]/eps^2, polynomial in eps2 of order 2
      -9, 64, -128, 2048,
    // C1[3]/eps^3, polynomial in eps2 of order 1
      +9, -16, 768,
    // C1[4]/eps^4, polynomial in eps2 of order 1
      +3, -5, 512,
    // C1[5]/eps^5, polynomial in eps2 of order 0
      -7, 1280,
    // C1[6]/eps^6, polynomial in eps2 of order 0
      -7, 2048
  ];

  // The coefficients C1[l] in the Fourier expansion of B1
  g.C1f = function(eps, c) {
    var eps2 = m.sq(eps),
        d = eps,
        o = 0,
        l, p;
    for (l = 1; l <= g.nC1_; ++l) {     // l is index of C1p[l]
      p = Math.floor((g.nC1_ - l) / 2); // order of polynomial in eps^2
      c[l] = d * m.polyval(p, C1f_coeff, o, eps2) / C1f_coeff[o + p + 1];
      o += p + 2;
      d *= eps;
    }
  };

  C1pf_coeff = [
    // C1p[1]/eps^1, polynomial in eps2 of order 2
      +205, -432, 768, 1536,
    // C1p[2]/eps^2, polynomial in eps2 of order 2
      +4005, -4736, 3840, 12288,
    // C1p[3]/eps^3, polynomial in eps2 of order 1
      -225, 116, 384,
    // C1p[4]/eps^4, polynomial in eps2 of order 1
      -7173, 2695, 7680,
    // C1p[5]/eps^5, polynomial in eps2 of order 0
      +3467, 7680,
    // C1p[6]/eps^6, polynomial in eps2 of order 0
      +38081, 61440
  ];

  // The coefficients C1p[l] in the Fourier expansion of B1p
  g.C1pf = function(eps, c) {
    var eps2 = m.sq(eps),
        d = eps,
        o = 0,
        l, p;
    for (l = 1; l <= g.nC1p_; ++l) {     // l is index of C1p[l]
      p = Math.floor((g.nC1p_ - l) / 2); // order of polynomial in eps^2
      c[l] = d * m.polyval(p, C1pf_coeff, o, eps2) / C1pf_coeff[o + p + 1];
      o += p + 2;
      d *= eps;
    }
  };

  A2m1f_coeff = [
    // (eps+1)*A2-1, polynomial in eps2 of order 3
      -11, -28, -192, 0, 256
  ];

  // The scale factor A2-1 = mean value of (d/dsigma)I2 - 1
  g.A2m1f = function(eps) {
    var p = Math.floor(nA2_/2),
        t = m.polyval(p, A2m1f_coeff, 0, m.sq(eps)) / A2m1f_coeff[p + 1];
    return (t - eps) / (1 + eps);
  };

  C2f_coeff = [
    // C2[1]/eps^1, polynomial in eps2 of order 2
      +1, 2, 16, 32,
    // C2[2]/eps^2, polynomial in eps2 of order 2
      +35, 64, 384, 2048,
    // C2[3]/eps^3, polynomial in eps2 of order 1
      +15, 80, 768,
    // C2[4]/eps^4, polynomial in eps2 of order 1
      +7, 35, 512,
    // C2[5]/eps^5, polynomial in eps2 of order 0
      +63, 1280,
    // C2[6]/eps^6, polynomial in eps2 of order 0
      +77, 2048
  ];

  // The coefficients C2[l] in the Fourier expansion of B2
  g.C2f = function(eps, c) {
    var eps2 = m.sq(eps),
        d = eps,
        o = 0,
        l, p;
    for (l = 1; l <= g.nC2_; ++l) {     // l is index of C2[l]
      p = Math.floor((g.nC2_ - l) / 2); // order of polynomial in eps^2
      c[l] = d * m.polyval(p, C2f_coeff, o, eps2) / C2f_coeff[o + p + 1];
      o += p + 2;
      d *= eps;
    }
  };

  /**
   * @class
   * @property {number} a the equatorial radius (meters).
   * @property {number} f the flattening.
   * @summary Initialize a Geodesic object for a specific ellipsoid.
   * @classdesc Performs geodesic calculations on an ellipsoid of revolution.
   *   The routines for solving the direct and inverse problems return an
   *   object with some of the following fields set: lat1, lon1, azi1, lat2,
   *   lon2, azi2, s12, a12, m12, M12, M21, S12.  See {@tutorial 2-interface},
   *   "The results".
   * @example
   * var GeographicLib = require("geographiclib"),
   *     geod = GeographicLib.Geodesic.WGS84;
   * var inv = geod.Inverse(1,2,3,4);
   * console.log("lat1 = " + inv.lat1 + ", lon1 = " + inv.lon1 +
   *             ", lat2 = " + inv.lat2 + ", lon2 = " + inv.lon2 +
   *             ",\nazi1 = " + inv.azi1 + ", azi2 = " + inv.azi2 +
   *             ", s12 = " + inv.s12);
   * @param {number} a the equatorial radius of the ellipsoid (meters).
   * @param {number} f the flattening of the ellipsoid.  Setting f = 0 gives
   *   a sphere (on which geodesics are great circles).  Negative f gives a
   *   prolate ellipsoid.
   * @throws an error if the parameters are illegal.
   */
  g.Geodesic = function(a, f) {
    this.a = a;
    this.f = f;
    this._f1 = 1 - this.f;
    this._e2 = this.f * (2 - this.f);
    this._ep2 = this._e2 / m.sq(this._f1); // e2 / (1 - e2)
    this._n = this.f / ( 2 - this.f);
    this._b = this.a * this._f1;
    // authalic radius squared
    this._c2 = (m.sq(this.a) + m.sq(this._b) *
                (this._e2 === 0 ? 1 :
                 (this._e2 > 0 ? m.atanh(Math.sqrt(this._e2)) :
                  Math.atan(Math.sqrt(-this._e2))) /
                 Math.sqrt(Math.abs(this._e2))))/2;
    // The sig12 threshold for "really short".  Using the auxiliary sphere
    // solution with dnm computed at (bet1 + bet2) / 2, the relative error in
    // the azimuth consistency check is sig12^2 * abs(f) * min(1, 1-f/2) / 2.
    // (Error measured for 1/100 < b/a < 100 and abs(f) >= 1/1000.  For a given
    // f and sig12, the max error occurs for lines near the pole.  If the old
    // rule for computing dnm = (dn1 + dn2)/2 is used, then the error increases
    // by a factor of 2.)  Setting this equal to epsilon gives sig12 = etol2.
    // Here 0.1 is a safety factor (error decreased by 100) and max(0.001,
    // abs(f)) stops etol2 getting too large in the nearly spherical case.
    this._etol2 = 0.1 * tol2_ /
      Math.sqrt( Math.max(0.001, Math.abs(this.f)) *
                 Math.min(1.0, 1 - this.f/2) / 2 );
    if (!(isFinite(this.a) && this.a > 0))
      throw new Error("Major radius is not positive");
    if (!(isFinite(this._b) && this._b > 0))
      throw new Error("Minor radius is not positive");
    this._A3x = new Array(nA3x_);
    this._C3x = new Array(nC3x_);
    this._C4x = new Array(nC4x_);
    this.A3coeff();
    this.C3coeff();
    this.C4coeff();
  };

  A3_coeff = [
    // A3, coeff of eps^5, polynomial in n of order 0
      -3, 128,
    // A3, coeff of eps^4, polynomial in n of order 1
      -2, -3, 64,
    // A3, coeff of eps^3, polynomial in n of order 2
      -1, -3, -1, 16,
    // A3, coeff of eps^2, polynomial in n of order 2
      +3, -1, -2, 8,
    // A3, coeff of eps^1, polynomial in n of order 1
      +1, -1, 2,
    // A3, coeff of eps^0, polynomial in n of order 0
      +1, 1
  ];

  // The scale factor A3 = mean value of (d/dsigma)I3
  g.Geodesic.prototype.A3coeff = function() {
    var o = 0, k = 0,
        j, p;
    for (j = nA3_ - 1; j >= 0; --j) { // coeff of eps^j
      p = Math.min(nA3_ - j - 1, j);  // order of polynomial in n
      this._A3x[k++] = m.polyval(p, A3_coeff, o, this._n)
        / A3_coeff[o + p + 1];
      o += p + 2;
    }
  };

  C3_coeff = [
    // C3[1], coeff of eps^5, polynomial in n of order 0
      +3, 128,
    // C3[1], coeff of eps^4, polynomial in n of order 1
      +2, 5, 128,
    // C3[1], coeff of eps^3, polynomial in n of order 2
      -1, 3, 3, 64,
    // C3[1], coeff of eps^2, polynomial in n of order 2
      -1, 0, 1, 8,
    // C3[1], coeff of eps^1, polynomial in n of order 1
      -1, 1, 4,
    // C3[2], coeff of eps^5, polynomial in n of order 0
      +5, 256,
    // C3[2], coeff of eps^4, polynomial in n of order 1
      +1, 3, 128,
    // C3[2], coeff of eps^3, polynomial in n of order 2
      -3, -2, 3, 64,
    // C3[2], coeff of eps^2, polynomial in n of order 2
      +1, -3, 2, 32,
    // C3[3], coeff of eps^5, polynomial in n of order 0
      +7, 512,
    // C3[3], coeff of eps^4, polynomial in n of order 1
      -10, 9, 384,
    // C3[3], coeff of eps^3, polynomial in n of order 2
      +5, -9, 5, 192,
    // C3[4], coeff of eps^5, polynomial in n of order 0
      +7, 512,
    // C3[4], coeff of eps^4, polynomial in n of order 1
      -14, 7, 512,
    // C3[5], coeff of eps^5, polynomial in n of order 0
      +21, 2560
  ];

  // The coefficients C3[l] in the Fourier expansion of B3
  g.Geodesic.prototype.C3coeff = function() {
    var o = 0, k = 0,
        l, j, p;
    for (l = 1; l < g.nC3_; ++l) {        // l is index of C3[l]
      for (j = g.nC3_ - 1; j >= l; --j) { // coeff of eps^j
        p = Math.min(g.nC3_ - j - 1, j);  // order of polynomial in n
        this._C3x[k++] = m.polyval(p, C3_coeff, o, this._n) /
          C3_coeff[o + p + 1];
        o += p + 2;
      }
    }
  };

  C4_coeff = [
    // C4[0], coeff of eps^5, polynomial in n of order 0
      +97, 15015,
    // C4[0], coeff of eps^4, polynomial in n of order 1
      +1088, 156, 45045,
    // C4[0], coeff of eps^3, polynomial in n of order 2
      -224, -4784, 1573, 45045,
    // C4[0], coeff of eps^2, polynomial in n of order 3
      -10656, 14144, -4576, -858, 45045,
    // C4[0], coeff of eps^1, polynomial in n of order 4
      +64, 624, -4576, 6864, -3003, 15015,
    // C4[0], coeff of eps^0, polynomial in n of order 5
      +100, 208, 572, 3432, -12012, 30030, 45045,
    // C4[1], coeff of eps^5, polynomial in n of order 0
      +1, 9009,
    // C4[1], coeff of eps^4, polynomial in n of order 1
      -2944, 468, 135135,
    // C4[1], coeff of eps^3, polynomial in n of order 2
      +5792, 1040, -1287, 135135,
    // C4[1], coeff of eps^2, polynomial in n of order 3
      +5952, -11648, 9152, -2574, 135135,
    // C4[1], coeff of eps^1, polynomial in n of order 4
      -64, -624, 4576, -6864, 3003, 135135,
    // C4[2], coeff of eps^5, polynomial in n of order 0
      +8, 10725,
    // C4[2], coeff of eps^4, polynomial in n of order 1
      +1856, -936, 225225,
    // C4[2], coeff of eps^3, polynomial in n of order 2
      -8448, 4992, -1144, 225225,
    // C4[2], coeff of eps^2, polynomial in n of order 3
      -1440, 4160, -4576, 1716, 225225,
    // C4[3], coeff of eps^5, polynomial in n of order 0
      -136, 63063,
    // C4[3], coeff of eps^4, polynomial in n of order 1
      +1024, -208, 105105,
    // C4[3], coeff of eps^3, polynomial in n of order 2
      +3584, -3328, 1144, 315315,
    // C4[4], coeff of eps^5, polynomial in n of order 0
      -128, 135135,
    // C4[4], coeff of eps^4, polynomial in n of order 1
      -2560, 832, 405405,
    // C4[5], coeff of eps^5, polynomial in n of order 0
      +128, 99099
  ];

  g.Geodesic.prototype.C4coeff = function() {
    var o = 0, k = 0,
        l, j, p;
    for (l = 0; l < g.nC4_; ++l) {        // l is index of C4[l]
      for (j = g.nC4_ - 1; j >= l; --j) { // coeff of eps^j
        p = g.nC4_ - j - 1;               // order of polynomial in n
        this._C4x[k++] = m.polyval(p, C4_coeff, o, this._n)
          / C4_coeff[o + p + 1];
        o += p + 2;
      }
    }
  };

  g.Geodesic.prototype.A3f = function(eps) {
    // Evaluate A3
    return m.polyval(nA3x_ - 1, this._A3x, 0, eps);
  };

  g.Geodesic.prototype.C3f = function(eps, c) {
    // Evaluate C3 coeffs
    // Elements c[1] thru c[nC3_ - 1] are set
    var mult = 1,
        o = 0,
        l, p;
    for (l = 1; l < g.nC3_; ++l) { // l is index of C3[l]
      p = g.nC3_ - l - 1;          // order of polynomial in eps
      mult *= eps;
      c[l] = mult * m.polyval(p, this._C3x, o, eps);
      o += p + 1;
    }
  };

  g.Geodesic.prototype.C4f = function(eps, c) {
    // Evaluate C4 coeffs
    // Elements c[0] thru c[g.nC4_ - 1] are set
    var mult = 1,
        o = 0,
        l, p;
    for (l = 0; l < g.nC4_; ++l) { // l is index of C4[l]
      p = g.nC4_ - l - 1;          // order of polynomial in eps
      c[l] = mult * m.polyval(p, this._C4x, o, eps);
      o += p + 1;
      mult *= eps;
    }
  };

  // return s12b, m12b, m0, M12, M21
  g.Geodesic.prototype.Lengths = function(eps, sig12,
                                          ssig1, csig1, dn1, ssig2, csig2, dn2,
                                          cbet1, cbet2, outmask,
                                          C1a, C2a) {
    // Return m12b = (reduced length)/_b; also calculate s12b =
    // distance/_b, and m0 = coefficient of secular term in
    // expression for reduced length.
    outmask &= g.OUT_MASK;
    var vals = {},
        m0x = 0, J12 = 0, A1 = 0, A2 = 0,
        B1, B2, l, csig12, t;
    if (outmask & (g.DISTANCE | g.REDUCEDLENGTH | g.GEODESICSCALE)) {
      A1 = g.A1m1f(eps);
      g.C1f(eps, C1a);
      if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
        A2 = g.A2m1f(eps);
        g.C2f(eps, C2a);
        m0x = A1 - A2;
        A2 = 1 + A2;
      }
      A1 = 1 + A1;
    }
    if (outmask & g.DISTANCE) {
      B1 = g.SinCosSeries(true, ssig2, csig2, C1a) -
        g.SinCosSeries(true, ssig1, csig1, C1a);
      // Missing a factor of _b
      vals.s12b = A1 * (sig12 + B1);
      if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
        B2 = g.SinCosSeries(true, ssig2, csig2, C2a) -
          g.SinCosSeries(true, ssig1, csig1, C2a);
        J12 = m0x * sig12 + (A1 * B1 - A2 * B2);
      }
    } else if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
      // Assume here that nC1_ >= nC2_
      for (l = 1; l <= g.nC2_; ++l)
        C2a[l] = A1 * C1a[l] - A2 * C2a[l];
      J12 = m0x * sig12 + (g.SinCosSeries(true, ssig2, csig2, C2a) -
                           g.SinCosSeries(true, ssig1, csig1, C2a));
    }
    if (outmask & g.REDUCEDLENGTH) {
      vals.m0 = m0x;
      // Missing a factor of _b.
      // Add parens around (csig1 * ssig2) and (ssig1 * csig2) to ensure
      // accurate cancellation in the case of coincident points.
      vals.m12b = dn2 * (csig1 * ssig2) - dn1 * (ssig1 * csig2) -
        csig1 * csig2 * J12;
    }
    if (outmask & g.GEODESICSCALE) {
      csig12 = csig1 * csig2 + ssig1 * ssig2;
      t = this._ep2 * (cbet1 - cbet2) * (cbet1 + cbet2) / (dn1 + dn2);
      vals.M12 = csig12 + (t * ssig2 - csig2 * J12) * ssig1 / dn1;
      vals.M21 = csig12 - (t * ssig1 - csig1 * J12) * ssig2 / dn2;
    }
    return vals;
  };

  // return sig12, salp1, calp1, salp2, calp2, dnm
  g.Geodesic.prototype.InverseStart = function(sbet1, cbet1, dn1,
                                               sbet2, cbet2, dn2, lam12,
                                               C1a, C2a) {
    // Return a starting point for Newton's method in salp1 and calp1
    // (function value is -1).  If Newton's method doesn't need to be
    // used, return also salp2 and calp2 and function value is sig12.
    // salp2, calp2 only updated if return val >= 0.
    var vals = {},
        // bet12 = bet2 - bet1 in [0, pi); bet12a = bet2 + bet1 in (-pi, 0]
        sbet12 = sbet2 * cbet1 - cbet2 * sbet1,
        cbet12 = cbet2 * cbet1 + sbet2 * sbet1,
        sbet12a, shortline, omg12, sbetm2, somg12, comg12, t, ssig12, csig12,
        x, y, lamscale, betscale, k2, eps, cbet12a, bet12a, m12b, m0, nvals,
        k, omg12a;
    vals.sig12 = -1;        // Return value
    // Volatile declaration needed to fix inverse cases
    // 88.202499451857 0 -88.202499451857 179.981022032992859592
    // 89.262080389218 0 -89.262080389218 179.992207982775375662
    // 89.333123580033 0 -89.333123580032997687 179.99295812360148422
    // which otherwise fail with g++ 4.4.4 x86 -O3
    sbet12a = sbet2 * cbet1;
    sbet12a += cbet2 * sbet1;

    shortline = cbet12 >= 0 && sbet12 < 0.5 && cbet2 * lam12 < 0.5;
    omg12 = lam12;
    if (shortline) {
      sbetm2 = m.sq(sbet1 + sbet2);
      // sin((bet1+bet2)/2)^2
      // =  (sbet1 + sbet2)^2 / ((sbet1 + sbet2)^2 + (cbet1 + cbet2)^2)
      sbetm2 /= sbetm2 + m.sq(cbet1 + cbet2);
      vals.dnm = Math.sqrt(1 + this._ep2 * sbetm2);
      omg12 /= this._f1 * vals.dnm;
    }
    somg12 = Math.sin(omg12); comg12 = Math.cos(omg12);

    vals.salp1 = cbet2 * somg12;
    vals.calp1 = comg12 >= 0 ?
      sbet12 + cbet2 * sbet1 * m.sq(somg12) / (1 + comg12) :
      sbet12a - cbet2 * sbet1 * m.sq(somg12) / (1 - comg12);

    ssig12 = m.hypot(vals.salp1, vals.calp1);
    csig12 = sbet1 * sbet2 + cbet1 * cbet2 * comg12;

    if (shortline && ssig12 < this._etol2) {
      // really short lines
      vals.salp2 = cbet1 * somg12;
      vals.calp2 = sbet12 - cbet1 * sbet2 *
        (comg12 >= 0 ? m.sq(somg12) / (1 + comg12) : 1 - comg12);
      // norm(vals.salp2, vals.calp2);
      t = m.hypot(vals.salp2, vals.calp2); vals.salp2 /= t; vals.calp2 /= t;
      // Set return value
      vals.sig12 = Math.atan2(ssig12, csig12);
    } else if (Math.abs(this._n) > 0.1 || // Skip astroid calc if too eccentric
               csig12 >= 0 ||
               ssig12 >= 6 * Math.abs(this._n) * Math.PI * m.sq(cbet1)) {
      // Nothing to do, zeroth order spherical approximation is OK
    } else {
      // Scale lam12 and bet2 to x, y coordinate system where antipodal
      // point is at origin and singular point is at y = 0, x = -1.
      if (this.f >= 0) {       // In fact f == 0 does not get here
        // x = dlong, y = dlat
        k2 = m.sq(sbet1) * this._ep2;
        eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
        lamscale = this.f * cbet1 * this.A3f(eps) * Math.PI;
        betscale = lamscale * cbet1;

        x = (lam12 - Math.PI) / lamscale;
        y = sbet12a / betscale;
      } else {                  // f < 0
        // x = dlat, y = dlong
        cbet12a = cbet2 * cbet1 - sbet2 * sbet1;
        bet12a = Math.atan2(sbet12a, cbet12a);
        // In the case of lon12 = 180, this repeats a calculation made
        // in Inverse.
        nvals = this.Lengths(this._n, Math.PI + bet12a,
                             sbet1, -cbet1, dn1, sbet2, cbet2, dn2,
                             cbet1, cbet2, g.REDUCEDLENGTH, C1a, C2a);
        m12b = nvals.m12b; m0 = nvals.m0;
        x = -1 + m12b / (cbet1 * cbet2 * m0 * Math.PI);
        betscale = x < -0.01 ? sbet12a / x :
          -this.f * m.sq(cbet1) * Math.PI;
        lamscale = betscale / cbet1;
        y = (lam12 - Math.PI) / lamscale;
      }

      if (y > -tol1_ && x > -1 - xthresh_) {
        // strip near cut
        if (this.f >= 0) {
          vals.salp1 = Math.min(1, -x);
          vals.calp1 = - Math.sqrt(1 - m.sq(vals.salp1));
        } else {
          vals.calp1 = Math.max(x > -tol1_ ? 0 : -1, x);
          vals.salp1 = Math.sqrt(1 - m.sq(vals.calp1));
        }
      } else {
        // Estimate alp1, by solving the astroid problem.
        //
        // Could estimate alpha1 = theta + pi/2, directly, i.e.,
        //   calp1 = y/k; salp1 = -x/(1+k);  for f >= 0
        //   calp1 = x/(1+k); salp1 = -y/k;  for f < 0 (need to check)
        //
        // However, it's better to estimate omg12 from astroid and use
        // spherical formula to compute alp1.  This reduces the mean number of
        // Newton iterations for astroid cases from 2.24 (min 0, max 6) to 2.12
        // (min 0 max 5).  The changes in the number of iterations are as
        // follows:
        //
        // change percent
        //    1       5
        //    0      78
        //   -1      16
        //   -2       0.6
        //   -3       0.04
        //   -4       0.002
        //
        // The histogram of iterations is (m = number of iterations estimating
        // alp1 directly, n = number of iterations estimating via omg12, total
        // number of trials = 148605):
        //
        //  iter    m      n
        //    0   148    186
        //    1 13046  13845
        //    2 93315 102225
        //    3 36189  32341
        //    4  5396      7
        //    5   455      1
        //    6    56      0
        //
        // Because omg12 is near pi, estimate work with omg12a = pi - omg12
        k = Astroid(x, y);
        omg12a = lamscale * ( this.f >= 0 ? -x * k/(1 + k) : -y * (1 + k)/k );
        somg12 = Math.sin(omg12a); comg12 = -Math.cos(omg12a);
        // Update spherical estimate of alp1 using omg12 instead of
        // lam12
        vals.salp1 = cbet2 * somg12;
        vals.calp1 = sbet12a -
          cbet2 * sbet1 * m.sq(somg12) / (1 - comg12);
      }
    }
    // Sanity check on starting guess.  Backwards check allows NaN through.
    if (!(vals.salp1 <= 0)) {
      // norm(vals.salp1, vals.calp1);
      t = m.hypot(vals.salp1, vals.calp1); vals.salp1 /= t; vals.calp1 /= t;
    } else {
      vals.salp1 = 1; vals.calp1 = 0;
    }
    return vals;
  };

  // return lam12, salp2, calp2, sig12, ssig1, csig1, ssig2, csig2, eps,
  // domg12, dlam12,
  g.Geodesic.prototype.Lambda12 = function(sbet1, cbet1, dn1, sbet2, cbet2, dn2,
                                           salp1, calp1, diffp,
                                           C1a, C2a, C3a) {
    var vals = {},
        t, salp0, calp0,
        somg1, comg1, somg2, comg2, omg12, B312, h0, k2, nvals;
    if (sbet1 === 0 && calp1 === 0)
      // Break degeneracy of equatorial line.  This case has already been
      // handled.
      calp1 = -g.tiny_;

    // sin(alp1) * cos(bet1) = sin(alp0)
    salp0 = salp1 * cbet1;
    calp0 = m.hypot(calp1, salp1 * sbet1); // calp0 > 0

    // tan(bet1) = tan(sig1) * cos(alp1)
    // tan(omg1) = sin(alp0) * tan(sig1) = tan(omg1)=tan(alp1)*sin(bet1)
    vals.ssig1 = sbet1; somg1 = salp0 * sbet1;
    vals.csig1 = comg1 = calp1 * cbet1;
    // norm(vals.ssig1, vals.csig1);
    t = m.hypot(vals.ssig1, vals.csig1); vals.ssig1 /= t; vals.csig1 /= t;
    // norm(somg1, comg1); -- don't need to normalize!

    // Enforce symmetries in the case abs(bet2) = -bet1.  Need to be careful
    // about this case, since this can yield singularities in the Newton
    // iteration.
    // sin(alp2) * cos(bet2) = sin(alp0)
    vals.salp2 = cbet2 !== cbet1 ? salp0 / cbet2 : salp1;
    // calp2 = sqrt(1 - sq(salp2))
    //       = sqrt(sq(calp0) - sq(sbet2)) / cbet2
    // and subst for calp0 and rearrange to give (choose positive sqrt
    // to give alp2 in [0, pi/2]).
    vals.calp2 = cbet2 !== cbet1 || Math.abs(sbet2) !== -sbet1 ?
      Math.sqrt(m.sq(calp1 * cbet1) + (cbet1 < -sbet1 ?
                                       (cbet2 - cbet1) * (cbet1 + cbet2) :
                                       (sbet1 - sbet2) * (sbet1 + sbet2))) /
      cbet2 : Math.abs(calp1);
    // tan(bet2) = tan(sig2) * cos(alp2)
    // tan(omg2) = sin(alp0) * tan(sig2).
    vals.ssig2 = sbet2; somg2 = salp0 * sbet2;
    vals.csig2 = comg2 = vals.calp2 * cbet2;
    // norm(vals.ssig2, vals.csig2);
    t = m.hypot(vals.ssig2, vals.csig2); vals.ssig2 /= t; vals.csig2 /= t;
    // norm(somg2, comg2); -- don't need to normalize!

    // sig12 = sig2 - sig1, limit to [0, pi]
    vals.sig12 = Math.atan2(Math.max(0, vals.csig1 * vals.ssig2 -
                                     vals.ssig1 * vals.csig2),
                            vals.csig1 * vals.csig2 + vals.ssig1 * vals.ssig2);

    // omg12 = omg2 - omg1, limit to [0, pi]
    omg12 = Math.atan2(Math.max(0, comg1 * somg2 - somg1 * comg2),
                       comg1 * comg2 + somg1 * somg2);
    k2 = m.sq(calp0) * this._ep2;
    vals.eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
    this.C3f(vals.eps, C3a);
    B312 = (g.SinCosSeries(true, vals.ssig2, vals.csig2, C3a) -
            g.SinCosSeries(true, vals.ssig1, vals.csig1, C3a));
    h0 = -this.f * this.A3f(vals.eps);
    vals.domg12 = salp0 * h0 * (vals.sig12 + B312);
    vals.lam12 = omg12 + vals.domg12;

    if (diffp) {
      if (vals.calp2 === 0)
        vals.dlam12 = - 2 * this._f1 * dn1 / sbet1;
      else {
        nvals = this.Lengths(vals.eps, vals.sig12,
                             vals.ssig1, vals.csig1, dn1,
                             vals.ssig2, vals.csig2, dn2,
                             cbet1, cbet2, g.REDUCEDLENGTH, C1a, C2a);
        vals.dlam12 = nvals.m12b;
        vals.dlam12 *= this._f1 / (vals.calp2 * cbet2);
      }
    }
    return vals;
  };

  /**
   * @summary Solve the inverse geodesic problem.
   * @param {number} lat1 the latitude of the first point in degrees.
   * @param {number} lon1 the longitude of the first point in degrees.
   * @param {number} lat2 the latitude of the second point in degrees.
   * @param {number} lon2 the longitude of the second point in degrees.
   * @param {bitmask} [outmask = STANDARD] which results to include.
   * @returns {object} the requested results
   * @description The lat1, lon1, lat2, lon2, and a12 fields of the result are
   *   always set.  For details on the outmask parameter, see {@tutorial
   *   2-interface}, "The outmask and caps parameters".
   */
  g.Geodesic.prototype.Inverse = function(lat1, lon1, lat2, lon2, outmask) {
    var vals = {},
        lon12, lonsign, t, swapp, latsign,
        sbet1, cbet1, sbet2, cbet2, s12x, m12x,
        dn1, dn2, lam12, slam12, clam12,
        sig12, calp1, salp1, calp2, salp2, C1a, C2a, C3a, meridian, nvals,
        ssig1, csig1, ssig2, csig2, eps, omg12, dnm,
        numit, salp1a, calp1a, salp1b, calp1b,
        tripn, tripb, v, dv, dalp1, sdalp1, cdalp1, nsalp1,
        lengthmask, salp0, calp0, alp12, k2, A4, C4a, B41, B42,
        somg12, domg12, dbet1, dbet2, salp12, calp12;
    if (!outmask) outmask = g.STANDARD;
    if (outmask == g.LONG_UNROLL) outmask |= g.STANDARD;
    outmask &= g.OUT_MASK;
    // Compute longitude difference (AngDiff does this carefully).  Result is
    // in [-180, 180] but -180 is only for west-going geodesics.  180 is for
    // east-going and meridional geodesics.
    vals.lat1 = lat1 = m.LatFix(lat1); vals.lat2 = lat2 = m.LatFix(lat2);
    lon12 = m.AngDiff(lon1, lon2);
    if (outmask & g.LONG_UNROLL) {
      vals.lon1 = lon1; vals.lon2 = lon1 + lon12;
    } else {
      vals.lon1 = m.AngNormalize(lon1); vals.lon2 = m.AngNormalize(lon2);
    }
    // If very close to being on the same half-meridian, then make it so.
    lon12 = m.AngRound(lon12);
    // Make longitude difference positive.
    lonsign = lon12 >= 0 ? 1 : -1;
    lon12 *= lonsign;
    // If really close to the equator, treat as on equator.
    lat1 = m.AngRound(lat1);
    lat2 = m.AngRound(lat2);
    // Swap points so that point with higher (abs) latitude is point 1
    // If one latitude is a nan, then it becomes lat1.
    swapp = Math.abs(lat1) < Math.abs(lat2) ? -1 : 1;
    if (swapp < 0) {
      lonsign *= -1;
      t = lat1;
      lat1 = lat2;
      lat2 = t;
      // swap(lat1, lat2);
    }
    // Make lat1 <= 0
    latsign = lat1 < 0 ? 1 : -1;
    lat1 *= latsign;
    lat2 *= latsign;
    // Now we have
    //
    //     0 <= lon12 <= 180
    //     -90 <= lat1 <= 0
    //     lat1 <= lat2 <= -lat1
    //
    // longsign, swapp, latsign register the transformation to bring the
    // coordinates to this canonical form.  In all cases, 1 means no change was
    // made.  We make these transformations so that there are few cases to
    // check, e.g., on verifying quadrants in atan2.  In addition, this
    // enforces some symmetries in the results returned.

    t = m.sincosd(lat1); sbet1 = this._f1 * t.s; cbet1 = t.c;
    // norm(sbet1, cbet1);
    t = m.hypot(sbet1, cbet1); sbet1 /= t; cbet1 /= t;
    // Ensure cbet1 = +epsilon at poles
    cbet1 = Math.max(g.tiny_, cbet1);

    t = m.sincosd(lat2); sbet2 = this._f1 * t.s; cbet2 = t.c;
    // norm(sbet2, cbet2);
    t = m.hypot(sbet2, cbet2); sbet2 /= t; cbet2 /= t;
    // Ensure cbet2 = +epsilon at poles
    cbet2 = Math.max(g.tiny_, cbet2);

    // If cbet1 < -sbet1, then cbet2 - cbet1 is a sensitive measure of the
    // |bet1| - |bet2|.  Alternatively (cbet1 >= -sbet1), abs(sbet2) + sbet1 is
    // a better measure.  This logic is used in assigning calp2 in Lambda12.
    // Sometimes these quantities vanish and in that case we force bet2 = +/-
    // bet1 exactly.  An example where is is necessary is the inverse problem
    // 48.522876735459 0 -48.52287673545898293 179.599720456223079643
    // which failed with Visual Studio 10 (Release and Debug)

    if (cbet1 < -sbet1) {
      if (cbet2 === cbet1)
        sbet2 = sbet2 < 0 ? sbet1 : -sbet1;
    } else {
      if (Math.abs(sbet2) === -sbet1)
        cbet2 = cbet1;
    }

    dn1 = Math.sqrt(1 + this._ep2 * m.sq(sbet1));
    dn2 = Math.sqrt(1 + this._ep2 * m.sq(sbet2));

    lam12 = lon12 * m.degree;
    t = m.sincosd(lon12); slam12 = t.s; clam12 = t.c;

    // index zero elements of these arrays are unused
    C1a = new Array(g.nC1_ + 1);
    C2a = new Array(g.nC2_ + 1)
    C3a = new Array(g.nC3_);

    meridian = lat1 === -90 || slam12 === 0;
    if (meridian) {

      // Endpoints are on a single full meridian, so the geodesic might
      // lie on a meridian.

      calp1 = clam12; salp1 = slam12; // Head to the target longitude
      calp2 = 1; salp2 = 0;           // At the target we're heading north

      // tan(bet) = tan(sig) * cos(alp)
      ssig1 = sbet1; csig1 = calp1 * cbet1;
      ssig2 = sbet2; csig2 = calp2 * cbet2;

      // sig12 = sig2 - sig1
      sig12 = Math.atan2(Math.max(0, csig1 * ssig2 - ssig1 * csig2),
                         csig1 * csig2 + ssig1 * ssig2);
      nvals = this.Lengths(this._n, sig12,
                           ssig1, csig1, dn1, ssig2, csig2, dn2, cbet1, cbet2,
                           outmask | g.DISTANCE | g.REDUCEDLENGTH,
                           C1a, C2a);
      s12x = nvals.s12b;
      m12x = nvals.m12b;
      // Ignore m0
      if ((outmask & g.GEODESICSCALE) !== 0) {
        vals.M12 = nvals.M12;
        vals.M21 = nvals.M21;
      }
      // Add the check for sig12 since zero length geodesics might yield
      // m12 < 0.  Test case was
      //
      //    echo 20.001 0 20.001 0 | GeodSolve -i
      //
      // In fact, we will have sig12 > pi/2 for meridional geodesic
      // which is not a shortest path.
      if (sig12 < 1 || m12x >= 0) {
        // Need at least 2, to handle 90 0 90 180
        if (sig12 < 3 * g.tiny_)
          sig12 = m12x = s12x = 0;
        m12x *= this._b;
        s12x *= this._b;
        vals.a12 = sig12 / m.degree;
      } else
        // m12 < 0, i.e., prolate and too close to anti-podal
        meridian = false;
    }

    if (!meridian &&
        sbet1 === 0 &&           // and sbet2 == 0
        // Mimic the way Lambda12 works with calp1 = 0
        (this.f <= 0 || lam12 <= Math.PI - this.f * Math.PI)) {

      // Geodesic runs along equator
      calp1 = calp2 = 0; salp1 = salp2 = 1;
      s12x = this.a * lam12;
      sig12 = omg12 = lam12 / this._f1;
      m12x = this._b * Math.sin(sig12);
      if (outmask & g.GEODESICSCALE)
        vals.M12 = vals.M21 = Math.cos(sig12);
      vals.a12 = lon12 / this._f1;

    } else if (!meridian) {

      // Now point1 and point2 belong within a hemisphere bounded by a
      // meridian and geodesic is neither meridional or equatorial.

      // Figure a starting point for Newton's method
      nvals = this.InverseStart(sbet1, cbet1, dn1, sbet2, cbet2, dn2, lam12,
                                C1a, C2a);
      sig12 = nvals.sig12;
      salp1 = nvals.salp1;
      calp1 = nvals.calp1;

      if (sig12 >= 0) {
        salp2 = nvals.salp2;
        calp2 = nvals.calp2;
        // Short lines (InverseStart sets salp2, calp2, dnm)

        dnm = nvals.dnm;
        s12x = sig12 * this._b * dnm;
        m12x = m.sq(dnm) * this._b * Math.sin(sig12 / dnm);
        if (outmask & g.GEODESICSCALE)
          vals.M12 = vals.M21 = Math.cos(sig12 / dnm);
        vals.a12 = sig12 / m.degree;
        omg12 = lam12 / (this._f1 * dnm);
      } else {

        // Newton's method.  This is a straightforward solution of f(alp1) =
        // lambda12(alp1) - lam12 = 0 with one wrinkle.  f(alp) has exactly one
        // root in the interval (0, pi) and its derivative is positive at the
        // root.  Thus f(alp) is positive for alp > alp1 and negative for alp <
        // alp1.  During the course of the iteration, a range (alp1a, alp1b) is
        // maintained which brackets the root and with each evaluation of
        // f(alp) the range is shrunk if possible.  Newton's method is
        // restarted whenever the derivative of f is negative (because the new
        // value of alp1 is then further from the solution) or if the new
        // estimate of alp1 lies outside (0,pi); in this case, the new starting
        // guess is taken to be (alp1a + alp1b) / 2.
        numit = 0;
        // Bracketing range
        salp1a = g.tiny_; calp1a = 1; salp1b = g.tiny_; calp1b = -1;
        for (tripn = false, tripb = false; numit < maxit2_; ++numit) {
          // the WGS84 test set: mean = 1.47, sd = 1.25, max = 16
          // WGS84 and random input: mean = 2.85, sd = 0.60
          nvals = this.Lambda12(sbet1, cbet1, dn1, sbet2, cbet2, dn2,
                                salp1, calp1, numit < maxit1_,
                                C1a, C2a, C3a);
          v = nvals.lam12 - lam12;
          salp2 = nvals.salp2;
          calp2 = nvals.calp2;
          sig12 = nvals.sig12;
          ssig1 = nvals.ssig1;
          csig1 = nvals.csig1;
          ssig2 = nvals.ssig2;
          csig2 = nvals.csig2;
          eps = nvals.eps;
          omg12 = nvals.domg12;
          dv = nvals.dlam12;

          // 2 * tol0 is approximately 1 ulp for a number in [0, pi].
          // Reversed test to allow escape with NaNs
          if (tripb || !(Math.abs(v) >= (tripn ? 8 : 2) * tol0_))
            break;
          // Update bracketing values
          if (v > 0 && (numit < maxit1_ || calp1/salp1 > calp1b/salp1b)) {
              salp1b = salp1; calp1b = calp1;
          } else if (v < 0 &&
                     (numit < maxit1_ || calp1/salp1 < calp1a/salp1a)) {
            salp1a = salp1; calp1a = calp1;
          }
          if (numit < maxit1_ && dv > 0) {
            dalp1 = -v/dv;
            sdalp1 = Math.sin(dalp1); cdalp1 = Math.cos(dalp1);
            nsalp1 = salp1 * cdalp1 + calp1 * sdalp1;
            if (nsalp1 > 0 && Math.abs(dalp1) < Math.PI) {
              calp1 = calp1 * cdalp1 - salp1 * sdalp1;
              salp1 = nsalp1;
              // norm(salp1, calp1);
              t = m.hypot(salp1, calp1); salp1 /= t; calp1 /= t;
              // In some regimes we don't get quadratic convergence because
              // slope -> 0.  So use convergence conditions based on epsilon
              // instead of sqrt(epsilon).
              tripn = Math.abs(v) <= 16 * tol0_;
              continue;
            }
          }
          // Either dv was not postive or updated value was outside legal
          // range.  Use the midpoint of the bracket as the next estimate.
          // This mechanism is not needed for the WGS84 ellipsoid, but it does
          // catch problems with more eccentric ellipsoids.  Its efficacy is
          // such for the WGS84 test set with the starting guess set to alp1 =
          // 90deg:
          // the WGS84 test set: mean = 5.21, sd = 3.93, max = 24
          // WGS84 and random input: mean = 4.74, sd = 0.99
          salp1 = (salp1a + salp1b)/2;
          calp1 = (calp1a + calp1b)/2;
          // norm(salp1, calp1);
          t = m.hypot(salp1, calp1); salp1 /= t; calp1 /= t;
          tripn = false;
          tripb = (Math.abs(salp1a - salp1) + (calp1a - calp1) < tolb_ ||
                   Math.abs(salp1 - salp1b) + (calp1 - calp1b) < tolb_);
        }
        lengthmask = outmask |
            (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE) ?
             g.DISTANCE : g.NONE);
        nvals = this.Lengths(eps, sig12,
                             ssig1, csig1, dn1, ssig2, csig2, dn2, cbet1, cbet2,
                             lengthmask, C1a, C2a);
        s12x = nvals.s12b;
        m12x = nvals.m12b;
        // Ignore m0
        if ((outmask & g.GEODESICSCALE) !== 0) {
          vals.M12 = nvals.M12;
          vals.M21 = nvals.M21;
        }
        m12x *= this._b;
        s12x *= this._b;
        vals.a12 = sig12 / m.degree;
        omg12 = lam12 - omg12;
      }
    }

    if (outmask & g.DISTANCE)
      vals.s12 = 0 + s12x;      // Convert -0 to 0

    if (outmask & g.REDUCEDLENGTH)
      vals.m12 = 0 + m12x;      // Convert -0 to 0

    if (outmask & g.AREA) {
      // From Lambda12: sin(alp1) * cos(bet1) = sin(alp0)
      salp0 = salp1 * cbet1;
      calp0 = m.hypot(calp1, salp1 * sbet1); // calp0 > 0
      if (calp0 !== 0 && salp0 !== 0) {
        // From Lambda12: tan(bet) = tan(sig) * cos(alp)
        ssig1 = sbet1; csig1 = calp1 * cbet1;
        ssig2 = sbet2; csig2 = calp2 * cbet2;
        k2 = m.sq(calp0) * this._ep2;
        eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
        // Multiplier = a^2 * e^2 * cos(alpha0) * sin(alpha0).
        A4 = m.sq(this.a) * calp0 * salp0 * this._e2;
        // norm(ssig1, csig1);
        t = m.hypot(ssig1, csig1); ssig1 /= t; csig1 /= t;
        // norm(ssig2, csig2);
        t = m.hypot(ssig2, csig2); ssig2 /= t; csig2 /= t;
        C4a = new Array(g.nC4_);
        this.C4f(eps, C4a);
        B41 = g.SinCosSeries(false, ssig1, csig1, C4a);
        B42 = g.SinCosSeries(false, ssig2, csig2, C4a);
        vals.S12 = A4 * (B42 - B41);
      } else
        // Avoid problems with indeterminate sig1, sig2 on equator
        vals.S12 = 0;
      if (!meridian &&
          omg12 < 0.75 * Math.PI && // Long difference too big
          sbet2 - sbet1 < 1.75) {   // Lat difference too big
          // Use tan(Gamma/2) = tan(omg12/2)
          // * (tan(bet1/2)+tan(bet2/2))/(1+tan(bet1/2)*tan(bet2/2))
          // with tan(x/2) = sin(x)/(1+cos(x))
        somg12 = Math.sin(omg12); domg12 = 1 + Math.cos(omg12);
        dbet1 = 1 + cbet1; dbet2 = 1 + cbet2;
        alp12 = 2 * Math.atan2( somg12 * (sbet1*dbet2 + sbet2*dbet1),
                                domg12 * (sbet1*sbet2 + dbet1*dbet2) );
      } else {
        // alp12 = alp2 - alp1, used in atan2 so no need to normalize
        salp12 = salp2 * calp1 - calp2 * salp1;
        calp12 = calp2 * calp1 + salp2 * salp1;
        // The right thing appears to happen if alp1 = +/-180 and alp2 = 0, viz
        // salp12 = -0 and alp12 = -180.  However this depends on the sign
        // being attached to 0 correctly.  The following ensures the correct
        // behavior.
        if (salp12 === 0 && calp12 < 0) {
          salp12 = g.tiny_ * calp1;
          calp12 = -1;
        }
        alp12 = Math.atan2(salp12, calp12);
      }
      vals.S12 += this._c2 * alp12;
      vals.S12 *= swapp * lonsign * latsign;
      // Convert -0 to 0
      vals.S12 += 0;
    }

    // Convert calp, salp to azimuth accounting for lonsign, swapp, latsign.
    if (swapp < 0) {
      t = salp1;
      salp1 = salp2;
      salp2 = t;
      // swap(salp1, salp2);
      t = calp1;
      calp1 = calp2;
      calp2 = t;
      // swap(calp1, calp2);
      if (outmask & g.GEODESICSCALE) {
        t = vals.M12;
        vals.M12 = vals.M21;
        vals.M21 = t;
        // swap(vals.M12, vals.M21);
      }
    }

    salp1 *= swapp * lonsign; calp1 *= swapp * latsign;
    salp2 *= swapp * lonsign; calp2 *= swapp * latsign;

    if (outmask & g.AZIMUTH) {
      vals.azi1 = m.atan2d(salp1, calp1);
      vals.azi2 = m.atan2d(salp2, calp2);
    }

    // Returned value in [0, 180]
    return vals;
  };

  /**
   * @summary Solve the general direct geodesic problem.
   * @param {number} lat1 the latitude of the first point in degrees.
   * @param {number} lon1 the longitude of the first point in degrees.
   * @param {number} azi1 the azimuth at the first point in degrees.
   * @param {bool} arcmode is the next parameter an arc length?
   * @param {number} s12_a12 the (arcmode ? arc length : distance) from the
   *   first point to the second in (arcmode ? degrees : meters).
   * @param {bitmask} [outmask = STANDARD] which results to include.
   * @returns {object} the requested results.
   * @description The lat1, lon1, azi1, and a12 fields of the result are always
   *   set; s12 is included if arcmode is false.  For details on the outmask
   *   parameter, see {@tutorial 2-interface}, "The outmask and caps
   *   parameters".
   */
  g.Geodesic.prototype.GenDirect = function (lat1, lon1, azi1,
                                             arcmode, s12_a12, outmask) {
    var line;
    if (!outmask)
      outmask = g.STANDARD;
    else if (outmask == g.LONG_UNROLL)
      outmask |= g.STANDARD;
    line = new l.GeodesicLine(this, lat1, lon1, azi1,
                              // Automatically supply DISTANCE_IN if necessary
                              outmask | (arcmode ? g.NONE : g.DISTANCE_IN));
    return line.GenPosition(arcmode, s12_a12, outmask);
  };

  /**
   * @summary Solve the direct geodesic problem.
   * @param {number} lat1 the latitude of the first point in degrees.
   * @param {number} lon1 the longitude of the first point in degrees.
   * @param {number} azi1 the azimuth at the first point in degrees.
   * @param {number} s12 the distance from the first point to the second in
   *   meters.
   * @param {bitmask} [outmask = STANDARD] which results to include.
   * @returns {object} the requested results.
   * @description The lat1, lon1, azi1, s12, and a12 fields of the result are
   *   always set.  For details on the outmask parameter, see {@tutorial
   *   2-interface}, "The outmask and caps parameters".
   */
  g.Geodesic.prototype.Direct = function (lat1, lon1, azi1, s12, outmask) {
    return this.GenDirect(lat1, lon1, azi1, false, s12, outmask);
  };

  /**
   * @summary Solve the direct geodesic problem with arc length.
   * @param {number} lat1 the latitude of the first point in degrees.
   * @param {number} lon1 the longitude of the first point in degrees.
   * @param {number} azi1 the azimuth at the first point in degrees.
   * @param {number} a12 the arc length from the first point to the second in
   *   degrees.
   * @param {bitmask} [outmask = STANDARD] which results to include.
   * @returns {object} the requested results.
   * @description The lat1, lon1, azi1, and a12 fields of the result are
   *   always set.  For details on the outmask parameter, see {@tutorial
   *   2-interface}, "The outmask and caps parameters".
   */
  g.Geodesic.prototype.ArcDirect = function (lat1, lon1, azi1, a12, outmask) {
    return this.GenDirect(lat1, lon1, azi1, true, a12, outmask);
  };

  /**
   * @summary Create a {@link module:GeographicLib/GeodesicLine.GeodesicLine
   *   GeodesicLine} object.
   * @param {number} lat1 the latitude of the first point in degrees.
   * @param {number} lon1 the longitude of the first point in degrees.
   * @param {number} azi1 the azimuth at the first point in degrees.
   *   degrees.
   * @param {bitmask} [caps = STANDARD | DISTANCE_IN] which capabilities to
   *   include.
   * @returns {object} the
   *   {@link module:GeographicLib/GeodesicLine.GeodesicLine
   *   GeodesicLine} object
   * @description For details on the caps parameter, see {@tutorial
   *   2-interface}, "The outmask and caps parameters".
   */
  g.Geodesic.prototype.Line = function (lat1, lon1, azi1, caps) {
    return new l.GeodesicLine(this, lat1, lon1, azi1, caps);
  };

  /**
   * @summary Create a {@link module:GeographicLib/PolygonArea.PolygonArea
   *   PolygonArea} object.
   * @param {bool} [polyline = false] if true the new PolygonArea object
   *   describes a polyline instead of a polygon.
   * @returns {object} the
   *   {@link module:GeographicLib/PolygonArea.PolygonArea
   *   PolygonArea} object
   */
  g.Geodesic.prototype.Polygon = function (polyline) {
    return new p.PolygonArea(this, polyline);
  };

  /**
   * @summary a {@link module:GeographicLib/Geodesic.Geodesic Geodesic} object
   *   initialized for the WGS84 ellipsoid.
   * @constant {object}
   */
  g.WGS84 = new g.Geodesic(c.WGS84.a, c.WGS84.f);
})(GeographicLib.Geodesic, GeographicLib.GeodesicLine,
   GeographicLib.PolygonArea, GeographicLib.Math, GeographicLib.Constants);

/*
 * GeodesicLine.js
 * Transcription of GeodesicLine.[ch]pp into JavaScript.
 *
 * See the documentation for the C++ class.  The conversion is a literal
 * conversion from C++.
 *
 * The algorithms are derived in
 *
 *    Charles F. F. Karney,
 *    Algorithms for geodesics, J. Geodesy 87, 43-55 (2013);
 *    https://dx.doi.org/10.1007/s00190-012-0578-z
 *    Addenda: http://geographiclib.sf.net/geod-addenda.html
 *
 * Copyright (c) Charles Karney (2011-2015) <charles@karney.com> and licensed
 * under the MIT/X11 License.  For more information, see
 * http://geographiclib.sourceforge.net/
 */

// Load AFTER GeographicLib/Math.js, GeographicLib/Geodesic.js

(function(
  g,
  /**
   * @exports GeographicLib/GeodesicLine
   * @description Solve geodesic problems on a single geodesic line via the
   *   {@link module:GeographicLib/GeodesicLine.GeodesicLine GeodesicLine}
   *   class.
   */
  l, m) {
  "use strict";

  /**
   * @class
   * @property {number} a the equatorial radius (meters).
   * @property {number} f the flattening.
   * @property {number} lat1 the initial latitude (degrees).
   * @property {number} lon1 the initial longitude (degrees).
   * @property {number} azi1 the initial azimuth (degrees).
   * @property {bitmask} caps the capabilities of the object.
   * @summary Initialize a GeodesicLine object.  For details on the caps
   *   parameter, see {@tutorial 2-interface}, "The outmask and caps
   *   parameters".
   * @classdesc Performs geodesic calculations along a given geodesic line.
   *   This object is usually instantiated by
   *   {@link module:GeographicLib/Geodesic.Geodesic#Line Geodesic.Line}.
   * @param {object} geod a {@link module:GeographicLib/Geodesic.Geodesic
   *   Geodesic} object.
   * @param {number} lat1 the latitude of the first point in degrees.
   * @param {number} lon1 the longitude of the first point in degrees.
   * @param {number} azi1 the azimuth at the first point in degrees.
   * @param {bitmask} [caps = STANDARD | DISTANCE_IN] which capabilities to
   *   include; LATITUDE | AZIMUTH are always included.
   */
  l.GeodesicLine = function(geod, lat1, lon1, azi1, caps) {
    var t, cbet1, sbet1, eps, s, c;
    if (!caps) caps = g.STANDARD | g.DISTANCE_IN;

    this.a = geod.a;
    this.f = geod.f;
    this._b = geod._b;
    this._c2 = geod._c2;
    this._f1 = geod._f1;
    this._caps = (!caps ? g.ALL : (caps | g.LATITUDE | g.AZIMUTH)) |
      g.LONG_UNROLL;

    this.lat1 = m.LatFix(lat1);
    this.lon1 = lon1;
    this.azi1 = m.AngNormalize(azi1);
    t = m.sincosd(m.AngRound(this.azi1)); this._salp1 = t.s; this._calp1 = t.c;
    t = m.sincosd(m.AngRound(this.lat1)); sbet1 = this._f1 * t.s; cbet1 = t.c;
    // norm(sbet1, cbet1);
    t = m.hypot(sbet1, cbet1); sbet1 /= t; cbet1 /= t;
    // Ensure cbet1 = +epsilon at poles
    cbet1 = Math.max(g.tiny_, cbet1);
    this._dn1 = Math.sqrt(1 + geod._ep2 * m.sq(sbet1));

    // Evaluate alp0 from sin(alp1) * cos(bet1) = sin(alp0),
    this._salp0 = this._salp1 * cbet1; // alp0 in [0, pi/2 - |bet1|]
    // Alt: calp0 = hypot(sbet1, calp1 * cbet1).  The following
    // is slightly better (consider the case salp1 = 0).
    this._calp0 = m.hypot(this._calp1, this._salp1 * sbet1);
    // Evaluate sig with tan(bet1) = tan(sig1) * cos(alp1).
    // sig = 0 is nearest northward crossing of equator.
    // With bet1 = 0, alp1 = pi/2, we have sig1 = 0 (equatorial line).
    // With bet1 =  pi/2, alp1 = -pi, sig1 =  pi/2
    // With bet1 = -pi/2, alp1 =  0 , sig1 = -pi/2
    // Evaluate omg1 with tan(omg1) = sin(alp0) * tan(sig1).
    // With alp0 in (0, pi/2], quadrants for sig and omg coincide.
    // No atan2(0,0) ambiguity at poles since cbet1 = +epsilon.
    // With alp0 = 0, omg1 = 0 for alp1 = 0, omg1 = pi for alp1 = pi.
    this._ssig1 = sbet1; this._somg1 = this._salp0 * sbet1;
    this._csig1 = this._comg1 =
      sbet1 !== 0 || this._calp1 !== 0 ? cbet1 * this._calp1 : 1;
    // norm(this._ssig1, this._csig1); // sig1 in (-pi, pi]
    t = m.hypot(this._ssig1, this._csig1);
    this._ssig1 /= t; this._csig1 /= t;
    // norm(this._somg1, this._comg1); -- don't need to normalize!

    this._k2 = m.sq(this._calp0) * geod._ep2;
    eps = this._k2 / (2 * (1 + Math.sqrt(1 + this._k2)) + this._k2);

    if (this._caps & g.CAP_C1) {
      this._A1m1 = g.A1m1f(eps);
      this._C1a = new Array(g.nC1_ + 1);
      g.C1f(eps, this._C1a);
      this._B11 = g.SinCosSeries(true, this._ssig1, this._csig1, this._C1a);
      s = Math.sin(this._B11); c = Math.cos(this._B11);
      // tau1 = sig1 + B11
      this._stau1 = this._ssig1 * c + this._csig1 * s;
      this._ctau1 = this._csig1 * c - this._ssig1 * s;
      // Not necessary because C1pa reverts C1a
      //    _B11 = -SinCosSeries(true, _stau1, _ctau1, _C1pa);
    }

    if (this._caps & g.CAP_C1p) {
      this._C1pa = new Array(g.nC1p_ + 1);
      g.C1pf(eps, this._C1pa);
    }

    if (this._caps & g.CAP_C2) {
      this._A2m1 = g.A2m1f(eps);
      this._C2a = new Array(g.nC2_ + 1);
      g.C2f(eps, this._C2a);
      this._B21 = g.SinCosSeries(true, this._ssig1, this._csig1, this._C2a);
    }

    if (this._caps & g.CAP_C3) {
      this._C3a = new Array(g.nC3_);
      geod.C3f(eps, this._C3a);
      this._A3c = -this.f * this._salp0 * geod.A3f(eps);
      this._B31 = g.SinCosSeries(true, this._ssig1, this._csig1, this._C3a);
    }

    if (this._caps & g.CAP_C4) {
      this._C4a = new Array(g.nC4_); // all the elements of _C4a are used
      geod.C4f(eps, this._C4a);
      // Multiplier = a^2 * e^2 * cos(alpha0) * sin(alpha0)
      this._A4 = m.sq(this.a) * this._calp0 * this._salp0 * geod._e2;
      this._B41 = g.SinCosSeries(false, this._ssig1, this._csig1, this._C4a);
    }
  };

  /**
   * @summary Find the position on the line (general case).
   * @param {bool} arcmode is the next parameter an arc length?
   * @param {number} s12_a12 the (arcmode ? arc length : distance) from the
   *   first point to the second in (arcmode ? degrees : meters).
   * @param {bitmask} [outmask = STANDARD] which results to include; this is
   *   subject to the capabilities of the object.
   * @returns {object} the requested results.
   * @description The lat1, lon1, azi1, and a12 fields of the result are
   *   always set; s12 is included if arcmode is false.  For details on the
   *   outmask parameter, see {@tutorial 2-interface}, "The outmask and caps
   *   parameters".
   */
  l.GeodesicLine.prototype.GenPosition = function(arcmode, s12_a12,
                                                  outmask) {
    var vals = {},
        sig12, ssig12, csig12, B12, AB1, ssig2, csig2, tau12, s, c, serr,
        omg12, lam12, lon12, E, sbet2, cbet2, somg2, comg2, salp2, calp2, dn2,
        B22, AB2, J12, t, B42, salp12, calp12;
    if (!outmask)
      outmask = g.STANDARD;
    else if (outmask == g.LONG_UNROLL)
      outmask |= g.STANDARD;
    outmask &= this._caps & g.OUT_MASK;
    vals.lat1 = this.lat1; vals.azi1 = this.azi1;
    vals.lon1 = outmask & g.LONG_UNROLL ?
      this.lon1 : m.AngNormalize(this.lon1);
    if (arcmode)
      vals.a12 = s12_a12;
    else
      vals.s12 = s12_a12;
    if (!( arcmode || (this._caps & g.DISTANCE_IN & g.OUT_MASK) )) {
      // Uninitialized or impossible distance calculation requested
      vals.a12 = Number.NaN;
      return vals;
    }

    // Avoid warning about uninitialized B12.
    B12 = 0; AB1 = 0;
    if (arcmode) {
      // Interpret s12_a12 as spherical arc length
      sig12 = s12_a12 * m.degree;
      t = m.sincosd(s12_a12); ssig12 = t.s; csig12 = t.c;
    } else {
      // Interpret s12_a12 as distance
      tau12 = s12_a12 / (this._b * (1 + this._A1m1));
      s = Math.sin(tau12);
      c = Math.cos(tau12);
      // tau2 = tau1 + tau12
      B12 = - g.SinCosSeries(true,
                             this._stau1 * c + this._ctau1 * s,
                             this._ctau1 * c - this._stau1 * s,
                             this._C1pa);
      sig12 = tau12 - (B12 - this._B11);
      ssig12 = Math.sin(sig12); csig12 = Math.cos(sig12);
      if (Math.abs(this.f) > 0.01) {
        // Reverted distance series is inaccurate for |f| > 1/100, so correct
        // sig12 with 1 Newton iteration.  The following table shows the
        // approximate maximum error for a = WGS_a() and various f relative to
        // GeodesicExact.
        //     erri = the error in the inverse solution (nm)
        //     errd = the error in the direct solution (series only) (nm)
        //     errda = the error in the direct solution (series + 1 Newton) (nm)
        //
        //       f     erri  errd errda
        //     -1/5    12e6 1.2e9  69e6
        //     -1/10  123e3  12e6 765e3
        //     -1/20   1110 108e3  7155
        //     -1/50  18.63 200.9 27.12
        //     -1/100 18.63 23.78 23.37
        //     -1/150 18.63 21.05 20.26
        //      1/150 22.35 24.73 25.83
        //      1/100 22.35 25.03 25.31
        //      1/50  29.80 231.9 30.44
        //      1/20   5376 146e3  10e3
        //      1/10  829e3  22e6 1.5e6
        //      1/5   157e6 3.8e9 280e6
        ssig2 = this._ssig1 * csig12 + this._csig1 * ssig12;
        csig2 = this._csig1 * csig12 - this._ssig1 * ssig12;
        B12 = g.SinCosSeries(true, ssig2, csig2, this._C1a);
        serr = (1 + this._A1m1) * (sig12 + (B12 - this._B11)) -
          s12_a12 / this._b;
        sig12 = sig12 - serr / Math.sqrt(1 + this._k2 * m.sq(ssig2));
        ssig12 = Math.sin(sig12); csig12 = Math.cos(sig12);
        // Update B12 below
      }
    }

    // sig2 = sig1 + sig12
    ssig2 = this._ssig1 * csig12 + this._csig1 * ssig12;
    csig2 = this._csig1 * csig12 - this._ssig1 * ssig12;
    dn2 = Math.sqrt(1 + this._k2 * m.sq(ssig2));
    if (outmask & (g.DISTANCE | g.REDUCEDLENGTH | g.GEODESICSCALE)) {
      if (arcmode || Math.abs(this.f) > 0.01)
        B12 = g.SinCosSeries(true, ssig2, csig2, this._C1a);
      AB1 = (1 + this._A1m1) * (B12 - this._B11);
    }
    // sin(bet2) = cos(alp0) * sin(sig2)
    sbet2 = this._calp0 * ssig2;
    // Alt: cbet2 = hypot(csig2, salp0 * ssig2);
    cbet2 = m.hypot(this._salp0, this._calp0 * csig2);
    if (cbet2 === 0)
      // I.e., salp0 = 0, csig2 = 0.  Break the degeneracy in this case
      cbet2 = csig2 = g.tiny_;
    // tan(alp0) = cos(sig2)*tan(alp2)
    salp2 = this._salp0; calp2 = this._calp0 * csig2; // No need to normalize

    if (arcmode && (outmask & g.DISTANCE))
      vals.s12 = this._b * ((1 + this._A1m1) * sig12 + AB1);

    if (outmask & g.LONGITUDE) {
      // tan(omg2) = sin(alp0) * tan(sig2)
      somg2 = this._salp0 * ssig2; comg2 = csig2; // No need to normalize
      E = this._salp0 < 0 ? -1 : 1;
      // omg12 = omg2 - omg1
      omg12 = outmask & g.LONG_UNROLL ?
        E * (sig12 -
             (Math.atan2(ssig2, csig2) -
              Math.atan2(this._ssig1, this._csig1)) +
             (Math.atan2(E * somg2, comg2) -
              Math.atan2(E * this._somg1, this._comg1))) :
        Math.atan2(somg2 * this._comg1 - comg2 * this._somg1,
                     comg2 * this._comg1 + somg2 * this._somg1);
      lam12 = omg12 + this._A3c *
        ( sig12 + (g.SinCosSeries(true, ssig2, csig2, this._C3a) -
                   this._B31));
      lon12 = lam12 / m.degree;
      vals.lon2 = outmask & g.LONG_UNROLL ? this.lon1 + lon12 :
        m.AngNormalize(m.AngNormalize(this.lon1) + m.AngNormalize(lon12));
    }

    if (outmask & g.LATITUDE)
      vals.lat2 = m.atan2d(sbet2, this._f1 * cbet2);

    if (outmask & g.AZIMUTH)
      vals.azi2 = m.atan2d(salp2, calp2);

    if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
      B22 = g.SinCosSeries(true, ssig2, csig2, this._C2a);
      AB2 = (1 + this._A2m1) * (B22 - this._B21);
      J12 = (this._A1m1 - this._A2m1) * sig12 + (AB1 - AB2);
      if (outmask & g.REDUCEDLENGTH)
        // Add parens around (_csig1 * ssig2) and (_ssig1 * csig2) to ensure
        // accurate cancellation in the case of coincident points.
        vals.m12 = this._b * ((      dn2 * (this._csig1 * ssig2) -
                               this._dn1 * (this._ssig1 * csig2)) -
                              this._csig1 * csig2 * J12);
      if (outmask & g.GEODESICSCALE) {
        t = this._k2 * (ssig2 - this._ssig1) * (ssig2 + this._ssig1) /
          (this._dn1 + dn2);
        vals.M12 = csig12 + (t * ssig2 - csig2 * J12) * this._ssig1 / this._dn1;
        vals.M21 = csig12 - (t * this._ssig1 - this._csig1 * J12) * ssig2 / dn2;
      }
    }

    if (outmask & g.AREA) {
      B42 = g.SinCosSeries(false, ssig2, csig2, this._C4a);
      if (this._calp0 === 0 || this._salp0 === 0) {
        // alp12 = alp2 - alp1, used in atan2 so no need to normalize
        salp12 = salp2 * this._calp1 - calp2 * this._salp1;
        calp12 = calp2 * this._calp1 + salp2 * this._salp1;
        // The right thing appears to happen if alp1 = +/-180 and alp2 = 0, viz
        // salp12 = -0 and alp12 = -180.  However this depends on the sign being
        // attached to 0 correctly.  The following ensures the correct behavior.
        if (salp12 === 0 && calp12 < 0) {
          salp12 = g.tiny_ * this._calp1;
          calp12 = -1;
        }
      } else {
        // tan(alp) = tan(alp0) * sec(sig)
        // tan(alp2-alp1) = (tan(alp2) -tan(alp1)) / (tan(alp2)*tan(alp1)+1)
        // = calp0 * salp0 * (csig1-csig2) / (salp0^2 + calp0^2 * csig1*csig2)
        // If csig12 > 0, write
        //   csig1 - csig2 = ssig12 * (csig1 * ssig12 / (1 + csig12) + ssig1)
        // else
        //   csig1 - csig2 = csig1 * (1 - csig12) + ssig12 * ssig1
        // No need to normalize
        salp12 = this._calp0 * this._salp0 *
          (csig12 <= 0 ? this._csig1 * (1 - csig12) + ssig12 * this._ssig1 :
           ssig12 * (this._csig1 * ssig12 / (1 + csig12) + this._ssig1));
        calp12 = m.sq(this._salp0) + m.sq(this._calp0) * this._csig1 * csig2;
      }
      vals.S12 = this._c2 * Math.atan2(salp12, calp12) +
        this._A4 * (B42 - this._B41);
    }

    if (!arcmode)
      vals.a12 = sig12 / m.degree;
    return vals;
  };

  /**
   * @summary Find the position on the line given s12.
   * @param {number} s12 the distance from the first point to the second in
   *   meters.
   * @param {bitmask} [outmask = STANDARD] which results to include; this is
   *   subject to the capabilities of the object.
   * @returns {object} the requested results.
   * @description The lat1, lon1, azi1, s12, and a12 fields of the result are
   *   always set; s12 is included if arcmode is false.  For details on the
   *   outmask parameter, see {@tutorial 2-interface}, "The outmask and caps
   *   parameters".
   */
  l.GeodesicLine.prototype.Position = function(s12, outmask) {
    return this.GenPosition(false, s12, outmask);
  };

  /**
   * @summary Find the position on the line given a12.
   * @param {number} a12 the arc length from the first point to the second in
   *   degrees.
   * @param {bitmask} [outmask = STANDARD] which results to include; this is
   *   subject to the capabilities of the object.
   * @returns {object} the requested results.
   * @description The lat1, lon1, azi1, and a12 fields of the result are
   *   always set.  For details on the outmask parameter, see {@tutorial
   *   2-interface}, "The outmask and caps parameters".
   */
  l.GeodesicLine.prototype.ArcPosition = function(a12, outmask) {
    return this.GenPosition(true, a12, outmask);
  };

})(GeographicLib.Geodesic, GeographicLib.GeodesicLine, GeographicLib.Math);


/*
 * PolygonArea.js
 * Transcription of PolygonArea.[ch]pp into JavaScript.
 *
 * See the documentation for the C++ class.  The conversion is a literal
 * conversion from C++.
 *
 * The algorithms are derived in
 *
 *    Charles F. F. Karney,
 *    Algorithms for geodesics, J. Geodesy 87, 43-55 (2013);
 *    https://dx.doi.org/10.1007/s00190-012-0578-z
 *    Addenda: http://geographiclib.sf.net/geod-addenda.html
 *
 * Copyright (c) Charles Karney (2011-2014) <charles@karney.com> and licensed
 * under the MIT/X11 License.  For more information, see
 * http://geographiclib.sourceforge.net/
 */

// Load AFTER GeographicLib/Math.js and GeographicLib/Geodesic.js

(function(
  /**
   * @exports GeographicLib/PolygonArea
   * @description Compute the area of geodesic polygons via the
   *   {@link module:GeographicLib/PolygonArea.PolygonArea PolygonArea}
   *   class.
   */
  p, g, m, a) {
  "use strict";

  var transit, transitdirect;
  transit = function(lon1, lon2) {
    // Return 1 or -1 if crossing prime meridian in east or west direction.
    // Otherwise return zero.
    var lon12, cross;
    // Compute lon12 the same way as Geodesic::Inverse.
    lon1 = m.AngNormalize(lon1);
    lon2 = m.AngNormalize(lon2);
    lon12 = m.AngDiff(lon1, lon2);
    cross = lon1 < 0 && lon2 >= 0 && lon12 > 0 ? 1 :
      (lon2 < 0 && lon1 >= 0 && lon12 < 0 ? -1 : 0);
    return cross;
  };

  // an alternate version of transit to deal with longitudes in the direct
  // problem.
  transitdirect = function(lon1, lon2) {
    // We want to compute exactly
    //   int(floor(lon2 / 360)) - int(floor(lon1 / 360))
    // Since we only need the parity of the result we can use std::remquo but
    // this is buggy with g++ 4.8.3 and requires C++11.  So instead we do
    lon1 = lon1 % 720.0; lon2 = lon2 % 720.0;
    return ( ((lon2 >= 0 && lon2 < 360) || lon2 < -360 ? 0 : 1) -
             ((lon1 >= 0 && lon1 < 360) || lon1 < -360 ? 0 : 1) );
  };

  /**
   * @class
   * @property {number} a the equatorial radius (meters).
   * @property {number} f the flattening.
   * @property {bool} polyline whether the PolygonArea object describes a
   *   polyline or a polygon.
   * @property {number} num the number of vertices so far.
   * @property {number} lat the current latitude (degrees).
   * @property {number} lon the current longitude (degrees).
   * @summary Initialize a PolygonArea object.
   * @classdesc Computes the area and perimeter of a geodesic polygon.
   *   This object is usually instantiated by
   *   {@link module:GeographicLib/Geodesic.Geodesic#Polygon Geodesic.Polygon}.
   * @param {object} geod a {@link module:GeographicLib/Geodesic.Geodesic
   *   Geodesic} object.
   * @param {bool} [polyline = false] if true the new PolygonArea object
   *   describes a polyline instead of a polygon.
   */
  p.PolygonArea = function(geod, polyline) {
    this._geod = geod;
    this.a = this._geod.a;
    this.f = this._geod.f;
    this._area0 = 4 * Math.PI * geod._c2;
    this.polyline = !polyline ? false : polyline;
    this._mask = g.LATITUDE | g.LONGITUDE | g.DISTANCE |
          (this.polyline ? g.NONE : g.AREA | g.LONG_UNROLL);
    if (!this.polyline)
      this._areasum = new a.Accumulator(0);
    this._perimetersum = new a.Accumulator(0);
    this.Clear();
  };

  /**
   * @summary Clear the PolygonArea object, setting the number of vertices to
   *   0.
   */
  p.PolygonArea.prototype.Clear = function() {
    this.num = 0;
    this._crossings = 0;
    if (!this.polyline)
      this._areasum.Set(0);
    this._perimetersum.Set(0);
    this._lat0 = this._lon0 = this.lat = this.lon = Number.NaN;
  };

  /**
   * @summary Add the next vertex to the polygon.
   * @param {number} lat the latitude of the point (degrees).
   * @param {number} lon the longitude of the point (degrees).
   * @description This adds an edge from the current vertex to the new vertex.
   */
  p.PolygonArea.prototype.AddPoint = function(lat, lon) {
    var t;
    if (this.num === 0) {
      this._lat0 = this.lat = lat;
      this._lon0 = this.lon = lon;
    } else {
      t = this._geod.Inverse(this.lat, this.lon, lat, lon, this._mask);
      this._perimetersum.Add(t.s12);
      if (!this.polyline) {
        this._areasum.Add(t.S12);
        this._crossings += transit(this.lon, lon);
      }
      this.lat = lat;
      this.lon = lon;
    }
    ++this.num;
  };

  /**
   * @summary Add the next edge to the polygon.
   * @param {number} azi the azimuth at the current the point (degrees).
   * @param {number} s the length of the edge (meters).
   * @description This specifies the new vertex in terms of the edge from the
   *   current vertex.
   */
  p.PolygonArea.prototype.AddEdge = function(azi, s) {
    var t;
    if (this.num) {
      t = this._geod.Direct(this.lat, this.lon, azi, s, this._mask);
      this._perimetersum.Add(s);
      if (!this.polyline) {
        this._areasum.Add(t.S12);
        this._crossings += transitdirect(this.lon, t.lon2);
      }
      this.lat = t.lat2;
      this.lon = t.lon2;
    }
    ++this.num;
  };

  /**
   * @summary Compute the perimeter and area of the polygon.
   * @param {bool} reverse if true then clockwise (instead of
   *   counter-clockwise) traversal counts as a positive area.
   * @param {bool} sign if true then return a signed result for the area if the
   *   polygon is traversed in the "wrong" direction instead of returning the
   * @returns {object} r where r.number is the number of vertices, r.perimeter
   *   is the perimeter (meters), and r.area (only returned if polyline is
   *   false) is the area (meters<sup>2</sup>).
   * @description More points can be added to the polygon after this call.
   */
  p.PolygonArea.prototype.Compute = function(reverse, sign) {
    var vals = {number: this.num}, t, tempsum, crossings;
    if (this.num < 2) {
      vals.perimeter = 0;
      if (!this.polyline)
        vals.area = 0;
      return vals;
    }
    if (this.polyline) {
      vals.perimeter = this._perimetersum.Sum();
      return vals;
    }
    t = this._geod.Inverse(this.lat, this.lon, this._lat0, this._lon0,
                           this._mask);
    vals.perimeter = this._perimetersum.Sum(t.s12);
    tempsum = new a.Accumulator(this._areasum);
    tempsum.Add(t.S12);
    crossings = this._crossings + transit(this.lon, this._lon0);
    if (crossings & 1)
      tempsum.Add( (tempsum.Sum() < 0 ? 1 : -1) * this._area0/2 );
    // area is with the clockwise sense.  If !reverse convert to
    // counter-clockwise convention.
    if (!reverse)
      tempsum.Negate();
    // If sign put area in (-area0/2, area0/2], else put area in [0, area0)
    if (sign) {
      if (tempsum.Sum() > this._area0/2)
        tempsum.Add( -this._area0 );
      else if (tempsum.Sum() <= -this._area0/2)
        tempsum.Add( +this._area0 );
    } else {
      if (tempsum.Sum() >= this._area0)
        tempsum.Add( -this._area0 );
      else if (tempsum < 0)
        tempsum.Add( -this._area0 );
    }
    vals.area = tempsum.Sum();
    return vals;
  };

  /**
   * @summary Compute the perimeter and area of the polygon with a tentative
   *   new vertex.
   * @param {number} lat the latitude of the point (degrees).
   * @param {number} lon the longitude of the point (degrees).
   * @param {bool} reverse if true then clockwise (instead of
   *   counter-clockwise) traversal counts as a positive area.
   * @param {bool} sign if true then return a signed result for the area if the
   *   polygon is traversed in the "wrong" direction instead of returning the
   * @returns {object} r where r.number is the number of vertices, r.perimeter
   *   is the perimeter (meters), and r.area (only returned if polyline is
   *   false) is the area (meters<sup>2</sup>).
   * @description A new vertex is *not* added to the polygon.
   */
  p.PolygonArea.prototype.TestPoint = function(lat, lon, reverse, sign) {
    var vals = {number: this.num + 1}, t, tempsum, crossings, i;
    if (this.num === 0) {
      vals.perimeter = 0;
      if (!this.polyline)
        vals.area = 0;
      return vals;
    }
    vals.perimeter = this._perimetersum.Sum();
    tempsum = this.polyline ? 0 : this._areasum.Sum();
    crossings = this._crossings;
    for (i = 0; i < (this.polyline ? 1 : 2); ++i) {
      t = this._geod.Inverse(
       i === 0 ? this.lat : lat, i === 0 ? this.lon : lon,
       i !== 0 ? this._lat0 : lat, i !== 0 ? this._lon0 : lon,
       this._mask);
      vals.perimeter += t.s12;
      if (!this.polyline) {
        tempsum += t.S12;
        crossings += transit(i === 0 ? this.lon : lon,
                               i !== 0 ? this._lon0 : lon);
      }
    }

    if (this.polyline)
      return vals;

    if (crossings & 1)
      tempsum += (tempsum < 0 ? 1 : -1) * this._area0/2;
    // area is with the clockwise sense.  If !reverse convert to
    // counter-clockwise convention.
    if (!reverse)
      tempsum *= -1;
    // If sign put area in (-area0/2, area0/2], else put area in [0, area0)
    if (sign) {
      if (tempsum > this._area0/2)
        tempsum -= this._area0;
      else if (tempsum <= -this._area0/2)
        tempsum += this._area0;
    } else {
      if (tempsum >= this._area0)
        tempsum -= this._area0;
      else if (tempsum < 0)
        tempsum += this._area0;
    }
    vals.area = tempsum;
    return vals;
  };

  /**
   * @summary Compute the perimeter and area of the polygon with a tentative
   *   new edge.
   * @param {number} azi the azimuth of the edge (degrees).
   * @param {number} s the length of the edge (meters).
   * @param {bool} reverse if true then clockwise (instead of
   *   counter-clockwise) traversal counts as a positive area.
   * @param {bool} sign if true then return a signed result for the area if the
   *   polygon is traversed in the "wrong" direction instead of returning the
   * @returns {object} r where r.number is the number of vertices, r.perimeter
   *   is the perimeter (meters), and r.area (only returned if polyline is
   *   false) is the area (meters<sup>2</sup>).
   * @description A new vertex is *not* added to the polygon.
   */
  p.PolygonArea.prototype.TestEdge = function(azi, s, reverse, sign) {
    var vals = {number: this.num ? this.num + 1 : 0}, t, tempsump, crossings;
    if (this.num === 0)
      return vals;
    vals.perimeter = this._perimetersum.Sum() + s;
    if (this.polyline)
      return vals;

    tempsum = this._areasum.Sum();
    crossings = this._crossings;
    t = this._geod.Direct(this.lat, this.lon, azi, s, this._mask);
    tempsum += t.S12;
    crossings += transitdirect(this.lon, t.lon2);
    t = this._geod(t.lat2, t.lon2, this._lat0, this._lon0, this._mask);
    perimeter += t.s12;
    tempsum += t.S12;
    crossings += transit(t.lon2, this._lon0);

    if (crossings & 1)
      tempsum += (tempsum < 0 ? 1 : -1) * this._area0/2;
    // area is with the clockwise sense.  If !reverse convert to
    // counter-clockwise convention.
    if (!reverse)
      tempsum *= -1;
    // If sign put area in (-area0/2, area0/2], else put area in [0, area0)
    if (sign) {
      if (tempsum > this._area0/2)
        tempsum -= this._area0;
      else if (tempsum <= -this._area0/2)
        tempsum += this._area0;
    } else {
      if (tempsum >= this._area0)
        tempsum -= this._area0;
      else if (tempsum < 0)
        tempsum += this._area0;
    }
    vals.area = tempsum;
    return vals;
  };

})(GeographicLib.PolygonArea, GeographicLib.Geodesic,
   GeographicLib.Math, GeographicLib.Accumulator);


window["GeographicLib"] = GeographicLib;
window["GeographicLib"]["Geodesic"] = GeographicLib.Geodesic;
window["GeographicLib"]["Geodesic"]["Geodesic"] = GeographicLib.Geodesic.Geodesic;
//window["GeographicLib"]["Geodesic"]["Direct"] = GeographicLib.Geodesic.prototype.Direct;













/** @define {boolean} */
var Melown_MERGE = false;

/** @define {boolean} */
var SEZNAMCZ = false;

var Melown = {};

//prevent minification
window["Melown"] = Melown;
// glMatrix v0.9.5
Melown.glMatrixArrayType2 = /*typeof Float32Array != "undefined" ? Float32Array : typeof WebGLFloatArray != "undefined" ? WebGLFloatArray :*/ Array;

Melown.vec2 = {};
Melown.vec2.create = function (a) {
    var b = new Melown.glMatrixArrayType2(2);
    if (a) {
        b[0] = a[0];
        b[1] = a[1];
    }
    return b;
};

Melown.vec4 = {};
Melown.vec4.create = function (a) {
    var b = new Melown.glMatrixArrayType2(4);
    if (a) {
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
    }
    return b;
};
Melown.vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

Melown.vec3 = {};
Melown.vec3.create = function (a) {
    var b = new Melown.glMatrixArrayType2(3);
    if (a) {
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
    }
    return b;
};
Melown.vec3.set = function (a, b) {
    b[0] = a[0];
    b[1] = a[1];
    b[2] = a[2];
    return b;
};
Melown.vec3.add = function (a, b, c) {
    if (!c || a == c) {
        a[0] += b[0];
        a[1] += b[1];
        a[2] += b[2];
        return a;
    }
    c[0] = a[0] + b[0];
    c[1] = a[1] + b[1];
    c[2] = a[2] + b[2];
    return c;
};
Melown.vec3.subtract = function (a, b, c) {
    if (!c || a == c) {
        a[0] -= b[0];
        a[1] -= b[1];
        a[2] -= b[2];
        return a;
    }
    c[0] = a[0] - b[0];
    c[1] = a[1] - b[1];
    c[2] = a[2] - b[2];
    return c;
};
Melown.vec3.negate = function (a, b) {
    b || (b = a);
    b[0] = -a[0];
    b[1] = -a[1];
    b[2] = -a[2];
    return b;
};
Melown.vec3.scale = function (a, b, c) {
    if (!c || a == c) {
        a[0] *= b;
        a[1] *= b;
        a[2] *= b;
        return a;
    }
    c[0] = a[0] * b;
    c[1] = a[1] * b;
    c[2] = a[2] * b;
    return c;
};
Melown.vec3.normalize = function (a, b) {
    b || (b = a);
    var c = a[0],
        d = a[1],
        e = a[2],
        g = Math.sqrt(c * c + d * d + e * e);
    if (g) {
        if (g == 1) {
            b[0] = c;
            b[1] = d;
            b[2] = e;
            return b;
        }
    } else {
        b[0] = 0;
        b[1] = 0;
        b[2] = 0;
        return b;
    }
    g = 1 / g;
    b[0] = c * g;
    b[1] = d * g;
    b[2] = e * g;
    return b;
};
Melown.vec3.cross = function (a, b, c) {
    c || (c = a);
    var d = a[0],
        e = a[1];
    a = a[2];
    var g = b[0],
        f = b[1];
    b = b[2];
    c[0] = e * b - a * f;
    c[1] = a * g - d * b;
    c[2] = d * f - e * g;
    return c;
};
Melown.vec3.length = function (a) {
    var b = a[0],
        c = a[1];
    a = a[2];
    return Math.sqrt(b * b + c * c + a * a);
};
Melown.vec3.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
};
Melown.vec3.squareDistance = function (a, b) {
    var dx = b[0] - a[0];
    var dy = b[1] - a[1];
    var dz = b[2] - a[2];
    return dx*dx + dy*dy + dz*dz;
};
Melown.vec3.direction = function (a, b, c) {
    c || (c = a);
    var d = a[0] - b[0],
        e = a[1] - b[1];
    a = a[2] - b[2];
    b = Math.sqrt(d * d + e * e + a * a);
    if (!b) {
        c[0] = 0;
        c[1] = 0;
        c[2] = 0;
        return c;
    }
    b = 1 / b;
    c[0] = d * b;
    c[1] = e * b;
    c[2] = a * b;
    return c;
};
Melown.vec3.lerp = function (a, b, c, d) {
    d || (d = a);
    d[0] = a[0] + c * (b[0] - a[0]);
    d[1] = a[1] + c * (b[1] - a[1]);
    d[2] = a[2] + c * (b[2] - a[2]);
    return d;
};
Melown.vec3.str = function (a) {
    return "[" + a[0] + ", " + a[1] + ", " + a[2] + "]";
};
Melown.mat3 = {};
Melown.mat3.create = function (a) {
    var b = new Melown.glMatrixArrayType2(9);
    if (a) {
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        b[4] = a[4];
        b[5] = a[5];
        b[6] = a[6];
        b[7] = a[7];
        b[8] = a[8];
        b[9] = a[9];
    }
    return b;
};
Melown.mat3.set = function (a, b) {
    b[0] = a[0];
    b[1] = a[1];
    b[2] = a[2];
    b[3] = a[3];
    b[4] = a[4];
    b[5] = a[5];
    b[6] = a[6];
    b[7] = a[7];
    b[8] = a[8];
    return b;
};
Melown.mat3.identity = function (a) {
    a[0] = 1;
    a[1] = 0;
    a[2] = 0;
    a[3] = 0;
    a[4] = 1;
    a[5] = 0;
    a[6] = 0;
    a[7] = 0;
    a[8] = 1;
    return a;
};
Melown.mat3.transpose = function (a, b) {
    if (!b || a == b) {
        var c = a[1],
            d = a[2],
            e = a[5];
        a[1] = a[3];
        a[2] = a[6];
        a[3] = c;
        a[5] = a[7];
        a[6] = d;
        a[7] = e;
        return a;
    }
    b[0] = a[0];
    b[1] = a[3];
    b[2] = a[6];
    b[3] = a[1];
    b[4] = a[4];
    b[5] = a[7];
    b[6] = a[2];
    b[7] = a[5];
    b[8] = a[8];
    return b;
};
Melown.mat3.toMat4 = function (a, b) {
    b || (b = Melown.mat4.create());
    b[0] = a[0];
    b[1] = a[1];
    b[2] = a[2];
    b[3] = 0;
    b[4] = a[3];
    b[5] = a[4];
    b[6] = a[5];
    b[7] = 0;
    b[8] = a[6];
    b[9] = a[7];
    b[10] = a[8];
    b[11] = 0;
    b[12] = 0;
    b[13] = 0;
    b[14] = 0;
    b[15] = 1;
    return b;
};
Melown.mat3.str = function (a) {
    return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + "]";
};
Melown.mat4 = {};
Melown.mat4.create = function (a) {
    var b = new Melown.glMatrixArrayType2(16);
    if (a) {
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
        b[4] = a[4];
        b[5] = a[5];
        b[6] = a[6];
        b[7] = a[7];
        b[8] = a[8];
        b[9] = a[9];
        b[10] = a[10];
        b[11] = a[11];
        b[12] = a[12];
        b[13] = a[13];
        b[14] = a[14];
        b[15] = a[15];
    }
    return b;
};
Melown.mat4.set = function (a, b) {
    b[0] = a[0];
    b[1] = a[1];
    b[2] = a[2];
    b[3] = a[3];
    b[4] = a[4];
    b[5] = a[5];
    b[6] = a[6];
    b[7] = a[7];
    b[8] = a[8];
    b[9] = a[9];
    b[10] = a[10];
    b[11] = a[11];
    b[12] = a[12];
    b[13] = a[13];
    b[14] = a[14];
    b[15] = a[15];
    return b;
};
Melown.mat4.identity = function (a) {
    a[0] = 1;
    a[1] = 0;
    a[2] = 0;
    a[3] = 0;
    a[4] = 0;
    a[5] = 1;
    a[6] = 0;
    a[7] = 0;
    a[8] = 0;
    a[9] = 0;
    a[10] = 1;
    a[11] = 0;
    a[12] = 0;
    a[13] = 0;
    a[14] = 0;
    a[15] = 1;
    return a;
};
Melown.mat4.transpose = function (a, b) {
    if (!b || a == b) {
        var c = a[1],
            d = a[2],
            e = a[3],
            g = a[6],
            f = a[7],
            h = a[11];
        a[1] = a[4];
        a[2] = a[8];
        a[3] = a[12];
        a[4] = c;
        a[6] = a[9];
        a[7] = a[13];
        a[8] = d;
        a[9] = g;
        a[11] = a[14];
        a[12] = e;
        a[13] = f;
        a[14] = h;
        return a;
    }
    b[0] = a[0];
    b[1] = a[4];
    b[2] = a[8];
    b[3] = a[12];
    b[4] = a[1];
    b[5] = a[5];
    b[6] = a[9];
    b[7] = a[13];
    b[8] = a[2];
    b[9] = a[6];
    b[10] = a[10];
    b[11] = a[14];
    b[12] = a[3];
    b[13] = a[7];
    b[14] = a[11];
    b[15] = a[15];
    return b;
};
Melown.mat4.determinant = function (a) {
    var b = a[0],
        c = a[1],
        d = a[2],
        e = a[3],
        g = a[4],
        f = a[5],
        h = a[6],
        i = a[7],
        j = a[8],
        k = a[9],
        l = a[10],
        o = a[11],
        m = a[12],
        n = a[13],
        p = a[14];
    a = a[15];
    return m * k * h * e - j * n * h * e - m * f * l * e + g * n * l * e + j * f * p * e - g * k * p * e - m * k * d * i + j * n * d * i + m * c * l * i - b * n * l * i - j * c * p * i + b * k * p * i + m * f * d * o - g * n * d * o - m * c * h * o + b * n * h * o + g * c * p * o - b * f * p * o - j * f * d * a + g * k * d * a + j * c * h * a - b * k * h * a - g * c * l * a + b * f * l * a;
};
Melown.mat4.inverse = function (a, b) {
    b || (b = a);
    var c = a[0],
        d = a[1],
        e = a[2],
        g = a[3],
        f = a[4],
        h = a[5],
        i = a[6],
        j = a[7],
        k = a[8],
        l = a[9],
        o = a[10],
        m = a[11],
        n = a[12],
        p = a[13],
        r = a[14],
        s = a[15],
        A = c * h - d * f,
        B = c * i - e * f,
        t = c * j - g * f,
        u = d * i - e * h,
        v = d * j - g * h,
        w = e * j - g * i,
        x = k * p - l * n,
        y = k * r - o * n,
        z = k * s - m * n,
        C = l * r - o * p,
        D = l * s - m * p,
        E = o * s - m * r,
        q = 1 / (A * E - B * D + t * C + u * z - v * y + w * x);
    b[0] = (h * E - i * D + j * C) * q;
    b[1] = (-d * E + e * D - g * C) * q;
    b[2] = (p * w - r * v + s * u) * q;
    b[3] = (-l * w + o * v - m * u) * q;
    b[4] = (-f * E + i * z - j * y) * q;
    b[5] = (c * E - e * z + g * y) * q;
    b[6] = (-n * w + r * t - s * B) * q;
    b[7] = (k * w - o * t + m * B) * q;
    b[8] = (f * D - h * z + j * x) * q;
    b[9] = (-c * D + d * z - g * x) * q;
    b[10] = (n * v - p * t + s * A) * q;
    b[11] = (-k * v + l * t - m * A) * q;
    b[12] = (-f * C + h * y - i * x) * q;
    b[13] = (c * C - d * y + e * x) * q;
    b[14] = (-n * u + p * B - r * A) * q;
    b[15] = (k * u - l * B + o * A) * q;
    return b;
};
Melown.mat4.toRotationMat = function (a, b) {
    b || (b = Melown.mat4.create());
    b[0] = a[0];
    b[1] = a[1];
    b[2] = a[2];
    b[3] = a[3];
    b[4] = a[4];
    b[5] = a[5];
    b[6] = a[6];
    b[7] = a[7];
    b[8] = a[8];
    b[9] = a[9];
    b[10] = a[10];
    b[11] = a[11];
    b[12] = 0;
    b[13] = 0;
    b[14] = 0;
    b[15] = 1;
    return b;
};
Melown.mat4.toMat3 = function (a, b) {
    b || (b = Melown.mat3.create());
    b[0] = a[0];
    b[1] = a[1];
    b[2] = a[2];
    b[3] = a[4];
    b[4] = a[5];
    b[5] = a[6];
    b[6] = a[8];
    b[7] = a[9];
    b[8] = a[10];
    return b;
};
Melown.mat4.toInverseMat3 = function (a, b) {
    var c = a[0],
        d = a[1],
        e = a[2],
        g = a[4],
        f = a[5],
        h = a[6],
        i = a[8],
        j = a[9],
        k = a[10],
        l = k * f - h * j,
        o = -k * g + h * i,
        m = j * g - f * i,
        n = c * l + d * o + e * m;
    if (!n) return null;
    n = 1 / n;
    b || (b = Melown.mat3.create());
    b[0] = l * n;
    b[1] = (-k * d + e * j) * n;
    b[2] = (h * d - e * f) * n;
    b[3] = o * n;
    b[4] = (k * c - e * i) * n;
    b[5] = (-h * c + e * g) * n;
    b[6] = m * n;
    b[7] = (-j * c + d * i) * n;
    b[8] = (f * c - d * g) * n;
    return b;
};
Melown.mat4.multiply = function (a, b, c) {
    c || (c = a);
    var d = a[0],
        e = a[1],
        g = a[2],
        f = a[3],
        h = a[4],
        i = a[5],
        j = a[6],
        k = a[7],
        l = a[8],
        o = a[9],
        m = a[10],
        n = a[11],
        p = a[12],
        r = a[13],
        s = a[14];
    a = a[15];
    var A = b[0],
        B = b[1],
        t = b[2],
        u = b[3],
        v = b[4],
        w = b[5],
        x = b[6],
        y = b[7],
        z = b[8],
        C = b[9],
        D = b[10],
        E = b[11],
        q = b[12],
        F = b[13],
        G = b[14];
    b = b[15];
    c[0] = A * d + B * h + t * l + u * p;
    c[1] = A * e + B * i + t * o + u * r;
    c[2] = A * g + B * j + t * m + u * s;
    c[3] = A * f + B * k + t * n + u * a;
    c[4] = v * d + w * h + x * l + y * p;
    c[5] = v * e + w * i + x * o + y * r;
    c[6] = v * g + w * j + x * m + y * s;
    c[7] = v * f + w * k + x * n + y * a;
    c[8] = z * d + C * h + D * l + E * p;
    c[9] = z * e + C * i + D * o + E * r;
    c[10] = z *
        g + C * j + D * m + E * s;
    c[11] = z * f + C * k + D * n + E * a;
    c[12] = q * d + F * h + G * l + b * p;
    c[13] = q * e + F * i + G * o + b * r;
    c[14] = q * g + F * j + G * m + b * s;
    c[15] = q * f + F * k + G * n + b * a;
    return c;
};
Melown.mat4.multiplyVec3 = function (a, b, c) {
    c || (c = b);
    var d = b[0],
        e = b[1];
    b = b[2];
    c[0] = a[0] * d + a[4] * e + a[8] * b + a[12];
    c[1] = a[1] * d + a[5] * e + a[9] * b + a[13];
    c[2] = a[2] * d + a[6] * e + a[10] * b + a[14];
    return c;
};
Melown.mat4.multiplyVec4 = function (a, b, c) {
    c || (c = b);
    var d = b[0],
        e = b[1],
        g = b[2];
    b = b[3];
    c[0] = a[0] * d + a[4] * e + a[8] * g + a[12] * b;
    c[1] = a[1] * d + a[5] * e + a[9] * g + a[13] * b;
    c[2] = a[2] * d + a[6] * e + a[10] * g + a[14] * b;
    c[3] = a[3] * d + a[7] * e + a[11] * g + a[15] * b;
    return c;
};
Melown.mat4.translate = function (a, b, c) {
    var d = b[0],
        e = b[1];
    b = b[2];
    if (!c || a == c) {
        a[12] = a[0] * d + a[4] * e + a[8] * b + a[12];
        a[13] = a[1] * d + a[5] * e + a[9] * b + a[13];
        a[14] = a[2] * d + a[6] * e + a[10] * b + a[14];
        a[15] = a[3] * d + a[7] * e + a[11] * b + a[15];
        return a;
    }
    var g = a[0],
        f = a[1],
        h = a[2],
        i = a[3],
        j = a[4],
        k = a[5],
        l = a[6],
        o = a[7],
        m = a[8],
        n = a[9],
        p = a[10],
        r = a[11];
    c[0] = g;
    c[1] = f;
    c[2] = h;
    c[3] = i;
    c[4] = j;
    c[5] = k;
    c[6] = l;
    c[7] = o;
    c[8] = m;
    c[9] = n;
    c[10] = p;
    c[11] = r;
    c[12] = g * d + j * e + m * b + a[12];
    c[13] = f * d + k * e + n * b + a[13];
    c[14] = h * d + l * e + p * b + a[14];
    c[15] = i * d + o * e + r * b + a[15];
    return c;
};
Melown.mat4.scale = function (a, b, c) {
    var d = b[0],
        e = b[1];
    b = b[2];
    if (!c || a == c) {
        a[0] *= d;
        a[1] *= d;
        a[2] *= d;
        a[3] *= d;
        a[4] *= e;
        a[5] *= e;
        a[6] *= e;
        a[7] *= e;
        a[8] *= b;
        a[9] *= b;
        a[10] *= b;
        a[11] *= b;
        return a;
    }
    c[0] = a[0] * d;
    c[1] = a[1] * d;
    c[2] = a[2] * d;
    c[3] = a[3] * d;
    c[4] = a[4] * e;
    c[5] = a[5] * e;
    c[6] = a[6] * e;
    c[7] = a[7] * e;
    c[8] = a[8] * b;
    c[9] = a[9] * b;
    c[10] = a[10] * b;
    c[11] = a[11] * b;
    c[12] = a[12];
    c[13] = a[13];
    c[14] = a[14];
    c[15] = a[15];
    return c;
};
Melown.mat4.rotate = function (a, b, c, d) {
    var e = c[0],
        g = c[1];
    c = c[2];
    var f = Math.sqrt(e * e + g * g + c * c);
    if (!f) return null;
    if (f != 1) {
        f = 1 / f;
        e *= f;
        g *= f;
        c *= f;
    }
    var h = Math.sin(b),
        i = Math.cos(b),
        j = 1 - i;
    b = a[0];
    f = a[1];
    var k = a[2],
        l = a[3],
        o = a[4],
        m = a[5],
        n = a[6],
        p = a[7],
        r = a[8],
        s = a[9],
        A = a[10],
        B = a[11],
        t = e * e * j + i,
        u = g * e * j + c * h,
        v = c * e * j - g * h,
        w = e * g * j - c * h,
        x = g * g * j + i,
        y = c * g * j + e * h,
        z = e * c * j + g * h;
    e = g * c * j - e * h;
    g = c * c * j + i;
    if (d) {
        if (a != d) {
            d[12] = a[12];
            d[13] = a[13];
            d[14] = a[14];
            d[15] = a[15];
        }
    } else d = a;
    d[0] = b * t + o * u + r * v;
    d[1] = f * t + m * u + s * v;
    d[2] = k * t + n * u + A * v;
    d[3] = l * t + p * u + B *
        v;
    d[4] = b * w + o * x + r * y;
    d[5] = f * w + m * x + s * y;
    d[6] = k * w + n * x + A * y;
    d[7] = l * w + p * x + B * y;
    d[8] = b * z + o * e + r * g;
    d[9] = f * z + m * e + s * g;
    d[10] = k * z + n * e + A * g;
    d[11] = l * z + p * e + B * g;
    return d;
};
Melown.mat4.rotateX = function (a, b, c) {
    var d = Math.sin(b);
    b = Math.cos(b);
    var e = a[4],
        g = a[5],
        f = a[6],
        h = a[7],
        i = a[8],
        j = a[9],
        k = a[10],
        l = a[11];
    if (c) {
        if (a != c) {
            c[0] = a[0];
            c[1] = a[1];
            c[2] = a[2];
            c[3] = a[3];
            c[12] = a[12];
            c[13] = a[13];
            c[14] = a[14];
            c[15] = a[15];
        }
    } else c = a;
    c[4] = e * b + i * d;
    c[5] = g * b + j * d;
    c[6] = f * b + k * d;
    c[7] = h * b + l * d;
    c[8] = e * -d + i * b;
    c[9] = g * -d + j * b;
    c[10] = f * -d + k * b;
    c[11] = h * -d + l * b;
    return c;
};
Melown.mat4.rotateY = function (a, b, c) {
    var d = Math.sin(b);
    b = Math.cos(b);
    var e = a[0],
        g = a[1],
        f = a[2],
        h = a[3],
        i = a[8],
        j = a[9],
        k = a[10],
        l = a[11];
    if (c) {
        if (a != c) {
            c[4] = a[4];
            c[5] = a[5];
            c[6] = a[6];
            c[7] = a[7];
            c[12] = a[12];
            c[13] = a[13];
            c[14] = a[14];
            c[15] = a[15];
        }
    } else c = a;
    c[0] = e * b + i * -d;
    c[1] = g * b + j * -d;
    c[2] = f * b + k * -d;
    c[3] = h * b + l * -d;
    c[8] = e * d + i * b;
    c[9] = g * d + j * b;
    c[10] = f * d + k * b;
    c[11] = h * d + l * b;
    return c;
};
Melown.mat4.rotateZ = function (a, b, c) {
    var d = Math.sin(b);
    b = Math.cos(b);
    var e = a[0],
        g = a[1],
        f = a[2],
        h = a[3],
        i = a[4],
        j = a[5],
        k = a[6],
        l = a[7];
    if (c) {
        if (a != c) {
            c[8] = a[8];
            c[9] = a[9];
            c[10] = a[10];
            c[11] = a[11];
            c[12] = a[12];
            c[13] = a[13];
            c[14] = a[14];
            c[15] = a[15];
        }
    } else c = a;
    c[0] = e * b + i * d;
    c[1] = g * b + j * d;
    c[2] = f * b + k * d;
    c[3] = h * b + l * d;
    c[4] = e * -d + i * b;
    c[5] = g * -d + j * b;
    c[6] = f * -d + k * b;
    c[7] = h * -d + l * b;
    return c;
};
Melown.mat4.frustum = function (a, b, c, d, e, g, f) {
    f || (f = Melown.mat4.create());
    var h = b - a,
        i = d - c,
        j = g - e;
    f[0] = e * 2 / h;
    f[1] = 0;
    f[2] = 0;
    f[3] = 0;
    f[4] = 0;
    f[5] = e * 2 / i;
    f[6] = 0;
    f[7] = 0;
    f[8] = (b + a) / h;
    f[9] = (d + c) / i;
    f[10] = -(g + e) / j;
    f[11] = -1;
    f[12] = 0;
    f[13] = 0;
    f[14] = -(g * e * 2) / j;
    f[15] = 0;
    return f;
};
Melown.mat4.perspective = function (a, b, c, d, e) {
    a = c * Math.tan(a * Math.PI / 360);
    b = a * b;
    return Melown.mat4.frustum(-b, b, -a, a, c, d, e);
};
Melown.mat4.ortho = function (a, b, c, d, e, g, f) {
    f || (f = Melown.mat4.create());
    var h = b - a,
        i = d - c,
        j = g - e;
    f[0] = 2 / h;
    f[1] = 0;
    f[2] = 0;
    f[3] = 0;
    f[4] = 0;
    f[5] = 2 / i;
    f[6] = 0;
    f[7] = 0;
    f[8] = 0;
    f[9] = 0;
    f[10] = -2 / j;
    f[11] = 0;
    f[12] = -(a + b) / h;
    f[13] = -(d + c) / i;
    f[14] = -(g + e) / j;
    f[15] = 1;
    return f;
};
Melown.mat4.lookAt = function (a, b, c, d) {
    d || (d = Melown.mat4.create());
    var e = a[0],
        g = a[1];
    a = a[2];
    var f = c[0],
        h = c[1],
        i = c[2];
    c = b[1];
    var j = b[2];
    if (e == b[0] && g == c && a == j) return Melown.mat4.identity(d);
    var k, l, o, m;
    c = e - b[0];
    j = g - b[1];
    b = a - b[2];
    m = 1 / Math.sqrt(c * c + j * j + b * b);
    c *= m;
    j *= m;
    b *= m;
    k = h * b - i * j;
    i = i * c - f * b;
    f = f * j - h * c;
    if (m = Math.sqrt(k * k + i * i + f * f)) {
        m = 1 / m;
        k *= m;
        i *= m;
        f *= m;
    } else f = i = k = 0;
    h = j * f - b * i;
    l = b * k - c * f;
    o = c * i - j * k;
    if (m = Math.sqrt(h * h + l * l + o * o)) {
        m = 1 / m;
        h *= m;
        l *= m;
        o *= m;
    } else o = l = h = 0;
    d[0] = k;
    d[1] = h;
    d[2] = c;
    d[3] = 0;
    d[4] = i;
    d[5] = l;
    d[6] = j;
    d[7] = 0;
    d[8] = f;
    d[9] =
        o;
    d[10] = b;
    d[11] = 0;
    d[12] = -(k * e + i * g + f * a);
    d[13] = -(h * e + l * g + o * a);
    d[14] = -(c * e + j * g + b * a);
    d[15] = 1;
    return d;
};
Melown.mat4.str = function (a) {
    return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + "]";
};
Melown.quat4 = {};
Melown.quat4.create = function (a) {
    var b = new Melown.glMatrixArrayType2(4);
    if (a) {
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[3];
    }
    return b;
};
Melown.quat4.set = function (a, b) {
    b[0] = a[0];
    b[1] = a[1];
    b[2] = a[2];
    b[3] = a[3];
    return b;
};
Melown.quat4.calculateW = function (a, b) {
    var c = a[0],
        d = a[1],
        e = a[2];
    if (!b || a == b) {
        a[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - e * e));
        return a;
    }
    b[0] = c;
    b[1] = d;
    b[2] = e;
    b[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - e * e));
    return b;
};
Melown.quat4.inverse = function (a, b) {
    if (!b || a == b) {
        a[0] *= 1;
        a[1] *= 1;
        a[2] *= 1;
        return a;
    }
    b[0] = -a[0];
    b[1] = -a[1];
    b[2] = -a[2];
    b[3] = a[3];
    return b;
};
Melown.quat4.length = function (a) {
    var b = a[0],
        c = a[1],
        d = a[2];
    a = a[3];
    return Math.sqrt(b * b + c * c + d * d + a * a);
};
Melown.quat4.normalize = function (a, b) {
    b || (b = a);
    var c = a[0],
        d = a[1],
        e = a[2],
        g = a[3],
        f = Math.sqrt(c * c + d * d + e * e + g * g);
    if (f == 0) {
        b[0] = 0;
        b[1] = 0;
        b[2] = 0;
        b[3] = 0;
        return b;
    }
    f = 1 / f;
    b[0] = c * f;
    b[1] = d * f;
    b[2] = e * f;
    b[3] = g * f;
    return b;
};
Melown.quat4.multiply = function (a, b, c) {
    c || (c = a);
    var d = a[0],
        e = a[1],
        g = a[2];
    a = a[3];
    var f = b[0],
        h = b[1],
        i = b[2];
    b = b[3];
    c[0] = d * b + a * f + e * i - g * h;
    c[1] = e * b + a * h + g * f - d * i;
    c[2] = g * b + a * i + d * h - e * f;
    c[3] = a * b - d * f - e * h - g * i;
    return c;
};
Melown.quat4.multiplyVec3 = function (a, b, c) {
    c || (c = b);
    var d = b[0],
        e = b[1],
        g = b[2];
    b = a[0];
    var f = a[1],
        h = a[2];
    a = a[3];
    var i = a * d + f * g - h * e,
        j = a * e + h * d - b * g,
        k = a * g + b * e - f * d;
    d = -b * d - f * e - h * g;
    c[0] = i * a + d * -b + j * -h - k * -f;
    c[1] = j * a + d * -f + k * -b - i * -h;
    c[2] = k * a + d * -h + i * -f - j * -b;
    return c;
};
Melown.quat4.toMat3 = function (a, b) {
    b || (b = Melown.mat3.create());
    var c = a[0],
        d = a[1],
        e = a[2],
        g = a[3],
        f = c + c,
        h = d + d,
        i = e + e,
        j = c * f,
        k = c * h;
    c = c * i;
    var l = d * h;
    d = d * i;
    e = e * i;
    f = g * f;
    h = g * h;
    g = g * i;
    b[0] = 1 - (l + e);
    b[1] = k - g;
    b[2] = c + h;
    b[3] = k + g;
    b[4] = 1 - (j + e);
    b[5] = d - f;
    b[6] = c - h;
    b[7] = d + f;
    b[8] = 1 - (j + l);
    return b;
};
Melown.quat4.toMat4 = function (a, b) {
    b || (b = Melown.mat4.create());
    var c = a[0],
        d = a[1],
        e = a[2],
        g = a[3],
        f = c + c,
        h = d + d,
        i = e + e,
        j = c * f,
        k = c * h;
    c = c * i;
    var l = d * h;
    d = d * i;
    e = e * i;
    f = g * f;
    h = g * h;
    g = g * i;
    b[0] = 1 - (l + e);
    b[1] = k - g;
    b[2] = c + h;
    b[3] = 0;
    b[4] = k + g;
    b[5] = 1 - (j + e);
    b[6] = d - f;
    b[7] = 0;
    b[8] = c - h;
    b[9] = d + f;
    b[10] = 1 - (j + l);
    b[11] = 0;
    b[12] = 0;
    b[13] = 0;
    b[14] = 0;
    b[15] = 1;
    return b;
};
Melown.quat4.slerp = function (a, b, c, d) {
    d || (d = a);
    var e = c;
    if (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3] < 0) e = -1 * c;
    d[0] = 1 - c * a[0] + e * b[0];
    d[1] = 1 - c * a[1] + e * b[1];
    d[2] = 1 - c * a[2] + e * b[2];
    d[3] = 1 - c * a[3] + e * b[3];
    return d;
};
Melown.quat4.str = function (a) {
    return "[" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + "]";
};

Melown.frustumMatrix = function(left_, right_, bottom_, top_, near_, far_) {
    var w = (right_ - left_);
    var h = (top_ - bottom_);
    var d = (far_ - near_);

    var m = Melown.mat4.create([2*near_/w, 0, (right_+left_)/w, 0,
        0, 2*near_/h, (top_+bottom_)/h, 0,
        0, 0, -(far_+near_)/d, -2*far_*near_/d,
        0, 0, -1, 0]);

    Melown.mat4.transpose(m);
    return m;
};


Melown.perspectiveMatrix = function(fovy_, aspect_, near_, far_) {
    var ymax_ = near_ * Math.tan(fovy_ * Math.PI / 360.0);
    var xmax_ = ymax_ * aspect_;
    return Melown.frustumMatrix(-xmax_, xmax_, -ymax_, ymax_, near_, far_);
};

Melown.orthographicMatrix = function(vsize_, aspect_, near_, far_) {
    //vsize_ *= 0.020;
    var w = vsize_* 0.5 * aspect_;
    var h = vsize_ * 0.5;
    var d = (far_ - near_);

    var m = Melown.mat4.create([1/w, 0, 0, 0,
        0, 1/h, 0, 0,
        0, 0, -2/d, -((far_+near_)/d),
        0, 0, 0, 1]);

    Melown.mat4.transpose(m);
    return m;
};


Melown.rotationMatrix = function(axis_, angle_) {
    var ca = Math.cos(angle_), sa = Math.sin(angle_);
    var m;

    switch (axis_) {
    case 0:
        m = [
            1,  0,  0, 0,
            0, ca,-sa, 0,
            0, sa, ca, 0,
            0,  0,  0, 1 ];
            break;
    case 1:
        m = [
            ca, 0,-sa, 0,
             0, 1,  0, 0,
            sa, 0, ca, 0,
             0, 0,  0, 1 ];
             break;
    default:
        m = [
            ca,-sa, 0, 0,
            sa, ca, 0, 0,
            0,  0,  1, 0,
            0,  0,  0, 1 ];
            break;
    }

    Melown.mat4.transpose(m);
    return m;
};


Melown.scaleMatrix = function(sx, sy, sz) {
    var m = [
        sx,  0,  0, 0,
         0, sy,  0, 0,
         0,  0, sz, 0,
         0,  0,  0, 1 ];

    Melown.mat4.transpose(m);
    return m;
};

Melown.scaleMatrixf = function(s) {
    return Melown.scaleMatrix(s, s, s);
};


Melown.translationMatrix = function(tx, ty, tz) {
    var m = [
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1 ];

    Melown.mat4.transpose(m);
    return m;
};

Melown.translationMatrix2f = function(t) {
    return Melown.translationMatrix(t[0], t[1], 0);
};

Melown.translationMatrix3f = function(t) {
    return Melown.translationMatrix(t[0], t[1], t[2]);
};

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very fileMelown.isEqual = function(value_, value2_, delta_) {    return (Math.abs(value_ - value2_) < delta_);};Melown.clamp = function(value_, min_, max_) {    if (value_ < min_) value_ = min_;    else if (value_ > max_) value_ = max_;    return value_;};Melown.radians = function(degrees_) {    return degrees_ * Math.PI / 180;};Melown.degrees = function(radians_) {    return (radians_ / Math.PI) * 180;};Melown.padNumber = function(n, width_) {  var z = '0';  if (n < 0) {      n = (-n) + '';      width_--;     //7      return n.length >= width_ ? ("-" + n) : "-" + (new Array(width_ - n.length + 1).join(z) + n);  } else {      n = n + '';      return n.length >= width_ ? n : new Array(width_ - n.length + 1).join(z) + n;  }};Melown.decodeFloat16 = function(binary) {    var exponent = (binary & 0x7C00) >> 10;        fraction = binary & 0x03FF;    return (binary >> 15 ? -1 : 1) * (        exponent ?        (            exponent === 0x1F ?            fraction ? NaN : Infinity :            Math.pow(2, exponent - 15) * (1 + fraction / 0x400)        ) :        6.103515625e-5 * (fraction / 0x400)    );};Melown.simpleFmtObj = (function obj(str, obj) {    return str.replace(/\{([_$a-zA-Z0-9][_$a-zA-Z0-9]*)\}/g, function(s, match) {        return (match in obj ? obj[match] : s);    });});Melown.simpleFmtObjOrCall = (function obj(str, obj, call) {    return str.replace(/\{([_$a-zA-Z(-9][_$a-zA-Z(-9]*)\}/g, function(s, match) {        return (match in obj ? obj[match] : call(match));    });});Melown.getABGRFromHexaCode = (function(code_) {    var result_ = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(code_);    return result_ ?        [ parseInt(result_[4], 16),          parseInt(result_[3], 16),          parseInt(result_[2], 16),          parseInt(result_[1], 16)]    : [0,0,0,255];});Melown.stringifyFunction = (function(function_) {    // Stringify the code    return '(' + function_ + ').call(self);';});Melown.loadJSON = function(path_, onLoaded_, onError_, skipEval_) {    var xhr_ = new XMLHttpRequest();    xhr_.onload  = (function()    {        var data_ = xhr_.response;        try {            var parsedData_ = skipEval_ ? data_ : eval("("+data_+")");        } catch(e) {            if (onError_ != null) {                onError_();            }            return;        }        if (onLoaded_ != null) {            onLoaded_(parsedData_);        }    }).bind(this);    xhr_.onerror  = (function()    {        if (onError_ != null) {            onError_();        }    }).bind(this);    xhr_.open('GET',  path_, true);    xhr_.send("");};Melown.loadBinary = function(path_, onLoaded_, onError_) {    var xhr_ = new XMLHttpRequest();    xhr_.onreadystatechange = (function (){        switch (xhr_.readyState)        {        case 0 : // UNINITIALIZED        case 1 : // LOADING        case 2 : // LOADED        case 3 : // INTERACTIVE        break;        case 4 : // COMPLETED                if (xhr_.status == 404)                {                    if (onError_ != null) {                        onError_();                    }                    break;                }                var abuffer_ = xhr_.response;                var data_ = new DataView(abuffer_);                if (onLoaded_ != null) {                    onLoaded_(data_);                }          break;          default:            if (onError_ != null) {                onError_();            }            break;          }       }).bind(this);    xhr_.onerror  = (function() {        if (onError_ != null) {            onError_();        }    }).bind(this);    xhr_.open('GET', path_, true);    xhr_.responseType = "arraybuffer";    xhr_.send("");};Melown.isSameOrigin = function(url_) {    if (typeof url_ !== 'string') {        return false;    }    var docHost_ = document.location.hostname;    var parser_ = document.createElement('a');    parser_['href'] = url_;    return parser_['hostname'] === docHost_;}window.performance = window.performance || {};performance.now = (function() {  return performance.now       ||         performance.mozNow    ||         performance.msNow     ||         performance.oNow      ||         performance.webkitNow ||         function() { return new Date().getTime(); };})();//Provides requestAnimationFrame in a cross browser way.window.requestAnimFrame = (function() {  return window.requestAnimationFrame ||         window.webkitRequestAnimationFrame ||         window.mozRequestAnimationFrame ||         window.oRequestAnimationFrame ||         window.msRequestAnimationFrame ||         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {           window.setTimeout(callback, 1000/60);         };})();// only implement if no native implementation is availableif (typeof Array.isArray === 'undefined') {  Array.isArray = (function(obj) {    return Object.prototype.toString.call(obj) === '[object Array]';  });}
Melown.Platform = {

    init: function () {

        var self_ = Melown.Platform;

        self_.browser = self_.searchString(self_.dataBrowser) || "An unknown browser";
        self_.version = self_.searchVersion(navigator.userAgent.toLowerCase()) || self_.searchVersion(navigator.appVersion) || "an unknown version";
        self_.OS = self_.searchString(self_.dataOS) || "an unknown os: ua: " + navigator.userAgent + " pl: " + navigator.platform;

        self_.mobile_ = (self_.OS == "iphone/ipod" || self_.OS == "android" || self_.OS == "ipad" || self_.OS == "windows ce"  || self_.OS == "windows phone" || self_.OS == "kindle");
        self_.mobileAndroid_ = (self_.OS == "android");
    },

    isMobile : function() { return Melown.Platform.mobile_; },
    isAndroid : function() { return Melown.Platform.mobileAndroid_; },

    searchString: function (data) {
        var self_ = Melown.Platform;
        for (var i=0; i<data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            self_.versionSearchString = data[i].versionSearch || data[i].identity;

            if (dataString) {
                if (dataString.toLowerCase().indexOf(data[i].subString) != -1) {
                    if (data[i].version != null) {
                        self_.version = data[i].version;
                    }
                    return data[i].identity;
                }
            } else if (dataProp) {
                return data[i].identity;
            }
        }
    },

    searchVersion: function (dataString) {
        var self_ = Melown.Platform;
        if (self_.version != null) {
            return self_.version;
        }
        var index = dataString.indexOf(self_.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+self_.versionSearchString.length+1));
    },

    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "chrome",
            identity: "chrome"
        },
        {
            string: navigator.userAgent,
            subString: "firefox",
            identity: "firefox"
        },
        {
            string: navigator.vendor,
            subString: "apple",
            identity: "safari",
            versionSearch: "version"
        },
        {
            prop: window.opera,
            identity: "opera",
            versionSearch: "version"
        },
        {
            string: navigator.vendor,
            subString: "icab",
            identity: "icab"
        },
        {
            string: navigator.vendor,
            subString: "kde",
            identity: "konqueror"
        },
        {
            string: navigator.vendor,
            subString: "camino",
            identity: "camino"
        },
        {       // for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "netscape",
            identity: "netscape"
        },
        {
            string: navigator.userAgent,
            subString: "msie",
            identity: "explorer",
            versionSearch: "msie"
        },
        {
            string: navigator.userAgent,
            subString: "trident/",
            identity: "explorer",
            version: "11"
        },
        {
            string: navigator.userAgent,
            subString: "edge/",
            identity: "explorer",
            version: "12"
        },
        {   string: navigator.userAgent,
            subString: "omniweb",
            versionSearch: "omniweb/",
            identity: "omniweb"
        },
        {   string: navigator.userAgent,
            subString: "silk",
            versionSearch: "silk/",
            identity: "silk"
        },
        {
            string: navigator.userAgent,
            subString: "gecko",
            identity: "mozilla",
            versionSearch: "rv"
        },
        {       // for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "mozilla",
            identity: "netscape",
            versionSearch: "mozilla"
        }
    ],

    dataOS : [
        {
           string: navigator.userAgent,
           subString: "windows ce",
           identity: "windows ce"
        },
        {
           string: navigator.userAgent,
           subString: "windows phone",
           identity: "windows phone"
        },
        {
            string: navigator.platform,
            subString: "win",
            identity: "windows"
        },
        {
            string: navigator.platform,
            subString: "mac",
            identity: "mac"
        },
        {
           string: navigator.userAgent,
           subString: "iphone",
           identity: "iphone/ipod"
        },
        {
           string: navigator.userAgent,
           subString: "ipod",
           identity: "iphone/ipod"
        },
        {
           string: navigator.userAgent,
           subString: "ipad",
           identity: "ipad"
        },
        {
           string: navigator.userAgent,
           subString: "android",
           identity: "android"
        },
        {
           string: navigator.userAgent,
           subString: "silk",
           identity: "kindle"
        },
        {
           string: navigator.userAgent,
           subString: "blackberry",
           identity: "blackberry"
        },
        {
            string: navigator.platform,
            subString: "linux",
            identity: "linux"
        }
    ]

};

/**
 * @constructor
 */
Melown.Inspector = function(core_) {
    this.core_ = core_;

    this.initStatsPanel();
    this.initGraphsPanel();

    //keyboard events
//    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
//    document.addEventListener("keypress", this.onKeyPress.bind(this), false);
//    document.addEventListener("keydown", this.onKeyDown.bind(this), false);

    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("keypress", this.onKeyPress.bind(this), false);
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);

};

Melown.Inspector.prototype.addStyle = function(string_) {
    var style_ = document.createElement('style');
    style_.type = 'text/css';
    style_.innerHTML = string_;
    document.getElementsByTagName('head')[0].appendChild(style_);
};




//keyboard events
Melown.Inspector.prototype.onKeyDown = function(event_) {
    if (typeof event_ == 'undefined') {
        event_ = window.event;
    }

    this.altDown_ = event_.altKey;
    this.ctrlDown_ = event_.ctrlKey;
    this.shiftDown_ = event_.shiftKey;

    this.onKeyUp(event_, true);
};

Melown.Inspector.prototype.onKeyPress = function(event_) {
    this.onKeyUp(event_, true);
};

Melown.Inspector.prototype.preventDefault = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};

Melown.Inspector.prototype.onKeyUp = function(event_, press_) {
    if (typeof event_ == 'undefined') {
        event_ = window.event;
    }

    var map_ = this.core_.getMap();

    if (map_ == null) {
        return;
    }

    this.altDown_ = event_.altKey;
    this.ctrlDown_ = event_.ctrlKey;
    this.shiftDown_ = event_.shiftKey;

    var done_ = (function(){});
    var hit_ = false;

    if (event_) {
        var keyCode_;

        if (window.event) {         // eg. IE
            keyCode_ = window.event.keyCode;
        } else if (event_.which) {   // eg. Firefox
            keyCode_ = event_.which;
        } else {
            keyCode_ = event_.charCode;
        }

        if (this.shiftDown_ == true) {

            if (this.ctrlDown_ == true) {

                switch(keyCode_) {
                    case 68:
                    case 100:
                        this.preventDefault(event_); break;  //key D pressed
                }
            }
        }

        if (this.shiftDown_ == true && press_ != true) {

            switch(keyCode_) {
                case 76:
                case 108:
                    /*this.showMenu(); this.toolbarItemSelected('link'); done_();*/  break;  //key L pressed

                case 71:
                case 103:
                    /*this.showMenu(); this.toolbarItemSelected('position'); done_();*/ break; //key G pressed

                case 65:
                case 97:
                    /*this.engine_.setAutorotate(1);*/ break;  //key A pressed
            }

            if (this.ctrlDown_ == true) {

                switch(keyCode_) {
                    case 68:
                    case 100:
                        this.diagnosticMode_ = true; hit_ = true; break;  //key D pressed
                }

            }

            if (this.diagnosticMode_ == true) {

                var blockHit_ = true;

                switch(keyCode_) {

                    case 68:
                    case 100:
                        break; //key D pressed


                    case 49: /*this.core_.setControlMode("manual"); done_();*/  break;  //key 1 pressed
                    case 50: /*this.core_.setControlMode("drone"); done_();*/   break;  //key 2 pressed
                    case 51: /*this.core_.setControlMode("observer"); done_();*/ break; //key 3 pressed

                    case 48:  //key 0 pressed
                        /*this.core_.setOption("noForwardMovement" , !this.core_.getOption("noForwardMovement"));*/
                        break;

                    case 84:
                    case 116:
                        /*var pos_ = this.core_.hitTest(this.mouseX_, this.mouseY_, "all");
                        console.log("hit pos: " + pos_[0] + " " + pos_[1] + " " + pos_[2] + " " + pos_[3] + " d " + pos_[4]); //key T pressed
                        this.core_.logTile(pos_);*/
                        break;

                    case 72:
                    case 104:
                        map_.heightmapOnly_ = !map_.heightmapOnly_; break;  //key H pressed

                    case 80:
                    case 112:
                        /*this.core_.saveScreenshot(pos_);*/ break;  //key P pressed

                    case 83:
                    case 115:
                        this.switchStatsPanel(); break; //key S pressed

                    case 66:
                    case 98:
                        map_.drawBBoxes_ = !map_.drawBBoxes_; break; //key B pressed

                    case 87:
                    case 119:
                        var value_ = map_.drawWireframe_ + 1;
                        map_.drawWireframe_ = value_ > 2 ? 0 : value_;
                        break; //key W pressed

                    case 70:
                    case 102:
                        map_.drawWireframe_ = map_.drawWireframe_ != 3 ? 3 : 0;
                        break; //key F pressed

                    case 77:
                    case 109:
                        map_.drawMaxLod_ = !map_.drawMaxLod_; break; //key M pressed

                    case 74:
                    case 106:
                        map_.blendHeightmap_ = !map_.blendHeightmap_; break; //key J pressed

                    case 88:
                    case 120:
                        map_.drawFog_ = !map_.drawFog_; hit_ = true; break; //key X pressed

                    case 82:
                    case 114:
                        this.switchGraphsPanel(); break; //key R pressed

                    case 69:
                    case 101:
                        /*this.showExport();*/ break; //key E pressed

                    case 79:
                    case 111:
                        map_.camera_.setOrtho(!map_.camera_.getOrtho()); break; //key O pressed

                    case 86:
                    case 118:
                         /*this.switchLocationsPanel();*/ break; //key V pressed

                    case 90:
                    case 122:
                        map_.ignoreTexelSize_ = !map_.ignoreTexelSize_; break; //key Z pressed

                    default:
                        blockHit_ = false;
                        break;

                }

                if (blockHit_) {
                    hit_ = true;
                }

            }

        }


        if (this.diagnosticMode_ == true && map_.drawBBoxes_ == true && this.shiftDown_ != true && press_ != true) {

             var blockHit_ = true;

            switch(keyCode_) {
                case 76:
                case 108:
                    map_.drawLods_ = !map_.drawLods_; break; //key L pressed

                case 80:
                case 112:
                    map_.drawPositions_ = !map_.drawPositions_; break; //key P pressed

                case 84:
                case 116:
                    map_.drawTextureSize_ = !map_.drawTextureSize_; break; //key T pressed

                case 70:
                case 102:
                    map_.drawFaceCount_ = !map_.drawFaceCount_; break; //key F pressed

                case 68:
                case 100:
                    map_.drawDistance_ = !map_.drawDistance_; break; //key D pressed

                case 77:
                case 109:
                    map_.drawMeshBBox_ = !map_.drawMeshBBox_; break; //key M pressed

                case 73:
                case 105:
                    map_.drawIndices_ = !map_.drawIndices_; break; //key M pressed

                case 83:
                case 115:
                    map_.debugTextSize_ = (map_.debugTextSize_ == 1.0) ? 2.0 : 1.0; break; //key S pressed

                default:
                    blockHit_ = false;
                    break;
            }

            if (blockHit_) {
                hit_ = true;
            }


        }

    }

    if (hit_) {
        map_.dirty_ = true;
        this.preventDefault(event_);
    }

    //console.log("key" + keyCode_);

};



Melown.Inspector.prototype.initStatsPanel = function() {

    this.addStyle(
        "#melown-stats-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 305px;"
            + "font-size: 14px;"
            + "position: absolute;"
            + "right: 10px;"
            + "top: 10px;"
            + "cursor: default;"
            + "background-color: rgba(255,255,255,0.95);"
            + "border-radius: 5px;"
            + "border: solid 1px #ccc;"
            + "text-align: left;"
            + "z-index: 4;"
            + "padding: 10px;"
        + "}"

        + "#melown-stats-panel-info {"
            + "margin-top: 5px;"
        + "}"

        + "#melown-stats-panel-info table {"
            + "color:#000000;"
            + "text-align: left;"
            + "font-size: 12px;"
        + "}"

        + "#melown-stats-panel-info table td {"
            + "vertical-align: top;"
        + "}"
    );

    this.statsElement_ = document.createElement("div");
    this.statsElement_.id = "melown-stats-panel";
    this.statsElement_.innerHTML =
        '<span id="melown-stats-panel-title">Render statistics</h3>'+
        '<p id="melown-stats-panel-info"></p>';

    this.core_.element_.appendChild(this.statsElement_);
    this.statsInfoElement_ = document.getElementById("melown-stats-panel-info");
    this.statsPanelVisible_ = false;
};

Melown.Inspector.prototype.showStatsPanel = function() {
    this.statsElement_.style.display = "block";
    this.statsPanelVisible_ = true;
};

Melown.Inspector.prototype.hideStatsPanel = function() {
    this.statsElement_.style.display = "none";
    this.statsPanelVisible_ = false;
};

Melown.Inspector.prototype.switchStatsPanel = function() {
    if (this.statsPanelVisible_) {
        this.hideStatsPanel();
    } else {
        this.showStatsPanel();
    }
};

Melown.Inspector.prototype.updateStatsPanel = function(stats_) {
    var text2_ =
            "FPS: " + Math.round(stats_.fps_) + "<br/>" +
            "Render time: " + Math.round(stats_.renderTime_*1000) + "<br/>" +
            "- gpu total: " + Math.round(stats_.gpuUsed_/(1024*1024)) + "MB<br/>" +
            "- gpu textures: " + Math.round(stats_.gpuTexturesUsed_/(1024*1024)) + "MB<br/>" +
            "- gpu meshes: " + Math.round(stats_.gpuMeshesUsed_/(1024*1024)) + "MB<br/>" +
            "- cpu cache: " + Math.round(stats_.resourcesUsed_/(1024*1024)) + "MB<br/>" +
            "- metailes: " + Math.round(stats_.metaUsed_/(1024*1024)) + "MB<br/>" +
//            "FOV: " + Math.round(this.core_.getOption("fov")) + " deg<br/>" +
//            "viewHeight: " + Math.round(this.core_.getOption("viewHeight")) + " m<br/>" +
//            "distance: " + Math.round(this.core_.renderer_.cameraDistance_) + " m<br/>" +
            "Polygons: " + (stats_.drawnFaces_) + "<br/>";

    var text3_ = "Tiles: " + (stats_.drawnTiles_) +"<br/>";

    var text_ = "<table style='width:305px'><tr><td>" + text2_ + "</td><td>" + text3_ + "</td></tr></table>";

    this.statsInfoElement_.innerHTML = text_;
};


Melown.Inspector.prototype.initGraphsPanel = function() {
    this.addStyle( ""
        + "#melown-graphs-panel {"
            + "position:absolute;"
            + "left:10px;"
            + "top:10px;"
            + "z-index: 4;"
            + "background-color: #FFFFFF;"
            + "padding: 5px;"
            + "border-radius: 4px;"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "color:#000000;"
            + "text-align: left;"
            + "font-size: 12px;"
            + "display:none;"
        + "}"

        + ".melown-graphs-canvas {"
            + "border: solid 1px #bbb;"
            + "image-rendering : pixelated;"
        + "}"

        + ".melown-graphs-info {"
            + "padding: 5px 2px;"
            + "font-size: 10px;"
        + "}"

        + ".melown-graphs-button {"
            + "padding: 2px 5px;"
            + "display:inline-block;"
            + "margin-right: 4px;"
            + "border-radius: 4px;"
            + "cursor:pointer;"
        + "}"

        + ".melown-graphs-button:hover {"
            + "box-shadow: 0 0 1px #0066ff;"
        + "}"
    );

    this.graphsElement_ = document.createElement("div");
    this.graphsElement_.id = "melown-graphs-panel";
    this.graphsElement_.innerHTML = ""
        + '<canvas id="melown-graphs-render" class="melown-graphs-canvas" width="500" height="100" ></canvas>'
        + '<div id="melown-graphs-info" class="melown-graphs-info" >&FilledSmallSquare; Frame: 1234 &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: 1234 &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: 1234 &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Mesh: 1234 &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMesh: 1234</div>'
        + '<canvas id="melown-graphs-cache" class="melown-graphs-canvas" width="500" height="100" ></canvas>'
        + '<div id="melown-graphs-info2" class="melown-graphs-info" >&FilledSmallSquare; Cache: 1234 &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Used: 123 &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: 1234 &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> Mesh: &nbsp 1234</div>'
        + '<div id="melown-graphs-rec" class="melown-graphs-button" >Recording On</div>'
        + '<div id="melown-graphs-ref" class="melown-graphs-button" >Refresh On</div>'
        + '<div id="melown-graphs-res" class="melown-graphs-button" >Reset</div>'
        + '<div id="melown-graphs-zoom" class="melown-graphs-button" >Scale: Max value</div>'
        + '<div id="melown-graphs-magnify" class="melown-graphs-button" >Magnify Off</div>'
        + '<div id="melown-graphs-graph" class="melown-graphs-button" >Graph: Cache</div>';

    this.core_.element_.appendChild(this.graphsElement_);
    this.graphsCanvasRender_ = document.getElementById("melown-graphs-render");
    this.graphsCanvasCache_ = document.getElementById("melown-graphs-cache");
    this.graphsCanvasRenderCtx_ = this.graphsCanvasRender_.getContext("2d");
    this.graphsCanvasCacheCtx_ = this.graphsCanvasCache_.getContext("2d");

    document.getElementById("melown-graphs-rec").onclick = this.graphsRecordingPressed.bind(this);

    document.getElementById("melown-graphs-rec").onclick = this.graphsRecordingPressed.bind(this);
    document.getElementById("melown-graphs-ref").onclick = this.graphsRefreshPressed.bind(this);
    document.getElementById("melown-graphs-res").onclick = this.graphsResetPressed.bind(this);
    document.getElementById("melown-graphs-zoom").onclick = this.graphsZoomPressed.bind(this);
    document.getElementById("melown-graphs-magnify").onclick = this.graphsMagnifyPressed.bind(this);
    document.getElementById("melown-graphs-graph").onclick = this.graphsGraphPressed.bind(this);

    document.getElementById("melown-graphs-render").onmousemove = this.onGraphsMouseMove.bind(this);
    document.getElementById("melown-graphs-render").onmouseout = this.onGraphsMouseOut.bind(this);
    document.getElementById("melown-graphs-cache").onmousemove = this.onGraphsMouseMove.bind(this);
    document.getElementById("melown-graphs-cache").onmouseout = this.onGraphsMouseOut.bind(this);


    this.graphsZoom_ = "max";
    this.graphsGraph_ = "Cache";
    this.graphsRefresh_ = true;

    this.graphsPanelVisible_ = false;
};

Melown.Inspector.prototype.showGraphsPanel = function() {
    this.graphsElement_.style.display = "block";
    this.graphsPanelVisible_ = true;
};

Melown.Inspector.prototype.hideGraphsPanel = function() {
    this.graphsElement_.style.display = "none";
    this.graphsPanelVisible_ = false;
};

Melown.Inspector.prototype.switchGraphsPanel = function() {
    if (this.graphsPanelVisible_ == true) {
        this.hideGraphsPanel();
    } else {
        this.showGraphsPanel();
    }
};

Melown.Inspector.prototype.graphsRecordingPressed = function() {
    var map_ = this.core_.getMap();

    if (map_ == null) {
        return;
    }

    map_.stats_.recordGraphs_ = !map_.stats_.recordGraphs_;
    this.updateGraphsPanel();
    this.updateGraphs(null, true);
};

Melown.Inspector.prototype.graphsRefreshPressed = function() {
    this.graphsRefresh_ = !this.graphsRefresh_;

    this.updateGraphsPanel();
    this.updateGraphs();
};

Melown.Inspector.prototype.graphsResetPressed = function() {
    var map_ = this.core_.getMap();

    if (map_ == null) {
        return;
    }

    map_.stats_.resetGraphs();
    this.updateGraphs(null, true);
};

Melown.Inspector.prototype.graphsZoomPressed = function() {
    switch (this.graphsZoom_) {
        case "max":     this.graphsZoom_ = "120avrg"; break;
        case "120avrg": this.graphsZoom_ = "180avrg"; break;
        case "180avrg": this.graphsZoom_ = "max"; break;
    }

    this.updateGraphsPanel();
    this.updateGraphs();
};

Melown.Inspector.prototype.graphsGraphPressed = function() {
    switch (this.graphsGraph_) {
        case "Cache":     this.graphsGraph_ = "Polygons"; break;
        case "Polygons":  this.graphsGraph_ = "LODs"; break;
        case "LODs":      this.graphsGraph_ = "Flux"; break;
        case "Flux":      this.graphsGraph_ = "Cache"; break;
    }

    this.updateGraphsPanel();
    this.updateGraphs();
};


Melown.Inspector.prototype.graphsMagnifyPressed = function() {
    this.graphsMagnify_ = !this.graphsMagnify_;

    if (this.graphsMagnify_ == true) {
        this.graphsCanvasRender_.style.width = "900px";
        this.graphsCanvasRender_.style.height = "150px";
        this.graphsCanvasCache_.style.width = "900px";
        this.graphsCanvasCache_.style.height = "150px";
        document.getElementById("melown-graphs-magnify").innerHTML = "Magnify On";
    } else {
        this.graphsCanvasRender_.style.width = "500px";
        this.graphsCanvasRender_.style.height = "100px";
        this.graphsCanvasCache_.style.width = "500px";
        this.graphsCanvasCache_.style.height = "100px";
        document.getElementById("melown-graphs-magnify").innerHTML = "Magnify Off";
    }

    this.updateGraphsPanel();
    this.updateGraphs();
};

Melown.Inspector.prototype.updateGraphsPanel = function() {
    var map_ = this.core_.getMap();

    if (map_ == null) {
        return;
    }

    if (map_.stats_.recordGraphs_ == true) {
        document.getElementById("melown-graphs-rec").innerHTML = "Recording On";
    } else {
        document.getElementById("melown-graphs-rec").innerHTML = "Recording Off";
    }

    if (this.graphsRefresh_ == true) {
        document.getElementById("melown-graphs-ref").innerHTML = "Refresh On";
    } else {
        document.getElementById("melown-graphs-ref").innerHTML = "Refresh Off";
    }

    switch (this.graphsZoom_) {
        case "max":
            document.getElementById("melown-graphs-zoom").innerHTML = "Scale: Max value";
            break;

        case "120avrg":
            document.getElementById("melown-graphs-zoom").innerHTML = "Scale: 100% Avrg";
            break;

        case "180avrg":
            document.getElementById("melown-graphs-zoom").innerHTML = "Scale: 50% Avrg";
            break;
    }

    document.getElementById("melown-graphs-graph").innerHTML = "Graph: " + this.graphsGraph_;
};

Melown.Inspector.prototype.onGraphsMouseMove = function(event_) {
    var x = event_.clientX - this.graphsCanvasRender_.getBoundingClientRect().left;
    this.graphsShowCursor_ = true;

    if (this.graphsMagnify_ == true) {
        x = Math.floor(x * 500/900);
    }

    this.graphsCursorIndex_ = x;

    var map_ = this.core_.getMap();

    if (map_ == null) {
        return;
    }

    if (map_.stats_.recordGraphs_ != true) {
        this.updateGraphs(null);
    }
};

Melown.Inspector.prototype.onGraphsMouseOut = function() {
    this.graphsShowCursor_ = false;
    this.updateGraphs(null);
};


Melown.Inspector.prototype.updateGraphs = function(stats_, ignoreRefresh_) {
    var map_ = this.core_.getMap();

    if (map_ == null || (this.graphsRefresh_ == false && !ignoreRefresh_) || this.graphsPanelVisible_ == false) {
        return;
    }

    stats_ = stats_ || map_.stats_;

    var width_ = this.graphsCanvasRender_.width;
    var height_ = this.graphsCanvasRender_.height;
    var ctx_ = this.graphsCanvasRenderCtx_;

    var samples_ = stats_.graphsTimeSamples_;
    var samplesIndex_ = stats_.graphsTimeIndex_;

    var factorX_ = width_ / samples_;

    ctx_.clearRect(0, 0, width_, height_);

    var maxValue_ = 0;
    var totalFrame_ = 0;
    var totalRender_ = 0;
    var totalTexture_ = 0;
    var totalMeshes_ = 0;
    var totalGpuMeshes_ = 0;
    var realCount_ = 0;

    var valuesFrame_ = stats_.graphsFrameTimes_;
    var valuesRender_ = stats_.graphsRenderTimes_;
    var valuesTextures_ = stats_.graphsCreateTextureTimes_;
    var valuesMeshes_ = stats_.graphsCreateMeshTimes_;
    var valuesGpuMeshes_ = stats_.graphsCreateGpuMeshTimes_;

    for (var i = 0; i < samples_; i++) {
        totalFrame_ += valuesFrame_[i];
        totalRender_ += valuesRender_[i];
        totalTexture_ += valuesTextures_[i];
        totalMeshes_ += valuesMeshes_[i];
        totalGpuMeshes_ += valuesGpuMeshes_[i];

        var v = valuesFrame_[i];

        if (v > maxValue_) {
            maxValue_ = v;
        }

        if (v > 0) {
            realCount_++;
        }
    }

    if (this.graphsZoom_ == "120avrg") {
        maxValue_ = (totalFrame_ / realCount_) * 1.0;
    }

    if (this.graphsZoom_ == "180avrg") {
        maxValue_ = (totalFrame_ / realCount_) * 0.5;
    }

    var factorY_ = height_ / maxValue_;

    for (var i = 0; i < samples_; i++) {
        var index_ = samplesIndex_ + i;
        index_ %= samples_;

        ctx_.fillStyle="#000000";
        ctx_.fillRect(i*factorX_, height_, 1, -(valuesFrame_[index_])*factorY_);
        ctx_.fillStyle="#ff0000";
        ctx_.fillRect(i*factorX_, height_, 1, -(valuesRender_[index_])*factorY_);

        ctx_.fillStyle="#0000ff";
        ctx_.fillRect(i*factorX_, height_, 1, -(valuesTextures_[index_])*factorY_);

        var y = height_ -(valuesTextures_[index_])*factorY_;

        ctx_.fillStyle="#007700";
        ctx_.fillRect(i*factorX_, y, 1, -(valuesMeshes_[index_])*factorY_);

        y -= (valuesMeshes_[index_])*factorY_;

        ctx_.fillStyle="#00ff00";
        ctx_.fillRect(i*factorX_, y, 1, -(valuesGpuMeshes_[index_])*factorY_);

    }

    if (this.graphsShowCursor_ == true) {
        ctx_.fillStyle="#aa00aa";
        var index_ = (this.graphsCursorIndex_) % samples_;
        ctx_.fillRect(Math.floor(index_*factorX_)-1, 0, 1, height_);
        ctx_.fillRect(Math.floor(index_*factorX_)+1, 0, 1, height_);
        index_ = (this.graphsCursorIndex_ + samplesIndex_) % samples_;

        var str_ = '&FilledSmallSquare; Frame: ' + valuesFrame_[index_].toFixed(2) +
                   ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: ' + valuesRender_[index_].toFixed(2) +
                   ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + valuesTextures_[index_].toFixed(2) +
                   ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + valuesMeshes_[index_].toFixed(2) +
                   ' &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMeshes: ' + valuesGpuMeshes_[index_].toFixed(2) + '</div>';
    } else {
        var str_ = '&FilledSmallSquare; Frame: ' + Math.round(totalFrame_) +
                   ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: ' + Math.round(totalRender_) +
                   ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + Math.round(totalTexture_) +
                   ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + Math.round(totalMeshes_) +
                   ' &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMeshes: ' + Math.round(totalGpuMeshes_) +'</div>';
    }

    document.getElementById("melown-graphs-info").innerHTML = str_;






    var width_ = this.graphsCanvasCache_.width;
    var height_ = this.graphsCanvasCache_.height;
    var ctx_ = this.graphsCanvasCacheCtx_;

    //var samples_ = graphs_["samples"];
    //var samplesIndex_ = graphs_["index"];

    var factorX_ = width_ / samples_;

    ctx_.clearRect(0, 0, width_, height_);

    switch (this.graphsGraph_) {
    case "Cache":
        {
            var factorY_ = height_ / ((map_.gpuCache_.maxCost_+map_.resourcesCache_.maxCost_+map_.metatileCache_.maxCost_));

            var maxMetatiles_ = 0;
            var maxResources_ = 0;
            var maxTextures_ = 0;
            var maxMeshes_ = 0;

            var valuesMetatiles_ = stats_.graphsCpuMemoryMetatiles_;
            var valuesResources_ = stats_.graphsCpuMemoryUsed_;
            var valuesTextures_ = stats_.graphsGpuMemoryTextures_;
            var valuesMeshes_ = stats_.graphsGpuMemoryMeshes_;

            for (var i = 0; i < samples_; i++) {
                maxMetatiles_ = valuesMetatiles_[i] > maxMetatiles_ ? valuesMetatiles_[i] : maxMetatiles_;
                maxResources_ = valuesResources_[i] > maxResources_ ? valuesResources_[i] : maxResources_;
                maxTextures_ = valuesTextures_[i] > maxTextures_ ? valuesTextures_[i] : maxTextures_;
                maxMeshes_ = valuesMeshes_[i] > maxMeshes_ ? valuesMeshes_[i] : maxMeshes_;
            }

            for (var i = 0; i < samples_; i++) {
                var index_ = samplesIndex_ + i;
                index_ %= samples_;

                var value_ = valuesMetatiles_[index_] + valuesMeshes_[index_] + valuesTextures_[index_] + valuesResources_[index_];
                ctx_.fillStyle="#000000";
                ctx_.fillRect(i*factorX_, height_, 1, -(value_)*factorY_);
                value_ -= valuesResources_[index_];

                ctx_.fillStyle="#0000ff";
                ctx_.fillRect(i*factorX_, height_, 1, -(value_)*factorY_);
                value_ -= valuesTextures_[index_];

                ctx_.fillStyle="#007700";
                ctx_.fillRect(i*factorX_, height_, 1, -(value_)*factorY_);
                value_ -= valuesMeshes_[index_];

                ctx_.fillStyle="#ff0000";
                ctx_.fillRect(i*factorX_, height_, 1, -(value_)*factorY_);
            }

            if (this.graphsShowCursor_ == true) {
                var index_ = (this.graphsCursorIndex_ + samplesIndex_) % samples_;
                var str_ = '<span style="color:#555">&FilledSmallSquare;</span> Total: ' + Math.ceil((valuesMetatiles_[index_] + valuesResources_[index_] + valuesTextures_[index_] + valuesMeshes_[index_])/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#000000">&FilledSmallSquare;</span> CPU: ' + Math.ceil(valuesResources_[index_]/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#0055ff">&FilledSmallSquare;</span> GPU: ' + Math.ceil((valuesTextures_[index_] + valuesMeshes_[index_])/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + Math.ceil(valuesTextures_[index_]/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + Math.ceil(valuesMeshes_[index_]/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Meta.: ' + Math.ceil(valuesMetatiles_[index_]/(1024*1024)) + "MB" +'</div>';
            } else {
                var str_ = '<span style="color:#555">&FilledSmallSquare;</span> Total: ' + Math.round((maxMetatiles_ + maxResources_ + maxTextures_ + maxMeshes_)/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#000000">&FilledSmallSquare;</span> CPU: ' + Math.ceil(maxResources_/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#009999">&FilledSmallSquare;</span> GPU: ' + Math.ceil((maxTextures_ + maxMeshes_)/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + Math.ceil(maxTextures_/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + Math.ceil(maxMeshes_/(1024*1024)) + "MB" +
                           ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Meta.: ' + Math.ceil(maxMetatiles_/(1024*1024)) + "MB" +'</div>';
            }

        }
        break;


    case "Polygons":
        {
            var max_ = 0;
            var min_ = 99999999999;
            var total_ = 0;
            var realCount_ = 0;
            var values_ = stats_.graphsPolygons_;

            for (var i = 0; i < samples_; i++) {
                max_ = values_[i] > max_ ? values_[i] : max_;

                if (values_[i] > 0) {
                    min_ = values_[i] < min_ ? values_[i] : min_;
                    total_ += values_[i];
                    realCount_++;
                }
            }

            var factorY_ = height_ / max_;

            for (var i = 0; i < samples_; i++) {
                var index_ = samplesIndex_ + i;
                index_ %= samples_;

                ctx_.fillStyle="#007700";
                ctx_.fillRect(i*factorX_, height_, 1, -(values_[index_])*factorY_);
            }

            if (this.graphsShowCursor_ == true) {
                var index_ = (this.graphsCursorIndex_ + samplesIndex_) % samples_;
                var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Polygons: ' + Math.round(values_[index_]) +'</div>';
            } else {
                var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Polygons Max: ' + max_ +'</div>';
                str_ += ' &nbsp Min: ' + min_;
                str_ += ' &nbsp Avrg: ' + Math.round(total_ / realCount_) +'</div>';
            }
        }
        break;

    case "LODs":
        {
            var max_ = 0;
            var values_ = stats_.graphsLODs_;

            for (var i = 0; i < samples_; i++) {
                max_ = values_[i][0] > max_ ? values_[i][0] : max_;
            }

            var factorY_ = height_ / max_;

            ctx_.fillStyle="#000000";
            ctx_.fillRect(0, 0, width_, height_);

            for (var i = 0; i < samples_; i++) {
                var index_ = samplesIndex_ + i;
                index_ %= samples_;

                //ctx_.fillStyle="#000000";
                //ctx_.fillRect(i*factorX_, height_, 1, -(values_[index_][0])*factorY_);

                var y = height_;

                for (var j in values_[index_][1]) {
                    ctx_.fillStyle="hsl("+((j*23)%360)+",100%,50%)";
                    var value_ = Math.round((values_[index_][1][j])*factorY_);
                    ctx_.fillRect(i*factorX_, y, 1, -value_);
                    y -= value_;
                }

            }

            if (this.graphsShowCursor_ == true) {
                var index_ = (this.graphsCursorIndex_ + samplesIndex_) % samples_;

                var str_ = "LODs:" + values_[index_][0];

                for (var j in values_[index_][1]) {
                    str_ += '<span style="color:hsl('+((j*23)%360)+',100%,50%)">&FilledSmallSquare;</span>'+j+':'+values_[index_][1][j];
                }

            } else {
                var str_ = "LODs:" + values_[index_][0];
            }

            str_ += '</div>';
        }
        break;

    case "Flux":
        {
            var maxCount_ = 0;
            var maxSize_ = 0;

            var maxTexPlusCount_ = 0;
            var maxTexPlusSize_ = 0;
            var maxTexMinusCount_ = 0;
            var maxTexMinusSize_ = 0;

            var maxMeshPlusCount_ = 0;
            var maxMeshPlusSize_ = 0;
            var maxMeshMinusCount_ = 0;
            var maxMeshMinusSize_ = 0;

            var valuesTextures_ = stats_.graphsFluxTextures_;
            var valuesMeshes_ = stats_.graphsFluxMeshes_;

            for (var i = 0; i < samples_; i++) {
                var tmp_ = valuesTextures_[i][0][0] + valuesMeshes_[i][0][0];
                maxCount_ = tmp_ > maxCount_ ? tmp_ : maxCount_;
                tmp_ = valuesTextures_[i][1][0] + valuesMeshes_[i][1][0];
                maxCount_ = tmp_ > maxCount_ ? tmp_ : maxCount_;

                tmp_ = valuesTextures_[i][0][1] + valuesMeshes_[i][0][1];
                maxSize_ = tmp_ > maxSize_ ? tmp_ : maxSize_;
                tmp_ = valuesTextures_[i][1][1] + valuesMeshes_[i][1][1];
                maxSize_ = tmp_ > maxSize_ ? tmp_ : maxSize_;

                maxTexPlusCount_ = valuesTextures_[i][0][0] > maxTexPlusCount_ ? valuesTextures_[i][0][0] : maxTexPlusCount_;
                maxTexPlusSize_ = valuesTextures_[i][0][1] > maxTexPlusSize_ ? valuesTextures_[i][0][1] : maxTexPlusSize_;
                maxTexMinusCount_ = valuesTextures_[i][1][0] > maxTexMinusCount_ ? valuesTextures_[i][1][0] : maxTexMinusCount_;
                maxTexMinusSize_ = valuesTextures_[i][1][1] ? valuesTextures_[i][1][1] : maxTexMinusSize_;

                maxMeshPlusCount_ = valuesMeshes_[i][0][0] > maxMeshPlusCount_ ? valuesMeshes_[i][0][0] : maxMeshPlusCount_;
                maxMeshPlusSize_ = valuesMeshes_[i][0][1] > maxMeshPlusSize_ ? valuesMeshes_[i][0][1] : maxMeshPlusSize_;
                maxMeshMinusCount_ = valuesMeshes_[i][1][0] > maxMeshMinusCount_ ? valuesMeshes_[i][1][0] : maxMeshMinusCount_;
                maxMeshMinusSize_ = valuesMeshes_[i][1][1] > maxMeshMinusSize_ ? valuesMeshes_[i][1][1] : maxMeshMinusSize_;
            }

            var factorY_ = (height_*0.25-2) / maxCount_;
            var factorY2_ = (height_*0.25-2) / maxSize_;

            var base_ = Math.floor(height_*0.25);
            var base2_ = Math.floor(height_*0.75);

            for (var i = 0; i < samples_; i++) {
                var index_ = samplesIndex_ + i;
                index_ %= samples_;

                ctx_.fillStyle="#0000aa";
                ctx_.fillRect(i*factorX_, base_, 1, -(valuesTextures_[index_][0][0])*factorY_);
                ctx_.fillRect(i*factorX_, base_+1, 1, (valuesTextures_[index_][1][0])*factorY_);

                ctx_.fillRect(i*factorX_, base2_, 1, -(valuesTextures_[index_][0][1])*factorY2_);
                ctx_.fillRect(i*factorX_, base2_+1, 1, (valuesTextures_[index_][1][1])*factorY2_);

                ctx_.fillStyle="#007700";

                ctx_.fillRect(i*factorX_, base_-(valuesTextures_[index_][0][0])*factorY_, 1, -(valuesMeshes_[index_][0][0])*factorY_);
                ctx_.fillRect(i*factorX_, base_+1+(valuesTextures_[index_][1][0])*factorY_, 1, (valuesMeshes_[index_][1][0])*factorY_);

                ctx_.fillRect(i*factorX_, base2_-(valuesTextures_[index_][0][1])*factorY2_, 1, -(valuesMeshes_[index_][0][1])*factorY2_);
                ctx_.fillRect(i*factorX_, base2_+1+(valuesTextures_[index_][1][0])*factorY2_, 1, (valuesMeshes_[index_][1][1])*factorY2_);

                ctx_.fillStyle="#aaaaaa";
                ctx_.fillRect(0, Math.floor(height_*0.5), width_, 1);
                ctx_.fillStyle="#dddddd";
                ctx_.fillRect(0, base_, width_, 1);
                ctx_.fillRect(0, base2_, width_, 1);
            }


            if (this.graphsShowCursor_ == true) {
                var index_ = (this.graphsCursorIndex_ + samplesIndex_) % samples_;
                var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Textures Count +/-: ' + valuesTextures_[index_][0][0] + "/" + valuesTextures_[index_][1][0];
                str_ += ' &nbsp Size +/-: ' + (valuesTextures_[index_][0][1]/1024/1024).toFixed(2) + "/" + (valuesTextures_[index_][1][1]/1024/1024).toFixed(2);
                str_ += ' &nbsp <span style="color:#0000aa">&FilledSmallSquare;</span> Meshes Count +/-: ' + valuesMeshes_[index_][0][0] + "/" + valuesMeshes_[index_][1][0];
                str_ += ' &nbsp Size +/-: ' + (valuesMeshes_[index_][0][1]/1024/1024).toFixed(2) + "/" + (valuesMeshes_[index_][1][1]/1024/1024).toFixed(2);
                str_ += '</div>';
            } else {
                var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Textures Count +/-: ' + maxTexPlusCount_ + "/" + maxTexMinusCount_;
                str_ += ' &nbsp Size +/-: ' + (maxTexPlusSize_/1024/1024).toFixed(2) + "/" + (maxTexMinusSize_/1024/1024).toFixed(2);
                str_ += ' &nbsp <span style="color:#0000aa">&FilledSmallSquare;</span> Meshes Count +/-: ' + maxMeshPlusCount_ + "/" + maxMeshMinusCount_;
                str_ += ' &nbsp Size +/-: ' + (maxMeshPlusSize_/1024/1024).toFixed(2) + "/" + (maxMeshMinusSize_/1024/1024).toFixed(2);
                str_ += '</div>';
            }

        }
        break;

    }

    if (this.graphsShowCursor_ == true) {
        ctx_.fillStyle="#aa00aa";
        var index_ = (this.graphsCursorIndex_) % samples_;
        ctx_.fillRect(Math.floor(index_*factorX_)-1, 0, 1, height_);
        ctx_.fillRect(Math.floor(index_*factorX_)+1, 0, 1, height_);
    }

    document.getElementById("melown-graphs-info2").innerHTML = str_;

};




/**
 * @constructor
 */
Melown.GpuBBox = function(gpu_) {
    this.gl_ = gpu_.gl_;

    var gl_ = this.gl_;

    if (gl_ == null)
        return;

    this.vertexPositionBuffer_ = null;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    var vertices_ = [0,0,0, 1,0,0,
                     1,0,0, 1,1,0,
                     1,1,0, 0,1,0,
                     0,1,0, 0,0,0,

                     0,0,1, 1,0,1,
                     1,0,1, 1,1,1,
                     1,1,1, 0,1,1,
                     0,1,1, 0,0,1,

                     0,0,0, 0,0,1,
                     1,0,0, 1,0,1,
                     1,1,0, 1,1,1,
                     0,1,0, 0,1,1 ];

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = vertices_.length / 3;

    this.size_ = 4 + 4 * 8;
    this.lines_ = this.vertexPositionBuffer_.numItems / 3;
};

//destructor
Melown.GpuBBox.prototype.kill = function() {
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuBBox.prototype.draw = function(program_, attrPosition_) {
    var gl_ = this.gl_;
    if (gl_ == null)
        return;

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw lines
    gl_.drawArrays(gl_.LINES, 0, this.vertexPositionBuffer_.numItems);

};


/**
 * @constructor
 */
Melown.GpuDevice = function(div_, size_, keepFrameBuffer_) {
    this.div_ = div_;
    this.canvas_ =  null;
    this.curSize_ = size_;
    this.currentProgram_ = null;

    this.defaultState_ = this.createState({});
    this.currentState_ = this.defaultState_;
    this.currentOffset_ = 0; //used fot direct offset

    this.keepFrameBuffer_ = (keepFrameBuffer_ == null) ? false : keepFrameBuffer_;
};

Melown.GpuDevice.prototype.init = function() {
    this.canvas_ = document.createElement("canvas");

    if (this.canvas_ == null) {
        //canvas not supported
        return;
    }

    this.canvas_.width = this.curSize_[0];
    this.canvas_.height = this.curSize_[1];
    this.canvas_.style.display = "block";

    if (this.canvas_.getContext == null) {
        //canvas not supported
        return;
    }

    try {
        this.gl_ = this.canvas_.getContext("webgl", {preserveDrawingBuffer: this.keepFrameBuffer_, stencil: true}) || this.canvas_.getContext("experimental-webgl", {preserveDrawingBuffer: this.keepFrameBuffer_});
    } catch(e) {
        //webgl not supported
    }

    if (!this.gl_) {
        //webgl not supported
        return;
    }

    this.gl_.getExtension('OES_standard_derivatives');

    this.div_.appendChild(this.canvas_);

    this.gl_.viewportWidth = this.canvas_.width;
    this.gl_.viewportHeight = this.canvas_.height;

    this.gl_.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl_.enable(this.gl_.DEPTH_TEST);

    //clear screen
    this.gl_.viewport(0, 0, this.gl_.viewportWidth, this.gl_.viewportHeight);
    this.gl_.clear(this.gl_.COLOR_BUFFER_BIT | this.gl_.DEPTH_BUFFER_BIT);
};

Melown.GpuDevice.prototype.resize = function(size_, skipCanvas_) {
    this.curSize_ = size_;

    if (this.canvas_ != null && skipCanvas_ != true)
    {
        this.canvas_.width = this.curSize_[0];
        this.canvas_.height = this.curSize_[1];
    }

    if (this.gl_ != null)
    {
        this.gl_.viewportWidth = this.canvas_.width;
        this.gl_.viewportHeight = this.canvas_.height;
    }
};

Melown.GpuDevice.prototype.getCanvas = function() {
    return this.canvas_;
};

Melown.GpuDevice.prototype.setViewport = function() {
    this.gl_.viewport(0, 0, this.gl_.viewportWidth, this.gl_.viewportHeight);
};

Melown.GpuDevice.prototype.clear = function(clearDepth_, clearColor_, color_) {
    if (color_ != null) {
        this.gl_.clearColor(color_[0]/255, color_[1]/255, color_[2]/255, color_[3]/255);
    }

    this.gl_.clear((clearDepth_ ? this.gl_.COLOR_BUFFER_BIT : 0) |
                   (clearColor_ ? this.gl_.DEPTH_BUFFER_BIT : 0) );
};

Melown.GpuDevice.prototype.useProgram = function(program_, attrPosition_, attrTexCoord_, attrTexCoord2_, attrBarycentric_, attrNormal_, attrNormal2_, attrNormal3_) {
    if (this.currentProgram_ != program_) {
        this.gl_.useProgram(program_.program_);
        this.currentProgram_ = program_;

        program_.setSampler("uSampler", 0);

        var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
        this.gl_.enableVertexAttribArray(vertexPositionAttribute_);

        if (attrTexCoord_ != null) {
            var textureCoordAttribute_ = program_.getAttribute(attrTexCoord_);
            this.gl_.enableVertexAttribArray(textureCoordAttribute_);
        }

        if (attrTexCoord2_ != null) {
            var textureCoordAttribute2_ = program_.getAttribute(attrTexCoord2_);
            this.gl_.enableVertexAttribArray(textureCoordAttribute2_);
        }

        if (attrBarycentric_ != null) {
            var barycentricAttribute_ = program_.getAttribute(attrBarycentric_);
            this.gl_.enableVertexAttribArray(barycentricAttribute_);
        }

        if (attrNormal_ != null) {
            var normalAttribute_ = program_.getAttribute(attrNormal_);
            this.gl_.enableVertexAttribArray(normalAttribute_);
        }

        if (attrNormal2_ != null) {
            var normal2Attribute_ = program_.getAttribute(attrNormal2_);
            this.gl_.enableVertexAttribArray(normal2Attribute_);
        }

        if (attrNormal3_ != null) {
            //var normal3Attribute_ = program_.getAttribute(attrNormal3_);
            //this.gl_.enableVertexAttribArray(normal3Attribute_);
        }

    }
};

Melown.GpuDevice.prototype.bindTexture = function(texture_) {
    if (texture_.loaded_ == false) {
        return;
    }

    this.gl_.activeTexture(this.gl_.TEXTURE0);
    this.gl_.bindTexture(this.gl_.TEXTURE_2D, texture_.texture_);
};

Melown.GpuDeviceSupported = function() {
    return true;
};

Melown.GpuDevice.prototype.setFramebuffer = function(texture_) {
    if (texture_ != null) {
        this.gl_.bindFramebuffer(this.gl_.FRAMEBUFFER, texture_.framebuffer_);
        //utResizeViewport(texture_.framebuffer_.width, texture_.framebuffer_.height, true);
    } else {
        this.gl_.bindTexture(this.gl_.TEXTURE_2D, null);
        this.gl_.bindRenderbuffer(this.gl_.RENDERBUFFER, null);
        this.gl_.bindFramebuffer(this.gl_.FRAMEBUFFER, null);
    }

};

Melown.GpuDevice.prototype.createState = function(state_) {
    if (state_.blend_ == null) { state_.blend_ = false; }
    if (state_.stencil_ == null) { state_.stencil_ = false; }
    if (state_.zoffset_ == null) { state_.zoffset_ = 0; }
    if (state_.zwrite_ == null) { state_.zwrite_ = true; }
    if (state_.ztest_ == null) { state_.ztest_ = true; }
    if (state_.culling_ == null) { state_.culling_ = true; }

    return state_;
};

Melown.GpuDevice.prototype.setState = function(state_, directOffset_) {
    if (this.currentState_ == state_) {

        if (directOffset_ != null) {
            if (directOffset_ != this.currentOffset_) {
                this.currentOffset_ = directOffset_;
                this.gl_.polygonOffset(-1.0, directOffset_);
            }
        }

        return;
    }

    var gl_ = this.gl_;
    var currentState_ = this.currentState_;
    directOffset_ = directOffset_ || state_.zoffset_;

    if (currentState_.blend_ != state_.blend_) {
        if (state_.blend_ == true) {
            gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
            gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
            gl_.enable(gl_.BLEND);
        } else {
            gl_.disable(gl_.BLEND);
        }
    }

    if (currentState_.stencil_ != state_.stencil_) {
        if (state_.stencil_ == true) {
            gl_.enable(gl_.STENCIL_TEST);
        } else {
            gl_.disable(gl_.STENCIL_TEST);
        }
    }

    if (currentState_.zoffset_ != directOffset_) {
        if (directOffset_ != 0) {
            gl_.polygonOffset(-1.0, directOffset_);
            gl_.enable(gl_.POLYGON_OFFSET_FILL);
        } else {
            gl_.disable(gl_.POLYGON_OFFSET_FILL);
        }
        this.currentOffset_ = directOffset_;
    }

    if (currentState_.zwrite_ != state_.zwrite_) {
        if (state_.zwrite_ == true) {
            gl_.depthMask(true);
        } else {
            gl_.depthMask(false);
        }
    }

    if (currentState_.ztest_ != state_.ztest_) {
        if (state_.ztest_ != 0) {
            gl_.enable(gl_.DEPTH_TEST);
        } else {
            gl_.disable(gl_.DEPTH_TEST);
        }
    }

    if (currentState_.culling_ != state_.culling_) {
        if (state_.culling_ == true) {
            gl_.enable(gl_.CULL_FACE);
        } else {
            gl_.disable(gl_.CULL_FACE);
        }
    }

    this.currentState_ = state_;
};






/**
 * @constructor
 */
Melown.GpuFont = function(gpu_, core_, font_, size_) {
    this.bbox_ = null;
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;

    this.chars_ = [];
    this.space_ = 0;
    this.font_ = font_;
    this.size_ = size_;
    this.image_ = null;
    this.texture_ = null;

    this.generate(font_, size_);
};

//destructor
Melown.GpuFont.prototype.kill = function() {

};

Melown.GpuFont.prototype.generate = function(font_, size_) {
    if (font_ == null) {
        font_ = "Arial, 'Helvetica Neue', Helvetica, sans-serif"; //"Calibri";
    }

    if (size_ == null) {
        size_ = 10;
    }

    var textureLX_ = 512;
    var textureLY_ = 512;
    var fx = 1.0 / textureLX_;
    var fy = 1.0 / textureLY_;

    var canvas_ = document.createElement('canvas');
    canvas_.width = textureLX_;
    canvas_.height = textureLY_;

    var ctx_ = canvas_.getContext('2d');

    //utDrawFilledRect(0, 0, _textureLX, _textureLY, [0,0,0,255]);

    var _fontSize = 10;
    ctx_.beginPath();
    ctx_.font = size_ + "pt " + font_;
    ctx_.textAlign = "left";
    ctx_.textBaseline = "top";
//  ctx_.fillStyle = "@white";
//    ctx_.fillStyle = [0,0,0,255];
    ctx_.fillStyle = "#ffffff";
    ctx_.strokeStyle = "#000000";
    ctx_.lineWidth = 5;
    ctx_.lineCap = "round";
    ctx_.lineJoin = "round";

    var lineSpace_ = Math.round(ctx_.lineWidth*0.5);

    var space_ = ctx_.lineWidth+2;
    var x = space_;
    var y = space_;


    var cly = Math.floor(ctx_.measureText("e").width * 2.5);
    var clxe = Math.floor(ctx_.measureText("e").width);
    //var clxe = Math.floor(ctx_.measureText("ee").width);

    this.chars_ = [];
    this.space_ = cly;
    this.size_ = size_;
    this.font_ = font_;

    var codes_ = [];

    for (var i = 33; i < 191; i++) {
        codes_.push(i);
    }

    for (var i = 192; i < 688; i++) {
        codes_.push(i);
    }

    codes_ = codes_.concat(0x20, 0x2026, 0x2018, 0x2019, 0x201a, 0x201b, 0x201c, 0x201d, 0x201e, 0x2032, 0x2033, 0x203c);

    for (var i = 0, li = codes_.length; i < li; i++) {
        var c = String.fromCharCode(codes_[i]);
        var clx2 = Math.round(ctx_.measureText(c).width);
        var clx = clx2 + ctx_.lineWidth;

        if (x + clx2 + space_ >= textureLX_) {
            x = space_;
            y += cly + space_;
        }

        ctx_.strokeText(c, x+lineSpace_, y);
        ctx_.fillText(c, x+lineSpace_, y);

        this.chars_[codes_[i]] = {
                u1 : x * fx,
                v1 : y * fy,
                u2 : (x + clx) * fx,
                v2 : (y + cly) * fy,
                lx : clx,
                ly : cly,
                step_ : (clx-2)
            };

        x += clx + space_;
    }

    this.image_ = ctx_.getImageData(0, 0, textureLX_, textureLY_);

    this.texture_ = new Melown.GpuTexture(this.gpu_, null);
    //this.texture_.createFromData(textureLX_, textureLY_, this.image_);
    this.texture_.createFromImage(this.image_, "linear");
    this.texture_.width_ = textureLX_;
    this.texture_.height_ = textureLY_;
    this.texture_.size_ = textureLX_ * textureLY_ * 4;
};

//! Returns GPU RAM used, in bytes.
Melown.GpuFont.prototype.size = function(){ return this.size_; };



/**
 * @constructor
 */
Melown.GpuGeodata = function(gpu_, tile_) {
    this.gpu_ = gpu_;
    this.type_ = tile_.type_;
    this.gpuGroups_ = [];
    this.tile_ = tile_;
    this.curerntGpuGroup_ = null;
    this.geodataProcessor_ = tile_.layer_.geodataProcessor_;
    this.size_ = 0;
    this.killed_ = false;
    this.ready_ = false;

    this.isReady();
};

Melown.GpuGeodata.prototype.kill = function() {
    this.killed_ = true;

    switch(this.type_){
        case "geodata":

            for (var i = 0, li = this.gpuGroups_.length; i < li; i++) {
                this.gpuGroups_[i].kill();
            }

            break;
    }
};

Melown.GpuGeodata.prototype.onGeodataProcessorMessage = function(message_) {
    if (this.killed_ == true){
        return;
    }

    if (message_["command"] != null) {

        switch (message_["command"]) {

            case "beginGroup":
                this.currentGpuGroup_ = new Melown.GpuGroup(message_["id"], message_["bbox"], message_["origin"], this.gpu_, this.tile_.core_, this.tile_.layer_);
                this.gpuGroups_.push(this.currentGpuGroup_);
                break;

            case "addRenderJob":
                this.currentGpuGroup_.addRenderJob(message_);
                break;

            case "endGroup":
                this.size += this.currentGpuGroup_.size();
                break;
        }

    } else {

        switch (message_) {
            case "allProcessed":
                this.tile_.core_.renderer_.dirty_ = true;
                this.ready_ = true;
                break;

            case "ready":
                break;

        }
    }

};

Melown.GpuGeodata.prototype.isReady = function() {
    if (this.ready_ == false && this.geodataProcessor_.isReady() == true) {
        switch(this.type_){
            case "geodata":
                this.geodataProcessor_.setListener(this.onGeodataProcessorMessage.bind(this));
                this.geodataProcessor_.sendCommand("processGeodata", this.tile_.geodata_, this.tile_.id_, this.tile_.layer_.autoLods_);
                break;
        }
    }

    return this.ready_;
};


Melown.GpuGeodata.prototype.draw = function(mv_, mvp_, applyOrigin_) {
    if (this.ready_ == true) {
        switch(this.type_){
            case "geodata":
                for (var i = 0, li = this.gpuGroups_.length; i < li; i++) {
                    this.gpuGroups_[i].draw(mv_, mvp_, applyOrigin_);
                }
                break;
        }
    }
    return this.ready_;
};

Melown.GpuGeodata.prototype.size = function() {
    return this.size_;
};



/**
 * @constructor
 */
Melown.GpuGroup = function(id_, bbox_, origin_, gpu_, core_, layer_) {
    this.id_ = id_;
    this.bbox_ = null;
    this.origin_ = origin_ || [0,0,0];
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.renderer_ = core_.renderer_;
    this.core_ = core_;
    this.layer_ = layer_;
    this.jobs_ = [];

    if (bbox_ != null && bbox_[0] != null && bbox_[1] != null) {
        this.bbox_ = new Melown.BBox(bbox_[0][0], bbox_[0][1], bbox_[0][2], bbox_[1][0], bbox_[1][1], bbox_[1][2]);
    }

    this.size_ = 0;
    this.polygons_ = 0;
};

//destructor
Melown.GpuGroup.prototype.kill = function() {
    for (var i = 0, li = this.jobs_.length; i < li; i++) {

        switch(this.jobs_[i].type_) {
            case "flat-line":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                break;

            case "flat-tline":
            case "pixel-line":
            case "pixel-tline":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexNormalBuffer_);
                break;

            case "line-label":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexTexcoordBuffer_);
                break;

            case "icon":
            case "label":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexTexcoordBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexOriginBuffer_);
                break;
        }
    }
};

Melown.GpuGroup.prototype.size = function() {
    return this.size_;
};

Melown.GpuGroup.prototype.getZbufferOffset = function(params_) {
    return this.size_;
};

Melown.GpuGroup.prototype.addLineJob = function(data_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var color_ = data_["color"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = "flat-line";
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.lod_ = data_["lod"];
    job_.lineWidth_ = data_["line-width"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];

    //create vertex buffer
    job_.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    job_.vertexPositionBuffer_.itemSize = 3;
    job_.vertexPositionBuffer_.numItems = vertices_.length / 3;

    this.jobs_.push(job_);

    this.size_ += job_.vertexPositionBuffer_.numItems * 3 * 4;
    this.polygons_ += job_.vertexPositionBuffer_.numItems / 3;
};

Melown.GpuGroup.prototype.addExtentedLineJob = function(data_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var normals_ = data_["normalBuffer"];
    var color_ = data_["color"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = data_["type"];
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.lod_ = data_["lod"];
    job_.layer_ = this.layer_;
    job_.lineWidth_ = data_["line-width"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];

    if (data_["texture"] != null) {
        var texture_ = data_["texture"];
        var bitmap_ = texture_[0];
        job_.texture_ = [this.renderer_.getBitmap(bitmap_["url"], bitmap_["filter"] || "linear", bitmap_["tiled"] || false),
                                                  texture_[1], texture_[2], texture_[3], texture_[4]];
        var background_ = data_["background"];

        if (background_[3] != 0) {
            job_.background_ = [background_[0]*f, background_[1]*f, background_[2]*f, background_[3]*f];
        }
    }

    switch(job_.type_) {
        case "flat-tline":   job_.program_ = (background_[3] != 0) ? this.renderer_.progTBLine_ : this.renderer_.progTLine_;  break;
        case "pixel-line":   job_.program_ = this.renderer_.progLine3_;  break;
        case "pixel-tline":  job_.program_ = (background_[3] != 0) ? this.renderer_.progTPBLine_ : this.renderer_.progTPLine_; break;
    }

    //create vertex buffer
    job_.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    job_.vertexPositionBuffer_.itemSize = 4;
    job_.vertexPositionBuffer_.numItems = vertices_.length / 4;

    //create normal buffer
    job_.vertexNormalBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexNormalBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(normals_), gl_.STATIC_DRAW);
    job_.vertexNormalBuffer_.itemSize = 4;
    job_.vertexNormalBuffer_.numItems = normals_.length / 4;

    this.jobs_.push(job_);

    this.size_ += job_.vertexPositionBuffer_.numItems * 3 * 4 + job_.vertexNormalBuffer_.numItems * 4 * 4;
    this.polygons_ += job_.vertexPositionBuffer_.numItems / 3;
};

Melown.GpuGroup.prototype.addLineLabelJob = function(data_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var texcoords_ = data_["texcoordsBuffer"];
    var color_ = data_["color"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = "line-label";
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.lod_ = data_["lod"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];

    //create vertex buffer
    job_.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    job_.vertexPositionBuffer_.itemSize = 3;
    job_.vertexPositionBuffer_.numItems = vertices_.length / 3;

    //create normal buffer
    job_.vertexTexcoordBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(texcoords_), gl_.STATIC_DRAW);
    job_.vertexTexcoordBuffer_.itemSize = 4;
    job_.vertexTexcoordBuffer_.numItems = texcoords_.length / 4;

    this.jobs_.push(job_);

    this.size_ += job_.vertexPositionBuffer_.numItems * 3 * 4 + job_.vertexTexcoordBuffer_.numItems * 4 * 4;
    this.polygons_ += job_.vertexPositionBuffer_.numItems / 3;
};

Melown.GpuGroup.prototype.addIconJob = function(data_, label_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var texcoords_ = data_["texcoordsBuffer"];
    var origins_ = data_["originBuffer"];
    var color_ = data_["color"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = label_ ? "label" : "icon";
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.visibility_ = data_["visibility"];
    job_.center_ = data_["center"];
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.lod_ = data_["lod"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];

    if (label_ != true) {
        var icon_ = data_["icon"];
        job_.texture_ = this.renderer_.getBitmap(icon_["url"], icon_["filter"] || "linear", icon_["tiled"] || false);
    } else {
        job_.texture_ = this.renderer_.font_.texture_;
    }

    //create vertex buffer
    job_.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    job_.vertexPositionBuffer_.itemSize = 3;
    job_.vertexPositionBuffer_.numItems = vertices_.length / 3;

    //create normal buffer
    job_.vertexTexcoordBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(texcoords_), gl_.STATIC_DRAW);
    job_.vertexTexcoordBuffer_.itemSize = 4;
    job_.vertexTexcoordBuffer_.numItems = texcoords_.length / 4;

    //create origin buffer
    job_.vertexOriginBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexOriginBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(origins_), gl_.STATIC_DRAW);
    job_.vertexOriginBuffer_.itemSize = 3;
    job_.vertexOriginBuffer_.numItems = origins_.length / 3;

    this.jobs_.push(job_);

    this.size_ += job_.vertexPositionBuffer_.numItems * 3 * 4 +
                  job_.vertexOriginBuffer_.numItems * 3 * 4 +
                  job_.vertexTexcoordBuffer_.numItems * 4 * 4;
    this.polygons_ += job_.vertexPositionBuffer_.numItems / 3;
};


Melown.GpuGroup.prototype.addRenderJob = function(data_) {
    switch(data_["type"]) {
        case "flat-line":  this.addLineJob(data_); break;
        case "flat-tline": this.addExtentedLineJob(data_); break;
        case "pixel-line": this.addExtentedLineJob(data_); break;
        case "pixel-tline": this.addExtentedLineJob(data_); break;
        case "line-label": this.addLineLabelJob(data_); break;
        case "icon":       this.addIconJob(data_); break;
        case "label":      this.addIconJob(data_, true); break;
    }
};

Melown.GpuGroup.prototype.draw = function(mv_, mvp_, applyOrigin_) {
    if (this.id_ != null) {
        if (this.renderer_.layerGroupVisible_[this.id_] === false) {
            return;
        }
    }

    if (applyOrigin_ == true) {
        var mvp2_ = Melown.mat4.create();
        var mv2_ = Melown.mat4.create();

        var pos_ = this.renderer_.position_;

        var transform_ = this.renderer_.layerGroupTransform_[this.id_];

        if (transform_ != null) {
            var origin_ = transform_[1];
            origin_ = [origin_[0] - pos_[0], origin_[1] - pos_[1], origin_[2]];
            Melown.mat4.multiply(Melown.translationMatrix(origin_[0], origin_[1], origin_[2]), transform_[0], mv2_);
            Melown.mat4.multiply(mv_, mv2_, mv2_);
        } else {
            var origin_ = [this.origin_[0] - pos_[0], this.origin_[1] - pos_[1], this.origin_[2]];
            Melown.mat4.multiply(mv_, Melown.translationMatrix(origin_[0], origin_[1], origin_[2]), mv2_);
        }

        Melown.mat4.multiply(mvp_, mv2_, mvp2_);
        mv_ = mv2_;
        mvp_ = mvp2_;
    }

    var gl_ = this.gl_;
    var gpu_ = this.gpu_;

    var planet_ = this.renderer_.getPlanet();
    var cameraPos_ = this.renderer_.cameraPosition();

    var jobZBuffer_ = planet_.jobZBuffer_;
    var jobZBufferSize_ = planet_.jobZBufferSize_;

    var onlyHitable_ = this.renderer_.onlyHitLayers_;

    for (var i = 0, li = this.jobs_.length; i < li; i++) {
        var job_ = this.jobs_[i];

        if ((job_.type_ == "icon" || job_.type_ == "label") && job_.visibility_ > 0) {
            var center_ = job_.center_;
            if (Melown.vec3.length([center_[0]-cameraPos_[0],
                                      center_[1]-cameraPos_[1],
                                      center_[2]-cameraPos_[2]]) > job_.visibility_) {
                continue;
            }
        }

        if (onlyHitable_ && !job_.hitable_) {
            continue;
        }

        job_.mv_ = mv_;
        job_.mvp_ = mvp_;

        var zIndex_ = job_.zIndex_;
        jobZBuffer_[zIndex_][jobZBufferSize_[zIndex_]] = job_;
        jobZBufferSize_[zIndex_]++;
    }
};

Melown.drawGpuJob = function(gpu_, gl_, renderer_, job_, screenPixelSize_) {
    var mv_ = job_.mv_;
    var mvp_ = job_.mvp_;

    if (job_.state_ != 0) {
        var id_ = job_.eventInfo_["id"];

        if (id_ != null && renderer_.hoverFeature_ != null) {
            if (job_.state_ == 1){  // 1 = no hover state

                if (renderer_.hoverFeature_[0]["id"] == id_) { //are we hovering over feature?
                    return;
                }

            } else { // 2 = hover state

                if (renderer_.hoverFeature_[0]["id"] != id_) { //are we hovering over feature?
                    return;
                }

            }
        } else { //id id provided
            if (job_.state_ == 2) { //skip hover style
                return;
            }
        }
    }

    var hitmapRender_ = job_.hitable_ && renderer_.onlyHitLayers_;

    var color_ = job_.color_;

    if (hitmapRender_) {
        var c = renderer_.hoverFeatureCounter_;
        color_ = [(c&255)/255, ((c>>8)&255)/255, ((c>>16)&255)/255, 1];
        renderer_.hoverFeatureList_[c] = [job_.eventInfo_, job_.center_, job_.clickEvent_, job_.hoverEvent_, job_.enterEvent_, job_.leaveEvent_];
        renderer_.hoverFeatureCounter_++;
    }

    switch(job_.type_) {
        case "flat-line":

            gpu_.setState(Melown.StencilLineState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            var prog_ = renderer_.progLine_;

            gpu_.useProgram(prog_, "aPosition", null, null, null);
            prog_.setVec4("uColor", color_);
            prog_.setMat4("uMVP", mvp_);

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;

        case "flat-tline":
        case "pixel-line":
        case "pixel-tline":

            gpu_.setState(Melown.StencilLineState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            var prog_ = job_.program_;
            var texture_ = null;
            var textureParams_ = [0,0,0,0];

            if (job_.type_ != "pixel-line") {

                if (hitmapRender_) {
                    texture_ = renderer_.whiteTexture_;
                } else {
                    var t = job_.texture_;

                    if (t == null || t[0] == null) {
                        return;
                    }

                    texture_ = t[0];
                    textureParams_ = [0, t[1]/t[0].height_, (t[1]+t[2])/t[0].height_, 0];

                    if (job_.type_ == "flat-tline") {
                        textureParams_[0] = 1/job_.lineWidth_/(texture_.width_/t[2]);
                    } else {
                        var lod_ = job_.lod_ || job_.layer_.currentLod_;
                        var tileSize_ = job_.layer_.core_.mapConfig_.tileSize(lod_);
                        var tilePixelSize_ = tileSize_ / job_.layer_.tilePixels_;
                        textureParams_[0] = 1/texture_.width_/tilePixelSize_;
                    }
                }

                if (texture_.loaded_ == false) {
                    return;
                }

                gpu_.bindTexture(texture_);
            }

            gpu_.useProgram(prog_, "aPosition", null, null, null);
            prog_.setVec4("uColor", color_);
            prog_.setVec2("uScale", screenPixelSize_);
            prog_.setMat4("uMVP", mvp_);

            if (job_.type_ != "pixel-line") {
                if (job_.background_ != null) {
                    prog_.setVec4("uColor2", job_.background_);
                }
                prog_.setVec4("uParams", textureParams_);
                prog_.setSampler("uSampler", 0);
            }

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");
            var vertexNormalAttribute_ = prog_.getAttribute("aNormal");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex normals
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexNormalBuffer_);
            gl_.vertexAttribPointer(vertexNormalAttribute_, job_.vertexNormalBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;

        case "line-label":

            var texture_ = hitmapRender_ ? renderer_.whiteTexture_ : renderer_.font_.texture_;

            var yaw_ = Melown.radians(renderer_.orientation_[0]);
            var forward_ = [-Math.sin(yaw_), Math.cos(yaw_), 0, 0];

            gpu_.setState(Melown.LineLabelState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            var prog_ = renderer_.progText_;

            gpu_.bindTexture(texture_);

            gpu_.useProgram(prog_, "aPosition", "aTexCoord", null, null);
            prog_.setSampler("uSampler", 0);
            prog_.setMat4("uMVP", mvp_);
            prog_.setVec4("uVec", forward_);
            prog_.setVec4("uColor", color_);
            //prog_.setVec2("uScale", screenPixelSize_);

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");
            var vertexTexcoordAttribute_ = prog_.getAttribute("aTexCoord");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex texcoords
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);
            gl_.vertexAttribPointer(vertexTexcoordAttribute_, job_.vertexTexcoordBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;

        case "icon":
        case "label":

            var texture_ = hitmapRender_ ? renderer_.whiteTexture_ : job_.texture_;

            if (texture_.loaded_ == false) {
                return;
            }

            //value larger then 0 means that visibility is tested
            //if (job_.visibility_ != 0) {
                //job_.visibility_
            //}

            gpu_.setState(Melown.LineLabelState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            var prog_ = renderer_.progIcon_;

            gpu_.bindTexture(texture_);

            gpu_.useProgram(prog_, "aPosition", "aTexCoord", null, "aOrigin");
            prog_.setSampler("uSampler", 0);
            prog_.setMat4("uMVP", mvp_);
            prog_.setVec4("uScale", [screenPixelSize_[0], screenPixelSize_[1], (job_.type_ == "label" ? 1.0 : 1.0 / texture_.width_), 0]);
            prog_.setVec4("uColor", color_);
            //prog_.setVec2("uScale", screenPixelSize_);

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");
            var vertexTexcoordAttribute_ = prog_.getAttribute("aTexCoord");
            var vertexOriginAttribute_ = prog_.getAttribute("aOrigin");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex texcoordds
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);
            gl_.vertexAttribPointer(vertexTexcoordAttribute_, job_.vertexTexcoordBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex origin
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexOriginBuffer_);
            gl_.vertexAttribPointer(vertexOriginAttribute_, job_.vertexOriginBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;
    }

};



/**
 * @constructor
 */
Melown.GpuLine = function(gpu_, core_) {
    this.bbox_ = null;
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;

    var timer_ = performance.now();

    var gl_ = this.gl_;

    if (gl_ == null)
        return;

    this.vertices_ = [];
    this.vertexPositionBuffer_ = null;

};

//destructor
Melown.GpuLine.prototype.kill = function() {
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
*/
};

//add line to vertices buffer
Melown.GpuLine.prototype.addLine = function(p1, p2, size_) {
    //get direction vector
    var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

    //normalize vector
    var n = [0,0,0];
    Melown.vec3.normalize(v, n);
    n = [-n[1],n[0],0];

    n[0] *= size_;
    n[1] *= size_;
    n[2] *= size_;

    var index_ = this.vertices_.length;

    //first polygon
    this.vertices_[index_] = p1[0] + n[0];
    this.vertices_[index_+1] = p1[1] + n[1];
    this.vertices_[index_+2] = p1[2] + n[2];

    this.vertices_[index_+3] = p1[0] - n[0];
    this.vertices_[index_+4] = p1[1] - n[1];
    this.vertices_[index_+5] = p1[2] - n[2];

    this.vertices_[index_+6] = p2[0] + n[0];
    this.vertices_[index_+7] = p2[1] + n[1];
    this.vertices_[index_+8] = p2[2] + n[2];


    //next polygon
    this.vertices_[index_+9] = p1[0] - n[0];
    this.vertices_[index_+10] = p1[1] - n[1];
    this.vertices_[index_+11] = p1[2] - n[2];

    this.vertices_[index_+12] = p2[0] - n[0];
    this.vertices_[index_+13] = p2[1] - n[1];
    this.vertices_[index_+14] = p2[2] - n[2];

    this.vertices_[index_+15] = p2[0] + n[0];
    this.vertices_[index_+16] = p2[1] + n[1];
    this.vertices_[index_+17] = p2[2] + n[2];

    this.polygons_ += 2;
};

//add circle to vertices buffer
Melown.GpuLine.prototype.addCircle = function(p1, size_, sides_) {
    var i;

    if (this.circleBuffer_ == null) {

        this.circleBuffer_ = [];
        var buffer_ = this.circleBuffer_;

        var angle_ = 0, step_ = (2.0*Math.PI) / sides_;

        for (i = 0; i < sides_; i++) {
            buffer_[i] = [-Math.sin(angle_), Math.cos(angle_)];
            angle_ += step_;
        }

        buffer_[sides_] = [0, 1.0];
    }

    var buffer_ = this.circleBuffer_;
    var index_ = this.vertices_.length;

    for (i = 0; i < sides_; i++) {

        this.vertices_[index_] = p1[0];
        this.vertices_[index_+1] = p1[1];
        this.vertices_[index_+2] = p1[2];

        this.vertices_[index_+3] = p1[0] + buffer_[i][0] * size_;
        this.vertices_[index_+4] = p1[1] + buffer_[i][1] * size_;
        this.vertices_[index_+5] = p1[2];

        this.vertices_[index_+6] = p1[0] + buffer_[i+1][0] * size_;
        this.vertices_[index_+7] = p1[1] + buffer_[i+1][1] * size_;
        this.vertices_[index_+8] = p1[2];

        index_ += 9;
    }

    this.polygons_ += sides_;
};

//compile content of vertices buffer into gpu buffer
Melown.GpuLine.prototype.compile = function() {
    var gl_ = this.gl_;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = this.vertices_.length / 3;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;

/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxMesh_[0][0] ++;
        this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }
*/

};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuLine.prototype.draw = function(program_, attrPosition_, attrTexCoord_, attrBarycenteric_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.vertexPositionBuffer_ == null){
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuLine.prototype.size = function(){ return this.size_; };

Melown.GpuLine.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuLine.prototype.getPolygons = function(){ return this.polygons_; };

/**
 * @constructor
 */
Melown.GpuMesh = function(gpu_, meshData_, fileSize_, core_) {
    this.gl_ = gpu_.gl_;
    this.bbox_ = meshData_.bbox_; //!< bbox copy from Mesh
    this.fileSize_ = fileSize_; //used for stats
    this.core_ = core_;
    this.vertexBuffer_ = null;
    this.uvBuffer_ = null;
    this.uv2Buffer_ = null;

    var timer_ = performance.now();

    var vertices_ = meshData_.vertices_;
    var uvs_ = meshData_.uvs_;
    var uvs2_ = meshData_.uvs2_;
    var vertexSize_ = meshData_.vertexSize_ || 3;
    var uvSize_ = meshData_.uvSize_ || 2;
    var uv2Size_ = meshData_.uv2Size_ || 2;
    var gl_ = this.gl_;

    if (!vertices_ || !gl_) {
        return;
    }

    //create vertex buffer
    this.vertexBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    this.vertexBuffer_.itemSize = vertexSize_;
    this.vertexBuffer_.numItems = vertices_.length / vertexSize_;

    if (uvs_ != null) {
        //create texture coords buffer
        this.uvBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uvBuffer_);

        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(uvs_), gl_.STATIC_DRAW);
        this.uvBuffer_.itemSize = uvSize_;
        this.uvBuffer_.numItems = uvs_.length / uvSize_;
    }

    if (uvs2_ != null) {
        //create texture coords buffer
        this.uv2Buffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uv2Buffer_);

        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(uvs2_), gl_.STATIC_DRAW);
        this.uv2Buffer_.itemSize = uv2Size_;
        this.uv2Buffer_.numItems = uvs2_.length / uv2Size_;
    }

    this.size_ = this.vertexBuffer_.numItems * vertexSize_ * 4;
    this.size_ += (uvs_ == null) ? 0 : this.uvBuffer_.numItems * uvSize_ * 4;
    this.size_ += (uvs2_ == null) ? 0 : this.uv2Buffer_.numItems * uv2Size_ * 4;
    this.polygons_ = this.vertexBuffer_.numItems / 3;

    /*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxMesh_[0][0] ++;
        this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }*/

    this.valid_ = true;
};

//destructor
Melown.GpuMesh.prototype.kill = function() {
    if (!this.gl_ || !this.valid_) {
        return;
    }

    this.gl_.deleteBuffer(this.vertexBuffer_);
    this.gl_.deleteBuffer(this.uvBuffer_);

    /*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }*/
};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuMesh.prototype.draw = function(program_, attrVertex_, attrUV_, attrUV2_, attrBarycenteric_) {
    var gl_ = this.gl_;
    if (gl_ == null || !this.valid_) {
        return;
    }

    //bind vetex positions
    var vertexAttribute_ = program_.getAttribute(attrVertex_);
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexBuffer_);
    gl_.vertexAttribPointer(vertexAttribute_, this.vertexBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind texture coords
    if (this.uvBuffer_ != null) {
        var uvAttribute_ = program_.getAttribute(attrUV_);
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uvBuffer_);
        gl_.vertexAttribPointer(uvAttribute_, this.uvBuffer_.itemSize, gl_.FLOAT, false, 0, 0);
    }

    if (this.uv2Buffer_ != null) {
        var uv2Attribute_ = program_.getAttribute(attrUV2_);
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uv2Buffer_);
        gl_.vertexAttribPointer(uvAttribute_, this.uv2Buffer_.itemSize, gl_.FLOAT, false, 0, 0);
    }

    if (attrBarycenteric_ != null) {
        var barycentericAttribute_ = program_.getAttribute(attrBarycenteric_);
        gl_.bindBuffer(gl_.ARRAY_BUFFER, Melown.GpuBarycentricBuffer_);
        gl_.vertexAttribPointer(barycentericAttribute_, Melown.GpuBarycentricBuffer_.itemSize, gl_.FLOAT, false, 0, 0);
    }

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuMesh.prototype.size = function(){ return this.size_; };

Melown.GpuMesh.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuMesh.prototype.getPolygons = function(){ return this.polygons_; };


/**
 * @constructor
 */
Melown.GpuPixelLine = function(gpu_, core_) {
    this.bbox_ = null;
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;

    var timer_ = performance.now();

    var gl_ = this.gl_;

    if (gl_ == null)
        return;

    this.vertices_ = [];
    this.normals_ = [];
    this.vertexPositionBuffer_ = null;
    this.vertexNormalBuffer_ = null;
};

//destructor
Melown.GpuPixelLine.prototype.kill = function() {
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexNormalBuffer_);
/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
*/
};

//add line to vertices buffer
Melown.GpuPixelLine.prototype.addLine = function(p1, p2, size_) {
    //get direction vector
    var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

    //normalize vector
    var n = [0,0,0];
    Melown.vec3.normalize(v, n);
    n = [-n[1],n[0],0];

    n[0] *= size_;
    n[1] *= size_;
    n[2] *= size_;

    size_ *= 0.5;

    var index_ = this.vertices_.length;
    var index2_ = this.normals_.length;

    //first polygon
    this.vertices_[index_] = p1[0];
    this.vertices_[index_+1] = p1[1];
    this.vertices_[index_+2] = p1[2];
    this.normals_[index2_] = p2[0];
    this.normals_[index2_+1] = p2[1];
    this.normals_[index2_+2] = p2[2];
    this.normals_[index2_+3] = size_;

    this.vertices_[index_+3] = p1[0];
    this.vertices_[index_+4] = p1[1];
    this.vertices_[index_+5] = p1[2];
    this.normals_[index2_+4] = p2[0];
    this.normals_[index2_+5] = p2[1];
    this.normals_[index2_+6] = p2[2];
    this.normals_[index2_+7] = -size_;

    this.vertices_[index_+6] = p2[0];
    this.vertices_[index_+7] = p2[1];
    this.vertices_[index_+8] = p2[2];
    this.normals_[index2_+8] = p1[0];
    this.normals_[index2_+9] = p1[1];
    this.normals_[index2_+10] = p1[2];
    this.normals_[index2_+11] = size_;

    //next polygon
    this.vertices_[index_+9] = p1[0];
    this.vertices_[index_+10] = p1[1];
    this.vertices_[index_+11] = p1[2];
    this.normals_[index2_+12] = p2[0];
    this.normals_[index2_+13] = p2[1];
    this.normals_[index2_+14] = p2[2];
    this.normals_[index2_+15] = size_;

    this.vertices_[index_+12] = p2[0];
    this.vertices_[index_+13] = p2[1];
    this.vertices_[index_+14] = p2[2];
    this.normals_[index2_+16] = p1[0];
    this.normals_[index2_+17] = p1[1];
    this.normals_[index2_+18] = p1[2];
    this.normals_[index2_+19] = size_;

    this.vertices_[index_+15] = p2[0];
    this.vertices_[index_+16] = p2[1];
    this.vertices_[index_+17] = p2[2];
    this.normals_[index2_+20] = p1[0];
    this.normals_[index2_+21] = p1[1];
    this.normals_[index2_+22] = p1[2];
    this.normals_[index2_+23] = -size_;

    this.polygons_ += 2;
};

//add circle to vertices buffer
Melown.GpuPixelLine.prototype.addCircle = function(p1, size_, sides_) {
    size_ *= 0.5;

    var i;

    if (this.circleBuffer_ == null) {

        this.circleBuffer_ = [];
        var buffer_ = this.circleBuffer_;

        var angle_ = 0, step_ = (2.0*Math.PI) / sides_;

        for (i = 0; i < sides_; i++) {
            buffer_[i] = [-Math.sin(angle_), Math.cos(angle_)];
            angle_ += step_;
        }

        buffer_[sides_] = [0, 1.0];
    }

    var buffer_ = this.circleBuffer_;
    var index_ = this.vertices_.length;
    var index2_ = this.normals_.length;

    for (i = 0; i < sides_; i++) {

        this.vertices_[index_] = p1[0];
        this.vertices_[index_+1] = p1[1];
        this.vertices_[index_+2] = p1[2];
        this.normals_[index2_] = 0;
        this.normals_[index2_+1] = 0;
        this.normals_[index2_+2] = 0;
        this.normals_[index2_+3] = 0;

        this.vertices_[index_+3] = p1[0];
        this.vertices_[index_+4] = p1[1];
        this.vertices_[index_+5] = p1[2];
        this.normals_[index2_+4] = buffer_[i][0] * size_;
        this.normals_[index2_+5] = buffer_[i][1] * size_;
        this.normals_[index2_+6] = 0;
        this.normals_[index2_+7] = 0;

        this.vertices_[index_+6] = p1[0];
        this.vertices_[index_+7] = p1[1];
        this.vertices_[index_+8] = p1[2];
        this.normals_[index2_+8] = buffer_[i+1][0] * size_;
        this.normals_[index2_+9] = buffer_[i+1][1] * size_;
        this.normals_[index2_+10] = 0;
        this.normals_[index2_+11] = 0;

        index_ += 9;
        index2_ += 12;
    }

    this.polygons_ += sides_;
};

//compile content of vertices buffer into gpu buffer
Melown.GpuPixelLine.prototype.compile = function() {
    var gl_ = this.gl_;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = this.vertices_.length / 3;

    //create normal buffer
    this.vertexNormalBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormalBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.normals_), gl_.STATIC_DRAW);
    this.vertexNormalBuffer_.itemSize = 4;
    this.vertexNormalBuffer_.numItems = this.normals_.length / 4;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4 * 2;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;

/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxMesh_[0][0] ++;
        this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }
*/

};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuPixelLine.prototype.draw = function(program_, attrPosition_, attrNormal_, attrTexCoord_, attrBarycenteric_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.vertexPositionBuffer_ == null || this.vertexNormalBuffer_ == null){
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
    var vertexNormalAttribute_ = program_.getAttribute(attrNormal_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind vetex normals
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormalBuffer_);
    gl_.vertexAttribPointer(vertexNormalAttribute_, this.vertexNormalBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuPixelLine.prototype.size = function(){ return this.size_; };

Melown.GpuPixelLine.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuPixelLine.prototype.getPolygons = function(){ return this.polygons_; };


/**
 * @constructor
 */
Melown.GpuPolygon = function(gpu_, core_) {
    this.bbox_ = null;
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;

    var timer_ = performance.now();

    var gl_ = this.gl_;

    if (gl_ == null)
        return;

    this.vertices_ = [];
    this.normals_ = [];
    this.vertexPositionBuffer_ = null;
    this.vertexNormalBuffer_ = null;
};

//destructor
Melown.GpuPolygon.prototype.kill = function() {
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexNormalBuffer_);
/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
*/
};

//add face
Melown.GpuPolygon.prototype.addFace = function(p1, p2, p3, n) {
    var index_ = this.vertices_.length;

    if (n == null) {
        var n = [0,0,0];
        Melown.vec3.cross([p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2]], [p3[0]-p1[0], p3[1]-p1[1], p3[2]-p1[2]], n);
    }

    this.vertices_[index_] = p1[0];
    this.vertices_[index_+1] = p1[1];
    this.vertices_[index_+2] = p1[2];
    this.normals_[index_] = n[0];
    this.normals_[index_+1] = n[1];
    this.normals_[index_+2] = n[2];

    this.vertices_[index_+3] = p2[0];
    this.vertices_[index_+4] = p2[1];
    this.vertices_[index_+5] = p2[2];
    this.normals_[index_+3] = n[0];
    this.normals_[index_+4] = n[1];
    this.normals_[index_+5] = n[2];

    this.vertices_[index_+6] = p3[0];
    this.vertices_[index_+7] = p3[1];
    this.vertices_[index_+8] = p3[2];
    this.normals_[index_+6] = n[0];
    this.normals_[index_+7] = n[1];
    this.normals_[index_+8] = n[2];

    this.polygons_++;
};

//add quad
Melown.GpuPolygon.prototype.addQuad = function(p1, p2, p3, p4, n) {
    var index_ = this.vertices_.length;

    if (n == null) {
        var n = [0,0,0];
        Melown.vec3.cross([p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2]], [p3[0]-p1[0], p3[1]-p1[1], p3[2]-p1[2]], n);
        Melown.vec3.normalize(n);
    }

    //first polygon
    this.vertices_[index_] = p1[0];
    this.vertices_[index_+1] = p1[1];
    this.vertices_[index_+2] = p1[2];
    this.normals_[index_] = n[0];
    this.normals_[index_+1] = n[1];
    this.normals_[index_+2] = n[2];

    this.vertices_[index_+3] = p2[0];
    this.vertices_[index_+4] = p2[1];
    this.vertices_[index_+5] = p2[2];
    this.normals_[index_+3] = n[0];
    this.normals_[index_+4] = n[1];
    this.normals_[index_+5] = n[2];

    this.vertices_[index_+6] = p3[0];
    this.vertices_[index_+7] = p3[1];
    this.vertices_[index_+8] = p3[2];
    this.normals_[index_+6] = n[0];
    this.normals_[index_+7] = n[1];
    this.normals_[index_+8] = n[2];


    //next polygon
    this.vertices_[index_+9] = p1[0];
    this.vertices_[index_+10] = p1[1];
    this.vertices_[index_+11] = p1[2];
    this.normals_[index_+9] = n[0];
    this.normals_[index_+10] = n[1];
    this.normals_[index_+11] = n[2];

    this.vertices_[index_+12] = p3[0];
    this.vertices_[index_+13] = p3[1];
    this.vertices_[index_+14] = p3[2];
    this.normals_[index_+12] = n[0];
    this.normals_[index_+13] = n[1];
    this.normals_[index_+14] = n[2];

    this.vertices_[index_+15] = p4[0];
    this.vertices_[index_+16] = p4[1];
    this.vertices_[index_+17] = p4[2];
    this.normals_[index_+15] = n[0];
    this.normals_[index_+16] = n[1];
    this.normals_[index_+17] = n[2];

    this.polygons_ += 2;
};

Melown.GpuPolygon.prototype.addPolygon = function(outerRing_, innerRings_) {
    var contour_ = [];

    for (var i = 0, li = outerRing_.length; i < li; i++) {
        contour_.push({x: outerRing_[i][0], y: outerRing_[i][1]});
    }

    var swctx_ = new poly2tri.SweepContext(contour_);


    for (var j = 0, lj = outerRing_.length; j < lj; j++) {
        var hole_ = [];

        for (var i = 0, li = outerRing_.length; i < li; i++) {
            contour_.push({x: innerRings_[j][i][0], y: innerRings_[j][i][1]});
        }

        swctx_.addHole(hole_);
    }

    swctx_.triangulate();
    var triangles_ = swctx_.getTriangles();

    var height_ = 0;

    for (var i = 0, li = triangles_.length; i < li; i++) {
        var points_ = triangles_[i].getPoints();
        this.addFace([points_[0].x, points_[0].y, height_], [points_[1].x, points_[1].y, height_], [points_[2].x, points_[2].y, height_]);
    }
};


Melown.GpuPolygon.prototype.addWall = function(points_, points2_, closed_) {
    for (var i = 0, li = points_.length - 1; i < li; i++) {
        this.addQuad(points_[i], points_[i+1], points2_[i+1], points2_[i]);
    }

    if (closed_ && points_.length > 2) {
        this.addQuad(points_[points_.length-1], points_[0], points2_[0], points2_[points_.length-1]);
    }
};


//compile content of vertices buffer into gpu buffer
Melown.GpuPolygon.prototype.compile = function() {
    var gl_ = this.gl_;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = this.vertices_.length / 3;

    //create normal buffer
    this.vertexNormalBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormalBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.normals_), gl_.STATIC_DRAW);
    this.vertexNormalBuffer_.itemSize = 3;
    this.vertexNormalBuffer_.numItems = this.normals_.length / 3;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4 * 2;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;

/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxMesh_[0][0] ++;
        this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }
*/

};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuPolygon.prototype.draw = function(program_, attrPosition_, attrNormal_, attrTexCoord_, attrBarycenteric_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.vertexPositionBuffer_ == null || this.vertexNormalBuffer_ == null){
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
    var vertexNormalAttribute_ = program_.getAttribute(attrNormal_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind vetex normals
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormalBuffer_);
    gl_.vertexAttribPointer(vertexNormalAttribute_, this.vertexNormalBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuPolygon.prototype.size = function(){ return this.size_; };

Melown.GpuPolygon.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuPolygon.prototype.getPolygons = function(){ return this.polygons_; };


/**
 * @constructor
 */
Melown.GpuProgram = function(gpu_, vertex_, fragment_) {
    this.gl_ = gpu_.gl_;
    this.vertex_ = vertex_;
    this.fragment_ = fragment_;
    this.program_ = null;
    this.uniformLocationCache_ = [];
    this.attributeLocationCache_ = [];
    this.createProgram(vertex_, fragment_);
};


Melown.GpuProgram.prototype.createShader = function(source_, vertexShader_) {
    var gl_ = this.gl_;

    if (!source_ || !gl_) {
        return null;
    }

    var shader_;

    if (vertexShader_ != true) {
        shader_ = gl_.createShader(gl_.FRAGMENT_SHADER);
    } else {
        shader_ = gl_.createShader(gl_.VERTEX_SHADER);
    }

    gl_.shaderSource(shader_, source_);
    gl_.compileShader(shader_);

    if (!gl_.getShaderParameter(shader_, gl_.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl_.getShaderInfoLog(shader_));
        return null;
    }

    return shader_;
};


Melown.GpuProgram.prototype.createProgram = function(vertex_, fragment_) {
    var gl_ = this.gl_;
    if (gl_ == null) return;

    var vertexShader_ = this.createShader(vertex_, true);
    var fragmentShader_ = this.createShader(fragment_, false);

    var program_ = gl_.createProgram();
    gl_.attachShader(program_, vertexShader_);
    gl_.attachShader(program_, fragmentShader_);
    gl_.linkProgram(program_);

    if (!gl_.getProgramParameter(program_, gl_.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl_.useProgram(program_);

    this.program_ = program_;
};

Melown.GpuProgram.prototype.setSampler = function(name_, index_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform1i(key_, index_);
    }
};

Melown.GpuProgram.prototype.setMat4 = function(name_, m_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniformMatrix4fv(key_, false, m_);
    }
};

Melown.GpuProgram.prototype.setVec2 = function(name_, m_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform2fv(key_, m_);
    }
};

Melown.GpuProgram.prototype.setVec4 = function(name_, m_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform4fv(key_, m_);
    }
};

Melown.GpuProgram.prototype.setFloat = function(name_, value_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform1f(key_, value_);
    }
};

Melown.GpuProgram.prototype.setFloatArray = function(name_, array_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform1fv(key_, array_);
    }
};


Melown.GpuProgram.prototype.getAttribute = function(name_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    if (this.attributeLocationCache_[name_] == null) {
        var location_ = gl_.getAttribLocation(this.program_, name_);
        this.attributeLocationCache_[name_] = location_;
        return location_;
    } else {
        return this.attributeLocationCache_[name_];
    }
};

Melown.GpuProgram.prototype.getUniform = function(name_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    if (this.uniformLocationCache_[name_] == null) {
        var location_ = gl_.getUniformLocation(this.program_, name_);
        this.uniformLocationCache_[name_] = location_;
        return location_;
    } else {
        return this.uniformLocationCache_[name_];
    }
};



Melown.bboxVertexShader =
    "attribute vec3 aPosition;\n"+
    "uniform mat4 uMVP;\n"+
    "void main(){ \n"+
        "gl_Position = uMVP * vec4(aPosition, 1.0);\n"+
    "}";

Melown.bboxFragmentShader = "precision mediump float;\n"+
    "void main() {\n"+
        "gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);\n"+
    "}";

Melown.lineVertexShader =
    "attribute vec3 aPosition;\n"+
    "uniform mat4 uMVP;\n"+
    "void main(){ \n"+
        "gl_Position = uMVP * vec4(aPosition, 1.0);\n"+
    "}";

Melown.lineFragmentShader = "precision mediump float;\n"+
    "uniform vec4 uColor;\n"+
    "void main() {\n"+
        "gl_FragColor = uColor;\n"+
    "}";

Melown.line3VertexShader =
    "attribute vec4 aPosition;\n"+
    "attribute vec4 aNormal;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec2 uScale;\n"+
    "void main(){ \n"+
        "vec4 pp0 = (uMVP * vec4(aPosition.xyz, 1.0));\n"+
        "if (aNormal.w == 0.0) {\n"+
            "gl_Position = pp0 + vec4((vec3(aNormal.x*uScale.x*pp0.w, aNormal.y*uScale.y*pp0.w, 0.0)), 0.0);\n"+
        "} else {\n"+
            "vec2 pp1 = pp0.xy / pp0.w;\n"+
            "vec4 pp3 = (uMVP * vec4(aNormal.xyz, 1.0));\n"+
            "vec2 pp2 = pp3.xy / pp3.w;\n"+
            "vec2 n = normalize(pp2 - pp1);\n"+
            "gl_Position = pp0 + vec4((vec3(-n.y*uScale.x*aNormal.w*pp0.w, n.x*uScale.y*aNormal.w*pp0.w, 0.0)), 0.0);\n"+
        "}\n"+
    "}";

Melown.line3FragmentShader = "precision mediump float;\n"+
    "uniform vec4 uColor;\n"+
    "void main() {\n"+
        "gl_FragColor = uColor;\n"+
    "}";

Melown.tlineVertexShader =
    "attribute vec4 aPosition;\n"+
    "attribute vec4 aNormal;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec2 uScale;\n"+
    "uniform vec4 uParams;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "vec4 p=vec4(aPosition.xyz, 1.0);\n"+
        "p.xy+=aNormal.xy;\n"+
        "if (aNormal.w == 0.0){\n"+
            "float tcy=(uParams[1]+uParams[2])*0.5;\n"+
            "float tdy=uParams[1]-tcy;\n"+
            "float ty=(aNormal.x == 0.0 && aNormal.y == 0.0)?tcy:tcy+tdy*cos(aNormal.z);\n"+
//            "float ty=tcy;\n"+
            "vTexCoord=vec2(abs(aPosition.w)*uParams[0], ty);\n"+
        "} else {\n"+
            "vTexCoord=vec2(abs(aPosition.w)*uParams[0], aPosition.w < 0.0 ? uParams[1] : uParams[2]);\n"+
        "}\n"+

        "gl_Position = uMVP * p;\n"+
    "}";

Melown.tplineVertexShader =
    "attribute vec4 aPosition;\n"+
    "attribute vec4 aNormal;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec2 uScale;\n"+
    "uniform vec4 uParams;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "vec4 pp0 = (uMVP * vec4(aPosition.xyz, 1.0));\n"+
        "vTexCoord=vec2(abs(aPosition.w)*uParams[0], aPosition.w < 0.0 ? uParams[1] : uParams[2]);\n"+
//        "vTexCoord=vec2((abs(aPosition.w)) / (pp0.z/10.0), aPosition.w < 0.0 ? 0.0001 : 0.9999);\n"+
        "if (aNormal.w == 0.0) {\n"+
            "gl_Position = pp0 + vec4((vec3(aNormal.x*uScale.x*pp0.w, aNormal.y*uScale.y*pp0.w, 0.0)), 0.0);\n"+
        "} else {\n"+
            "vec2 pp1 = pp0.xy / pp0.w;\n"+
            "vec4 pp3 = (uMVP * vec4(aNormal.xyz, 1.0));\n"+
            "vec2 pp2 = pp3.xy / pp3.w;\n"+
            "vec2 n = normalize(pp2 - pp1);\n"+
            "gl_Position = pp0 + vec4((vec3(-n.y*uScale.x*aNormal.w*pp0.w, n.x*uScale.y*aNormal.w*pp0.w, 0.0)), 0.0);\n"+
        "}\n"+
    "}";

Melown.tlineFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform vec4 uColor;\n"+
    "uniform vec4 uColor2;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main() {\n"+
        "vec4 c=texture2D(uSampler, vTexCoord)*uColor;\n"+
//        "if(c.w < 0.01){ discard; }\n"+
        "gl_FragColor = c;\n"+
    "}";

Melown.tblineFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform vec4 uColor;\n"+
    "uniform vec4 uColor2;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main() {\n"+
        "vec4 c=texture2D(uSampler, vTexCoord)*uColor;\n"+
        "vec4 c2=uColor2;\n"+
        "c.xyz*=c.w; c2.xyz*=c2.w;\n"+
        "c=mix(c,c2,1.0-c.w);\n"+
        "c.xyz/=(c.w+0.00001);\n"+
        "gl_FragColor = c;\n"+
    "}";

Melown.polygonVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec3 aNormal;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform mat4 uRot;\n"+
    "uniform vec4 uColor;\n"+
    "varying vec4 vColor;\n"+
    "void main(){ \n"+
        "float l = dot((uRot*vec4(aNormal,1.0)).xyz, vec3(0.0,0.0,1.0)) * 0.5;\n"+
        "vec3 c = uColor.xyz;\n"+
        "c = (l > 0.0) ? mix(c,vec3(1.0,1.0,1.0),l) : mix(vec3(0.0,0.0,0.0),c,1.0+l);\n"+
        "vColor = vec4(c, uColor.w);\n"+
        "gl_Position = uMVP * vec4(aPosition, 1.0);\n"+
    "}";

Melown.polygonFragmentShader = "precision mediump float;\n"+
    "varying vec4 vColor;\n"+
    "void main() {\n"+
        "gl_FragColor = vColor;\n"+
    "}";

Melown.textVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec4 aTexCoord;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec4 uVec;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "vTexCoord = aTexCoord.xy;\n"+
        "if (dot(uVec.xy, aTexCoord.zw) < 0.0) {\n"+
            "gl_Position = uMVP * vec4(2.0, 0.0, 0.0, 1.0);\n"+
        "}else{\n"+
            "gl_Position = uMVP * vec4(aPosition, 1.0);\n"+
        "}\n"+
    "}";

Melown.textVertexShader2 =
    "attribute vec3 aPosition;\n"+
    "attribute vec4 aTexCoord;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec4 uPosition;\n"+
    "uniform float uDepth;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "vTexCoord = aTexCoord.xy;\n"+
        //"gl_Position = uMVP * vec4(aPosition, 1.0);\n"+
        "gl_Position = uMVP*vec4(aPosition[0]+uPosition[0],-aPosition[1]+uPosition[1],uPosition[2],1.0);\n"+
    "}";

Melown.iconVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec4 aTexCoord;\n"+
    "attribute vec3 aOrigin;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec4 uScale;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "vTexCoord = aTexCoord.xy * uScale[2];\n"+
        "vec4 pos = (uMVP * vec4(aOrigin, 1.0));\n"+
        //"pos.xy = pos.xy / pos.w;\n"+
        "gl_Position = pos + vec4(aPosition.x*uScale.x*pos.w, aPosition.y*uScale.y*pos.w, 0.0, 0.0);\n"+
    "}";

Melown.textFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform vec4 uColor;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main() {\n"+
        "vec4 c=texture2D(uSampler, vTexCoord);\n"+
        "if(c.w < 0.01){ discard; }\n"+
        "gl_FragColor = c*uColor;\n"+
    "}";

Melown.skydomeVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMVP;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "gl_Position = uMVP * vec4(aPosition, 1.0);\n"+
        "vTexCoord = aTexCoord;\n"+
    "}";

Melown.skydomeFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "const vec4 gray = vec4(0.125, 0.125, 0.125, 1.0);\n"+
//    "const vec4 gray = vec4(1.0, 1.0, 1.0, 1.0);\n"+
    "void main() {\n"+
        //"float fade = smoothstep(0.49, 0.52, vTexCoord.t);\n"+
        "float fade = smoothstep(0.51, 0.55, vTexCoord.t);\n"+
        "gl_FragColor = mix(texture2D(uSampler, vTexCoord), gray, fade);\n"+
        //"gl_FragColor = vec4(0.9, 0.9, 0.9, 1.0);\n"+
        //"gl_FragColor = vec4(vTexCoord.x, vTexCoord.y, 0.9, 1.0);\n"+
    "}";

//heightmap tile
Melown.heightmapVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "uniform mat4 uGridMat;\n"+
    "uniform float uGridStep1, uGridStep2;\n"+
    "const int HMSize = 5;\n"+
    "const float HMSize1 = float(HMSize-1);\n"+
    "uniform float uHeight[HMSize*HMSize];\n"+
    "varying vec2 vTexCoord1;\n"+
    "varying vec2 vTexCoord2;\n"+
    "varying float vFogFactor;\n"+
    "float round(float x) { return floor(x + 0.5); }\n"+
    "void main() {\n"+
        "vec3 pos = aPosition;\n"+
        "float z = uHeight[int(round(pos.y*HMSize1)*float(HMSize) + round(pos.x*HMSize1))];\n"+
        "vec4 camSpacePos = uMV * vec4(pos.xy, z, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uFogDensity * camDist);\n"+
        "vec4 gridCoord = uGridMat * vec4(pos, 1.0);\n"+
        "vTexCoord1 = aTexCoord;\n"+
        "vTexCoord1 = gridCoord.xy * vec2(uGridStep1);\n"+
        "vTexCoord2 = gridCoord.xy * vec2(uGridStep2);\n"+
    "}";

Melown.heightmapFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform float uGridBlend;\n"+
    "varying vec2 vTexCoord1;\n"+
    "varying vec2 vTexCoord2;\n"+
    "varying float vFogFactor;\n"+
//    "const vec4 fogColor = vec4(1, 1, 1, 1);\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "vec4 gridColor = mix(texture2D(uSampler, vTexCoord1), texture2D(uSampler, vTexCoord2), uGridBlend);\n"+
        "gl_FragColor = mix(fogColor, gridColor, vFogFactor);\n"+
    "}";


//depth encoded heightmap tile
Melown.heightmapDepthVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "uniform mat4 uGridMat;\n"+
    "uniform float uGridStep1, uGridStep2;\n"+
    "const int HMSize = 5;\n"+
    "const float HMSize1 = float(HMSize-1);\n"+
    "uniform float uHeight[HMSize*HMSize];\n"+
    "varying vec2 vTexCoord1;\n"+
    "varying vec2 vTexCoord2;\n"+
    "varying float vDepth;\n"+
    "float round(float x) { return floor(x + 0.5); }\n"+
    "void main() {\n"+
        "vec3 pos = aPosition;\n"+
        "float z = uHeight[int(round(pos.y*HMSize1)*float(HMSize) + round(pos.x*HMSize1))];\n"+
        "vec4 camSpacePos = uMV * vec4(pos.xy, z, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vDepth = camDist;\n"+
        "vec4 gridCoord = uGridMat * vec4(pos, 1.0);\n"+
        "vTexCoord1 = aTexCoord;\n"+
        "vTexCoord1 = gridCoord.xy * vec2(uGridStep1);\n"+
        "vTexCoord2 = gridCoord.xy * vec2(uGridStep2);\n"+
    "}";

Melown.heightmapDepthFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform float uGridBlend;\n"+
    "varying vec2 vTexCoord1;\n"+
    "varying vec2 vTexCoord2;\n"+
    "varying float vDepth;\n"+
//    "const vec4 fogColor = vec4(1, 1, 1, 1);\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        //"vec4 gridColor = mix(texture2D(uSampler, vTexCoord1), texture2D(uSampler, vTexCoord2), uGridBlend);\n"+
        "gl_FragColor = fract(vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0) * vDepth) + (-0.5/255.0);\n"+

        //"gl_FragColor = mix(fogColor, gridColor, vFogFactor);\n"+
    "}";


//textured tile mesh
Melown.tileVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uFogDensity * camDist);\n"+
        "vTexCoord = aTexCoord;\n"+
    "}";

Melown.tileFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
//    "const vec4 fogColor = vec4(0.8274, 0.9137, 0.9725, 1.0);\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "gl_FragColor = mix(fogColor, texture2D(uSampler, vTexCoord), vFogFactor);\n"+
    "}";


//flat shade tile mesh
Melown.tileFlatShadeVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "attribute vec3 aBarycentric;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec3 vBarycentric;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uFogDensity * camDist);\n"+
        "vTexCoord = aTexCoord;\n"+
        "vBarycentric = camSpacePos.xyz;\n"+
    "}";

Melown.tileFlatShadeFragmentShader = "precision mediump float;\n"+
    "#extension GL_OES_standard_derivatives : enable\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec3 vBarycentric;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "#ifdef GL_OES_standard_derivatives\n"+
            "vec3 nx = dFdx(vBarycentric);\n"+
            "vec3 ny = dFdy(vBarycentric);\n"+
            "vec3 normal=normalize(cross(nx,ny));\n"+
            "gl_FragColor = vec4(vec3(max(0.0,normal.z*(204.0/255.0))+(32.0/255.0)),1.0);\n"+
        "#else\n"+
            "gl_FragColor = vec4(1.0,1.0,1.0,1.0);\n"+
        "#endif\n"+
    "}";

//textured wire frame tile mesh
Melown.tileWireframeVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "attribute vec3 aBarycentric;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec3 vBarycentric;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uFogDensity * camDist);\n"+
        "vTexCoord = aTexCoord;\n"+
        "vBarycentric = aBarycentric;\n"+
    "}";

Melown.tileWireframeFragmentShader = "precision mediump float;\n"+
    "#extension GL_OES_standard_derivatives : enable\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec3 vBarycentric;\n"+
    "varying float vFogFactor;\n"+
//    "const vec4 fogColor = vec4(1, 1, 1, 1);\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "float edgeFactor(){\n"+
        "#ifdef GL_OES_standard_derivatives\n"+
            "vec3 d = fwidth(vBarycentric);\n"+
            "vec3 a3 = smoothstep(vec3(0.0), d*1.0, vBarycentric);\n"+
            "return min(min(a3.x, a3.y), a3.z);\n"+
        "#else\n"+
            "float a = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n"+
            "return a > 0.1 ? 1.0 : smoothstep(0.0,1.0,a*10.0);\n"+
        "#endif\n"+
    "}\n"+
    "void main() {\n"+
        //"gl_FragColor = vec4( mix(vec3(0.0), vec3(0.5), edgeFactor()) , 1.0);\n"+
        "gl_FragColor = mix(fogColor, vec4( mix(vec3(0.0), texture2D(uSampler, vTexCoord).rgb, edgeFactor()) , 1.0), vFogFactor);\n"+
        //"gl_FragColor = mix(fogColor, texture2D(uSampler, vTexCoord), vFogFactor);\n"+
    "}";

Melown.tileWireframe2FragmentShader = "precision mediump float;\n"+
    "#extension GL_OES_standard_derivatives : enable\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec3 vBarycentric;\n"+
    "varying float vFogFactor;\n"+
//    "const vec4 fogColor = vec4(1, 1, 1, 1);\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "float edgeFactor(){\n"+
        "#ifdef GL_OES_standard_derivatives\n"+
            "vec3 d = fwidth(vBarycentric);\n"+
            "vec3 a3 = smoothstep(vec3(0.0), d*1.0, vBarycentric);\n"+
            "return min(min(a3.x, a3.y), a3.z);\n"+
        "#else\n"+
            "float a = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n"+
            "return a > 0.1 ? 1.0 : smoothstep(0.0,1.0,a*10.0);\n"+
        "#endif\n"+
    "}\n"+
    "void main() {\n"+
        "gl_FragColor = vec4( mix(vec3(0.0), vec3(0.5), edgeFactor()) , 1.0);\n"+
    "}";


//depth encoded tile mesh
Melown.tileDepthVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vDepth;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vDepth = camDist;\n"+
        "vTexCoord = aTexCoord;\n"+
    "}";

Melown.tileDepthFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "varying float vDepth;\n"+
    "void main() {\n"+

//        "gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);\n"+
        "gl_FragColor = fract(vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0) * vDepth) + (-0.5/255.0);\n"+
        //"gl_FragColor.w=1.0;"+
//        "gl_FragColor = fract(vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0) * vDepth);\n"+

    "}";

//used for 2d iamges
Melown.imageVertexShader = "\n"+
    "attribute vec4 aPosition;\n"+
    "uniform mat4 uProjectionMatrix;\n"+
    "uniform mat4 uData;\n"+
    "uniform vec4 uColor;\n"+
    "uniform float uDepth;\n"+
    "varying vec4 vColor;\n"+
    "varying vec2 vTexcoords;\n"+
    "void main(void){\n"+
        "int i=int(aPosition.x);\n"+
        //"gl_Position=uProjectionMatrix*vec4(floor(uData[i][0]+0.1),floor(uData[i][1]+0.1),0.0,1.0);\n"+
        //IE11 :(

        "if(i==0) gl_Position=uProjectionMatrix*vec4(floor(uData[0][0]+0.1),floor(uData[0][1]+0.1),uDepth,1.0), vTexcoords=vec2(uData[0][2], uData[0][3]);\n"+
        "if(i==1) gl_Position=uProjectionMatrix*vec4(floor(uData[1][0]+0.1),floor(uData[1][1]+0.1),uDepth,1.0), vTexcoords=vec2(uData[1][2], uData[1][3]);\n"+
        "if(i==2) gl_Position=uProjectionMatrix*vec4(floor(uData[2][0]+0.1),floor(uData[2][1]+0.1),uDepth,1.0), vTexcoords=vec2(uData[2][2], uData[2][3]);\n"+
        "if(i==3) gl_Position=uProjectionMatrix*vec4(floor(uData[3][0]+0.1),floor(uData[3][1]+0.1),uDepth,1.0), vTexcoords=vec2(uData[3][2], uData[3][3]);\n"+

        "vec4 c=uColor*(1.0/255.0);\n"+
        "c.w*=1.0;\n"+
        "vColor=c;\n"+
    "}";

Melown.imageFragmentShader = "precision mediump float;\n"+
    "varying vec4 vColor;\n"+
    "varying vec2 vTexcoords;\n"+
    "uniform sampler2D uSampler;\n"+
    "void main(void){\n"+
        "vec4 c=texture2D(uSampler, vec2(vTexcoords.x, vTexcoords.y) );\n"+
        "c*=vColor;\n"+
//        "gl_FragColor = vec4(1.0,0.0,1.0,1.0);\n"+
        "if(c.w < 0.01){ discard; }\n"+
        "gl_FragColor = c;\n"+
//        "gl_FragColor = vec4(vTexcoords.x, vTexcoords.y, 0.0, 1.0);\n"+
    "}";








/**
 * @constructor
 */
Melown.GpuText = function(gpu_, core_, font_, withNormals_) {
    //this.bbox_ = mesh_.bbox_; //!< bbox copy from Mesh
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;
    this.font_ = font_;
    this.withNormals_ = withNormals_;

    this.vertices_ = [];
    this.tvertices_ = [];

    this.vertexPositionBuffer_ = null;
    this.vertexTextureCoordBuffer_ = null;

    this.size_ = 0;
    this.polygons_ = 0;
};

//destructor
Melown.GpuText.prototype.kill = function() {
    if (this.vertexPositionBuffer_ == null) {
        return;
    }

    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexTextureCoordBuffer_);

    if (this.core_ != null && this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
};

Melown.GpuText.prototype.addChar = function(pos_, dir_, verticalShift_, char_, factor_, index_, index2_, textVector_) {
    //normal to dir
    var n = [-dir_[1],dir_[0],0];

    var p1 = [pos_[0], pos_[1], pos_[2]];
    var p2 = [p1[0], p1[1], p1[2]];

    var chars_ = this.font_.chars_;

    var fc = chars_[char_];
    var l = 0;
    var nx = textVector_[0];
    var ny = textVector_[1];

    if (char_ == 9 || char_ == 32) {  //tab or space
        fc = chars_[32]; //space

        if (fc != null) {
            p1[0] += dir_[0] * (fc.step_) * factor_;
            p1[1] += dir_[1] * (fc.step_) * factor_;
            l = fc.lx * factor_;
        }
    } else {
        if (fc != null) {
            var factorX_ = fc.lx * factor_;
            var factorY_ = fc.ly * factor_;

            var n2 = [n[0] * verticalShift_, n[1] * verticalShift_, n[2] * verticalShift_];
            var n3 = [n2[0] + n[0] * factorY_, n2[1] + n[1] * factorY_, n2[2] + n[2] * factorY_];

            p2[0] = p1[0] + dir_[0] * factorX_;
            p2[1] = p1[1] + dir_[1] * factorX_;
            p2[2] = p1[2] + dir_[2] * factorX_;

            //first polygon
            this.vertices_[index_] = p1[0] - n2[0];
            this.vertices_[index_+1] = p1[1] - n2[1];
            this.vertices_[index_+2] = p1[2] - n2[2];

            this.tvertices_[index2_] = fc.u1;
            this.tvertices_[index2_+1] = fc.v1;
            this.tvertices_[index2_+2] = nx;
            this.tvertices_[index2_+3] = ny;

            this.vertices_[index_+3] = p1[0] - n3[0];
            this.vertices_[index_+4] = p1[1] - n3[1];
            this.vertices_[index_+5] = p1[2] - n3[2];

            this.tvertices_[index2_+4] = fc.u1;
            this.tvertices_[index2_+5] = fc.v2;
            this.tvertices_[index2_+6] = nx;
            this.tvertices_[index2_+7] = ny;

            this.vertices_[index_+6] = p2[0] - n2[0];
            this.vertices_[index_+7] = p2[1] - n2[1];
            this.vertices_[index_+8] = p2[2] - n2[2];

            this.tvertices_[index2_+8] = fc.u2;
            this.tvertices_[index2_+9] = fc.v1;
            this.tvertices_[index2_+10] = nx;
            this.tvertices_[index2_+11] = ny;


            //next polygon
            this.vertices_[index_+9] = p1[0] - n3[0];
            this.vertices_[index_+10] = p1[1] - n3[1];
            this.vertices_[index_+11] = p1[2] - n3[2];

            this.tvertices_[index2_+12] = fc.u1;
            this.tvertices_[index2_+13] = fc.v2;
            this.tvertices_[index2_+14] = nx;
            this.tvertices_[index2_+15] = ny;

            this.vertices_[index_+12] = p2[0] - n3[0];
            this.vertices_[index_+13] = p2[1] - n3[1];
            this.vertices_[index_+14] = p2[2] - n3[2];

            this.tvertices_[index2_+16] = fc.u2;
            this.tvertices_[index2_+17] = fc.v2;
            this.tvertices_[index2_+18] = nx;
            this.tvertices_[index2_+19] = ny;

            this.vertices_[index_+15] = p2[0] - n2[0];
            this.vertices_[index_+16] = p2[1] - n2[1];
            this.vertices_[index_+17] = p2[2] - n2[2];

            this.tvertices_[index2_+20] = fc.u2;
            this.tvertices_[index2_+21] = fc.v1;
            this.tvertices_[index2_+22] = nx;
            this.tvertices_[index2_+23] = ny;

            index_ += 18;
            index2_ += 24;
            this.polygons_ += 2;

            p1[0] = p1[0] + dir_[0] * fc.step_ * factor_;
            p1[1] = p1[1] + dir_[1] * fc.step_ * factor_;
            l = fc.lx * factor_;
        } else {
            //unknown char
        }
    }

    return [p1, index_, index2_, l];
};


Melown.GpuText.prototype.addText = function(pos_, dir_, text_, size_) {
    var textVector_ = [0,1];
    var index_ = this.vertices_.length;
    var index2_ = this.tvertices_.length;

    var factor_ = size_ / this.font_.size_;
    var newLineSpace_ = this.font_.space_ * factor_;

    var s = [pos_[0], pos_[1], pos_[2]];
    var p1 = [pos_[0], pos_[1], pos_[2]];

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            s[0] += -dir_[1] * newLineSpace_;
            s[1] += dir_[0] * newLineSpace_;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        var shift_ = this.addChar(p1, dir_, 0, char_, factor_, index_, index2_, textVector_);

        p1 = shift_[0];
        index_ = shift_[1];
        index2_ = shift_[2];
    }

};


Melown.GpuText.prototype.addTextOnPath = function(points_, distance_, text_, size_, textVector_) {
    if (textVector_ == null) {
        textVector_ = [0,1];
    }

    var p1 = points_[0];
    var p2 = points_[1];

    var index_ = this.vertices_.length;
    var index2_ = this.tvertices_.length;

    var chars_ = this.font_.chars_;

    var factor_ = size_ / this.font_.size_;
    var newLineSpace_ = this.font_.space_ * factor_;

    var s = [p1[0], p1[1], p1[2]];
    var p1 = [p1[0], p1[1], p1[2]];
    var l = distance_;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            s[0] += -dir_[1] * newLineSpace_;
            s[1] += dir_[0] * newLineSpace_;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        if (char_ == 9) { //tab
            char_ = 32;
        }

        var fc = chars_[char_];
        var ll = 1;
        if (fc != null) {
            ll = fc.step_ * factor_;
        }

        var posAndDir_ = this.getPathPositionAndDirection(points_, l);
        var posAndDir2_ = this.getPathPositionAndDirection(points_, l+ll);

        //average dir
        var dir_ = [(posAndDir2_[1][0] + posAndDir_[1][0])*0.5,
                    (posAndDir2_[1][1] + posAndDir_[1][1])*0.5,
                    (posAndDir2_[1][2] + posAndDir_[1][2])*0.5];

        Melown.vec3.normalize(dir_);

        var shift_ = this.addChar(posAndDir_[0], dir_, -factor_*this.font_.size_*0.7, char_, factor_, index_, index2_, textVector_);

        p1 = shift_[0];
        index_ = shift_[1];
        index2_ = shift_[2];
        l += ll;
    }

};

Melown.GpuText.prototype.addStreetTextOnPath = function(points_, text_, size_) {
    var factor_ = size_ / this.font_.size_;
    var textLength_ = this.getTextLength(text_, factor_);
    var pathLength_ = this.getPathLength(points_);
    var shift_ = (pathLength_ -  textLength_)*0.5;
    if (shift_ < 0) {
        shift_ = 0;
    }

    if (textLength_ > pathLength_) {
        return;
    }

    var textVector_ = this.getPathTextVector(points_, shift_, text_, factor_);

    this.addTextOnPath(points_, shift_, text_, size_, textVector_);
};

Melown.GpuText.prototype.getFontFactor = function(size_) {
    return size_ / this.font_.size_;
};

Melown.GpuText.prototype.getTextLength = function(text_, factor_) {
    var l = 0;
    var chars_ = this.font_.chars_;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            continue;
        }

        if (char_ == 9) {  //tab or space
            char_ = 32;
        }

        var fc = chars_[char_];

        if (fc != null) {
            l += fc.step_ * factor_;
        }
    }

    return l;
};

Melown.GpuText.prototype.getPathLength = function(points_) {
    var l = 0;

    for (var i = 0, li = points_.length-1; i < li; i++) {
        var p1 = points_[i];
        var p2 = points_[i+1];
        var dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += Melown.vec3.length(dir_);
    }

    return l;
};

Melown.GpuText.prototype.getPathPositionAndDirection = function(points_, distance_) {
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];

    for (var i = 0, li = points_.length-1; i < li; i++) {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        var ll = Melown.vec3.length(dir_);

        if ((l + ll) > distance_) {
            var factor_ = (distance_ - l) / (ll);
            var p = [p1[0] + dir_[0] * factor_,
                     p1[1] + dir_[1] * factor_,
                     p1[2] + dir_[2] * factor_];

            Melown.vec3.normalize(dir_);

            return [p, dir_];
        }

        l += ll;
    }

    return [p1, dir_];
};

Melown.GpuText.prototype.getPathTextVector = function(points_, shift_, text_, factor_) {
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];
    var textDir_ = [0,0,0];
    var textStart_ = shift_;
    var textEnd_ = shift_ + this.getTextLength(text_, factor_);

    for (var i = 0, li = points_.length-1; i < li; i++) {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += Melown.vec3.length(dir_);

        if (l > textStart_) {
            Melown.vec3.normalize(dir_);
            textDir_[0] += dir_[0];
            textDir_[1] += dir_[1];
            textDir_[2] += dir_[2];
        }

        if (l > textEnd_) {
            Melown.vec3.normalize(textDir_);
            return [-textDir_[1], textDir_[0],0];
        }
    }

    return textDir_;
};

Melown.GpuText.prototype.compile = function() {
    var gl_ = this.gl_;
    if (gl_ == null)
        return;

    this.kill();

    this.vertexPositionBuffer_ = null;
    this.vertexTextureCoordBuffer_ = null;
    this.vertexNormalBuffer_ = null;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = this.vertices_.length / 3;

    //create texture coords buffer
    this.vertexTextureCoordBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexTextureCoordBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.tvertices_), gl_.STATIC_DRAW);
    this.vertexTextureCoordBuffer_.itemSize = 4;
    this.vertexTextureCoordBuffer_.numItems = this.tvertices_.length / 4;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4 + this.vertexTextureCoordBuffer_.numItems * 4 * 4;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;

    if (this.core_ != null && this.core_.renderer_ != null) {
        //this.core_.renderer_.statsCreateGpuTextTime_ += performance.now() - timer_;
        //this.core_.renderer_.statsFluxMesh_[0][0] ++;
        //this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }

    if (this.withNormals_ == true) {
        this.normals_ = [];
    }

};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuText.prototype.draw = function(program_, attrPosition_, attrTexCoord_) {
    var gl_ = this.gl_;
    if (gl_ == null)
        return;

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
    var textureCoordAttribute_ = program_.getAttribute(attrTexCoord_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind texture coords
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexTextureCoordBuffer_);
    gl_.vertexAttribPointer(textureCoordAttribute_, this.vertexTextureCoordBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuText.prototype.size = function(){ return this.size_; };

Melown.GpuText.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuText.prototype.getPolygons = function(){ return this.polygons_; };


/**
 * @constructor
 */
Melown.GpuTexture = function(gpu_, path_, core_, fileSize_, direct_, repeat_, filter_) {
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.texture_ = null;
    this.framebuffer_ = null;
    this.size_ = 0;
    this.fileSize_ = fileSize_; //used for stats
    this.width_ = 0;
    this.height_ = 0;
    this.repeat_ = repeat_ || false;
    this.filter_ = filter_ || "linear";

    this.image_ = null;
    this.loaded_ = false;
    this.trilinear_ = false;//true;
    this.core_ = core_;

    if (path_ != null) {
        this.load(path_, null, null, direct_);
    }
};

//destructor
Melown.GpuTexture.prototype.kill = function() {
    this.gl_.deleteTexture(this.texture_);

    /*
    if (this.core_ != null && this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxTexture_[1][0] ++;
        this.core_.renderer_.statsFluxTexture_[1][1] += this.size_;
    }
    */
};

//! Returns GPU RAM used, in bytes.
Melown.GpuTexture.prototype.size = function() {
    return this.size_;
};

Melown.GpuTexture.prototype.createFromData = function(lx_, ly_, data_, filter_, repeat_) {
    var gl_ = this.gl_;

    this.texture_ = gl_.createTexture();
    gl_.bindTexture(gl_.TEXTURE_2D, this.texture_);

    if (repeat_ == true){
        repeat_ = gl_.REPEAT;
        this.repeat_ = true;
    } else {
        repeat_ = gl_.CLAMP_TO_EDGE;
    }

    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, repeat_);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, repeat_);
    var mipmaps_ = false;

    switch (filter_)
    {
    case "linear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        break;
    case "trilinear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR_MIPMAP_LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        mipmaps_ = true;
        break;
    default:
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.NEAREST);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.NEAREST);
        break;
    }

    gl_.pixelStorei(gl_.UNPACK_ALIGNMENT, 1);
    //gl_.pixelStorei(gl_.UNPACK_FLIP_Y_WEBGL, true);

    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, lx_, ly_, 0, gl_.RGBA, gl_.UNSIGNED_BYTE, data_);

    if (mipmaps_ == true) {
        gl_.generateMipmap(gl_.TEXTURE_2D);
    }

    gl_.bindTexture(gl_.TEXTURE_2D, null);

    this.width_ = lx_;
    this.height_ = ly_;
    this.size_ = lx_ * ly_ * 4;
    this.loaded_ = true;
};

Melown.GpuTexture.prototype.createFromImage = function(image_, filter_, repeat_) {
    var gl_ = this.gl_;

    var timer_ = performance.now();

    this.texture_ = gl_.createTexture();
    gl_.bindTexture(gl_.TEXTURE_2D, this.texture_);

    if (repeat_ == true) {
        repeat_ = gl_.REPEAT;
        this.repeat_ = true;
    } else {
        repeat_ = gl_.CLAMP_TO_EDGE;
    }

    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, repeat_);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, repeat_);
    var mipmaps_ = false;
    this.filter_ = filter_;

    switch (filter_)
    {
    case "linear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        break;
    case "trilinear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR_MIPMAP_LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        mipmaps_ = true;
        break;
    default:
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.NEAREST);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.NEAREST);
        break;
    }

    //gl_.pixelStorei(gl_.UNPACK_ALIGNMENT, 1);
    //gl_.pixelStorei(gl_.UNPACK_FLIP_Y_WEBGL, true);

    if (Melown.noTextures_ != true) {
        gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, gl_.RGBA, gl_.UNSIGNED_BYTE, image_);

        if (mipmaps_ == true) {
            gl_.generateMipmap(gl_.TEXTURE_2D);
        }
    }

    gl_.bindTexture(gl_.TEXTURE_2D, null);

    this.width_ = image_.naturalWidth;
    this.height_ = image_.naturalHeight;
    this.size_ = image_.naturalWidth * image_.naturalHeight * 4;
    this.loaded_ = true;

    /*
    if (this.core_ != null && this.core_.renderer_!= null) {
        this.core_.renderer_.dirty_ = true;
        this.core_.renderer_.statsCreateTextureTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxTexture_[0][0] ++;
        this.core_.renderer_.statsFluxTexture_[0][1] += this.size_;
    }*/
};

Melown.GpuTexture.prototype.load = function(path_, onLoaded_, onError_, direct_) {
    this.image_ = new Image();
    this.image_.crossOrigin = Melown.isSameOrigin(path_) ? "use-credentials" : "anonymous";

    this.image_.onload = (function () {

        if (this.core_ != null && this.core_.killed_ == true) {
            return;
        }

        this.createFromImage(this.image_, this.filter_, this.repeat_);
        this.image_ = null;

    }).bind(this);

    this.image_.onerror = (function () {

        if (this.core_ != null && this.core_.killed_ == true) {
            return;
        }

        if (onError_ != null) {
            onError_();
        }

    }).bind(this);

    this.image_.src = path_;
};

Melown.GpuTexture.prototype.createFramebufferFromData = function(lx_, ly_, data_) {
    var gl_ = this.gl_;

    var framebuffer_ = gl_.createFramebuffer();
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, framebuffer_);
    framebuffer_.width = lx_;
    framebuffer_.height = ly_;

    var texture_ = gl_.createTexture();
    gl_.bindTexture(gl_.TEXTURE_2D, texture_);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, gl_.CLAMP_TO_EDGE);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, gl_.CLAMP_TO_EDGE);

    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.NEAREST);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.NEAREST);

    gl_.pixelStorei(gl_.UNPACK_ALIGNMENT, 1);

    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, lx_, ly_, 0, gl_.RGBA, gl_.UNSIGNED_BYTE, data_);



    var renderbuffer_ = gl_.createRenderbuffer();
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, renderbuffer_);
    gl_.renderbufferStorage(gl_.RENDERBUFFER, gl_.DEPTH_COMPONENT16, lx_, ly_);

    //gl_.framebufferTexture2D(gl_.FRAMEBUFFER, gl_.COLOR_ATTACHMENT0, gl_.TEXTURE_2D, this.texture_.texture_, 0);
    gl_.framebufferTexture2D(gl_.FRAMEBUFFER, gl_.COLOR_ATTACHMENT0, gl_.TEXTURE_2D, texture_, 0);

    gl_.framebufferRenderbuffer(gl_.FRAMEBUFFER, gl_.DEPTH_ATTACHMENT, gl_.RENDERBUFFER, renderbuffer_);

    this.width_ = lx_;
    this.height_ = ly_;
    this.size_ = lx_ * ly_ * 4;

    this.texture_ = texture_;
    this.renderbuffer_ = renderbuffer_;
    this.framebuffer_ = framebuffer_;

    //gl_.generateMipmap(gl_.TEXTURE_2D);
/*
    gl_.clearColor(0.0, 1.0, 0.0, 1.0);
    //gl_.enable(gl_.DEPTH_TEST);

    //clear screen
    gl_.viewport(0, 0, lx_, ly_);
    gl_.clear(gl_.COLOR_BUFFER_BIT);// | gl_.DEPTH_BUFFER_BIT);
*/
    gl_.bindTexture(gl_.TEXTURE_2D, null);
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, null);
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, null);
};

Melown.GpuTexture.prototype.createFramebuffer = function(lx_, ly_) {
    if (this.texture_ == null){
        return;
    }

    var gl_ = this.gl_;

    var framebuffer_ = gl_.createFramebuffer();
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, framebuffer_);
    framebuffer_.width = lx_;
    framebuffer_.height = ly_;

    gl_.bindTexture(gl_.TEXTURE_2D, this.texture_);

    var renderbuffer_ = gl_.createRenderbuffer();
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, renderbuffer_);
    gl_.renderbufferStorage(gl_.RENDERBUFFER, gl_.DEPTH_COMPONENT16, lx_, ly_);

    gl_.framebufferTexture2D(gl_.FRAMEBUFFER, gl_.COLOR_ATTACHMENT0, gl_.TEXTURE_2D, this.texture_, 0);
    gl_.framebufferRenderbuffer(gl_.FRAMEBUFFER, gl_.DEPTH_ATTACHMENT, gl_.RENDERBUFFER, renderbuffer_);

/*
    gl_.clearColor(0.0, 1.0, 0.0, 1.0);
    //gl_.enable(gl_.DEPTH_TEST);

    //clear screen
    gl_.viewport(0, 0, lx_, ly_);
//    gl_.clear(gl_.COLOR_BUFFER_BIT | gl_.DEPTH_BUFFER_BIT);
    gl_.clear(gl_.COLOR_BUFFER_BIT);
*/

    gl_.bindTexture(gl_.TEXTURE_2D, null);
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, null);
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, null);

    this.framebuffer_ = framebuffer_;
    this.renderbuffer_ = renderbuffer_;

};


Melown.GpuTexture.prototype.readFramebufferPixels = function(x_, y_, lx_, ly_) {
    if (this.texture_ == null) {
        return;
    }

    this.gpu_.bindTexture(this);
    this.gpu_.setFramebuffer(this);

    var gl_ = this.gl_;

    // Read the contents of the framebuffer (data stores the pixel data)
    var data_ = new Uint8Array(lx_ * ly_ * 4);
    gl_.readPixels(x_, y_, lx_, ly_, gl_.RGBA, gl_.UNSIGNED_BYTE, data_);

    this.gpu_.setFramebuffer(null);

    return data_;
};




/**
 * @constructor
 */
Melown.GpuTile = function(gpu_, core_, tile_) {
    this.gpu_ = gpu_;
    this.type_ = tile_.type_;
    this.ready_ = false;

    switch(this.type_){
        case "terrain":
            this.mesh_ = new Melown.GpuMesh(gpu_, tile_.mesh_, null, core_);
            this.texture_ = new Melown.GpuTexture(gpu_, null, core_);
            this.texture_.createFromImage(tile_.image_, "linear");
            this.meshFileSize_ = tile_.meshFileSize_;
            this.imageFileSize_ = tile_.imageFileSize_;
            this.ready_ = true;
            break;

        case "geodata":

            this.geodata_ = new Melown.GpuGeodata(gpu_, tile_, tile_.layer_);
            this.geodataFileSize_ += tile_.size();
            //this.ready_ = true;
            break;
    }

};

Melown.GpuTile.prototype.kill = function() {
    switch(this.type_){
        case "terrain":
            this.mesh_.kill();
            this.texture_.kill();
            break;

        case "geodata":
            this.geodata_.kill();
            break;
    }
};

Melown.GpuTile.prototype.isReady = function() {
    if (this.ready_ == false) {
        switch(this.type_){
            case "geodata":
                this.ready_ = this.geodata_.isReady();
                break;
        }
    }

    return this.ready_;
};

Melown.GpuTile.prototype.draw = function(mv_, mvp_, applyOrigin_) {
    if (this.ready_ == true) {
        switch(this.type_){
            case "geodata":
                this.geodata_.draw(mv_, mvp_, applyOrigin_);
                break;
        }
    }

    return this.ready_;
};

Melown.GpuTile.prototype.size = function() {
    switch(this.type_){
        case "terrain": return this.mesh_.size() + this.texture_.size();
        case "geodata": this.geodata_.size();
    }

};


//! Manages GPU memory -- uploads/releases GpuTiles
/**
 * @constructor
 */
Melown.GpuCache = function(gpu_, core_, size_) {
    //QCache<TileId, GpuTile> cache; cache(size)
    //this.cache_ = [];
    this.gpu_ = gpu_;
    this.core_ = core_;
    this.cache_ = new Melown.QCache(size_);
};

Melown.GpuCache.prototype.get = function(id_, tile_) {
    if (tile_ == null){
        id_ = id_;
    }

    if (tile_.layer_ != null) {
        id_.layerId_ = tile_.layer_.innerId_;
    }

    if (tile_.type_ == "geodata") {
        tile_ = tile_;
        //return null;
    }

    var gpuTile_ = this.cache_.find(id_);
    if (gpuTile_) return gpuTile_;

    var gpuTile_ = new Melown.GpuTile(this.gpu_, this.core_, tile_); // upload the tile to GPU RAM
    this.cache_.insert(id_, gpuTile_, gpuTile_.size());

    return gpuTile_;
};

Melown.GpuCache.prototype.size = function() {
    return this.cache_.totalCost_;
};

Melown.GpuCache.prototype.reset = function() {
    return this.cache_.clear();
};


//! maximum allowed projected texel size (affects LOD selection, i.e., display
//! quality, and also control constraints)
Melown.resolutionThreshold_ = 1.1;
Melown.texelSizeFactor_ = 1.0;
Melown.noTextures_ = false;

Melown.StencilLineState_ = null;

/**
 * @constructor
 */
Melown.Renderer = function(core_, div_, onUpdate_, keepFrameBuffer_) {
    this.core_ = core_;
    this.progTile_ = null;
    this.progHeightmap_ = null;
    this.progSkydome_ = null;
    this.progWireframeTile_ = null;
    this.progWireframeTile2_ = null;
    this.progText_ = null;
    this.div_ = div_;
    this.onUpdate_ = onUpdate_;
    this.killed_ = false;
    this.onlyDepth_ = false;
    this.onlyLayers_ = false;
    this.onlyHitLayers_ = false;
    this.hoverFeature_ = null;
    this.hoverFeatureId_ = null;
    this.lastHoverFeature_ = null;
    this.lastHoverFeatureId_ = null;
    this.hoverFeatureCounter_ = 0;
    this.hoverFeatureList_ = [];
    this.renderCounter_ = 1;
    this.hitmapCounter_ = 0;
    this.geoHitmapCounter_ = 0;
    this.clearStencilPasses_ = [];

    this.clickEvent_ = null;
    this.hoverEvent_ = null;
    this.touchSurfaceEvent_ = [];

    var rect_ = this.div_.getBoundingClientRect();

    this.winSize_ = [rect_.width, rect_.height]; //QSize
    this.curSize_ = [rect_.width, rect_.height]; //QSize
    this.dirty_ = true;
    this.cameraVector_ = [0,1,0];
    //this.texelSizeLimit_ = this.core_.mapConfig_.texelSize_ * Melown.texelSizeFactor_;
    this.gsd_ = 0.02;
    this.noForwardMovement_ = true;
    this.heightLod_ = this.core_.coreConfig_.heightLod_;

    this.gpu_ = new Melown.GpuDevice(div_, this.curSize_, keepFrameBuffer_);

    this.camera_ = new Melown.Camera(this, this.core_.coreConfig_.cameraFOV_, 2, this.core_.coreConfig_.cameraVisibility_);

    //reduce garbage collection
    this.drawTileMatrix_ = Melown.mat4.create();
    this.drawTileMatrix2_ = Melown.mat4.create();
    this.drawTileVec_ = [0,0,0];
    this.drawTileWorldMatrix_ = Melown.mat4.create();
    this.pixelTileSizeMatrix_ = Melown.mat4.create();

    //this.gpuCache_ = new Melown.GpuCache(this.gpu_, this.core_, this.core_.coreConfig_.gpuCacheSize_);

    this.heightmapMesh_ = null;
    this.heightmapTexture_ = null;

    this.skydomeMesh_ = null;
    this.skydomeTexture_ = null;

    this.hitmapTexture_ = null;
    this.geoHitmapTexture_ = null;
    this.hitmapSize_ = this.core_.coreConfig_.hitTextureSize_;
    this.updateHitmap_ = true;
    this.updateGeoHitmap_ = true;

    this.redTexture_ = null;

    this.rectVerticesBuffer_ = null;
    this.rectIndicesBuffer_ = null;
    this.imageProjectionMatrix_ = null;

    this.font_ = null;

    //hack for melown maps
    //this.melownHack_ = true;
    //this.melownHack_ = false;

    //reduce garbage collection
    this.updateCameraMatrix_ = Melown.mat4.create();

    //debug
    this.lastHitPosition_ = [0,0,100];
    this.logTilePos_ = null;

    window.addEventListener("resize", (this.onResize).bind(this), false);

    this.initializeGL();

    if (window["MelownMobile_"] == true && this.gpu_.canvas_ != null) {
        this.gpu_.canvas_.style.width = "100%";
        this.gpu_.canvas_.style.height = "100%";
    }

    var factor_ = window["MelownScreenScaleFactor_"];
    this.resizeGL(Math.floor(this.curSize_[0]*factor_), Math.floor(this.curSize_[1]*factor_));

    //this.planet_ = new Melown.Planet(this);
    //this.planet_.addTiledTerrainLayer("terrain");
};

Melown.Renderer.prototype.onResize = function()
{
    if (this.killed_ == true){
        return;
    }

    var rect_ = this.div_.getBoundingClientRect();
    //var factor_ = window["MelownScreenScaleFactor_"];
    this.resizeGL(Math.floor(rect_.width), Math.floor(rect_.height));
};

Melown.Renderer.prototype.kill = function()
{
    if (this.killed_ == true){
        return;
    }

    this.killed_ = true;

    if (this.planet_ != null) {
        this.planet_.kill();
    }

    this.gpuCache_.reset();

    if (this.heightmapMesh_ != null) this.heightmapMesh_.kill();
    if (this.heightmapTexture_ != null) this.heightmapTexture_.kill();
    if (this.skydomeMesh_ != null) this.skydomeMesh_.kill();
    if (this.skydomeTexture_ != null) this.skydomeTexture_.kill();
    if (this.hitmapTexture_ != null) this.hitmapTexture_.kill();
    if (this.geoHitmapTexture_ != null) this.geoHitmapTexture_.kill();

    this.div_.removeChild(this.gpu_.getCanvas());
};


Melown.Renderer.prototype.getPlanet = function()
{
    return this.planet_;
};

Melown.Renderer.prototype.resizeGL = function(width_, height_, skipCanvas_, skipPaint_)
{
    this.camera_.setAspect(width_ / height_);
    this.curSize_ = [width_, height_];
    this.gpu_.resize(this.curSize_, skipCanvas_);

    if (skipPaint_ != true) {
        this.paintGL();
    }

    var m = [];
    m[0] = 2.0/width_; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = -2.0/height_; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
    m[12] = -width_*0.5*m[0]; m[13] = -height_*0.5*m[5]; m[14] = 0; m[15] = 1;

    this.imageProjectionMatrix_ = m;
};

Melown.Renderer.prototype.project2 = function(point_, mvp_) {
    var p_ = [point_[0], point_[1], point_[2], 1 ];

    //project point coords to screen
    var p2_ = [0, 0, 0, 1];
    p2_ = Melown.mat4.multiplyVec4(mvp_, p_);

    if (p2_[3] != 0) {
        var sp_ = [0,0,0];

        //x and y are in screen pixels
        sp_[0] = ((p2_[0]/p2_[3])+1.0)*0.5*this.curSize_[0];
        sp_[1] = (-(p2_[1]/p2_[3])+1.0)*0.5*this.curSize_[1];

        //depth in meters
        sp_[2] = p2_[2]/p2_[3];
        //sp_[2] = p2_[2];
        //sp_[2] =  this.camera_.getNear() + sp_[2] ;//* (this.camera_.getFar() - this.camera_.getNear());

        return sp_;
    } else {
        return [0, 0, 0];
    }
};


Melown.Renderer.prototype.project = function(point_, mvp_) {
    //get mode-view-projection matrix
    var mvp_ = this.camera_.getMvpMatrix();

    //get camera position relative to position
    var cameraPos2_ = this.camera_.getPosition();

    //get global camera position
    var cameraPos_ = this.cameraPosition();

    //get point coords relative to camera
    var p_ = [point_[0] - cameraPos_[0] + cameraPos2_[0], point_[1] - cameraPos_[1] + cameraPos2_[1], point_[2] - cameraPos_[2] + cameraPos2_[2], 1 ];

    //project point coords to screen
    var p2_ = [0, 0, 0, 1];
    p2_ = Melown.mat4.multiplyVec4(mvp_, p_);

    if (p2_[3] != 0) {

        var sp_ = [0,0,0];

        //x and y are in screen pixels
        sp_[0] = ((p2_[0]/p2_[3])+1.0)*0.5*this.curSize_[0];
        sp_[1] = (-(p2_[1]/p2_[3])+1.0)*0.5*this.curSize_[1];

        //depth in meters
        sp_[2] = p2_[2]/p2_[3];
        //sp_[2] = p2_[2];
        //sp_[2] =  this.camera_.getNear() + sp_[2] ;//* (this.camera_.getFar() - this.camera_.getNear());

        return sp_;
    } else {
        return [0, 0, 0];
    }
};


Melown.Renderer.prototype.getScreenRay = function(screenX_, screenY_)
{
    if (this.camera_ == null) {
        return [0,0,1.0];
    }

    //conver screen coords
    var x_ = (2.0 * screenX_) / this.curSize_[0] - 1.0;
    var y_ = 1.0 - (2.0 * screenY_) / this.curSize_[1];

    var rayNormalizeDeviceSpace_ = [x_, y_, 1.0];

    var rayClipCoords_ = [rayNormalizeDeviceSpace_[0], rayNormalizeDeviceSpace_[1], -1.0, 1.0];

    var invProjection_ = Melown.mat4.create();
    invProjection_ = Melown.mat4.inverse(this.camera_.getProjectionMatrix());

    var rayEye_ = [0,0,0,0];
    Melown.mat4.multiplyVec4(invProjection_, rayClipCoords_, rayEye_); //inverse (projection_matrix) * rayClipCoords_;
    rayEye_[2] = -1.0;
    rayEye_[3] = 0.0;

    var invView_ = Melown.mat4.create();
    invView_ = Melown.mat4.inverse(this.camera_.getModelviewMatrix());

    var rayWorld_ = [0,0,0,0];
    Melown.mat4.multiplyVec4(invView_, rayEye_, rayWorld_); //inverse (projection_matrix) * rayClipCoords_;

    // don't forget to normalise the vector at some point
    rayWorld_ = Melown.vec3.normalize([rayWorld_[0], rayWorld_[1], rayWorld_[2]]); //normalise (ray_wor);

    return rayWorld_;
};


Melown.Renderer.prototype.hitTestGeoLayers = function(screenX_, screenY_, mode_)
{
    var gl_ = this.gpu_.gl_;

    //conver screen coords to texture coords
    if (gl_.checkFramebufferStatus(gl_.FRAMEBUFFER) != gl_.FRAMEBUFFER_COMPLETE) {
        return [null, false, []];
    }

    var surfaceHit_ = false;

    if (screenX_ >= 0 && screenX_ < this.curSize_[0] &&
        screenY_ >= 0 && screenY_ < this.curSize_[1]) {

        var x_ = 0, y_ = 0;

        //get screen coords
        x_ = Math.floor(screenX_ * (this.hitmapSize_ / this.curSize_[0]));
        y_ = Math.floor(screenY_ * (this.hitmapSize_ / this.curSize_[1]));

        //get pixel value from framebuffer
        var pixel_ = this.geoHitmapTexture_.readFramebufferPixels(x_, this.hitmapSize_ - y_ - 1, 1, 1);

        //convert rgb values into depth
        var id_ = (pixel_[0]) + (pixel_[1]*255.0) + (pixel_[2]*65025.0);// + (pixel_[3]*16581375.0);

        var surfaceHit_ = !(pixel_[0] == 255 && pixel_[1] == 255 && pixel_[2] == 255 && pixel_[3] == 255);

    //    console.log(JSON.stringify([pixel_[0], pixel_[1], pixel_[2], pixel_[3], surfaceHit_]));

    }


    if (surfaceHit_) {
        //console.log(JSON.stringify([id_, JSON.stringify(this.hoverFeatureList_[id_])]));

        if (mode_ == "hover") {
            this.lastHoverFeature_ = this.hoverFeature_;
            this.lastHoverFeatureId_ = this.hoverFeatureId_;
            this.hoverFeature_ = null;
            this.hoverFeatureId_ = null;

            this.hoverFeature_ = this.hoverFeatureList_[id_];
            this.hoverFeatureId_ = (this.hoverFeature_ != null) ? this.hoverFeature_[0]["id"] : null;

            var relatedEvents_ = [];

            if (this.hoverFeatureId_ != this.lastHoverFeatureId_) {

                if (this.lastHoverFeatureId_ != null) {
                    relatedEvents_.push(["leave", this.lastHoverFeature_, this.lastHoverFeatureId_]);
                }

                if (this.hoverFeatureId_ != null) {
                    relatedEvents_.push(["enter", this.hoverFeature_, this.hoverFeatureId_]);
                }

                this.dirty_ = true;
            }

            if (this.hoverFeature_ != null && this.hoverFeature_[3] == true) {
                return [this.hoverFeature_, surfaceHit_, relatedEvents_];
            } else {
                return [null, false, relatedEvents_];
            }
        }

        if (mode_ == "click") {

            var feature_ = this.hoverFeatureList_[id_];
            //this.hoverFeatureId_ = (this.hoverFeature_ != null) ? this.hoverFeature_["id"] : null;

            if (feature_ != null && this.hoverFeature_ != null && this.hoverFeature_[2] == true) {
                return [feature_, surfaceHit_, []];
            } else {
                return [null, false, []];
            }

        }
    } else {

        var relatedEvents_ = [];

        if (mode_ == "hover") {
            this.lastHoverFeature_ = this.hoverFeature_;
            this.lastHoverFeatureId_ = this.hoverFeatureId_;
            this.hoverFeature_ = null;
            this.hoverFeatureId_ = null;

            if (this.lastHoverFeatureId_ != null) {

                if (this.lastHoverFeatureId_ != null) {
                    relatedEvents_.push(["leave", this.lastHoverFeature_, this.lastHoverFeatureId_]);
                }

                this.dirty_ = true;
            }
        }

        return [null, false, relatedEvents_];
    }

};


Melown.Renderer.prototype.hitTest = function(screenX_, screenY_, mode_)
{

    //this.core_.hover(screenX_, screenY_, false, { test:true});
    //return [0,0,0,false];

    this.updateHitmap_ = true;

    var gl_ = this.gpu_.gl_;

    if (this.updateHitmap_ == true) {

        var size_ = this.hitmapSize_;

        //set texture framebuffer
        this.gpu_.setFramebuffer(this.hitmapTexture_);

        var oldSize_ = [ this.curSize_[0], this.curSize_[1] ];

        var width_ = size_;
        var height_ = size_;

        gl_.clearColor(1.0,1.0, 1.0, 1.0);
        //gl_.clearColor(0.0, 0.0, 0.0, 1.0);
        gl_.enable(gl_.DEPTH_TEST);

        //clear screen
        gl_.viewport(0, 0, size_, size_);
        gl_.clear(gl_.COLOR_BUFFER_BIT | gl_.DEPTH_BUFFER_BIT);

        this.curSize_ = [width_, height_];

        //gl_.viewport(0, 0, width_, height_);
        //render scene
        this.onlyDepth_ = true;
        //this.paintGL();

        this.gpu_.clear();

        this.camera_.update();
        //maxPixelSize_ = this.planet_.draw();
        this.drawTiles(this.planet_);

        this.onlyDepth_ = false;

        //return screen framebuffer
        width_ = oldSize_[0];
        height_ = oldSize_[1];

        gl_.clearColor(0.0, 0.0, 0.0, 1.0);

        this.gpu_.setFramebuffer(null);

        this.camera_.setAspect(width_ / height_);
        this.curSize_ = [width_, height_];
        this.gpu_.resize(this.curSize_, true);
        this.camera_.update();
        this.updateCamera();

        this.updateHitmap_ = false;
    }

    //conver screen coords to texture coords
    if (gl_.checkFramebufferStatus(gl_.FRAMEBUFFER) != gl_.FRAMEBUFFER_COMPLETE) {
        return [0,0,0,0];
    }

    var x_ = 0, y_ = 0;

    //get screen coords
    //if (this.curSize_[0] > this.curSize_[1]) {
    x_ = Math.floor(screenX_ * (this.hitmapSize_ / this.curSize_[0]));
    y_ = Math.floor(screenY_ * (this.hitmapSize_ / this.curSize_[1]));

    //console.log("hit screen: " + x_ + " " + y_);

    //get pixel value from framebuffer
    var pixel_ = this.hitmapTexture_.readFramebufferPixels(x_, this.hitmapSize_ - y_ - 1, 1, 1);

    //convert rgb values into depth
    var depth_ = (pixel_[0] * (1.0/255)) + (pixel_[1]) + (pixel_[2]*255.0) + (pixel_[3]*65025.0);// + (pixel_[3]*16581375.0);

    var surfaceHit_ = !(pixel_[0] == 255 && pixel_[1] == 255 && pixel_[2] == 255 && pixel_[3] == 255);

    //get screen ray
    var screenRay_ = this.getScreenRay(screenX_, screenY_);
    var cameraPos_ = this.cameraPosition();

    //compute hit postion
    this.lastHitPosition_ = [cameraPos_[0] + screenRay_[0]*depth_, cameraPos_[1] + screenRay_[1]*depth_, cameraPos_[2] + screenRay_[2]*depth_];


    //this.hitTestGeoLayers(screenX_, screenY_, "hover");
    this.core_.hover(screenX_, screenY_, false, { test:true});
    //this.core_.click(screenX_, screenY_, { test2:true});


    return [this.lastHitPosition_[0], this.lastHitPosition_[1], this.lastHitPosition_[2], surfaceHit_];
};


Melown.Renderer.prototype.saveScreenshot = function()
{
    //this.updateHitmap_ = true;

    var gl_ = this.gpu_.gl_;

    //get current screen size
    var width_ = this.curSize_[0];
    var height_ = this.curSize_[1];

    //read rgba data from frame buffer
    //works only when webgl context is initialized with preserveDrawingBuffer: true
    var data2_ = new Uint8Array(width_ * height_ * 4);
    gl_.readPixels(0, 0, width_, height_, gl_.RGBA, gl_.UNSIGNED_BYTE, data2_);

    //flip image vertically
    var data_ = new Uint8Array(width_ * height_ * 4);
    var index_ = 0;

    for (var y = 0; y < height_; y++) {

        index2_ = ((height_-1) - y) * width_ * 4;

        for (var x = 0; x < width_; x++) {
            data_[index_] = data2_[index2_];
            data_[index_+1] = data2_[index2_+1];
            data_[index_+2] = data2_[index2_+2];
            data_[index_+3] = data2_[index2_+3];
            index_+=4;
            index2_+=4;
        }
    }

    // Create a 2D canvas to store the result
    var canvas_ = document.createElement('canvas');
    canvas_.width = width_;
    canvas_.height = height_;
    var context_ = canvas_.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData_ = context_.createImageData(width_, height_);
    imageData_.data.set(data_);
    context_.putImageData(imageData_, 0, 0);

    //open image in new window
    window.open(canvas_.toDataURL("image/jpeg"));
};


Melown.Renderer.prototype.getBitmap = function(url_, filter_, tiled_) {
    var id_ = url_ + "*" + filter_ + "*" + tiled_;

    var texture_ = this.bitmaps_[id_];
    if (texture_ == null) {
        texture_ = new Melown.GpuTexture(this.gpu_, url_, this.core_, null, null, tiled_, filter_);
        this.bitmaps_[id_] = texture_;
    }

    return texture_;
};


/**
 * @constructor
 */
Melown.RendererInterface = function(renderer_) {
    this.renderer_ = renderer_;
    this.gpu_ = renderer_.gpu_;
};

Melown.RendererInterface.prototype.clear = function(options_) {
    if (options_ != null) {
        this.gpu_.clear((options_["clearDepth"] || true),
                        (options_["clearColor"] || false),
                        (options_["color"] || [255,255,255,255]),
                        (options_["depth"] || 1.0) );
    }
};

Melown.RendererInterface.prototype.createState = function(options_) {
};

Melown.RendererInterface.prototype.setState = function(options_) {
};


Melown.RendererInterface.prototype.createTexture = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return null;
    }

    var source_ = options_["source"];
    if (source_ == null) {
        return null;
    }

    var filter_ = options_["filter"] || "linear";
    var repeat_ = options_["repeat"] || false;

    if (source_ instanceof Uint8Array) {
        var width_ = options_["width"];
        var height_ = options_["height"];

        if (width_ && height_) {
            var texture_ = new Melown.GpuTexture(this.gpu_);
            texture_.createFromData(width_, height_, source_, filter, repeat_);
            return texture_;
        }
    }

    if (source_ instanceof Image) {
        var texture_ = new Melown.GpuTexture(this.gpu_);
        texture_.createFromImage(source_, filter_, repeat_);
        return texture_;
    }

    return null;
};

Melown.RendererInterface.prototype.createMesh = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return null;
    }

    var data_ = {
        vertices_ : options_["vertices"],
        uvs_ : options_["vertices"],
        vertexSize_ : options_["vertex-size"],
        uvSize_ : options_["uv-size"],
        bbox_ : options_["bbox"]
    };

    return new Melown.GpuMesh(this.gpu_, data_, 0, this.renderer_.core_);
};

Melown.RendererInterface.prototype.createProgram = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return null;
    }

    var vertexShader_ = options_["vertex-shader"];
    var fragmentShader_ = options_["fragment-shader"];

    if (vertexShader_ != null && fragmentShader_) {
        return new Melown.GpuProgram(this.gpu_, vertexShader_, fragmentShader_);
    }
};

Melown.RendererInterface.prototype.removeResource = function(resource_) {
    if (resource_ != null && resource_.kill != null) {
        resource.kill();
    }
};

Melown.RendererInterface.prototype.addJob = function(options_) {
};

Melown.RendererInterface.prototype.clearJobs = function(options_) {
};



Melown.RendererInterface.prototype.drawMesh = function(options_) {
};

Melown.RendererInterface.prototype.drawImage = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return;
    }

    if (options["texture"] == null || options["rect"] == null) {
        return;
    }

    var rect_ = options["rect"];
    var color_ = options["color"] || [255,255,255,255];
    var depth_ = options["depth"] || 0;
    var depthTest_ = options["depth-test"] || false;
    var blend_ = options["blend"] || false;

    this.renderer_.drawImage(rect_[0], rect_[1], rect_[2], rect_[3], options["texture"], color_, depth_, depthTest_, blend_);
};

Melown.RendererInterface.prototype.drawBillboard = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return;
    }

    if (options_["texture"] == null || options_["mvp"] == null) {
        return;
    }

    var mvp_ = options_["mvp"];
    var color_ = options_["color"] || [255,255,255,255];
    var depthTest_ = options_["depth-test"] || false;
    var blend_ = options_["blend"] || false;

    this.renderer_.drawBillboard(mvp_, options_["texture"], color_, depthTest_, blend_);
};

Melown.RendererInterface.prototype.drawLinestring = function(options_) {
};

Melown.RendererInterface.prototype.drawJobs = function(options_) {
};


Melown.RendererInterface.prototype.drawBBox = function(options_) {
};

Melown.RendererInterface.prototype.drawDebugText = function(options_) {
};

Melown.RendererInterface.prototype.getScreenCoords = function(point_, mvp_) {
    return this.renderer_.project2(point_, mvp_);
};

Melown.RendererInterface.prototype.getScreenSize = function(point_, mvp_) {
    return this.renderer_.curSize_.slice();
};


//prevent minification
Melown.RendererInterface.prototype["clear"] = Melown.RendererInterface.prototype.clear;
Melown.RendererInterface.prototype["createState"] = Melown.RendererInterface.prototype.createState;
Melown.RendererInterface.prototype["setState"] = Melown.RendererInterface.prototype.setState;

Melown.RendererInterface.prototype["createTexture"] = Melown.RendererInterface.prototype.createTexture;
Melown.RendererInterface.prototype["createMesh"] = Melown.RendererInterface.prototype.createMesh;
Melown.RendererInterface.prototype["createProgram"] = Melown.RendererInterface.prototype.createProgram;

Melown.RendererInterface.prototype["addJob"] = Melown.RendererInterface.prototype.addJob;
Melown.RendererInterface.prototype["clearJobs"] = Melown.RendererInterface.prototype.clearJobs;

Melown.RendererInterface.prototype["drawMesh"] = Melown.RendererInterface.prototype.drawMesh;
Melown.RendererInterface.prototype["drawImage"] = Melown.RendererInterface.prototype.drawImage;
Melown.RendererInterface.prototype["drawBillboard"] = Melown.RendererInterface.prototype.drawBillboard;
Melown.RendererInterface.prototype["drawLineString"] = Melown.RendererInterface.prototype.drawLineString;
Melown.RendererInterface.prototype["drawJobs"] = Melown.RendererInterface.prototype.drawJobs;


Melown["getVersion"] = Melown.getVersion;
Melown["checkSupport"] = Melown.checkSupport;

/**
 * @constructor
 */
Melown.BBox = function(xmin_, ymin_, zmin_, xmax_, ymax_, zmax_) {
    this.min_ = [];
    this.max_ = [];

    this.min_[0] = (xmin_ != null) ? xmin_ : Number.POSITIVE_INFINITY;
    this.min_[1] = (ymin_ != null) ? ymin_ : Number.POSITIVE_INFINITY;
    this.min_[2] = (zmin_ != null) ? zmin_ : Number.POSITIVE_INFINITY;

    this.max_[0] = (xmax_ != null) ? xmax_ : Number.NEGATIVE_INFINITY;
    this.max_[1] = (ymax_ != null) ? ymax_ : Number.NEGATIVE_INFINITY;
    this.max_[2] = (zmax_ != null) ? zmax_ : Number.NEGATIVE_INFINITY;

    this.maxSize_ = Math.max(this.max_[0] - this.min_[0],
                             this.max_[1] - this.min_[1],
                             this.max_[2] - this.min_[2]);
};

Melown.BBox.prototype.side = function(index_) {
    return this.max_[index_] - this.min_[index_];
};

Melown.BBox.prototype.center = function(vec_) {
    if (vec_ != null) {
        vec_[0] = (this.min_[0] + this.max_[0])*0.5;
        vec_[1] = (this.min_[1] + this.max_[1])*0.5;
        return vec_;
    } else {
        return [(this.min_[0] + this.max_[0])*0.5, (this.min_[1] + this.max_[1])*0.5, (this.min_[2] + this.max_[2])*0.5];
    }
};

Melown.BBox.prototype.translateXY = function(delta_) {
    return new Melown.BBox(this.min_[0] - delta_[0], this.min_[1] - delta_[1], this.min_[2],
                           this.max_[0] - delta_[0], this.max_[1] - delta_[1], this.max_[2]);
};

/**
 * @constructor
 */
Melown.Camera = function(parent_, fov_, near_, far_) {
    this.parent_ = parent_;
    this.position_ = /*(position_ != null) ? position_ :*/ [0,0,0];
    this.orientation_ = /*(orientation_ != null) ? orientation_ :*/ [0,0,0]; // {yaw, pitch, roll}
    this.aspect_ = 1;
    this.fov_ = fov_;
    this.near_ = near_;
    this.far_ = far_;

    // derived quantities, calculated from camera parameters by update()
    this.modelview_ = Melown.mat4.create();
    this.rotationview_ = Melown.mat4.create();
    this.projection_ = Melown.mat4.create();
    this.mvp_ = Melown.mat4.create();
    this.frustumPlanes_ = [ [0,0,0,0], [0,0,0,0], [0,0,0,0],
                            [0,0,0,0], [0,0,0,0], [0,0,0,0] ];

    //reduce garbage collection
    this.scaleFactorVec_ = [0,0,0,0];

    this.dirty_ = true;
};

Melown.Camera.prototype.setPosition = function(position_) {
    this.position_ = position_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setOrientation = function(orientation_) {
    this.orientation_ = orientation_;
    this.dirty_ = true;
};

//! Sets the viewport aspect ratio (width / height). Should be called
//! whenever the rendering viewport changes.
Melown.Camera.prototype.setAspect = function(aspect_) {
    this.aspect_ = aspect_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setViewHeight = function(height_) {
    this.viewHeight_ = height_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setOrtho = function(state_) {
    this.ortho_ = state_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setParams = function(fov_, near_, far_) {
    this.fov_ = fov_;
    this.near_ = near_;
    this.far_ = far_;
    this.dirty_ = true;
};

Melown.Camera.prototype.clone = function(newFov_) {
    var camera_ = new Melown.Camera(this. parent_, (newFov_ != null) ? newFov_ : this.getFov(), this.getNear(), this.getFar());

    camera_.setPosition(this.getPosition());
    camera_.setOrientation(this.getOrientation());
    camera_.setAspect(this.getAspect());
    camera_.update();

    return camera_;
};

// simple getters
Melown.Camera.prototype.getPosition = function(){ return [this.position_[0], this.position_[1], this.position_[2]]; };
Melown.Camera.prototype.getOrientation = function(){ return [this.orientation_[0], this.orientation_[1], this.orientation_[2]]; };
Melown.Camera.prototype.getAspect = function(){ return this.aspect_; };
Melown.Camera.prototype.getFov = function(){ return this.fov_; };
Melown.Camera.prototype.getNear = function(){ return this.near_; };
Melown.Camera.prototype.getFar = function(){ return this.far_; };
Melown.Camera.prototype.getViewHeight = function(){ return this.viewHeight_; };
Melown.Camera.prototype.getOrtho = function(){ return this.ortho_; };

//! Returns rotation matrix
Melown.Camera.prototype.getRotationviewMatrix = function(){
    if (this.dirty_) this.update();
    return this.rotationview_;
};


//! Returns a matrix that transforms the world space to camera space.
Melown.Camera.prototype.getModelviewMatrix = function(){
    if (this.dirty_) this.update();
    return this.modelview_;
};

//! Returns a matrix that transforms the camera space to screen space.
Melown.Camera.prototype.getProjectionMatrix = function(){
    if (this.dirty_) this.update();
    return this.projection_;
};

//! Returns projectionMatrix() * modelviewMatrix()
Melown.Camera.prototype.getMvpMatrix = function(){
    if (this.dirty_) this.update();
    return this.mvp_;
};

//! Returns how much a length unit located at a point in world space is
//! stretched when projected to the sceen space.
Melown.Camera.prototype.scaleFactor = function(worldPos_, returnDist_) {
    if (this.dirty_) this.update();

    //var camPos_ = Melown.vec4.create();
    //Melown.mat4.multiplyVec4(this.modelview_, worldPos_, camPos_);
    Melown.mat4.multiplyVec3(this.modelview_, worldPos_, this.scaleFactorVec_);
    var dist_ = Melown.vec3.length(this.scaleFactorVec_); // distance from camera

    // the expression "projection(0,0) / depth" is the derivative of the
    // screen X position by the camera space X coordinate.

    // ('dist' is used instead of camera depth (camPos(2)) to make the tile
    // resolution independent of camera rotation)

    if (returnDist_ == true) {
        if (dist_ < this.near_) return [Number.POSITIVE_INFINITY, dist_];
        return [this.projection_[0] / dist_, dist_];
    }

    if (dist_ < this.near_) return Number.POSITIVE_INFINITY;
    return this.projection_[0] / dist_;
};

Melown.Camera.prototype.distance = function(worldPos_) {
    var delta_ = Melown.vec3.create();
    Melown.vec3.subtract(this.position_, worldPos_, delta_);
    return Melown.vec3.length(delta_);
};

//! Returns true if the box intersects the camera frustum.
Melown.Camera.prototype.bboxVisible = function(bbox_, shift_) {
    if (this.dirty_) this.update();

    var min_ = bbox_.min_;
    var max_ = bbox_.max_;

    if (shift_ != null) {
        min_ = [min_[0] - shift_[0], min_[1] - shift_[1], min_[2] - shift_[2]];
        max_ = [max_[0] - shift_[0], max_[1] - shift_[1], max_[2] - shift_[2]];
    }

    var points_ = [
        [ min_[0], min_[1], min_[2], 1 ],
        [ min_[0], min_[1], max_[2], 1 ],
        [ min_[0], max_[1], min_[2], 1 ],
        [ min_[0], max_[1], max_[2], 1 ],
        [ max_[0], min_[1], min_[2], 1 ],
        [ max_[0], min_[1], max_[2], 1 ],
        [ max_[0], max_[1], min_[2], 1 ],
        [ max_[0], max_[1], max_[2], 1 ]
    ];

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++)
    {
        // check if all points lie on the negative side of the frustum plane
        var negative_ = true;
        for (var j = 0; j < 8; j++)
        {
            if (Melown.vec4.dot(this.frustumPlanes_[i], points_[j]) >= 0) {
                negative_ = false;
                break;
            }
        }
        if (negative_) return false;
    }

    // the box might be inside - further testing should be done here - TODO!
    return true;
};

Melown.Camera.prototype.update = function() {
    // modelview matrix, this is essentially the inverse of a matrix that
    // brings the camera from the origin to its world position (the inverse
    // is trivial here -- negative angles, reverse order of transformations)
    //this.modelview_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(-this.orientation_[2])), Melown.rotationMatrix(0, Melown.radians(-this.orientation_[1] - 90.0)), this.rotationview_);
    Melown.mat4.multiply(this.rotationview_, Melown.rotationMatrix(2, Melown.radians(-this.orientation_[0])), this.rotationview_);
    Melown.mat4.multiply(this.rotationview_, Melown.translationMatrix(-this.position_[0], -this.position_[1], -this.position_[2]), this.modelview_);

    if (this.ortho_ == true) {
        this.projection_ = Melown.orthographicMatrix(this.viewHeight_, this.aspect_, this.near_, this.far_);
    } else {
        this.projection_ = Melown.perspectiveMatrix(this.fov_, this.aspect_, this.near_, this.far_);
    }

    //this.mvp_ = Melown.mat4.create();
    Melown.mat4.multiply(this.projection_, this.modelview_, this.mvp_);

    // prepare frustum planes (in normalized device coordinates)
    this.frustumPlanes_[0] = [ 0, 0, 1, 1 ]; // far
    this.frustumPlanes_[1] = [ 0, 0,-1, 1 ]; // near
    this.frustumPlanes_[2] = [ 1, 0, 0, 1 ]; // left
    this.frustumPlanes_[3] = [-1, 0, 0, 1 ]; // right
    this.frustumPlanes_[4] = [ 0, 1, 0, 1 ]; // bottom
    this.frustumPlanes_[5] = [ 0,-1, 0, 1 ]; // top

    // transform the frustum planes to the world space, remember that
    // planes in homogeneous coordinates transform as p' = M^{-T} * p, where
    // M^{-T} is the transpose of inverse of M
    var mvpt_ = Melown.mat4.create();
    Melown.mat4.transpose(this.mvp_, mvpt_);
    for (var i = 0; i < 6; i++) {
        this.frustumPlanes_[i] = Melown.mat4.multiplyVec4(mvpt_, this.frustumPlanes_[i]);
    }

    // the derived quantities are now in sync with the parameters
    this.dirty_ = false;
};

Melown.Renderer.prototype.drawSkydome = function() {
    this.gpu_.gl_.disable(this.gpu_.gl_.CULL_FACE);

    ///progSkydome.use();
    var lower_ = 400; // put the dome a bit lower
    var normMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.scaleMatrix(2, 2, 2), Melown.translationMatrix(-0.5, -0.5, -0.5), normMat_);

    var domeMat_ = Melown.mat4.create();
//    Melown.mat4.multiply(Melown.translationMatrix(0, 0, this.camera_.getPosition()[2] - lower_), Melown.scaleMatrixf(this.camera_.getFar()*0.5), domeMat_);

    var pos_ = this.camera_.getPosition();
    Melown.mat4.multiply(Melown.translationMatrix(pos_[0], pos_[1], pos_[2] - lower_), Melown.scaleMatrixf(Math.min(this.camera_.getFar()*0.9,600000)), domeMat_);

    var mvp_ = Melown.mat4.create();
    Melown.mat4.multiply(this.camera_.getMvpMatrix(), domeMat_, mvp_);
    Melown.mat4.multiply(mvp_, normMat_, mvp_);

    this.gpu_.useProgram(this.progSkydome_, "aPosition", "aTexCoord");
    this.gpu_.bindTexture(this.skydomeTexture_);
//    this.gpu_.bindTexture(this.hitmapTexture_);

    this.progSkydome_.setSampler("uSampler", 0);
    this.progSkydome_.setMat4("uMVP", mvp_);

    this.gpu_.gl_.depthMask(false);

    this.skydomeMesh_.draw(this.progSkydome_, "aPosition", "aTexCoord");

    this.gpu_.gl_.depthMask(true);

    this.gpu_.gl_.enable(this.gpu_.gl_.CULL_FACE);

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();
};

Melown.Renderer.prototype.drawBall = function(position_, size_) {
    var gl_ = this.gpu_.gl_;

    gl_.disable(gl_.CULL_FACE);

    var normMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.scaleMatrix(2, 2, 2), Melown.translationMatrix(-0.5, -0.5, -0.5), normMat_);


   // var cameraPos2_ = this.camera_.getGlobalPosition();
    //var cameraPos_ = [0,0,0];
    var cameraPos2_ = this.camera_.getPosition();
    var cameraPos_ = this.cameraPosition();

    var pos_ = [position_[0] - cameraPos_[0] + cameraPos2_[0], position_[1] - cameraPos_[1] + cameraPos2_[1], position_[2] - cameraPos_[2] + cameraPos2_[2] ];
//    var pos_ = [position_[0] - cameraPos_[0], position_[1] - cameraPos_[1], position_[2] ];
    //var pos_ = [position_[0], position_[1], position_[2] ];
//    var pos_ = [cameraPos_[0]-position_[0], cameraPos_[1]-position_[1], -(cameraPos_[2]-position_[2]) ];


    var domeMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.translationMatrix(pos_[0], pos_[1], pos_[2]), Melown.scaleMatrixf(size_ != null ? size_ : 1.5), domeMat_);
    //Melown.mat4.multiply(Melown.translationMatrix(this.camera_.getPosition()[0]+pos_[0], this.camera_.getPosition()[1]+pos_[1], this.camera_.getPosition()[2]), Melown.scaleMatrixf(21.5), domeMat_);

    var mvp_ = Melown.mat4.create();
    Melown.mat4.multiply(this.camera_.getMvpMatrix(), domeMat_, mvp_);
    Melown.mat4.multiply(mvp_, normMat_, mvp_);

    this.gpu_.useProgram(this.progSkydome_, "aPosition", "aTexCoord");
    this.gpu_.bindTexture(this.redTexture_);

    this.progSkydome_.setSampler("uSampler", 0);
    this.progSkydome_.setMat4("uMVP", mvp_);

    this.skydomeMesh_.draw(this.progSkydome_, "aPosition", "aTexCoord");

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();

    gl_.enable(gl_.CULL_FACE);
};


//draw 2d image - used for debuging
Melown.Renderer.prototype.drawImage = function(x, y, lx, ly, texture_, color_, depth_, depthTest_, transparent_) {
    if (texture_ == null || this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;

    if (depthTest_ != true) {
        gl_.disable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
        gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
        gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
        gl_.enable(gl_.BLEND);
    }

    gl_.disable(gl_.CULL_FACE);

    this.gpu_.useProgram(this.progImage_, "aPosition", null);
    this.gpu_.bindTexture(texture_);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", this.imageProjectionMatrix_);

    this.progImage_.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);


    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

    if (depthTest_ != true) {
        gl_.enable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        gl_.disable(gl_.BLEND);
    }

    gl_.enable(gl_.CULL_FACE);
};

Melown.Renderer.prototype.drawBillboard = function(mvp_, texture_, color_, depthTest_, transparent_) {
    var gl_ = this.gpu_.gl_;

    if (depthTest_ != true) {
        gl_.disable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
        gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
        gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
        gl_.enable(gl_.BLEND);
    }

    gl_.disable(gl_.CULL_FACE);

    this.gpu_.useProgram(this.progImage_, "aPosition", "aTexCoord");
    this.gpu_.bindTexture(texture_);

    this.progImage_.setSampler("uSampler", 0);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", mvp_);

    var x = 0, y = 0, lx = 1, ly = 1;

    this.progImage_.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
    this.progImage_.setFloat("uDepth", 0);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

    if (depthTest_ != true) {
        gl_.enable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        gl_.disable(gl_.BLEND);
    }

    gl_.enable(gl_.CULL_FACE);
};


//draw flat 2d image - used for debuging
Melown.Renderer.prototype.drawFlatImage = function(x, y, lx, ly, texture_, color_, depth_) {
    if (texture_ == null || this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;
    this.gpu_.useProgram(this.progImage_, "aPosition", null);
    this.gpu_.bindTexture(texture_);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", this.imageProjectionMatrix_);

    this.progImage_.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);
};

//draw 2d text - used for debuging
Melown.Renderer.prototype.drawText = function(x, y, size_, text_, color_, depth_) {
    if (this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;

    gl_.disable(gl_.CULL_FACE);

    gl_.enable(gl_.DEPTH_TEST);

    if (depth_ == null) {
        gl_.disable(gl_.DEPTH_TEST);
    }

    this.gpu_.useProgram(this.progImage_, "aPosition", null);
    this.gpu_.bindTexture(this.textTexture_);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", this.imageProjectionMatrix_);
    this.progImage_.setVec4("uColor", color_);
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);

    var sizeX_ = size_;
    var sizeY_ = size_ * (7/4);

    var texelX_ = 1 / 64;
    var texelY_ = 1 / 8;


    var lx_ = x;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charAt(i);
        var charPos_ = this.textTable_[char_];

        this.progImage_.setMat4("uData", [
            x, y,  (charPos_ * texelX_), 0,
            x + sizeX_, y,  ((charPos_+4) * texelX_), 0,
            x + sizeX_, y + sizeY_, ((charPos_ + 4) * texelX_), texelY_*7,
            x,  y + sizeY_,  (charPos_ * texelX_), texelY_*7  ]);

        gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

        x += sizeX_;
    }

    x = lx_ - 1;

    //draw black line before text
    var charPos_ = this.textTable_[" "];

    this.progImage_.setMat4("uData", [
        x, y,  (charPos_ * texelX_), 0,
        x + sizeX_, y,  ((charPos_+4) * texelX_), 0,
        x + sizeX_, y + sizeY_, ((charPos_ + 4) * texelX_), texelY_*7,
        x,  y + sizeY_,  (charPos_ * texelX_), texelY_*7  ]);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);


    gl_.enable(gl_.CULL_FACE);

    if (depth_ == null) {
        gl_.enable(gl_.DEPTH_TEST);
    }

};

Melown.Renderer.prototype.fogSetup = function(program_, fogDensity_) {
    // the fog equation is: exp(-density*distance), this gives the fraction
    // of the original color that is still visible at some distance

    // we define visibility as a distance where only 5% of the original color
    // is visible; from this it is easy to calculate the correct fog density

    //var density_ = Math.log(0.05) / this.core_.coreConfig_.cameraVisibility_;
    var density_ = Math.log(0.05) / (this.core_.coreConfig_.cameraVisibility_ * 10*(Math.max(5,-this.camera_.getOrientation()[1])/90));
    density_ *= (5.0) / (Math.min(50000, Math.max(this.cameraDistance_, 1000)) /5000);

    if (this.drawFog_ == false) {
        density_ = 0;
    }

    //console.log("fden: " + density_);

    //reduce fog when camera is facing down
    //density_ *= 1.0 - (-this.orientation_[0]/90)

    program_.setFloat(fogDensity_, density_);
};

Melown.Renderer.prototype.paintGL = function() {
    this.gpu_.clear(true, false);

    //this.updateCamera();

    if (this.onlyLayers_ != true) {
        if (this.onlyDepth_ != true && this.onlyHitLayers_ != true) {
            this.drawSkydome();
        }
    }
};

Melown.RendererGeometry = {};

Melown.RendererGeometry.setFaceVertices = function(vertices_, a, b, c, index_) {
    vertices_[index_] = a[0];
    vertices_[index_+1] = a[1];
    vertices_[index_+2] = a[2];

    vertices_[index_+3] = b[0];
    vertices_[index_+4] = b[1];
    vertices_[index_+5] = b[2];

    vertices_[index_+6] = c[0];
    vertices_[index_+7] = c[1];
    vertices_[index_+8] = c[2];
};


Melown.RendererGeometry.setFaceUVs = function(uvs_, a, b, c, index_) {
    uvs_[index_] = a[0];
    uvs_[index_+1] = a[1];

    uvs_[index_+2] = b[0];
    uvs_[index_+3] = b[1];

    uvs_[index_+4] = c[0];
    uvs_[index_+5] = c[1];
};


//! Procedural mesh representing a heightmap block
//! Creates a grid of size x size vertices, all coords are [0..1].
Melown.RendererGeometry.buildHeightmap = function(size_) {
    size_--;

    var g = Melown.RendererGeometry;
    var numFaces_ = (size_* size_) * 2;
    var vertices_ = new Float32Array(numFaces_ * 3 * 3);//[];
    var uvs_ = new Float32Array(numFaces_ * 3 * 2);//[];

    var USHRT_MAX = 65535;
    var factor_ = 1.0 * size_;
    var index_ = 0;
    var index2_ = 0;

    for (var i = 0; i < size_; i++)
    {
        for (var j = 0; j < size_; j++)
        {
            var x1 = (j) * factor_;
            var x2 = (j+1) * factor_;

            var y1 = (i) * factor_;
            var y2 = (i+1) * factor_;

            g.setFaceVertices(vertices_, [x1, y1, 0], [x2, y1, 0], [x2, y2, 0], index_);
            g.setFaceUVs(vertices_, [x1, y1], [x2, y1], [x2, y2], index2_);
            index_ += 9;
            index2_ += 6;

            g.setFaceVertices(vertices_, [x2, y2, 0], [x1, y2, 0], [x1, y1, 0], index_);
            g.setFaceUVs(vertices_, [x2, y2], [x1, y2], [x1, y1], index2_);
            index_ += 9;
            index2_ += 6;
        }
    }

    var bbox_ = new Melown.BBox(0,0,0,1,1,1);

    return { bbox_:bbox_, vertices_:vertices_, uvs_: uvs_};
};


Melown.RendererGeometry.spherePos = function(lon_, lat_) {
    lat_ *= Math.PI;
    lon_ *= 2*Math.PI;

    return [Math.cos(lon_)*Math.sin(lat_)*0.5 + 0.5,
                Math.sin(lon_)*Math.sin(lat_)*0.5 + 0.5,
                Math.cos(lat_) * 0.5 + 0.5];
};


//! Creates an approximation of a unit sphere, note that all coords are
//! in the range [0..1] and the center is in (0.5, 0.5). Triangle "normals"
//! are oriented inwards.
Melown.RendererGeometry.buildSkydome = function(latitudeBands_, longitudeBands_) {
    var g = Melown.RendererGeometry;
    var numFaces_ = (latitudeBands_ * longitudeBands_) * 2;
    var vertices_ = new Float32Array(numFaces_ * 3 * 3);
    var uvs_ = new Float32Array(numFaces_ * 3 * 2);
    var index_ = 0;
    var index2_ = 0;

    for (var lat_ = 0; lat_ < latitudeBands_; lat_++) {
        for (var lon_ = 0; lon_ < longitudeBands_; lon_++)
        {
            var lon1_ = ((lon_) / longitudeBands_);
            var lon2_ = ((lon_+1) / longitudeBands_);

            var lat1_ = ((lat_) / latitudeBands_);
            var lat2_ = ((lat_+1) / latitudeBands_);

            g.makeQuad(lon1_, lat1_, lon2_, lat2_, vertices_, index_, uvs_, index2_);
            index_ += 9*2;
            index2_ += 6*2;
        }
    }

    var bbox_ = new Melown.BBox(0,0,0,1,1,1);

    return { bbox_:bbox_, vertices_:vertices_, uvs_: uvs_};
};

Melown.RendererGeometry.makeQuad = function(lon1_, lat1_, lon2_, lat2_, vertices_, index_, uvs_, index2_) {
    var g = Melown.RendererGeometry;
    var a = g.spherePos(lon1_, lat1_), ta = [lon1_, lat1_];
    var b = g.spherePos(lon1_, lat2_), tb = [lon1_, lat2_];
    var c = g.spherePos(lon2_, lat1_), tc = [lon2_, lat1_];
    var d = g.spherePos(lon2_, lat2_), td = [lon2_, lat2_];
    g.setFaceVertices(vertices_, b, a, c, index_);
    g.setFaceUVs(uvs_, tb, ta, tc, index2_);
    g.setFaceVertices(vertices_, c, d, b, index_+9);
    g.setFaceUVs(uvs_, tc, td, tb, index2_+6);
};



Melown.GpuBarycentricBuffer_ = null;

Melown.Renderer.prototype.initShaders = function() {
    this.progTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileVertexShader, Melown.tileFragmentShader);
    this.progWireframeTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileWireframeVertexShader, Melown.tileWireframeFragmentShader);
    this.progWireframeTile2_ = new Melown.GpuProgram(this.gpu_, Melown.tileWireframeVertexShader, Melown.tileWireframe2FragmentShader);
    this.progFlatShadeTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileFlatShadeVertexShader, Melown.tileFlatShadeFragmentShader);
    this.progHeightmap_ = new Melown.GpuProgram(this.gpu_, Melown.heightmapVertexShader, Melown.heightmapFragmentShader);
    this.progSkydome_ = new Melown.GpuProgram(this.gpu_, Melown.skydomeVertexShader, Melown.skydomeFragmentShader);

    this.progDepthTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileDepthVertexShader, Melown.tileDepthFragmentShader);
    this.progDepthHeightmap_ = new Melown.GpuProgram(this.gpu_, Melown.heightmapDepthVertexShader, Melown.heightmapDepthFragmentShader);
    //this.progDepthSkydome_ = new Melown.GpuProgram(this.gpu_, Melown.skydomeVertexShader, Melown.skydomeFragmentShader);

    this.progBBox_ = new Melown.GpuProgram(this.gpu_, Melown.bboxVertexShader, Melown.bboxFragmentShader);
    this.progLine_ = new Melown.GpuProgram(this.gpu_, Melown.lineVertexShader, Melown.lineFragmentShader);
    this.progLine3_ = new Melown.GpuProgram(this.gpu_, Melown.line3VertexShader, Melown.line3FragmentShader);
    this.progTLine_ = new Melown.GpuProgram(this.gpu_, Melown.tlineVertexShader, Melown.tlineFragmentShader);
    this.progTPLine_ = new Melown.GpuProgram(this.gpu_, Melown.tplineVertexShader, Melown.tlineFragmentShader);
    this.progTBLine_ = new Melown.GpuProgram(this.gpu_, Melown.tlineVertexShader, Melown.tblineFragmentShader);
    this.progTPBLine_ = new Melown.GpuProgram(this.gpu_, Melown.tplineVertexShader, Melown.tblineFragmentShader);
    this.progPolygon_ = new Melown.GpuProgram(this.gpu_, Melown.polygonVertexShader, Melown.polygonFragmentShader);
    this.progText_ = new Melown.GpuProgram(this.gpu_, Melown.textVertexShader, Melown.textFragmentShader);
    this.progText2_ = new Melown.GpuProgram(this.gpu_, Melown.textVertexShader2, Melown.textFragmentShader);
    this.progImage_ = new Melown.GpuProgram(this.gpu_, Melown.imageVertexShader, Melown.imageFragmentShader);
    this.progIcon_ = new Melown.GpuProgram(this.gpu_, Melown.iconVertexShader, Melown.textFragmentShader);

};


Melown.Renderer.prototype.initHeightmap = function() {
    // initialize heightmap geometry
    var meshData_ = Melown.RendererGeometry.buildHeightmap(5);
    this.heightmapMesh_ = new Melown.GpuMesh(this.gpu_, meshData_, null, this.core_);

   // create heightmap texture
    var size_ = 64;
    var halfLineWidth_ = 1;
    var data_ = new Uint8Array( size_ * size_ * 4 );

    for (var i = 0; i < size_; i++) {
        for (var j = 0; j < size_; j++) {

            var index_ =(i*size_+j)*4;

            if (i < halfLineWidth_ || i >= size_-halfLineWidth_ || j < halfLineWidth_ || j >= size_-halfLineWidth_) {
                 data_[index_] = 255;
                 data_[index_ + 1] = 255;
                 data_[index_ + 2] = 255;
             } else {
                 data_[index_] = 32;
                 data_[index_ + 1] = 32;
                 data_[index_ + 2] = 32;
             }

             data_[index_ + 3] = 255;
        }
    }


    this.heightmapTexture_ = new Melown.GpuTexture(this.gpu_);
    this.heightmapTexture_.createFromData(size_, size_, data_, "trilinear", true);
};


Melown.Renderer.prototype.initHitmap = function() {
    var size_ = this.hitmapSize_;
    var data_ = new Uint8Array( size_ * size_ * 4 );

    this.hitmapTexture_ = new Melown.GpuTexture(this.gpu_);
    this.hitmapTexture_.createFromData(size_, size_, data_);
    this.hitmapTexture_.createFramebuffer(size_, size_);

    this.geoHitmapTexture_ = new Melown.GpuTexture(this.gpu_);
    this.geoHitmapTexture_.createFromData(size_, size_, data_);
    this.geoHitmapTexture_.createFramebuffer(size_, size_);
};

Melown.Renderer.prototype.initTestMap = function() {
   // create red texture
    var size_ = 16;
    var data_ = new Uint8Array( size_ * size_ * 4 );

    for (var i = 0; i < size_; i++) {
        for (var j = 0; j < size_; j++) {

            var index_ = (i*size_+j)*4;

             data_[index_] = 255;
             data_[index_ + 1] = 0;
             data_[index_ + 2] = 0;
             data_[index_ + 3] = 255;
        }
    }

    this.redTexture_ = new Melown.GpuTexture(this.gpu_);
    this.redTexture_.createFromData(size_, size_, data_);

    var data_ = new Uint8Array( size_ * size_ * 4 );

    for (var i = 0; i < size_; i++) {
        for (var j = 0; j < size_; j++) {
            var index_ = (i*size_+j)*4;
             data_[index_] = 255;
             data_[index_ + 1] = 255;
             data_[index_ + 2] = 255;
             data_[index_ + 3] = 255;
        }
    }

    this.whiteTexture_ = new Melown.GpuTexture(this.gpu_);
    this.whiteTexture_.createFromData(size_, size_, data_);

    var sizeX_ = 64;
    var sizeY_ = 8;
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    var chars_ = [
    "............................................................",
    ".....xxxxx.......................xxxxx......................",
    ".....xxxxx.......................xxxxx......................",
    ".....xxxxx.......................xxxxx......................",
    "xxxxxxxxxxxxxxxx............xxxxxxxxxxxxxxxx................",
    "xxxxxxxxxxxxxxxx............xxxxxxxxxxxxxxxx................",
    "............................................................"
    ];


    // create red texture
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    //clear texture
    for (var i = 0; i < sizeY_; i++) {
        for (var j = 0; j < sizeX_; j++) {

            var index_ = (i*sizeX_+j)*4;

             data_[index_] = 0;
             data_[index_ + 1] = 0;
             data_[index_ + 2] = 0;
             data_[index_ + 3] = 0;//255;
        }
    }

    for (var i = 0, li = chars_.length; i < li; i++) {

        var string_ = chars_[i];

        for (var j = 0, lj = string_.length; j < lj; j++) {

            var index_ = (i*sizeX_+j)*4;

            if (string_.charAt(j) != '.') {
                 data_[index_] = 255;
                 data_[index_ + 1] = 255;
                 data_[index_ + 2] = 255;
                 data_[index_ + 3] = 255;
            }
        }
    }

    this.lineTexture_ = new Melown.GpuTexture(this.gpu_);
    this.lineTexture_.createFromData(sizeX_, sizeY_, data_, "linear", true);

};

Melown.Renderer.prototype.initTextMap = function() {
    var sizeX_ = 64;
    var sizeY_ = 8;
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    var chars_ = [
    "............................................................",
    "xxx..x..xxx.xxx.x...xxx.xxx.xxx.xxx.xxx.....................",
    "x.x.xx....x...x.x...x...x.....x.x.x.x.x......x..............",
    "x.x..x..xxx.xxx.x...xxx.xxx...x.xxx.xxx.........x.x.xxx.....",
    "x.x..x..x.....x.xxx...x.x.x...x.x.x...x......x...x..........",
    "xxx..x..xxx.xxx..x..xxx.xxx...x.xxx.xxx..x......x.x.........",
    "............................................................"
    ];

    this.textTable_ = {
        "0" : 0,
        "1" : 4,
        "2" : 8,
        "3" : 12,
        "4" : 16,
        "5" : 20,
        "6" : 24,
        "7" : 28,
        "8" : 32,
        "9" : 36,
        "." : 40,
        ":" : 44,
        "x" : 48,
        "-" : 52,
        " " : 56
    };

    // create red texture
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    //clear texture
    for (var i = 0; i < sizeY_; i++) {
        for (var j = 0; j < sizeX_; j++) {

            var index_ = (i*sizeX_+j)*4;

             data_[index_] = 0;
             data_[index_ + 1] = 0;
             data_[index_ + 2] = 0;
             data_[index_ + 3] = 255;
        }
    }

    for (var i = 0, li = chars_.length; i < li; i++) {

        var string_ = chars_[i];

        for (var j = 0, lj = string_.length; j < lj; j++) {

            var index_ = (i*sizeX_+j)*4;

            if (string_.charAt(j) != '.') {
                 data_[index_] = 255;
                 data_[index_ + 1] = 255;
                 data_[index_ + 2] = 255;
            }
        }
    }

    this.textTexture_ = new Melown.GpuTexture(this.gpu_);
    this.textTexture_.createFromData(sizeX_, sizeY_, data_);
};



Melown.Renderer.prototype.initImage = function() {
    var gl_ = this.gpu_.gl_;

    //create vertices buffer for rect
    this.rectVerticesBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.rectVerticesBuffer_);

    var vertices_ = [ 0, 0, 0, 1,   1, 0, 0, 1,
                      2, 0, 0, 1,   3, 0, 0, 1 ];

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    this.rectVerticesBuffer_.itemSize = 4;
    this.rectVerticesBuffer_.numItems = 4;

    //create indices buffer for rect
    this.rectIndicesBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, this.rectIndicesBuffer_);

    var indices_ = [ 0, 2, 1,    0, 3, 2 ];

    gl_.bufferData(gl_.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_), gl_.STATIC_DRAW);
    this.rectIndicesBuffer_.itemSize = 1;
    this.rectIndicesBuffer_.numItems = 6;
};


Melown.Renderer.prototype.initSkydome = function() {
    var meshData_ = Melown.RendererGeometry.buildSkydome(32, 64);
    this.skydomeMesh_ = new Melown.GpuMesh(this.gpu_, meshData_, null, this.core_);
    this.skydomeTexture_ = new Melown.GpuTexture(this.gpu_, this.core_.coreConfig_.skydomeTexture_, this.core_);
};


Melown.Renderer.prototype.initBBox = function() {
    this.bboxMesh_ = new Melown.GpuBBox(this.gpu_);

    if (this.displayDrawTest_ != true) {
        return;
    }
/*
    var x = 464823, y = 5582535, z = 259;

    var d = 400;

    var points_ = [
        [x,y,z],
        [x+d,y,z],
        [x+d,y+d,z],
        [x,y+d,z],
        [x+d*0.5,y,z],
        [x+d*0.5,y+d*2,z],
        [x,y,z+20],
        [x+d*0.5,y,z]
     ];

    this.lineTest_ = new Melown.GpuLine3(this.gpu_, this.core_);

    var s = 20;
   // var s = 1.0;

    this.lineTest_.addLine(points_[0], points_[7], s);
    this.lineTest_.addLine(points_[7], points_[1], s);

    this.lineTest_.addLine(points_[1], points_[2], s);
    this.lineTest_.addLine(points_[2], points_[3], s);
    //this.lineTest_.addLine(points_[3], points_[0], 5);

    this.lineTest_.addLine(points_[3], points_[4], s);
    this.lineTest_.addLine(points_[4], points_[5], s);

    this.lineTest_.addCircle(points_[0], s, 8);
    this.lineTest_.addCircle(points_[1], s, 8);
    this.lineTest_.addCircle(points_[2], s, 8);
    this.lineTest_.addCircle(points_[5], s, 8);

    this.lineTest_.addCircle(points_[3], s*5, 8);

    this.lineTest_.compile();


    this.font_ = new Melown.GpuFont(this.gpu_, this.core_);
    this.textTest_ = new Melown.GpuText(this.gpu_, this.core_, this.font_);

    this.textTest_.addText(points_[6], [1,0,0], "ABCabc", 1000);
    this.textTest_.compile();

    //var placemark_ = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAAK/INwWK6QAABchJREFUeNrlm39MVWUYxyGSEBUQ/4Coy49hRM1+DCRguhjoNMBEnBKIzFaZm2mT0TTDH9EWQcBMV0MYroDLEEYrc+H1ImBNVgYE+kfookzTtUQRzrnn3HPP/XF639t56PWG6L3Afe+599m+2/3j3PM+7+c8z/vjec/xkiTJyxHZaf5IuUiHkTqQriCxSIws/PsPpG6kz5C2IC20pwGH+zHLAMKQPkH6G/top8aQapEWKxXAQSQ90SFzWGiofkPWOqayrIw5rlYzHRqN4YxWK7Y2NTGHKirYTTk5TMTjKh5da7KBUaUkADh0zxLOG9akpzPffn2CFQ0GAf1XlO5tomQyC11aLbsxez1jA3AAKdzVAYQi/QlOJycmcj+c69Gh6w2S/SZeHBjQrVq5ksPRI98TQ4l1VQAhSNfhqe/fu5dxsOO2ZqgqL8eDpCDfG/9+0tUAzCeevKmpvp5F15ikmTPLqZMncceNRCSEuRKAHtkxsbG+XifNkmna2zkiEi67CoBCGOXfLSpiZvjJ25r5cEXFODFLVNEGEIxkwe0/HRurv88IP1NmTFm+nCdmh8U0AXwMg95gXx8nOcmuX7vGE6mgpgXAG2kEt706bQU7QyP+A0fBq/n5LMBHCqABIBPCUHtK48zOW22w/2eBWB+8QQPAIdx4cEAgbxKNguR8M8RER3MygEYaAE7jxjfn5nJOGvxszfTOrl0wGPbRAPAbbhxtbHiJkn1RVwcAbtAAgFdjUotaraMFoFNzGlKApQFAhxvHW1paAPp7ew0yAI4GAOs01N3ZZaQF4MLAoIlmBFjD75u2L6mlQM/Z7yAFeBoAbuLGa48eFWgB+KqtDVaDt2kA+Ak3vruoCO8BLDQAlJeWQsXoMg0Ajbjx+Oee55y8DJ6oGL2cng4poKEBALbBxivDw3pn935sdFTw8faGWeAjGgBUsBcoOXDA6WlQW11NFkzjaG2HrdXfoIAAvWQ2OzMNxEiVCgD8QrMekCY7YSncsRNPh2YndN5SVVamI3aCm2iXxL6XHREu9PWzs937G1ev4s7DHuCSK9QEH4NcXBS0kOMYZjYHROGJqCiOyP1nXKUq/Ao49eySJZxZFGdjh6hPTUnREZ1/29UORnaCc0lx8WPY4Zksfqxd/dIdovMfuOrR2D5wckPWuvEZWiAZC9/aMQ7VZ6RPXf1wtA5OiN5/r3h8musDS3NDI0OcCGmVcjw+ACdFP/b0ODwe3B65JRDl71tIDykFQDDM08GBgRyKAUcgmF5cdtcByFKlvSCRC0dm27e+ydq7SDrR1qYjQv+IUl+RaYdU+HVoyJ7CiYDL7fJ/R5T8jlAwhPCypCT+AaPAcqSykiWWumuVDABbKcwK5/99W+S+T3/+XP+7NjpKB/CwfH4nJSckYABTFVEtx2pqeGLOX+EOALzklZu1eDLQ2zfVjCBGhYdD7v/uDu8Jgi2AsSA/L0+41+Koq+OMnnj5YYs7AcDWjP2c6+cn6FndZPsEc15ODix6MARfdwOwFIonx2pr/wdA4Hlhwbx5AOBze2+uBADY/sK+ZmZkGGynxOaGBrLKk+yuAKxTop+vr8AxLHmgYt6cmwuD3x1HbqwUAPGQBq3NzWQaGB4NCYG5v9adAUykwfZt2yZK6efRjpEI/wx3B2CtF7wQFyfAoujDkhIIfwwhyN0BbMX+PjJnjsCNj+NjNcv6rCwI/05Hb6okAAnwtM91deOlsSk6MgqOuEo8AYA/fAfQ2tKCUwCXuUUZQLYnAJg4TKmprhaHhy7piM1PjKcAwFOddLC4mD/eqIZa/82pan7uBmA/9vm1ggLdvt17GBlA+3RuqDQAr2OfV6Wm8dmZa8amqve7LIDpSC5zSTEqFftUROSoDGAPFV8oAUjFnfZB216f/yq/BZ4EIHGSDyU3ehKAmEkAZHkSgEXE4geU5EkAvMkPLGVFeBIAbBeJzltrgJ4GQE18Pt85nbl8OvoHhtWMM6/FYLQAAAAASUVORK5CYII=";
    var placemark_ = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAKTSURBVHjavNfPS1RBAAfwL6nbocMebDe79UMFQyG3Tit2EjatLhZkmluYGwZlJoJZUuy2BUGuSCAWFkgnCRIrfxyk3ZMtHpT+gbq8UgLrtGD43ny7vKnJLH2zu29gLnv4fj/zdnbeLEjCyQRwBsAUgI8AvtvzE4BZAM2O8xwUhwG8B0A5PUVF3OnxUP0MwCKASE4BAO7IAr/Px7v9/UzPz/OzYfCLYXAhnea9aJQlJSUq5EFOAACuytCL4TB/rK1RCMGNQwhBc32dlyMRFdGTFQDAPhl2vbOTlmVxq2FZFvt6e1VEVTaAhwB4rLZ2W+Uq4ngopCIKHQMAnJQBszMzdDpSyaQKaNIBJACwrLSUuqOqslICnugAJgGwualp00231RBC8FJbmwS80QHMAOCVjg5twI2uLgmY1gG8BsDzLS3agEh7uwS81QE8BsBDFRXaeyBQXS0Bz3QAZ+UuTiWTjssX0mn1VxDWARTKgBP1DY7OAdM0ebqxUQXs0j2IqmRIPBbbFsI0TQ4mEmp5MNt3wS0Z9nRk5L8Iy7L4YmxMLY/m6m34SIa+m5v7J2BpcYkFOwpk+VCu7wPDAFheVsZMJrPp6mtramT5cD4uJLvtywbvx+N/nQ3PR0fVR1+ec4CNiADgHr+f31ZX/9h4RwIBWd6XlyuZglgAwMTAwC/A9NSUuvrifAOuAWBNMEjLsiiE4IXWVsfffTaA/XK1K8vLJMm9v++CDXkH2IgUAE5OTPDryor6+D1uAaIAODQ4yJfj47L8lVaWJuAcAPZ0dzMei0nATTcBRwEwVFfHU/X1EtDoJuAAABZ7vSz2eiXgsJsA/4a/YwRw0E2AZxOAzzWAjfiglBvaOVkAOmyEAeC2bs7PAQBlCgrhBHN4PQAAAABJRU5ErkJggg==";
    this.placemarkTexture_ = new Melown.GpuTexture(this.gpu_, placemark_, this.core_, null, true);
    */
};

Melown.Renderer.prototype.initBaricentricBuffer = function() {
    var buffer_ = new Array(65535*3);

    for (var i = 0; i < 65535*3; i+=9) {
        buffer_[i] = 1.0;
        buffer_[i+1] = 0;
        buffer_[i+2] = 0;

        buffer_[i+3] = 0;
        buffer_[i+4] = 1.0;
        buffer_[i+5] = 0;

        buffer_[i+6] = 0;
        buffer_[i+7] = 0;
        buffer_[i+8] = 1.0;
    }

    var gl_ = this.gpu_.gl_;
    Melown.GpuBarycentricBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, Melown.GpuBarycentricBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(buffer_), gl_.STATIC_DRAW);
    Melown.GpuBarycentricBuffer_.itemSize = 3;
    Melown.GpuBarycentricBuffer_.numItems = buffer_.length / 3;
};

Melown.Renderer.prototype.initializeGL = function() {
    this.gpu_.init();
    this.initShaders();
    this.initHeightmap();
    this.initSkydome();
    this.initHitmap();
    this.initTextMap();
    this.initImage();
    this.initTestMap();
    this.initBBox();
    this.initBaricentricBuffer();
};
/** @const */ var Melown_STILE_METADATA = 0;
/** @const */ var Melown_STILE_MESH = 1;
/** @const */ var Melown_STILE_TEXTURE = 2;
/** @const */ var Melown_STILE_HEIGHT = 3;

/**
 * @constructor
 */
Melown.Map = function(core_, mapConfig_, path_) {
    this.core_ = core_;
    this.proj4_ = this.core_.getProj4();
    this.mapConfig_ = mapConfig_;
    this.coreConfig_ = core_.coreConfig_;
    this.killed_ = false;
    this.urlCounter_ = 0;

    this.baseURL_ = path_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    //this.mapConfig_["view"] = { "surfaces": ["ppspace"], "boundLayers": [], "freeLayers": [] };

    this.navMode_ = "obj";
    this.navFov_ = 45;
    this.navCenter_ = [0,0];
    this.navHeight_ = 0;
    this.navTerrainHeight_ = 0;
    this.navTerrainHeightUnknown_ = true;
    this.navViewExtent_ = 1;
    this.navOrientation_ = [0,0,0];
    this.navCameraDistance_ = 0;
    this.navCameraPosition_ = [0,0,0];
    this.navHeightMode_ = "abs";

    this.navCurrentPos_ = ["obj", 0, 0, "abs", 0,  0, 0, 0,  0, 0];
    this.navLastPos_ = this.navCenter_.slice();

    this.srses_ = {};
    this.referenceFrames_ = {};
    this.credits_ = {};
    this.surfaces_ = [];
    this.glues_ = [];
    this.freeLayers_ = [];
    this.boundLayers_ = [];
    this.dynamicLayers_ = [];

    this.initialView_ = null;
    this.currentView_ = null;
    this.namedViews_ = [];
    this.viewCounter_ = 0;

    this.surfaceSequence_ = [];
    this.boundLayerSequence_ = [];

    this.mapTrees_ = [];

    this.gpuCache_ = new Melown.MapCache(this, 380*1024*1024);
    this.resourcesCache_ = new Melown.MapCache(this, 450*1024*1024);
    this.metatileCache_ = new Melown.MapCache(this, 60*1024*1024);

    this.loader_ = new Melown.MapLoader(this);

    this.renderer_ = this.core_.renderer_;//new Melown.Renderer(this.core_, this.core_.div_);
    this.camera_ = this.renderer_.camera_;

    this.stats_ = new Melown.MapStats(this);

    this.parseConfig(this.mapConfig_);

    this.initMapTrees();

    this.updateCoutner_ = 0;
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;

    this.heightmapOnly_ = false;
    this.blendHeightmap_ = true;
    this.drawBBoxes_ = false;
    this.drawLods_ = false;
    this.drawPositions_ = false;
    this.drawTexelSize_ = false;
    this.drawWireframe_ = 0;
    this.drawFaceCount_ = false;
    this.drawDistance_ = false;
    this.drawMaxLod_ = false;
    this.drawTextureSize_ = false;
    this.drawLayers_ = true;
    this.ignoreTexelSize_ = false;
    this.drawFog_ = true;
    this.debugTextSize_ = 1.0;

    //this.mesh_ = new Melown.MapMesh(this);
    //this.mesh_.load("http://pomerol.internal:8889/vasek-output/vts/jenstejn.ppspace/18-130382-129149.bin");

};

Melown.Map.prototype.kill = function() {
    this.killed_ = true;

    if (this.renderer_ != null) {
        this.renderer_.kill();
        this.renderer_ = null;
    }
};

Melown.Map.prototype.initMapTrees = function() {

    var nodes_ = this.referenceFrames_.division_.nodes_;

    for (var i = 0, li = nodes_.length; i < li; i++) {
        var node_ = nodes_[i];
        var id_ = [node_.id_.lod_, node_.id_.position_[0], node_.id_.position_[1]];
        this.mapTrees_.push(new Melown.MapTree(this, id_, node_.refFrame_, false));
    }
};

Melown.Map.prototype.setOption = function(key_, value_) {
};

Melown.Map.prototype.getOption = function(key_) {
};

Melown.Map.prototype.addSrs = function(id_, srs_) {
    this.srses_[id_] = srs_;
};

Melown.Map.prototype.setReferenceFrames = function(referenceFrames_) {
    this.referenceFrames_ = referenceFrames_;
};

Melown.Map.prototype.addCredit = function(id_, credit_) {
    this.credits_[id_] = credit_;
};

Melown.Map.prototype.addSurface = function(id_, surface_) {
    this.surfaces_.push(surface_);
};

Melown.Map.prototype.getSurface = function(id_) {
    return this.searchArrayById(this.surfaces_, id_);
};

Melown.Map.prototype.addGlue = function(id_, glue_) {
    this.glues_[id_] = glue_;
};

Melown.Map.prototype.getGlue = function(id_) {
    return this.searchArrayById(this.glues_, id_);
};

Melown.Map.prototype.addBoundLayer = function(number_, layer_) {
    this.boundLayers_[number_] = layer_;
};

Melown.Map.prototype.getBoundLayerByNumber = function(number_) {
    return this.boundLayers_[number_];
};

Melown.Map.prototype.getBoundLayerById = function(id_) {
    return this.searchArrayById(this.boundLayers_, id_);
};

Melown.Map.prototype.addFreeLayer = function(id_, layer_) {
    this.freeLayers_[id_] = layer_;
};

Melown.Map.prototype.getFreeLayer = function(id_) {
    return this.freeLayers_[id_];
};

Melown.Map.prototype.getMapsSrs = function(srs_) {
    if (srs_ == null) {
        return null;
    }

    //is it proj4 string?
    if (srs_.indexOf("+proj") != -1) {
        return new Melown.MapSrs(this, {"srsDef":srs_});
    }

    //search existing srs
    return this.srses_[srs_];
};

Melown.Map.prototype.setMapView = function(view_) {
    if (view_ == null) {
        return;
    }

    if (view_ != this.currentView_) {
        this.currentView_ = view_;
        this.freeLayers_ = this.currentView_.freeLayers_;
        this.viewCounter_++;
    }

    this.generateSurfaceSequence();
};

Melown.Map.prototype.searchArrayById = function(array_, id_) {
    for (var i = 0, li = array_.length; i < li; i++) {
        if (array_[i].id_ == id_) {
            return array_[i];
        }
    }

    return null;
};

Melown.Map.prototype.generateBoundLayerSequence = function() {
    var view_ = this.currentView_;
    var layers_ = view_.boundLayers_;
    this.boundLayerSequence_ = [];

    for (var i = 0, li = layers_.length; i < li; i++) {
        var item_ = layers_[i];

        if (typeof item_ === "string") {
            var layer_ = this.getBoundLayerById(item_);
        } else {
            var layer_ = this.getBoundLayerById(item_["id"]);
        }


        if (layer_ != null) {
            this.boundLayerSequence_
        } else {

        }

    }
};

Melown.Map.prototype.generateSurfaceSequence = function() {
    var view_ = this.currentView_;
    var surfaces_ = view_.surfaces_;
    this.surfaceSequence_ = [];

    for (var i = 0, li = surfaces_.length; i < li; i++) {

        //check for glue
        if (i + 1 < li) {
            var guleId_ = surfaces_[i].id_ + ";" + surfaces_[i+1].id_;
            var glue_ = this.glues_[glueId_];

            if (glue_ != null) {
                this.surfaceSequence_.push(glue_);
            }
        }

        this.surfaceSequence_.push(this.getSurface(surfaces_[i]));
    }
};

//! Returns the size of tiles at the given LOD.
Melown.Map.prototype.tileSize = function(lod_) { //int
    if (lod_ > this.foat_.lod_) {
        return this.foatSize_ >> (lod_ - this.foat_.lod_);
    } else {
        return this.foatSize_ << (this.foat_.lod_ - lod_);
    }
};

Melown.Map.prototype.setCenter = function(pos_) {
    this.navCenter_ = [pos_[0], pos_[1]];
    this.navTerrainHeightUnknown_ = true;
    this.dirty_ = true;
};

Melown.Map.prototype.getCenter = function() {
    return [ this.navCenter_[0], this.navCenter_[1] ];
};

Melown.Map.prototype.setOrientation = function(orientation_) {
    this.navOrientation_ = orientation_.slice();
    this.dirty_ = true;
};

Melown.Map.prototype.getOrientation = function() {
    return this.navOrientation_.slice();
};

Melown.Map.prototype.setFov = function(fov_) {
    this.navFov_ = fov_;
    this.dirty_ = true;
};

Melown.Map.prototype.getFov = function() {
    return this.navFov_;
};

Melown.Map.prototype.setViewExtent = function(extent_) {
    this.navViewExtent_ = extent_;
    this.dirty_ = true;
};

Melown.Map.prototype.getViewExtent = function() {
    return this.navViewExtent_;
};

Melown.Map.prototype.setHeight = function(height_) {
    this.navHeight_ = height_;
    this.dirty_ = true;
};

Melown.Map.prototype.getHeight = function() {
    return this.navHeight_;
};

Melown.Map.prototype.setHeightMode = function(mode_) {
    this.navHeightMode_ = mode_;
    this.dirty_ = true;
};

Melown.Map.prototype.getHeightMode = function() {
    return this.navHeightMode_;
};

Melown.Map.prototype.setCameraMode = function(mode_) {
    this.navCameraMode_ = mode_;
    this.dirty_ = true;
};

Melown.Map.prototype.getCameraMode = function() {
    return this.navCameraMode_;
};

Melown.Map.prototype.checkViewChange = function(pos_) {
    return !(Melown.isEqual(this.navCenter_[0], pos_[1], 0.0000001) &&
             Melown.isEqual(this.navCenter_[1], pos_[2], 0.0000001) &&
             Melown.isEqual(this.navHeight_, pos_[4], 0.001) &&
             Melown.isEqual(this.navOrientation_[0], pos_[5], 0.001) &&
             Melown.isEqual(this.navOrientation_[1], pos_[6], 0.001) &&
             Melown.isEqual(this.navOrientation_[2], pos_[7], 0.001) &&
             Melown.isEqual(this.navViewExtent_, pos_[8], 0.001) &&
             Melown.isEqual(this.navFov_, (pos_[9] || 90) * 0.5, 0.001));
};

Melown.Map.prototype.setPosition = function(pos_, public_) {
    pos_ = pos_.slice();

    if (pos_[0] == "fixed") {
        pos_[0] = "obj";
        pos_[9] = pos_[8];
        pos_[8] = pos_[7];
        pos_[7] = pos_[6];
        pos_[6] = pos_[5];
        pos_[5] = pos_[4];
        pos_[4] = pos_[3];
        pos_[3] = "fix";
    }

    pos_[9] = (pos_[9] || 90);

    /*if (public_ === false) { //convert to puclic
        var coords_ = this.referenceFrames_.convertCoords([pos_[1], pos_[2], pos_[4]], "physical", "public");
        pos_[1] = coords_[0];
        pos_[2] = coords_[1];
        pos_[4] = coords_[2];
    }*/

    this.setCameraMode(pos_[0]);
    this.setFov((pos_[9] || 90) * 0.5);
    this.setCenter([pos_[1], pos_[2]]);
    this.setHeightMode(pos_[3]);
    this.setHeight(pos_[4]);
    this.setOrientation([pos_[5], pos_[6], pos_[7]]);
    this.setViewExtent(pos_[8]);
    this.navTerrainHeight_ = 0;

    this.navCurrentPos_ = pos_;
};

Melown.Map.prototype.convertCoords = function(coords_, source_, destination_) {
    return this.referenceFrames_.convertCoords(coords_, source_, destination_);
};

Melown.Map.prototype.getPhysicalSrs = function(coords_, source_, destination_) {
    return this.referenceFrames_.model_.physicalSrs_;
};

Melown.Map.prototype.getPublicSrs = function() {
    return this.referenceFrames_.model_.publicSrs_;
};

Melown.Map.prototype.getNavigationSrs = function() {
    return this.referenceFrames_.model_.navigationSrs_;
};

Melown.Map.prototype.getPosition = function() {
    return this.navCurrentPos_.slice();
};

Melown.Map.prototype.pan = function(pos_, dx_ ,dy_) {
    var pos2_ = pos_.slice();

    var zoomFactor_ = (this.getViewExtent() * Math.tan(Melown.radians(this.camera_.getFov()))) / 800;
    dx_ *= zoomFactor_;
    dy_ *= zoomFactor_;

    var yaw_ = Melown.radians(this.getOrientation()[0]);
    var forward_ = [-Math.sin(yaw_), Math.cos(yaw_)];
    var aside_ = [Math.cos(yaw_), Math.sin(yaw_)];

    var coords_ = this.getCenter();
    var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

    if (navigationSrsInfo_["proj-name"] != "longlat") {
        pos2_[1] += forward_[0]*dy_ - aside_[0]*dx_;
        pos2_[2] += forward_[1]*dy_ - aside_[1]*dx_;
    } else {
        var mx_ = forward_[0]*dy_ - aside_[0]*dx_;
        var my_ = forward_[1]*dy_ - aside_[1]*dx_;

        var azimut_ = Melown.degrees(Math.atan2(mx_, my_));
        var distance_ = Math.sqrt(mx_*mx_ + my_*my_);
        console.log("azimut: " + azimut_ + " distance: " + distance_);

        var coords_ = this.getCenter();
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

        //build omerc
        /*
        var projString_ = "+proj=omerc +k=1.0" +
                          " +lat_0=" + coords_[1] +
                          " +lonc="  + coords_[0] +
                          " +alpha=" + azimut_ +
                          " +gamma=0 +a=" + navigationSrsInfo_["a"] +
                          " +b=" + navigationSrsInfo_["b"] +
                          " +x_0=0 +y_0=0";

        coords_ = this.getNavigationSrs().convertCoordsFrom([0, distance_], projString_);
        */

        var geod = new GeographicLib.Geodesic.Geodesic(navigationSrsInfo_["a"],
                                                       (navigationSrsInfo_["a"] / navigationSrsInfo_["b"]) - 1.0);

        var r = geod.Direct(coords_[1], coords_[0], azimut_, distance_);
        pos2_[1] = r.lon2;
        pos2_[2] = r.lat2;

        console.log("oldpos: " + JSON.stringify(pos_));
        console.log("newpos: " + JSON.stringify(pos2_));
    }

    return pos2_;
};

Melown.Map.prototype.update = function() {
    if (this.killed_ == true){
        return;
    }

    if (this.div_ != null && this.div_.style.visibility == "hidden"){
        //loop heartbeat
        window.requestAnimFrame(this.update.bind(this));
        return;
    }

    if (this.checkViewChange(this.navLastPos_)) {
        this.core_.callListener("map-position-changed", {"position":this.navCurrentPos_.slice()});
    }

    this.navLastPos_ = this.navCurrentPos_.slice();

    this.stats_.begin();

    var rect_ = this.renderer_.div_.getBoundingClientRect();

    if (this.renderer_.curSize_[0] != rect_.width || this.renderer_.curSize_[1] != rect_.height) {
        this.renderer_.onResize();
    }

    this.loader_.update();
    this.renderer_.gpu_.setViewport();

    this.updateCamera();
    this.renderer_.dirty_ = true;

    //this.cameraPosition_ = this.renderer_.cameraPosition();

    this.renderer_.paintGL();

    this.draw();

    this.stats_.end();

};
Melown.geodataProcessorWorker = function() { 
//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var layerStyles_ = {};
var layerId_ = {};
var layerBitmaps_ = {};
var forceOrigin_ = false;
var tileX_ = 0;
var tileY_ = 0;
var tileLod_ = 0;
var fonts_ = {};
var hitState_ = 0;
var groupOrigin_ = [0,0,0];
var autoLod_ = false;

var clamp = function(value_, min_, max_) {
    if (value_ < min_) {
        value_ = min_;
    }

    if (value_ > max_) {
        value_ = max_;
    }

    return value_;
};
//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var getStyle = function(styleId_, featureType_, index_) {
    var style_ = layerStyles_.styles_[styleId_];
    if (style_ == null) {
        logError("wrong-style", styleId_, null, null, index_, featureType_);
        return {};
    } else {
        return style_;
    }
};

var getStylePropertyValue = function(style_, key_, feature_, lod_) {

    var value_ = style_[key_];

    switch(typeof value_) {
        case "string":

            if (value_.length > 0) {
                //is it feature property?
                if (value_.charAt(0) == "$") {
                    var finalValue_ = feature_[value_.substr(1)];
                    if (finalValue_ != null) {
                        return finalValue_;
                    } else {
                        logError("wrong-object", style_["$$style-id"], key_, value_, null, "feature-property");
                        getDefaultStylePropertyValue(key_);
                    }
                }
            }

            return value_;

            break;

        case "object":

            //is it null?
            if (value_ == null) {
                return getDefaultStylePropertyValue(key_);
            }

            //is it array (rgb, rgba, vec2)?
            if (Array.isArray(value_) == true) {

                if (key_ == "icon-source" && layerBitmaps_[value_[0]] == null) {
                    logError("wrong-object", style_["$$style-id"], key_, value_, null, "bitmap");
                    return getDefaultStylePropertyValue(key_);
                }

                return value_;
            }

            //debugger

            var stops_ = null;
            var lodScaledArray_ = null;

            if (value_["lod-scaled"] != null) {
                var array_ = value_["lod-scaled"];

                if ((typeof array_[1]) == "number") {
                    return array_[1] * Math.pow(2*array_[2], array_[0] - lod_);
                }

                stops_ = array_[1];
                lodScaledArray_ = array_;

            } else {
                stops_ = value_["discrete"] || value_["linear"];
            }

            var lastLod_ = stops_[0][0];
            var lastValue_ = stops_[0][1];
            var valueType_ = (typeof lastValue_);
            var newValue_ = lastValue_;

            for (var i = 0, li = stops_.length; i <= li; i++) {

                if (i == li) {
                    newValue_ = lastValue_;
                    break;
                }

                if (stops_[i][0] > lod_) {

                    if (value_["discrete"] != null || lodScaledArray_ != null) { //no interpolation
                        newValue_ = lastValue_;
                        break;
                    } else { //interpolate

                        currentLod_ = stops_[i][0];
                        currentValue_ = stops_[i][1];

                        if (currentLod_ == lastLod_) { //end of array no interpolation needed
                            break;
                        }

                        switch(valueType_) {

                            case "boolean":
                                lastValue_ = lastValue_ ? 1 : 0;
                                currentValue_ = lastValue_ ? 1 : 0;
                                var newValue_ = lastValue_ + (currentValue_ - lastValue_) * ((lod_ - lastLod_) / (currentLod_ - lastLod_));

                                newValue_ = newValue_ > 0.5 ? true : false;
                                break;

                            case "number":

                                //debugger
                                var newValue_ = lastValue_ + (currentValue_ - lastValue_) * ((lod_ - lastLod_) / (currentLod_ - lastLod_));
                                break;

                            case "object":
                                var newValue_ = [];

                                for (var j = 0, lj= lastValue_.length; j < lj; j++) {
                                    newValue_[j] = lastValue_[j] + (currentValue_[j] - lastValue_[j]) * ((lod_ - lastLod_) / (currentLod_ - lastLod_));
                                }

                                break;
                        }

                        break;
                    }
                }

                lastLod_ = stops_[i][0];
                lastValue_ = stops_[i][1];
            }

            if (lodScaledArray_ != null) {
                newValue_ *= Math.pow(2*lodScaledArray_[2], lodScaledArray_[0] - lod_);
            }

            return newValue_;

            break;

        case "number":
        case "boolean":
            return value_;
    }

    return getDefaultStylePropertyValue(key_);
};

var inheritStyle = function(styleId_, style_, styleData_, layerStylesData_, depth_) {

    if (depth_ > 100) {
        logError("custom", "infinite inherit loop in style: " + styleId_);
        return;
    }

    //do we need inherite style?
    if (styleData_["inherit"] != null) {
        //get inherited style
        var styleToInherit_ = layerStylesData_["styles"][styleData_["inherit"]];

        if (styleToInherit_ != null) {

            if (styleToInherit_["inherit"] != null) {
                inheritStyle(styleData_["inherit"], style_, styleToInherit_, layerStylesData_, depth_++);
            }

            //copy inherited style properties
            for (var key_ in styleToInherit_) {
                style_[key_] = styleToInherit_[key_];
            }
        } else {
            logError("wrong-object", styleId_, "inherit", styleToInherit_, "style");
            return getDefaultStylePropertyValue(key_);
        }
    }

};

var copyStyle = function(styleId_, style_, styleData_, layerStylesData_) {

    //do we need inherite style?
    if (styleData_["inherit"] != null) {
        inheritStyle(styleId_, style_, styleData_, layerStylesData_, 0);

        /*
        //get inherited style
        var styleToInherit_ = layerStylesData_["styles"][styleData_["inherit"]];

        if (styleToInherit_ != null) {
            //copy inherited style properties
            for (var key_ in styleToInherit_) {
                style_[key_] = styleToInherit_[key_];
            }
        } else {
            logError("wrong-object", styleId_, "inherit", styleToInherit_, "style");
            return getDefaultStylePropertyValue(key_);
        }*/
    }

    //copy style properties
    //if inherited properties are present then they will be overwriten
    for (var key_ in styleData_) {
        style_[key_] = styleData_[key_];
    }

    //store style id
    style_["$$style-id"] = styleId_;
};

var logError = function(errorType_, styleId_, key_, value_, index_, subkey_) {
    if ((typeof value_) == "object") {
        value_ = JSON.stringify(value_);
    }

    switch(errorType_) {
        case "wrong-property-value":
            console.log("Error: wrong style property " + (subkey_ ? ("'" + subkey_ + "'") : "") + ": " + styleId_ + "." + key_ + " = " + value_);
            break;

        case "wrong-property-value[]":
            console.log("Error: wrong style property " + (subkey_ ? ("'" + subkey_ + "'") : "") + "["+index_+"]: " + styleId_ + "." + key_ + " = " + value_);
            break;

        case "wrong-object":
            console.log("Error: reffered "+ subkey_ + " does not exist: " + styleId_ + "." + key_ + " = " + value_);
            break;

        case "wrong-object[]":
            console.log("Error: reffered "+ subkey_ + " does not exist: " + styleId_ + "." + key_ + "["+index_+"] = " + value_);
            break;

        case "wrong-style":
            console.log("Error: reffered "+ subkey_ + " style does not exist: " + subkey_ + "["+index_+"].style = " + styleId_);
            break;

        case "wrong-bitmap":
            console.log("Error: wrong definition of bitmap: " + styleId_);
            break;

        case "custom":
            console.log("Error: " + styleId_);
            break;
    }
};

var validateValue = function(styleId_, key_, value_, type_, arrayLength_, min_, max_) {

    //check interpolator
    if (value_ != null && (typeof value_) == "object" && (value_["discrete"] != null || value_["linear"] != null || value_["lod-scaled"] != null)) {

        var stops_ = null;
        var lodScaled_ = false;

        if (value_["lod-scaled"] != null) {

            var array_ = value_["lod-scaled"];

            if (!((typeof array_) == "object" && Array.isArray(array_) && array_.length >= 2)) {
                logError("wrong-property-value", styleId_, key_, value_, null, "[]");
                return getDefaultStylePropertyValue(key_);
            }

            if (array_[2] == null) {
                array_[2] = 1;
            }

            if (!((typeof array_[0]) == "number" && (typeof array_[2]) == "number")) {
                logError("wrong-property-value", styleId_, key_, value_, null, "[]");
                return getDefaultStylePropertyValue(key_);
            }

            if ((typeof array_[1]) == "number") {
                return value_;
            }

            stops_ = array_[1];
            lodScaled_ = true;

        } else {
            stops_ = value_["discrete"] || value_["linear"];
        }

        //if stops exist then check if they are array
        if (stops_ == null || !((typeof stops_) == "object" && Array.isArray(stops_) && stops_.length > 0)) {
            logError("wrong-property-value", styleId_, key_, value_, null, "[]");
            return getDefaultStylePropertyValue(key_);
        }


        //validate stops values
        if (stops_ != null) {
            var stopsValueType_ = null;

            for (var i = 0, li = stops_.length; i < li; i++) {
                var stopItem_ = stops_[i];

                //is stop array[2]?
                if(!(stopItem_ != null && (typeof stopItem_) == "object" && Array.isArray(stopItem_) && stopItem_.length != 2)) {

                    //store fist stop type
                    if (stopsValueType_ == null) {
                        stopsValueType_ = typeof stopItem_[1];

                        if (lodScaled_ == true && stopsValueType_ != "number") {
                            logError("wrong-property-value[]", styleId_, key_, value_, i, "[]");
                            return getDefaultStylePropertyValue(key_);
                        }
                    }

                    //check lod value and type of value
                    if(!((typeof stopItem_[0]) == "number" && (typeof stopItem_[1]) == stopsValueType_)) {
                        logError("wrong-property-value[]", styleId_, key_, value_, i, "[]");
                        return getDefaultStylePropertyValue(key_);
                    }

                    //check number value
                    if (stopsValueType_ == "number") {
                        if (stopItem_[1] > max_ || stopItem_[1] < min_) {
                            logError("wrong-property-value[]", styleId_, key_, value_, i, "[]");
                            return getDefaultStylePropertyValue(key_);
                        }
                    }
                }
            }
        }


        return value_;
    }

    //console.log("validate."+styleId_+"."+key_+"."+value_);

    //check value type
    if ((typeof value_) != type_) {
        //check for exceptions
        if (!(value_ === null && (key_ == "icon-source" || key_ == "visibility"))) {
            logError("wrong-property-value", styleId_, key_, value_);
            return getDefaultStylePropertyValue(key_);
        }
    }

    //check value
    switch(typeof value_) {

        case "object":

            //accepted cases for null value
            if (value_ === null && (key_ == "line-style-texture" || key_ == "icon-source" || key_ == "visibility" || key_ == "multi-pass")) {
                return value_;
            }

            //check multipasss
            if (key_ == "multi-pass") {
                if (Array.isArray(value_) == true && value_.length > 0) {

                    for (var i = 0; i < li; i++) {
                        var valueItem_ = value_[i];

                        if (typeof valueItem_ == "object" &&
                            Array.isArray(valueItem_) == true &&
                            valueItem_.length == 2 &&
                            typeof valueItem_[0] == "number" &&
                            typeof valueItem_[1] == "string") {

                            if (layerStylesData_["styles"][valueItem_[1]] == null) {

                            }

                        } else {
                            logError("wrong-property-value[]", styleId_, key_, value_, i);
                            return getDefaultStylePropertyValue(key_);
                        }
                    }

                } else {
                    logError("wrong-property-value", styleId_, key_, value_);
                    return getDefaultStylePropertyValue(key_);
                }
            }

            //check array
            if (arrayLength_ != null) {
                if (Array.isArray(value_) == true && value_.length == arrayLength_) {

                    //validate array values
                    var i = 0;

                    if (key_ == "icon-source" || key_ == "line-style-texture") {
                        if (typeof value_[0] != "string") {
                            logError("wrong-property-value[]", styleId_, key_, value_, 0);
                            return getDefaultStylePropertyValue(key_);
                        }

                        if (layerBitmaps_[value_[0]] == null) {
                            logError("wrong-object", styleId_, key_, value_, null, "bitmap");
                            return getDefaultStylePropertyValue(key_);
                        }

                        i = 1;
                    }

                    for (li = value_.length; i < li; i++) {
                        if (typeof value_[i] != "number") {
                            logError("wrong-property-value[]", styleId_, key_, value_, i);
                            return getDefaultStylePropertyValue(key_);
                        }
                    }

                    return value_;
                } else {
                    logError("wrong-property-value", styleId_, key_, value_);
                    return getDefaultStylePropertyValue(key_);
                }
            }

            return value_;

        case "string":

            //validate line style enum
            if (key_ == "line-style") {
                switch(value_) {
                    case "solid":
                    case "texture": return value_;
                    default:
                        logError("wrong-property-value", styleId_, key_, value_);
                        return getDefaultStylePropertyValue(key_);
                }
            }

            //validate origin enum
            if (key_ == "label-origin" || key_ == "icon-origin") {
                switch(value_) {
                    case "top-left":
                    case "top-right":
                    case "top-center":
                    case "center-left":
                    case "center-right":
                    case "center-center":
                    case "bottom-left":
                    case "bottom-right":
                    case "bottom-center":   return value_;
                    default:
                        logError("wrong-property-value", styleId_, key_, value_);
                        return getDefaultStylePropertyValue(key_);
                }
            }

            //validate align enum
            if (key_ == "label-align") {
                switch(value_) {
                    case "left":
                    case "right":
                    case "center":  return value_;
                    default:
                        logError("wrong-property-value", styleId_, key_, value_);
                        return getDefaultStylePropertyValue(key_);
                }
            }

            return value_;

        case "number":

            //console.log("num2");

            if (value_ > max_ || value_ < min_) {
                logError("wrong-property-value", styleId_, key_, value_);
                return getDefaultStylePropertyValue(key_);
            }

            //console.log("num3");

            return value_;

        case "boolean":
            return value_;
    }

};

var validateStylePropertyValue = function(styleId_, key_, value_) {

    //console.log("vall:"+styleId_+"."+key_+"."+value_);
    //debugger;

    switch(key_) {
       case "inherit" :    return validateValue(styleId_, key_, value_, "string"); break;

       case "line":        return validateValue(styleId_, key_, value_, "boolean"); break;
       case "line-flat":   return validateValue(styleId_, key_, value_, "boolean"); break;
       case "line-width":  return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "line-color":  return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;
       case "line-style":  return validateValue(styleId_, key_, value_, "string"); break;
       case "line-style-texture":    return validateValue(styleId_, key_, value_, "object", 3, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "line-style-background": return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;

       case "line-label":         return validateValue(styleId_, key_, value_, "boolean"); break;
       case "line-label-source":  return validateValue(styleId_, key_, value_, "string"); break;
       case "line-label-color":   return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;
       case "line-label-size":    return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "line-label-offset":  return validateValue(styleId_, key_, value_, "number", null, -Number.MAX_VALUE, Number.MAX_VALUE); break;

       case "point":        return validateValue(styleId_, key_, value_, "boolean"); break;
       case "point-flat":   return validateValue(styleId_, key_, value_, "boolean"); break;
       case "point-radius": return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "point-style":  return validateValue(styleId_, key_, value_, "string"); break;

       case "point-color":  return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;

       case "icon":         return validateValue(styleId_, key_, value_, "boolean"); break;
       case "icon-source":  return validateValue(styleId_, key_, value_, "object", 5, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "icon-scale":   return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "icon-offset":  return validateValue(styleId_, key_, value_, "object", 2, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "icon-origin":  return validateValue(styleId_, key_, value_, "string"); break;
       case "icon-color":   return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;

       case "label":         return validateValue(styleId_, key_, value_, "boolean"); break;
       case "label-color":   return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;
       case "label-source":  return validateValue(styleId_, key_, value_, "string"); break;
       case "label-size":    return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "label-offset":  return validateValue(styleId_, key_, value_, "object", 2, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "label-origin":  return validateValue(styleId_, key_, value_, "string"); break;
       case "label-align":   return validateValue(styleId_, key_, value_, "string"); break;
       case "label-width":   return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;

       case "z-index":        return validateValue(styleId_, key_, value_, "number", null, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "zbuffer-offset": return validateValue(styleId_, key_, value_, "object", 3, 0, Number.MAX_VALUE); break;

       case "hover-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "hover-style":  return validateValue(styleId_, key_, value_, "string"); break;
       case "enter-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "leave-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "click-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "draw-event":   return validateValue(styleId_, key_, value_, "boolean"); break;

       case "visible":     return validateValue(styleId_, key_, value_, "boolean"); break;
       case "visibility":  return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "multi-pass":  return validateValue(styleId_, key_, value_, "object"); break;
    }

    return value_; //custom property
};

var getDefaultStylePropertyValue = function(key_) {
    switch(key_) {
       case "inherit": return "";

       case "line":       return false;
       case "line-flat":  return false;
       case "line-width": return 1;
       case "line-color": return [255,255,255,255];
       case "line-style": return "solid";
       case "line-style-texture":    return null;
       case "line-style-background": return [0,0,0,0];

       case "line-label":        return false;
       case "line-label-color":  return [255,255,255,255];
       case "line-label-source": return "name";
       case "line-label-size":   return 1;
       case "line-label-offset": return 0;

       case "point":        return false;
       case "point-flat":   return false;
       case "point-radius": return 1;
       case "point-style":  return "solid";
       case "point-color":  return [255,255,255,255];

       case "icon":        return false;
       case "icon-source": return null;
       case "icon-scale":  return 1;
       case "icon-offset": return [0,0];
       case "icon-origin": return "bottom-center";
       case "icon-color":  return [255,255,255,255];

       case "label":         return false;
       case "label-color":   return [255,255,255,255];
       case "label-source":  return "name";
       case "label-size":    return 10;
       case "label-offset":  return [0,0];
       case "label-origin":  return "bottom-center";
       case "label-align":   return "center";
       case "label-width":   return 200;

       case "z-index":        return 0;
       case "zbuffer-offset": return [1,1,1];

       case "hover-event": return false;
       case "hover-style": return "";
       case "enter-event": return false;
       case "leave-event": return false;
       case "click-event": return false;
       case "draw-event":  return false;

       case "visible":    return true;
       case "visibility": return 0;
       case "multi-pass": return null;
    }
};


var processStyle = function(styleId_, styleData_, layerStylesData_) {

    var style_ = {};

    //copy style and inherit style if needed
    copyStyle(styleId_, style_, styleData_, layerStylesData_);

    //console.log(JSON.stringify(style_));

    //replace constants and validate properties
    for (var key_ in style_) {

        var value_ = style_[key_];

        //replace constant with value
        if ((typeof value_) == "string") {
            if (value_.length > 0) {
                //is it constant?
                if (value_.charAt(0) == "@") {

                    if (layerStylesData_["constants"] != null) {
                        if (layerStylesData_["constants"][value_] != null) {

                            //replace constant with value
                            style_[key_] = layerStylesData_["constants"][value_];
                        } else {
                            logError("wrong-object", styleId_, key_, value_, null, "constant");

                            //replace constant with deafault value
                            style_[key_] = getDefaultStylePropertyValue(key_);
                        }
                    } else {
                        logError("wrong-object", styleId_, key_, value_, null, "constant");

                        //replace constant with deafault value
                        style_[key_] = getDefaultStylePropertyValue(key_);
                    }
                }
            }
        }

        //console.log("process."+styleId_+"."+key_+"."+value_);
        //console.log("out1: "+JSON.stringify(style_[key_]));

        style_[key_] = validateStylePropertyValue(styleId_, key_, style_[key_]);

        //console.log("out2: "+JSON.stringify(style_[key_]));
    }

    return style_;
};

var processStyles = function(layerStylesData_) {

    layerBitmaps_ = {};

    //get bitmaps
    var bitmaps_ = layerStylesData_["bitmaps"] || {};

    //build map
    for (var key_ in bitmaps_) {
        var bitmap_ = bitmaps_[key_];
        var skip_ = false;

        if ((typeof bitmap_) == "string") {
            bitmap_ = {"url":bitmap_};
        } else if((typeof bitmap_) == "object"){
            if (bitmap_["url"] == null) {
                logError("wrong-bitmap", key_);
            }
        } else {
            logError("wrong-bitmap", key_);
        }

        if (skip_ != true) {
            layerBitmaps_[key_] = bitmap_;
        }
    }

    //load bitmaps
    postMessage({"command":"loadBitmaps", "bitmaps": layerBitmaps_});

    //get layers
    layerStyles_ = {
        styles_ : {}
    };

    var styles_ = layerStylesData_["styles"] || {};

    //console.log(JSON.stringify(styles_));

    //process layers
    for (var key_ in styles_) {
        layerStyles_.styles_[key_] = processStyle(key_, styles_[key_], layerStylesData_);

        //console.log(JSON.stringify(layerStyles_.styles_[key_]));
    }
};


//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var processLineStringPass = function(lineString_, lod_, style_, zIndex_, eventInfo_) {

    var points_ = lineString_["points"] || [];

    if (points_.length == 0) {
        return;
    }

    var line_ = getStylePropertyValue(style_, "line", lineString_, lod_);

    if (line_ == false) {
        return;
    }

    var hoverEvent_ = getStylePropertyValue(style_, "hover-event", lineString_, lod_);
    var clickEvent_ = getStylePropertyValue(style_, "click-event", lineString_, lod_);
    var drawEvent_ = getStylePropertyValue(style_, "draw-event", lineString_, lod_);
    var enterEvent_ = getStylePropertyValue(style_, "enter-event", lineString_, lod_);
    var leaveEvent_ = getStylePropertyValue(style_, "leave-event", lineString_, lod_);

    var zbufferOffset_ = getStylePropertyValue(style_, "zbuffer-offset", lineString_, lod_);

    var lineFlat_ = getStylePropertyValue(style_, "line-flat", lineString_, lod_);
    var lineColor_ = getStylePropertyValue(style_, "line-color", lineString_, lod_);
    var lineWidth_ = 0.5 * getStylePropertyValue(style_, "line-width", lineString_, lod_);

    var lineStyle_ = getStylePropertyValue(style_, "line-style", lineString_, lod_);
    var lineStyleTexture_ = getStylePropertyValue(style_, "line-style-texture", lineString_, lod_);
    var lineStyleBackground_ = getStylePropertyValue(style_, "line-style-background", lineString_, lod_);

    var lineLabel_ = getStylePropertyValue(style_, "line-label", lineString_, lod_);
    var lineLabelSize_ = getStylePropertyValue(style_, "line-label-size", lineString_, lod_);

    if (lineLabel_ == true) {
        var lineLabelPoints_ = new Array(points_.length);
        var lineLabelPoints2_ = new Array(points_.length);
    }

    //console.log("lineflat: "+lineFlat_);
    //var lineWidth_ = Math.pow(2, 23 - lod_) / 32;

    var index_ = 0;
    var index2_ = 0;

    //console.log("lod: " + lod_ + "  width: " + lineWidth_);

    var circleBuffer_ = [];
    var circleBuffer2_ = [];
    var circleSides_ = 8;//Math.max(8, (14 - lod_) * 8);

    var angle_ = 0, step_ = (2.0*Math.PI) / circleSides_;

    for (var i = 0; i < circleSides_; i++) {
        circleBuffer_[i] = [-Math.sin(angle_), Math.cos(angle_)];
        circleBuffer2_[i] = angle_;
        angle_ += step_;
    }

    circleBuffer_[circleSides_] = [0, 1.0];
    circleBuffer2_[circleSides_] = 0;


    var p = points_[0];
    var p1 = [p[0], p[1], p[2]];

    if (forceOrigin_ == true) {
        p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
    }

    if (forceScale_ != null) {
        p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
    }

    var texturedLine_ = (lineStyle_ != "solid");

    //allocate buffers
    var lineVertices_ = (texturedLine_ || !lineFlat_ ? 4 : 3) * 3 * 2;
    var joinVertices_ = circleSides_ * (texturedLine_ || !lineFlat_? 4 : 3) * 3;
    var vertexBuffer_ = new Array(points_.length * lineVertices_ + points_.length * joinVertices_);

    if (lineFlat_ == false || texturedLine_ == true) {
        var lineNormals_ = 3 * 4 * 2;
        var joinNormals_ = circleSides_ * 3 * 4;
        var normalBuffer_ = new Array(points_.length * lineNormals_ + points_.length * joinNormals_);
    }

    if (texturedLine_ == true) {
        var joinParams_ = Array(points_.length);
    }

    var dlines_ = false;
    var distance_ = 0.001;
    var distance2_ = 0.001;

    //add lines
    for (var i = 0, li = points_.length - 1; i < li; i++) {

        if (dlines_ == true) {
            var p2 = points_[i+1];
            p2 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];

            if (forceOrigin_ == true) {
                p2 = [p2[0] - tileX_, p2[1] - tileY_, p2[2]];
            }

            if (forceScale_ != null) {
                p2 = [p2[0] * forceScale_[0], p2[1] * forceScale_[1], p2[2] * forceScale_[2]];
            }

        } else {
            p1 = points_[i];
            var p2 = points_[i+1];

            if (forceOrigin_ == true) {
                p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
                p2 = [p2[0] - tileX_, p2[1] - tileY_, p2[2]];
            }

            if (forceScale_ != null) {
                p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
                p2 = [p2[0] * forceScale_[0], p2[1] * forceScale_[1], p2[2] * forceScale_[2]];
            }
        }


        if (lineFlat_ == true && !texturedLine_) {

            //direction vector
            var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

            //get line length
            var l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
            distance2_ += l;

            //normalize vector to line width and rotate 90 degrees
            l = (l != 0) ? (lineWidth_ / l) : 0;
            var n = [-v[1]*l, v[0]*l,0];

            //add polygon
            vertexBuffer_[index_] = p1[0] + n[0];
            vertexBuffer_[index_+1] = p1[1] + n[1];
            vertexBuffer_[index_+2] = p1[2];

            vertexBuffer_[index_+3] = p1[0] - n[0];
            vertexBuffer_[index_+4] = p1[1] - n[1];
            vertexBuffer_[index_+5] = p1[2];

            vertexBuffer_[index_+6] = p2[0] + n[0];
            vertexBuffer_[index_+7] = p2[1] + n[1];
            vertexBuffer_[index_+8] = p2[2];

            //add polygon
            vertexBuffer_[index_+9] = p1[0] - n[0];
            vertexBuffer_[index_+10] = p1[1] - n[1];
            vertexBuffer_[index_+11] = p1[2];

            vertexBuffer_[index_+12] = p2[0] - n[0];
            vertexBuffer_[index_+13] = p2[1] - n[1];
            vertexBuffer_[index_+14] = p2[2];

            vertexBuffer_[index_+15] = p2[0] + n[0];
            vertexBuffer_[index_+16] = p2[1] + n[1];
            vertexBuffer_[index_+17] = p2[2];

            index_ += 18;

        } else {

            //direction vector
            var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

            //get line length
            var l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
            distance2_ += l;

            //console.log("distance("+i+"): " + distance_ + " " + distance2_);

            if (lineFlat_ == true) {

                //normalize vector to line width and rotate 90 degrees
                l = (l != 0) ? (lineWidth_ / l) : 0;
                var n = [-v[1]*l, v[0]*l,0];

                if (joinParams_ != null) {
                    joinParams_[i] = (l != 0) ? Math.atan2(v[0], v[1]) + Math.PI *0.5 : 0;
                }

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];
                vertexBuffer_[index_+3] = distance_;
                normalBuffer_[index2_] = n[0];
                normalBuffer_[index2_+1] = n[1];
                normalBuffer_[index2_+2] = 0;
                normalBuffer_[index2_+3] = lineWidth_;

                vertexBuffer_[index_+4] = p1[0];
                vertexBuffer_[index_+5] = p1[1];
                vertexBuffer_[index_+6] = p1[2];
                vertexBuffer_[index_+7] = -distance_;
                normalBuffer_[index2_+4] = -n[0];
                normalBuffer_[index2_+5] = -n[1];
                normalBuffer_[index2_+6] = 0;
                normalBuffer_[index2_+7] = -lineWidth_;

                vertexBuffer_[index_+8] = p2[0];
                vertexBuffer_[index_+9] = p2[1];
                vertexBuffer_[index_+10] = p2[2];
                vertexBuffer_[index_+11] = distance2_;
                normalBuffer_[index2_+8] = n[0];
                normalBuffer_[index2_+9] = n[1];
                normalBuffer_[index2_+10] = 0;
                normalBuffer_[index2_+11] = lineWidth_;

                //add polygon
                vertexBuffer_[index_+12] = p1[0];
                vertexBuffer_[index_+13] = p1[1];
                vertexBuffer_[index_+14] = p1[2];
                vertexBuffer_[index_+15] = -distance_;
                normalBuffer_[index2_+12] = -n[0];
                normalBuffer_[index2_+13] = -n[1];
                normalBuffer_[index2_+14] = 0;
                normalBuffer_[index2_+15] = -lineWidth_;

                vertexBuffer_[index_+16] = p2[0];
                vertexBuffer_[index_+17] = p2[1];
                vertexBuffer_[index_+18] = p2[2];
                vertexBuffer_[index_+19] = -distance2_;
                normalBuffer_[index2_+16] = -n[0];
                normalBuffer_[index2_+17] = -n[1];
                normalBuffer_[index2_+18] = 0;
                normalBuffer_[index2_+19] = -lineWidth_;

                vertexBuffer_[index_+20] = p2[0];
                vertexBuffer_[index_+21] = p2[1];
                vertexBuffer_[index_+22] = p2[2];
                vertexBuffer_[index_+23] = distance2_;
                normalBuffer_[index2_+20] = n[0];
                normalBuffer_[index2_+21] = n[1];
                normalBuffer_[index2_+22] = 0;
                normalBuffer_[index2_+23] = lineWidth_;

                index_ += 24;
                index2_ += 24;

            } else {

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];
                vertexBuffer_[index_+3] = distance_;
                normalBuffer_[index2_] = p2[0];
                normalBuffer_[index2_+1] = p2[1];
                normalBuffer_[index2_+2] = p2[2];
                normalBuffer_[index2_+3] = lineWidth_;

                vertexBuffer_[index_+4] = p1[0];
                vertexBuffer_[index_+5] = p1[1];
                vertexBuffer_[index_+6] = p1[2];
                vertexBuffer_[index_+7] = -distance_;
                normalBuffer_[index2_+4] = p2[0];
                normalBuffer_[index2_+5] = p2[1];
                normalBuffer_[index2_+6] = p2[2];
                normalBuffer_[index2_+7] = -lineWidth_;

                vertexBuffer_[index_+8] = p2[0];
                vertexBuffer_[index_+9] = p2[1];
                vertexBuffer_[index_+10] = p2[2];
                vertexBuffer_[index_+11] = -distance2_;
                normalBuffer_[index2_+8] = p1[0];
                normalBuffer_[index2_+9] = p1[1];
                normalBuffer_[index2_+10] = p1[2];
                normalBuffer_[index2_+11] = lineWidth_;

                //add polygon
                vertexBuffer_[index_+12] = p1[0];
                vertexBuffer_[index_+13] = p1[1];
                vertexBuffer_[index_+14] = p1[2];
                vertexBuffer_[index_+15] = distance_;
                normalBuffer_[index2_+12] = p2[0];
                normalBuffer_[index2_+13] = p2[1];
                normalBuffer_[index2_+14] = p2[2];
                normalBuffer_[index2_+15] = lineWidth_;

                vertexBuffer_[index_+16] = p2[0];
                vertexBuffer_[index_+17] = p2[1];
                vertexBuffer_[index_+18] = p2[2];
                vertexBuffer_[index_+19] = -distance2_;
                normalBuffer_[index2_+16] = p1[0];
                normalBuffer_[index2_+17] = p1[1];
                normalBuffer_[index2_+18] = p1[2];
                normalBuffer_[index2_+19] = lineWidth_;

                vertexBuffer_[index_+20] = p2[0];
                vertexBuffer_[index_+21] = p2[1];
                vertexBuffer_[index_+22] = p2[2];
                vertexBuffer_[index_+23] = distance2_;
                normalBuffer_[index2_+20] = p1[0];
                normalBuffer_[index2_+21] = p1[1];
                normalBuffer_[index2_+22] = p1[2];
                normalBuffer_[index2_+23] = -lineWidth_;

                index_ += 24;
                index2_ += 24;
            }
        }

        distance_ = distance2_;
        p1 = p2; //only for dlines
    }

    var p1 = [p[0], p[1], p[2]];
    var center_ = [0,0,0];

    var lindex_ = index_; //debug only
    var lindex2_ = index2_; //debug only

    //add joins
    for (var i = 0, li = points_.length; i < li; i++) {

        if (forceOrigin_ == true) {
            p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
        }

        if (forceScale_ != null) {
            p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
        }

        center_[0] += p1[0];
        center_[1] += p1[1];
        center_[2] += p1[2];

        var angleShift_ = (joinParams_ != null) ? joinParams_[i] : 0;

        for (var j = 0; j < circleSides_; j++) {

            if (lineFlat_ == true && !texturedLine_) {

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];

                vertexBuffer_[index_+3] = p1[0] + circleBuffer_[j][0] * lineWidth_;
                vertexBuffer_[index_+4] = p1[1] + circleBuffer_[j][1] * lineWidth_;
                vertexBuffer_[index_+5] = p1[2];

                vertexBuffer_[index_+6] = p1[0] + circleBuffer_[j+1][0] * lineWidth_;
                vertexBuffer_[index_+7] = p1[1] + circleBuffer_[j+1][1] * lineWidth_;
                vertexBuffer_[index_+8] = p1[2];

                index_ += 9;

            } else {

                //distance_ = vertexBuffer_[(i >> 1) * lineVertices_ + ((i & 1) ? 11 : 3)];
                if (i != (li-1)) {
                    distance_ = vertexBuffer_[i * lineVertices_ + 3];
                } else {
                    distance_ = vertexBuffer_[(i - 1) * lineVertices_ + 11];
                }
                //distance_ = vertexBuffer_[((i == li) ? i - 1 : i) * lineVertices_ + 3];

                //if (distance_ == null) {
                  //  debugger
                //}

                //console.log("distance-dot("+i+"): " + distance_);

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];
                vertexBuffer_[index_+3] = distance_;
                normalBuffer_[index2_] = 0;
                normalBuffer_[index2_+1] = 0;
                normalBuffer_[index2_+2] = 0;
                normalBuffer_[index2_+3] = 0;

                vertexBuffer_[index_+4] = p1[0];
                vertexBuffer_[index_+5] = p1[1];
                vertexBuffer_[index_+6] = p1[2];
                vertexBuffer_[index_+7] = distance_;
                normalBuffer_[index2_+4] = circleBuffer_[j][0] * lineWidth_;
                normalBuffer_[index2_+5] = circleBuffer_[j][1] * lineWidth_;
                normalBuffer_[index2_+6] = circleBuffer2_[j] + angleShift_;
                normalBuffer_[index2_+7] = 0;

                vertexBuffer_[index_+8] = p1[0];
                vertexBuffer_[index_+9] = p1[1];
                vertexBuffer_[index_+10] = p1[2];
                vertexBuffer_[index_+11] = distance_;
                normalBuffer_[index2_+8] = circleBuffer_[j+1][0] * lineWidth_;
                normalBuffer_[index2_+9] = circleBuffer_[j+1][1] * lineWidth_;
                normalBuffer_[index2_+10] = circleBuffer2_[j+1] + angleShift_;
                normalBuffer_[index2_+11] = 0;

                index_ += 12;
                index2_ += 12;
            }

        }

        if (lineLabel_ == true) {
            var p = [p1[0], p1[1], p1[2] + lineLabelSize_*0.1];
            lineLabelPoints_[i] = p;
            lineLabelPoints2_[li - i - 1] = p;
        }

        if (dlines_ == true) {
            var p2 = points_[i+1];
            p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
        } else {
            p1 = points_[i+1];
        }
    }

    if (li > 0) {
        center_[0] /= li;
        center_[1] /= li;
        center_[2] /= li;
    }

    center_[0] += groupOrigin_[0];
    center_[1] += groupOrigin_[1];
    center_[2] += groupOrigin_[2];

    //debug only
    //if (vertexBuffer_ != null) { vertexBuffer_ = vertexBuffer_.slice(lindex_); }
    //if (normalBuffer_ != null) { normalBuffer_ = normalBuffer_.slice(lindex2_); }

    var hitable_ = hoverEvent_ || clickEvent_ || enterEvent_ || leaveEvent_;

    var messageData_ = {"command":"addRenderJob", "vertexBuffer": vertexBuffer_,
                        "color":lineColor_, "z-index":zIndex_, "center": center_, "normalBuffer": normalBuffer_,
                        "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                        "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                        "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                        "line-width":lineWidth_*2, "lod":(autoLod_ ? null : tileLod_) };

    if (lineFlat_ == true) {
        messageData_["type"] = (texturedLine_ == true) ? "flat-tline" : "flat-line";
    } else {
        messageData_["type"] = (texturedLine_ == true) ? "pixel-tline" : "pixel-line";
    }

    if (texturedLine_ == true) {
        if (lineStyleTexture_ != null) {
            messageData_["texture"] = [layerBitmaps_[lineStyleTexture_[0]], lineStyleTexture_[1], lineStyleTexture_[2]];
            messageData_["background"] = lineStyleBackground_;
        }
    }

    postMessage(messageData_);

    //debugger
    var lineLabel_ = getStylePropertyValue(style_, "line-label", lineString_, lod_);

    if (lineLabel_ == true) {
        processLineLabel(lineLabelPoints_, lineLabelPoints2_, lineString_, center_, lod_, style_, zIndex_, eventInfo_);
    }

};

var processLineLabel = function(lineLabelPoints_, lineLabelPoints2_, lineString_, center_, lod_, style_, zIndex_, eventInfo_) {

    var labelColor_ = getStylePropertyValue(style_, "line-label-color", lineString_, lod_);
    var labelSource_ = getStylePropertyValue(style_, "line-label-source", lineString_, lod_);
    var labelSize_ = getStylePropertyValue(style_, "line-label-size", lineString_, lod_);
    var labelOffset_ = getStylePropertyValue(style_, "line-label-offset", lineString_, lod_);

    //console.log("label size: " + lod_ + "   " + labelSize_);

    if (labelSource_ == null || labelSource_ == "" || Math.abs(labelSize_) < 0.0001) {
        return;
    }

    var hoverEvent_ = getStylePropertyValue(style_, "hover-event", lineString_, lod_);
    var clickEvent_ = getStylePropertyValue(style_, "click-event", lineString_, lod_);
    var drawEvent_ = getStylePropertyValue(style_, "draw-event", lineString_, lod_);
    var enterEvent_ = getStylePropertyValue(style_, "enter-event", lineString_, lod_);
    var leaveEvent_ = getStylePropertyValue(style_, "leave-event", lineString_, lod_);

    var zbufferOffset_ = getStylePropertyValue(style_, "zbuffer-offset", lineString_, lod_);

    var vertexBuffer_ = [];
    var texcoordsBuffer_ = [];

    //debugger

    var hitable_ = hoverEvent_ || clickEvent_ || enterEvent_ || leaveEvent_;

    addStreetTextOnPath(lineLabelPoints_, labelSource_, labelSize_, fonts_["default"], labelOffset_, vertexBuffer_, texcoordsBuffer_);
    addStreetTextOnPath(lineLabelPoints2_, labelSource_, labelSize_, fonts_["default"], labelOffset_, vertexBuffer_, texcoordsBuffer_);

    postMessage({"command":"addRenderJob", "type": "line-label", "vertexBuffer": vertexBuffer_,
                  "texcoordsBuffer": texcoordsBuffer_, "color":labelColor_, "z-index":zIndex_, "center": center_,
                  "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                  "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                  "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                  "lod":(autoLod_ ? null : tileLod_) });

};


//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var processPointArrayPass = function(pointArray_, lod_, style_, zIndex_, eventInfo_) {

    var points_ = pointArray_["points"] || [];

    if (points_.length == 0) {
        return;
    }

    //debugger
    var visibility_ = getStylePropertyValue(style_, "visibility", pointArray_, lod_);
    var hoverEvent_ = getStylePropertyValue(style_, "hover-event", pointArray_, lod_);
    var clickEvent_ = getStylePropertyValue(style_, "click-event", pointArray_, lod_);
    var drawEvent_ = getStylePropertyValue(style_, "draw-event", pointArray_, lod_);
    var enterEvent_ = getStylePropertyValue(style_, "enter-event", pointArray_, lod_);
    var leaveEvent_ = getStylePropertyValue(style_, "leave-event", pointArray_, lod_);

    var zbufferOffset_ = getStylePropertyValue(style_, "zbuffer-offset", pointArray_, lod_);

    var point_ = getStylePropertyValue(style_, "point", pointArray_, lod_);
    var pointFlat_ = getStylePropertyValue(style_, "point-flat", pointArray_, lod_);
    var pointColor_ = getStylePropertyValue(style_, "point-color", pointArray_, lod_);
    var pointRadius_ = 0.5 * getStylePropertyValue(style_, "point-radius", pointArray_, lod_);
    //zIndex_ = (zIndex_ !== null) ? zIndex_ : getStylePropertyValue(style_, "z-index", pointArray_, lod_);

    var icon_ = getStylePropertyValue(style_, "icon", pointArray_, lod_);
    if (icon_ == true) {
        var iconData_ = {
            color_ : getStylePropertyValue(style_, "icon-color", pointArray_, lod_),
            scale_ : getStylePropertyValue(style_, "icon-scale", pointArray_, lod_),
            offset_ : getStylePropertyValue(style_, "icon-offset", pointArray_, lod_),
            origin_ : getStylePropertyValue(style_, "icon-origin", pointArray_, lod_),
            source_ : getStylePropertyValue(style_, "icon-source", pointArray_, lod_),
            vertexBuffer_ : [],
            originBuffer_ : [],
            texcoordsBuffer_ : []
        };
    }

    var label_ = getStylePropertyValue(style_, "label", pointArray_, lod_);
    if (label_ == true) {
        var labelData_ = {
            color_ : getStylePropertyValue(style_, "label-color", pointArray_, lod_),
            size_ : getStylePropertyValue(style_, "label-size", pointArray_, lod_),
            offset_ : getStylePropertyValue(style_, "label-offset", pointArray_, lod_),
            origin_ : getStylePropertyValue(style_, "label-origin", pointArray_, lod_),
            align_ : getStylePropertyValue(style_, "label-align", pointArray_, lod_),
            source_ : getStylePropertyValue(style_, "label-source", pointArray_, lod_),
            width_ : getStylePropertyValue(style_, "label-width", pointArray_, lod_),
            vertexBuffer_ : [],
            originBuffer_ : [],
            texcoordsBuffer_ : []
        };
    }

    var index_ = 0;
    var index2_ = 0;

    var circleBuffer_ = [];
    var circleSides_ = clamp(pointRadius_ * 8 * 0.5, 8, 32);

    var angle_ = 0, step_ = (2.0*Math.PI) / circleSides_;

    for (var i = 0; i < circleSides_; i++) {
        circleBuffer_[i] = [-Math.sin(angle_), Math.cos(angle_)];
        angle_ += step_;
    }

    circleBuffer_[circleSides_] = [0, 1.0];

    var p = points_[0];
    var p1 = [p[0], p[1], p[2]];
    var center_ = [0,0,0];

    //allocate buffers
    var pointsVertices_ = circleSides_ * 3 * 3;
    var vertexBuffer_ = new Array(points_.length * pointsVertices_);

    if (pointFlat_ == false) {
        var pointsNormals_ = circleSides_ * 3 * 4;
        var normalBuffer_ = new Array(points_.length * pointsNormals_);
    }

    var dpoints_ = false;

    //add ponints
    for (var i = 0, li = points_.length; i < li; i++) {

        if (forceOrigin_ == true) {
            p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
        }

        if (forceScale_ != null) {
            p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
        }

        center_[0] += p1[0];
        center_[1] += p1[1];
        center_[2] += p1[2];

        for (var j = 0; j < circleSides_; j++) {

            if (icon_ == true) {
                processIcon(p1, iconData_) ;//, pointArray_, lod_, style_, zIndex_);
            }

            if (label_ == true) {
                processLabel(p1, labelData_); //, pointArray_, lod_, style_, zIndex_);
            }

            if (point_ == true) {

                if (pointFlat_ == true) {

                    //add polygon
                    vertexBuffer_[index_] = p1[0];
                    vertexBuffer_[index_+1] = p1[1];
                    vertexBuffer_[index_+2] = p1[2];

                    vertexBuffer_[index_+3] = p1[0] + circleBuffer_[j][0] * pointRadius_;
                    vertexBuffer_[index_+4] = p1[1] + circleBuffer_[j][1] * pointRadius_;
                    vertexBuffer_[index_+5] = p1[2];

                    vertexBuffer_[index_+6] = p1[0] + circleBuffer_[j+1][0] * pointRadius_;
                    vertexBuffer_[index_+7] = p1[1] + circleBuffer_[j+1][1] * pointRadius_;
                    vertexBuffer_[index_+8] = p1[2];

                } else {

                    //add polygon
                    vertexBuffer_[index_] = p1[0];
                    vertexBuffer_[index_+1] = p1[1];
                    vertexBuffer_[index_+2] = p1[2];
                    normalBuffer_[index2_] = 0;
                    normalBuffer_[index2_+1] = 0;
                    normalBuffer_[index2_+2] = 0;
                    normalBuffer_[index2_+3] = 0;

                    vertexBuffer_[index_+3] = p1[0];
                    vertexBuffer_[index_+4] = p1[1];
                    vertexBuffer_[index_+5] = p1[2];
                    normalBuffer_[index2_+4] = circleBuffer_[j][0] * pointRadius_;
                    normalBuffer_[index2_+5] = circleBuffer_[j][1] * pointRadius_;
                    normalBuffer_[index2_+6] = 0;
                    normalBuffer_[index2_+7] = 0;

                    vertexBuffer_[index_+6] = p1[0];
                    vertexBuffer_[index_+7] = p1[1];
                    vertexBuffer_[index_+8] = p1[2];
                    normalBuffer_[index2_+8] = circleBuffer_[j+1][0] * pointRadius_;
                    normalBuffer_[index2_+9] = circleBuffer_[j+1][1] * pointRadius_;
                    normalBuffer_[index2_+10] = 0;
                    normalBuffer_[index2_+11] = 0;

                    index2_ += 12;
                }

                index_ += 9;
            }
        }

        if (dpoints_ == true) {
            var p2 = points_[i+1];
            p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
        } else {
            p1 = points_[i+1];
        }
    }

    if (li > 0) {
        center_[0] /= li;
        center_[1] /= li;
        center_[2] /= li;
    }

    center_[0] += groupOrigin_[0];
    center_[1] += groupOrigin_[1];
    center_[2] += groupOrigin_[2];

    var hitable_ = hoverEvent_ || clickEvent_ || enterEvent_ || leaveEvent_;

    if (point_ == true) {
        if (pointFlat_ == true) {
            postMessage({"command":"addRenderJob", "type": "flat-line", "vertexBuffer": vertexBuffer_,
                         "color":pointColor_, "z-index":zIndex_, "visibility": visibility_, "center": center_,
                         "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                         "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                         "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                         "lod":(autoLod_ ? null : tileLod_) });
        } else {
            postMessage({"command":"addRenderJob", "type": "pixel-line", "vertexBuffer": vertexBuffer_,
                         "normalBuffer": normalBuffer_, "color":pointColor_, "z-index":zIndex_,
                         "visibility": visibility_, "center": center_,
                         "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                         "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                         "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                         "lod":(autoLod_ ? null : tileLod_) });
        }
    }

    if (icon_ == true && iconData_.vertexBuffer_.length > 0) {
        postMessage({"command":"addRenderJob", "type": "icon", "vertexBuffer": iconData_.vertexBuffer_,
                     "originBuffer": iconData_.originBuffer_, "texcoordsBuffer": iconData_.texcoordsBuffer_,
                     "icon":layerBitmaps_[iconData_.source_[0]], "color":iconData_.color_, "z-index":zIndex_,
                     "visibility": visibility_, "center": center_,
                     "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                     "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                     "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                     "lod":(autoLod_ ? null : tileLod_) });
    }

    if (label_ == true && labelData_.vertexBuffer_.length > 0) {
        postMessage({"command":"addRenderJob", "type": "label", "vertexBuffer": labelData_.vertexBuffer_,
                     "originBuffer": labelData_.originBuffer_, "texcoordsBuffer": labelData_.texcoordsBuffer_,
                     "color":labelData_.color_, "z-index":zIndex_, "visibility": visibility_, "center": center_,
                     "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                     "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                     "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                     "lod":(autoLod_ ? null : tileLod_) });
    }

};

var getOriginOffset = function(origin_, width_, height_) {
    switch(origin_) {
        case "top-left":        return [0, 0];
        case "top-right":       return [-width_, 0];
        case "top-center":      return [-width_*0.5, 0];
        case "center-left":     return [0, -height_*0.5];
        case "center-right":    return [-width_, -height_*0.5];
        case "center-center":   return [-width_*0.5, -height_*0.5];
        case "bottom-left":     return [0, -height_];
        case "bottom-right":    return [-width_, -height_];
        case "bottom-center":   return [-width_*0.5, -height_];
    }
};

var processIcon = function(point_, iconData_) {

    var icon_ = iconData_.source_;

    if (icon_ == null) {
        return;
    }

    var width_ = Math.abs(icon_[3] * iconData_.scale_);
    var height_ = Math.abs(icon_[4] * iconData_.scale_);

    var vertexBuffer_ = iconData_.vertexBuffer_;
    var texcoordsBuffer_ = iconData_.texcoordsBuffer_;
    var originBuffer_ = iconData_.originBuffer_;
    var vertexBufferSize_ = vertexBuffer_.length;

    //add polygon
    vertexBuffer_.push(0, 0, 0,
                       width_, 0, 0,
                       width_, -height_, 0);

    texcoordsBuffer_.push(icon_[1], icon_[2], 0, 0,
                          icon_[1]+icon_[3], icon_[2], 0, 0,
                          icon_[1]+icon_[3], icon_[2]+icon_[4], 0, 0);

    //add polygon
    vertexBuffer_.push(0, 0, 0,
                       0, -height_, 0,
                       width_, -height_, 0);

    texcoordsBuffer_.push(icon_[1], icon_[2], 0, 0,
                          icon_[1], icon_[2]+icon_[4], 0, 0,
                          icon_[1]+icon_[3], icon_[2]+icon_[4], 0, 0);

    //get offset
    var originOffset_ = getOriginOffset(iconData_.origin_, width_, height_);
    originOffset_[0] = originOffset_[0] + iconData_.offset_[0];
    originOffset_[1] = originOffset_[1] + iconData_.offset_[1];

    //set origin buffer and apply offset
    for (var i = vertexBufferSize_, li = vertexBuffer_.length; i < li; i+=3) {
        originBuffer_.push(point_[0], point_[1], point_[2]);

        vertexBuffer_[i] +=  originOffset_[0];
        vertexBuffer_[i+1] -= originOffset_[1];
    }
};


var processLabel = function(point_, labelData_) {

    if (labelData_.source_ == null || labelData_.source_ == "" || Math.abs(labelData_.size_) < 0.0001) {
        return;
    }

    var vertexBuffer_ = labelData_.vertexBuffer_;
    var texcoordsBuffer_ = labelData_.texcoordsBuffer_;
    var originBuffer_ = labelData_.originBuffer_;
    var vertexBufferSize_ = vertexBuffer_.length;

    //debugger

    var text_ = labelData_.source_;

    //split by new line
    var lines_ = text_.match(/[^\r\n]+/g);
    var lines2_ = [];
    var align_ = false;

    //split lines by width
    for (var i = 0, li = lines_.length; i < li; i++) {

        var line_= lines_[i];

        do {
            var index_ = getSplitIndex(line_, labelData_.width_, getFontFactor(labelData_.size_, fonts_["default"]), fonts_["default"]);

            if (line_.length == index_) {
                lines2_.push(line_);
                break;
            }

            lines2_.push(line_.substring(0,index_));
            line_ = line_.substring(index_+1);
            align_ = true;

        } while(true);

    }

    var x = 0;
    var y = 0;
    var textLength_ = 0;
    var lineHeight_ = getLineHeight(labelData_.size_, fonts_["default"]);
    var maxWidth_ = 0;
    var lineWidths_ = [];

    //get max width
    for (var i = 0, li = lines2_.length; i < li; i++) {
        lineWidths_[i] = getTextLength(lines2_[i], getFontFactor(labelData_.size_, fonts_["default"]), fonts_["default"]);
        maxWidth_ = Math.max(lineWidths_[i], maxWidth_);
    }

    //generate text
    for (var i = 0, li = lines2_.length; i < li; i++) {
        var textWidth_ = lineWidths_[i];//getTextLength(lines2_[i], getFontFactor(labelData_.size_, fonts_["default"]), fonts_["default"]);
        //maxWidth_ = Math.max(textWidth_, maxWidth_);

        switch(labelData_.align_) {
            case "left": x = 0; break;
            case "right": x = maxWidth_ - textWidth_; break;
            case "center": x = (maxWidth_ - textWidth_)*0.5; break;
        }

        addText([x,y,0], [1,0,0], lines2_[i], labelData_.size_, fonts_["default"], vertexBuffer_, texcoordsBuffer_);
        y -= lineHeight_;
    }

    //get offset
    var originOffset_ = getOriginOffset(labelData_.origin_, maxWidth_, -y);
    originOffset_[0] = originOffset_[0] + labelData_.offset_[0];
    originOffset_[1] = originOffset_[1] + labelData_.offset_[1];

    //set origin buffer and apply offset
    for (var i = vertexBufferSize_, li = vertexBuffer_.length; i < li; i+=3) {
        originBuffer_.push(point_[0], point_[1], point_[2]);

        vertexBuffer_[i] +=  originOffset_[0];
        vertexBuffer_[i+1] -= originOffset_[1];
    }

};








//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var setFont = function(fontData_) {

    fonts_["default"] = {
        chars_ : fontData_["chars"],
        space_ : fontData_["space"],
        size_ : fontData_["size"]
    };

};

vec3Normalize = function (a, b) {
    b || (b = a);
    var c = a[0],
        d = a[1],
        e = a[2],
        g = Math.sqrt(c * c + d * d + e * e);
    if (g) {
        if (g == 1) {
            b[0] = c;
            b[1] = d;
            b[2] = e;
            return b;
        }
    } else {
        b[0] = 0;
        b[1] = 0;
        b[2] = 0;
        return b;
    }
    g = 1 / g;
    b[0] = c * g;
    b[1] = d * g;
    b[2] = e * g;
    return b;
};

vec3Length = function (a) {
    var b = a[0],
        c = a[1];
    a = a[2];
    return Math.sqrt(b * b + c * c + a * a);
};


var addChar = function(pos_, dir_, verticalShift_, char_, factor_, index_, index2_, textVector_, font_, vertexBuffer_, texcoordsBuffer_)
{
    //normal to dir
    var n = [-dir_[1],dir_[0],0];

    var p1 = [pos_[0], pos_[1], pos_[2]];
    var p2 = [p1[0], p1[1], p1[2]];

    var chars_ = font_.chars_;

    var fc = chars_[char_];
    var l = 0;
    var nx = textVector_[0];
    var ny = textVector_[1];

    if (char_ == 9 || char_ == 32) {  //tab or space
        fc = chars_[32]; //space

        if (fc != null) {
            p1[0] += dir_[0] * (fc.step_) * factor_;
            p1[1] += dir_[1] * (fc.step_) * factor_;
            l = fc.lx * factor_;
        }
    } else {
        if (fc != null) {
            var factorX_ = fc.lx * factor_;
            var factorY_ = fc.ly * factor_;

            var n2 = [n[0] * verticalShift_, n[1] * verticalShift_, n[2] * verticalShift_];
            var n3 = [n2[0] + n[0] * factorY_, n2[1] + n[1] * factorY_, n2[2] + n[2] * factorY_];

            p2[0] = p1[0] + dir_[0] * factorX_;
            p2[1] = p1[1] + dir_[1] * factorX_;
            p2[2] = p1[2] + dir_[2] * factorX_;

            //first polygon
            vertexBuffer_[index_] = p1[0] - n2[0];
            vertexBuffer_[index_+1] = p1[1] - n2[1];
            vertexBuffer_[index_+2] = p1[2] - n2[2];

            texcoordsBuffer_[index2_] = fc.u1;
            texcoordsBuffer_[index2_+1] = fc.v1;
            texcoordsBuffer_[index2_+2] = nx;
            texcoordsBuffer_[index2_+3] = ny;

            vertexBuffer_[index_+3] = p1[0] - n3[0];
            vertexBuffer_[index_+4] = p1[1] - n3[1];
            vertexBuffer_[index_+5] = p1[2] - n3[2];

            texcoordsBuffer_[index2_+4] = fc.u1;
            texcoordsBuffer_[index2_+5] = fc.v2;
            texcoordsBuffer_[index2_+6] = nx;
            texcoordsBuffer_[index2_+7] = ny;

            vertexBuffer_[index_+6] = p2[0] - n2[0];
            vertexBuffer_[index_+7] = p2[1] - n2[1];
            vertexBuffer_[index_+8] = p2[2] - n2[2];

            texcoordsBuffer_[index2_+8] = fc.u2;
            texcoordsBuffer_[index2_+9] = fc.v1;
            texcoordsBuffer_[index2_+10] = nx;
            texcoordsBuffer_[index2_+11] = ny;


            //next polygon
            vertexBuffer_[index_+9] = p1[0] - n3[0];
            vertexBuffer_[index_+10] = p1[1] - n3[1];
            vertexBuffer_[index_+11] = p1[2] - n3[2];

            texcoordsBuffer_[index2_+12] = fc.u1;
            texcoordsBuffer_[index2_+13] = fc.v2;
            texcoordsBuffer_[index2_+14] = nx;
            texcoordsBuffer_[index2_+15] = ny;

            vertexBuffer_[index_+12] = p2[0] - n3[0];
            vertexBuffer_[index_+13] = p2[1] - n3[1];
            vertexBuffer_[index_+14] = p2[2] - n3[2];

            texcoordsBuffer_[index2_+16] = fc.u2;
            texcoordsBuffer_[index2_+17] = fc.v2;
            texcoordsBuffer_[index2_+18] = nx;
            texcoordsBuffer_[index2_+19] = ny;

            vertexBuffer_[index_+15] = p2[0] - n2[0];
            vertexBuffer_[index_+16] = p2[1] - n2[1];
            vertexBuffer_[index_+17] = p2[2] - n2[2];

            texcoordsBuffer_[index2_+20] = fc.u2;
            texcoordsBuffer_[index2_+21] = fc.v1;
            texcoordsBuffer_[index2_+22] = nx;
            texcoordsBuffer_[index2_+23] = ny;

            index_ += 18;
            index2_ += 24;
            //polygons_ += 2;

            p1[0] = p1[0] + dir_[0] * fc.step_ * factor_;
            p1[1] = p1[1] + dir_[1] * fc.step_ * factor_;
            l = fc.lx * factor_;
        } else {
            //unknown char
        }
    }

    return [p1, index_, index2_, l];
};


var addText = function(pos_, dir_, text_, size_, font_, vertexBuffer_, texcoordsBuffer_)
{
    var textVector_ = [0,1];
    var index_ = vertexBuffer_.length;
    var index2_ = texcoordsBuffer_.length;

    var factor_ = size_ / font_.size_;
    var newLineSpace_ = font_.space_ * factor_;

    var s = [pos_[0], pos_[1], pos_[2]];
    var p1 = [pos_[0], pos_[1], pos_[2]];

    for (var i = 0, li = text_.length; i < li; i++)
    {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            s[0] += -dir_[1] * newLineSpace_;
            s[1] += dir_[0] * newLineSpace_;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        var shift_ = addChar(p1, dir_, 0, char_, factor_, index_, index2_, textVector_, font_, vertexBuffer_, texcoordsBuffer_);

        p1 = shift_[0];
        index_ = shift_[1];
        index2_ = shift_[2];
    }

};


var addTextOnPath = function(points_, distance_, text_, size_, textVector_, font_, verticalOffset_, vertexBuffer_, texcoordsBuffer_)
{
    if (textVector_ == null) {
        textVector_ = [0,1];
    }

    var p1 = points_[0];
    var p2 = points_[1];

    var index_ = vertexBuffer_.length;
    var index2_ = texcoordsBuffer_.length;

    var chars_ = font_.chars_;

    var factor_ = size_ / font_.size_;
    var newLineSpace_ = font_.space_ * factor_;

    var s = [p1[0], p1[1], p1[2]];
    var p1 = [p1[0], p1[1], p1[2]];
    var l = distance_;

    for (var i = 0, li = text_.length; i < li; i++)
    {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            s[0] += -dir_[1] * newLineSpace_;
            s[1] += dir_[0] * newLineSpace_;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        if (char_ == 9) { //tab
            char_ = 32;
        }

        var fc = chars_[char_];
        var ll = 1;
        if (fc != null) {
            ll = fc.step_ * factor_;
        }

        var posAndDir_ = getPathPositionAndDirection(points_, l);
        var posAndDir2_ = getPathPositionAndDirection(points_, l+ll);

        //average dir
        var dir_ = [(posAndDir2_[1][0] + posAndDir_[1][0])*0.5,
                    (posAndDir2_[1][1] + posAndDir_[1][1])*0.5,
                    (posAndDir2_[1][2] + posAndDir_[1][2])*0.5];

        vec3Normalize(dir_);

        var shift_ = addChar(posAndDir_[0], dir_, -factor_*font_.size_*0.7+verticalOffset_, char_, factor_, index_, index2_, textVector_, font_, vertexBuffer_, texcoordsBuffer_);

        p1 = shift_[0];
        index_ = shift_[1];
        index2_ = shift_[2];
        l += ll;
    }

};

var addStreetTextOnPath = function(points_, text_, size_, font_, verticalOffset_, vertexBuffer_, texcoordsBuffer_)
{
    var factor_ = size_ / font_.size_;
    var textLength_ = getTextLength(text_, factor_, font_);
    var pathLength_ = getPathLength(points_);
    var shift_ = (pathLength_ -  textLength_)*0.5;
    if (shift_ < 0) {
        shift_ = 0;
    }

    if (textLength_ > pathLength_) {
        return;
    }

    var textVector_ = getPathTextVector(points_, shift_, text_, factor_, font_);

    addTextOnPath(points_, shift_, text_, size_, textVector_, font_, verticalOffset_, vertexBuffer_, texcoordsBuffer_);
};

var getFontFactor = function(size_, font_)
{
    return size_ / font_.size_;
};

var getLineHeight = function(size_, font_)
{
    var factor_ = size_ / font_.size_;
    return font_.space_ * factor_;
};

var getTextLength = function(text_, factor_, font_)
{
    var l = 0;
    var chars_ = font_.chars_;

    for (var i = 0, li = text_.length; i < li; i++)
    {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            continue;
        }

        if (char_ == 9) {  //tab or space
            char_ = 32;
        }

        var fc = chars_[char_];

        if (fc != null) {
            l += fc.step_ * factor_;
        }
    }

    return l;
};

var getSplitIndex = function(text_, width_, factor_, font_)
{
    var l = 0;
    var chars_ = font_.chars_;

    for (var i = 0, li = text_.length; i < li; i++)
    {
        var char_ = text_.charCodeAt(i);

        if (l > width_ && (char_ == 10 || char_ == 9 || char_ == 32)) {
            return i;
        }

        if (char_ == 10) { //new line
            continue;
        }

        if (char_ == 9) {  //tab or space
            char_ = 32;
        }

        var fc = chars_[char_];

        if (fc != null) {
            l += fc.step_ * factor_;
        }
    }

    return li;
};

var getPathLength = function(points_) {
    var l = 0;

    for (var i = 0, li = points_.length-1; i < li; i++)
    {
        var p1 = points_[i];
        var p2 = points_[i+1];
        var dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3Length(dir_);
    }

    return l;
};

var getPathPositionAndDirection = function(points_, distance_)
{
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];

    for (var i = 0, li = points_.length-1; i < li; i++)
    {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        var ll = vec3Length(dir_);

        if ((l + ll) > distance_) {

            var factor_ = (distance_ - l) / (ll);
            var p = [p1[0] + dir_[0] * factor_,
                     p1[1] + dir_[1] * factor_,
                     p1[2] + dir_[2] * factor_];

            vec3Normalize(dir_);

            return [p, dir_];
        }

        l += ll;
    }

    return [p1, dir_];
};

var getPathTextVector = function(points_, shift_, text_, factor_, font_)
{
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];
    var textDir_ = [0,0,0];
    var textStart_ = shift_;
    var textEnd_ = shift_ + getTextLength(text_, factor_, font_);

    for (var i = 0, li = points_.length-1; i < li; i++)
    {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3Length(dir_);

        if (l > textStart_) {
            vec3Normalize(dir_);
            textDir_[0] += dir_[0];
            textDir_[1] += dir_[1];
            textDir_[2] += dir_[2];
        }

        if (l > textEnd_) {
            vec3Normalize(textDir_);
            return [-textDir_[1], textDir_[0],0];
        }
    }

    return textDir_;
};

//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var processFeaturePass = function(type_, feature_, lod_, style_, zIndex_, eventInfo_) {

    switch(type_) {
        case "line-string":
            if (getStylePropertyValue(style_, "point", feature_, lod_) ||
                getStylePropertyValue(style_, "label", feature_, lod_)) {
                processPointArrayPass(feature_, lod_, style_, zIndex_, eventInfo_);
            }

            processLineStringPass(feature_, lod_, style_, zIndex_, eventInfo_);
            break;

        case "point-array":
            processPointArrayPass(feature_, lod_, style_, zIndex_, eventInfo_);

            if (getStylePropertyValue(style_, "line", feature_, lod_) ||
                getStylePropertyValue(style_, "line-label", feature_, lod_)) {
                processLineStringPass(feature_, lod_, style_, zIndex_, eventInfo_);
            }

            break;
    }

};

var processFeature= function(type_, feature_, lod_, featureIndex_) {

    var style_ = getStyle(feature_["style"], type_, featureIndex_);
    var visible_ = getStylePropertyValue(style_, "visible", feature_, lod_);
    var zIndex_ = getStylePropertyValue(style_, "z-index", feature_, lod_);

    if (visible_ == false) {
        return;
    }

    var eventInfo_ = {};

    for (var key_ in feature_) {
        if (key_ != "points" && key_ != "d-points") {
            eventInfo_[key_] = feature_[key_];
        }
    }

    var hoverStyleId_ = getStylePropertyValue(style_, "hover-style", feature_, lod_);
    var hoverStyle_ = (hoverStyleId_ != "") ? getStyle(hoverStyleId_, type_, featureIndex_) : null;

    if (hoverStyle_ != null) {
        hitState_ = 1;
        processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
        hitState_ = 2;
        processFeaturePass(type_, feature_, lod_, hoverStyle_, zIndex_, eventInfo_);
    } else {
        hitState_ = 0;
        processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
    }


    var multiPass_ = getStylePropertyValue(style_, "multi-pass", feature_, lod_);

    if (multiPass_ != null) {
        for (var i = 0, li = multiPass_.length; i < li; i++) {
            var zIndex_ = multiPass_[i][0];
            var style_ = getStyle(multiPass_[i][1], type_, featureIndex_);

            visible_ = getStylePropertyValue(style_, "visible", feature_, lod_);

            if (visible_ == false) {
                continue;
            }

            hoverStyleId_ = getStylePropertyValue(style_, "hover-style", feature_, lod_);
            hoverStyle_ = (hoverStyleId_ != "") ? getStyle(hoverStyleId_, type_, featureIndex_) : null;

            if (hoverStyle_ != null) {
                hitState_ = 1;
                processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
                hitState_ = 2;
                processFeaturePass(type_, feature_, lod_, hoverStyle_, zIndex_, eventInfo_);
            } else {
                hitState_ = 0;
                processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
            }
        }
    }

};


var processGroup = function(group_, lod_) {

    var points_ = group_["points"] || [];

    if (group_["origin"] == null && (tileX_ != 0 && tileY_ != 0)) {
        group_["origin"] = [tileX_, tileY_, 0];
        forceOrigin_ = true;
    } else {
        forceOrigin_ = false;
    }

    groupOrigin_ = group_["origin"];

    if (group_["scale"] != null) {
        forceScale_ = group_["scale"];
    } else {
        forceScale_ = null;
    }


    postMessage({"command":"beginGroup", "id": group_["id"], "bbox": group_["bbox"], "origin": group_["origin"]});

    //process points
    for (var i = 0, li = points_.length; i < li; i++) {
        processFeature("point-array", points_[i], lod_, i);
    }

    var lines_ = group_["lines"] || [];

    //process lines
    for (var i = 0, li = lines_.length; i < li; i++) {
        processFeature("line-string", lines_[i], lod_, i);
    }

    postMessage({"command":"endGroup"});
};


var processGeodata = function(data_, lod_) {

    //console.log("processGeodata");

    //create object from JSON
    if ((typeof data_) == "string") {
        try {
            var geodata_ = JSON.parse(data_);
        } catch (e) {
            geodata_ = null;
        }
    } else {
        geodata_ = data_;
    }

    if (geodata_) {

        var groups_ = geodata_["layers"] || geodata_["groups"] || [];

        //process layers
        for (var i = 0, li = groups_.length; i < li; i++) {
            processGroup(groups_[i], lod_);
        }
    }

    //console.log("processGeodata-ready");
};

self.onmessage = function (e) {
    var message_ = e.data;
    var command_ = message_["command"];
    var data_ = message_["data"];

    switch(command_) {

        case "setStyles":
            processStyles(data_);
            postMessage("ready");
            break;

        case "setFont":
            setFont(data_);
            postMessage("ready");
            break;

        case "processGeodata":

            tileX_ = message_["x"] || 0;
            tileY_ = message_["y"] || 0;
            tileLod_ = message_["lod"] || 1;
            autoLod_ = message_["autoLod"] || false;

            processGeodata(data_, tileLod_);
            postMessage("allProcessed");
            postMessage("ready");
            break;
    }
};

};

Melown.geodataProcessor = function(layer_, listener_) {
    this.layer_ = layer_;
    this.core_ = layer_.core_;
    this.killed_ = false;
    this.listener_ = listener_;
    this.ready_ = true;

    if (Melown_MERGE == true){

        //strigify function
        var windowURL_ = window.URL || window.webkitURL;
        var blob_;
        var stringified_ = Melown.stringifyFunction(Melown.geodataProcessorWorker);

        //convert string to blob
        try {
            blob_ = new Blob([stringified_], {type: 'application/javascript'});
        } catch (e) { // Backwards-compatibility
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
            blob_ = new BlobBuilder();
            blob_.append(stringified_);
            blob_ = blob.getBlob();
        }

        //create worker from blob
        this.processWorker_ = new Worker(windowURL_.createObjectURL(blob_));
    } else {

        //debug worker
        this.processWorker_ = new Worker("./browser/geoWorkerDebug.js");
    }

    this.processWorker_.onmessage = this.onMessage.bind(this);
};

Melown.geodataProcessor.prototype.kill = function() {
    if (this.killed_ == true) {
        return;
    }

    this.killed_ = true;

    if (this.processWorker_ != null) {
        this.processWorker_.terminate();
    }
};

Melown.geodataProcessor.prototype.isReady = function(listener_) {
    return this.ready_ || this.killed_;
};

Melown.geodataProcessor.prototype.onMessage = function(message_) {

    if (this.killed_ == true) {
        return;
    }

    message_ = message_.data;

    //console.log("onmessage");

    if (message_ == "ready") {
        this.ready_ = true;
        //console.log("ready");
    }

    if (this.listener_ != null) {
        this.listener_(message_);
    }
};

Melown.geodataProcessor.prototype.setListener = function(listener_) {
    this.listener_ = listener_;
};

Melown.geodataProcessor.prototype.sendCommand = function(command_, data_, id_, autoLod_) {

    if (this.killed_ == true) {
        return;
    }

    this.ready_ = false;

    if (id_ == null) {
        id_ = new Melown.TileId(this.core_, 0, 0, 0);
    }

    var worldParams_ = id_.getWorldParams();
    var tileSize_ = worldParams_[2];
    //console.log("command: " + command_ + " data: " + data_);

    this.processWorker_.postMessage({"command": command_, "data":data_, "x":worldParams_[0], "y":worldParams_[1], "lod": id_.lod_, "autoLod":autoLod_});
};


/**
 * @constructor
 */
Melown.MapBoundLayer = function(map_, json_) {
    this.map_ = map_;
    this.id_ = json_["id"] || null;
    this.type_ = json_["type"] || "raster";
    this.url_ = json_["url"] || "";
    this.tileSize_ = json_["tileSize"] || [256,256];
    this.lodRange_ = json_["lodRange"] || [0,0];
    this.credits_ = json_["credits"] || [];
};

Melown.MapBoundLayer.prototype.hasTile = function(id_) {
    if (id_[0] < this.lodRange_[0] || id_[0] > this.lodRange_[1] ||
        id_[1] < this.tileRange_[0][0] || id_[1] > this.tileRange_[1][0] ||
        id_[2] < this.tileRange_[0][1] || id_[2] > this.tileRange_[1][1] ) {
        return false;
    }

    return true;
};

Melown.MapBoundLayer.prototype.getUrl = function(id_, skipBaseUrl_) {
    this.map_.makeUrl(this.url_, id_, null, skipBaseUrl_);
};
/**
 * @constructor
 */
Melown.MapCache = function(map_, maxCost_) {
    this.map_ = map_;
    this.maxCost_ = (maxCost_ != null) ? maxCost_ : Number.MAX_VALUE;
    this.last_ = null;
    this.first_ = null;

    this.totalCost_ = 0;
    this.totalItems_ = 0;
};

Melown.MapCache.prototype.updateItem = function(item_) {
    if (item_ == null) {
        return;
    }

    if (this.first_ == item_) {
        return;
    }

    //remove item from list
    if (item_.prev_ != null) {
        item_.prev_.next_ = item_.next_;
    }

    if (item_.next_ != null) {
        item_.next_.prev_ = item_.prev_;
    }

    if (this.last_ == item_) {
        this.last_ = item_.prev_;
    }

    var first_ = this.first_;

    //add item as first
    this.first_ = item_;
    this.first_.next_ = first_;
    this.first_.prev_ = null;

    first_.prev_ = this.first_;
};

Melown.MapCache.prototype.getMaxCost = function() {
    return this.maxCost_;
};

Melown.MapCache.prototype.setMaxCost = function(cost_) {
    this.maxCost_ = cost_;
    this.checkCost();
};

Melown.MapCache.prototype.clear = function() {
    var item_ = this.first_;

    while (item_ != null) {
        if (item_.destructor_ != null) {
            item_.destructor_();
        }
        item_ = item_.next_;
    }

    this.last_ = null;
    this.first_ = null;

    this.totalCost_ = 0;
    this.totalItems_ = 0;
};

Melown.MapCache.prototype.insert = function(destructor_, cost_) {
    this.totalItems_++;

    //console.log("insert: " + hash_ + " items: " + this.totalItems_);

    var item_ = { destructor_:destructor_, cost_:cost_, prev_: null, next_:this.first_ };

    if (this.first_ != null) {
        this.first_.prev_ = item_;
    }

    //add item as first in list
    this.first_ = item_;

    if (this.last_ == null) {
        this.last_ = item_;
    }

    this.totalCost_ += cost_;

    //console.log("MapCache.prototype.insert:" + this.totalCost_ + " / " + this.maxCost_);

    this.checkCost();

    return item_;
};

Melown.MapCache.prototype.remove = function(item_) {
    this.totalItems_++;

    if (item_ == this.first_) {
        this.first_ = item_.next_;

        if (this.first_ != null) {
            this.first_.prev_ = null;
        }
    }

    if (item_ == this.last_) {
        this.last_ = item_.prev_;

        if (this.last_ != null) {
            this.last_.next_ = null;
        }
    }

    if (item_ != this.last_ && item_ != this.first_) {
        item_.prev_.next_ = item_.next_;
        item_.next_.prev_ = item_.prev_;
    }

    this.totalCost_ -= item_.cost_;

    //destroy item
    item_.destructor_();

    //console.log("MapCache.prototype.remove:" + this.totalCost_ + " / " + this.maxCost_);

    this.checkCost();
};


Melown.MapCache.prototype.checkCost = function() {
    while (this.totalCost_ > this.maxCost_) {

        this.totalItems_--;

        //console.log("remove: " + this.last_.hash_ + " prev: " + this.last_.prev_ + " items: " + this.totalItems_);

        var last_ = this.last_;

        if (last_ != null) {
            //set new last
            this.last_ = this.last_.prev_;

            if (this.last_ != null) {
                this.last_.next_ = null;
            }

            this.totalCost_ -= last_.cost_;

            //destroy item
            last_.destructor_();

        } else {
            break;
        }
    }
};


Melown.Map.prototype.updateCamera = function() {
    var controlMode_ = "observer";
    var position_ = [0,0,0];

    this.updateCameraMatrix_ = Melown.mat4.create();
    this.navOrientation_[1] = Melown.clamp(this.navOrientation_[1], -90.0, 10.0);
    this.navCameraDistance_ = Melown.clamp(this.navCameraDistance_, 5, this.camera_.getFar());
    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(this.navOrientation_[0])), Melown.rotationMatrix(0, Melown.radians(this.navOrientation_[1])), this.updateCameraMatrix_);

    //do not divide height by 2, probably because of screen has range from -1 to 1
    this.navCameraDistance_ = (this.navViewExtent_) / Math.tan(Melown.radians(this.navFov_));

    var orbitPos_ = [0, -this.navCameraDistance_, 0];
    Melown.mat4.multiplyVec3(this.updateCameraMatrix_, orbitPos_);

    this.cameraVector_ = [0, 1, 0];
    Melown.mat4.multiplyVec3(this.updateCameraMatrix_, this.cameraVector_);

    this.camera_.setPosition(orbitPos_);
    this.camera_.setOrientation(this.navOrientation_);
    this.renderer_.cameraDistance_ = this.navCameraDistance_;

    this.camera_.setViewHeight(this.navViewExtent_);
    //this.camera_.setOrtho(true);

    this.camera_.setParams(this.navFov_, this.renderer_.camera_.getNear(), this.renderer_.camera_.getFar());

    //var height_ = 227;
    var height_ = this.navHeight_;//232.2;

    //convert public coords to physical
    var worldPos_ = this.convertCoords([this.navCenter_[0], this.navCenter_[1], height_], "navigation", "physical");

    //var worldPos_ = [this.navCenter_[0], this.navCenter_[1], height_];

    this.navCameraPosition_ = worldPos_;

    //auto far plane
    /*
    var far_ = this.camera_.getFar();

    var maxDistance_ = this.navCameraDistance_ * (Math.tan(this.camera_.getFov()*0.5) / this.camera_.getAspect());

    maxDistance_ *= Math.tan(Melown.radians(90+this.orientation_[1]*0.10));
    maxDistance_ = maxDistance_ > 9000000.0 ? 9000000.0 : maxDistance_;
    maxDistance_ = maxDistance_ < this.core_.coreConfig_.cameraVisibility_ ? this.core_.coreConfig_.cameraVisibility_ : maxDistance_;

    if (Math.abs(maxDistance_- far_) > 1.0) {
        this.camera_.setParams(this.camera_.getFov(), this.camera_.getNear(), maxDistance_);
    }
    */

    this.dirty_ = true;
};

Melown.Map.prototype.cameraHeight = function() {
    //TODO: get camera height
    //var cameraPos_ = this.camera_.position_;
    //return (this.camera_.getPosition()[2] - this.planet_.surfaceHeight([this.position_[0] + cameraPos_[0], this.position_[1] + cameraPos_[1]])[0]);

    //hack - distance intead of height
    return this.navCameraDistance_;
};

Melown.Map.prototype.parseConfig = function() {

    //if (this.mapConfig_["version"] < 4) {
      //  return;
    //}

    if (!(this.parseSrses() && this.parseReferenceFrame() &&
          this.parseCredits() && this.parseSurfaces() &&
          this.parseGlues() && this.parseBoundLayers() &&
          this.parseFreeLayers() && this.parseViews() && this.parseParams() )) {
        //wrong config file
    }

    if (this.mapConfig_["position"] != null) {
/*
        var pos_ = this.mapConfig_["position"];
        pos_[1] = 472112;
        pos_[2] = 5555728;
        pos_[3] = 202;

        pos_[4] = 0;
        pos_[5] = -30;
        pos_[6] = 0;

        pos_[7] = 5000;

        pos_[8] = 90;
*/

        this.setPosition(this.mapConfig_["position"], false);
    }

    this.setMapView(this.initialView_);

};

Melown.Map.prototype.parseSrses = function() {

    var srses_ = this.mapConfig_["srses"];
    this.srses_ = {};

    if (srses_ == null) {
        return false;
    }

    for (var key_ in srses_) {
        this.addSrs(key_, new Melown.MapSrs(this, srses_[key_]));
    }

    return true;
};

Melown.Map.prototype.parseReferenceFrame = function() {

    var rf_ = this.mapConfig_["referenceFrame"];
    this.referenceFrames_ = {};

    if (rf_ == null) {
        return false;
    }

    this.setReferenceFrames(new Melown.MapRefFrames(this, rf_));

    if (this.referenceFrames_.valid_ == false) {
        return false;
    }

    return true;
};


Melown.Map.prototype.parseCredits = function() {

    var credits_ = this.mapConfig_["credits"];
    this.credits_ = {};

    if (credits_ == null) {
        return false;
    }

    for (var key_ in credits_) {
        this.addCredit(key_, new Melown.MapCredit(this, credits_[key_]));
    }

    return true;
};

Melown.Map.prototype.parseSurfaces = function() {

    var surfaces_ = this.mapConfig_["surfaces"];
    this.surfaces_ = [];

    if (surfaces_ == null) {
        return false;
    }

    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = new Melown.MapSurface(this, surfaces_[i]);
        this.addSurface(surface_.id_, surface_);
    }

    return true;
};

Melown.Map.prototype.parseViews = function() {

    var views_ = this.mapConfig_["namedViews"];
    this.namedViews_ = [];

    if (views_ != null) {
        for (var key_ in views_) {
            this.addView(key_, new Melown.MapView(this, views_[key_]));
        }
    }

    var view_ = this.mapConfig_["view"];

    if (view_ == null) {
        return true;
    }

    this.initialView_ = new Melown.MapView(this, view_);
    this.currentView_ = null;

    return true;
};

Melown.Map.prototype.parseGlues = function() {

    var glues_ = this.mapConfig_["glues"];
    this.glues_ = [];

    if (glues_ == null) {
        return true;
    }

    for (var i = 0, li = glues_.length; i < li; i++) {
        var surface_ = new Melown.MapGlue(this, glues_[i]);
        this.addGlue(surface_.id_.join(";"), surface_);
    }

    return true;

};

Melown.Map.prototype.parseBoundLayers = function() {

    var layers_ = this.mapConfig_["boundLayers"];
    this.boundLayers_ = [];

    if (layers_ == null) {
        return true;
    }

    for (var key_ in layers_) {
        var layer_ = new Melown.MapBoundLayer(this, layers_[key_]);
        this.addBoundLayer(key_, layer_);
    }

    return true;
};

Melown.Map.prototype.parseFreeLayers = function() {

    var layers_ = this.mapConfig_["freeLayers"];
    this.freeLayers_ = [];

    if (layers_ == null) {
        return true;
    }

    for (var key_ in layers_) {
        var layer_ = new Melown.MapFreeLayer(this, layers_[key_]);
        this.addFreeLayer(key_, layer_);
    }

    return true;
};

Melown.Map.prototype.parseParams = function() {

};

Melown.Map.prototype.cloneConfig = function() {
    var json_ = JSON.parse(JSON.stringify(this.mapConfig_));
/*
    json_["lowRes"] =          this.lowRes_;
    json_["degdradeHorizon"] = [this.degdradeHorizon_[0], this.degdradeHorizon_[1], this.degdradeHorizon_[2], this.degdradeHorizon_[3]];
    json_["texelSize"] =       this.texelSize_;
    json_["texelSizeFactor"] = Melown.texelSizeFactor_;
    json_["mapVersion"] =      this.mapVersion_;
    json_["geodata-layers"] =  this.geoLayers_;
*/
    return json_;
};
/**
 * @constructor
 */
Melown.MapCredit = function(map_, json_) {
    this.map_ = map_;
    this.notice_ = json_["notice"] || null;
    this.copyrighted_ = json_["copyrighted"] || true;
    this.url_ = json_["url"] || null;
};

Melown.Map.prototype.draw = function() {
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;

    //loop map trees
    for (var i = 0, li = this.mapTrees_.length; i < li; i++) {
        this.mapTrees_[i].draw();
    }

    //loop currently used free layers
    for (var i = 0, li = this.freeLayers_.length; i < li; i++) {
        this.freeLayers_[i].draw();
    }

};

Melown.Map.prototype.drawSurfaceTile = function(tile_, node_, cameraPos_, pixelSize_) {

    if (tile_.surface_ != null) {

        if (node_.hasGeometry()) {

            if (tile_.surfaceMesh_ == null) {
                var path_ = tile_.surface_.getMeshUrl(tile_.id_);
                tile_.surfaceMesh_ = new Melown.MapMesh(this, path_);
            }

            if (this.drawBBoxes_) {
                this.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
            }

            if (tile_.surfaceMesh_.isReady() == true) {

                var submeshes_ = tile_.surfaceMesh_.submeshes_;

                for (var i = 0, li = submeshes_.length; i < li; i++) {

                    //TODO: check internal texture flag

                    if (this.drawBBoxes_ && this.drawMeshBBox_) {
                        submeshes_[i].drawBBox(cameraPos_);
                    }

                    /*
                    if (this.updateBounds_) {
                        this.updateBounds_ = false;
                        this.boundLayers_ = {};
                        this.boundTextures_ = {};

                        var boundLayer_ = surfaceMesh_.getSubmeshBoundLayer(i);
                        boundLayer_.hasTile(tile_.id_);
                    }
                    */

                    if (tile_.surfaceTextures_[i] == null) {
                        var path_ = tile_.surface_.getTexureUrl(tile_.id_, i);
                        tile_.surfaceTextures_[i] = new Melown.MapTexture(this, path_);
                    } else {
                        if (tile_.surfaceTextures_[i].isReady() == true) {
                            tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, tile_.surfaceTextures_[i]);
                            this.stats_.drawnTiles_++;
                        }
                    }
                }
            }
        }
    }


};

Melown.Map.prototype.drawTileInfo = function(tile_, node_, cameraPos_, mesh_, pixelSize_) {
    var mvp_;

    if (!this.drawMeshBBox_) {
        node_.drawBBox(cameraPos_);
    }

    //get screen pos of node
    var min_ = node_.bbox_.min_;
    var max_ = node_.bbox_.max_;

    var pos_ =  this.core_.getRendererInterface().getScreenCoords(
                    [(min_[0] + (max_[0] - min_[0])*0.5) - cameraPos_[0],
                     (min_[1] + (max_[1] - min_[1])*0.5) - cameraPos_[1],
                     (max_[2]) - cameraPos_[2]],
                     this.camera_.getMvpMatrix());

    pos_[2] = pos_[2] * 0.9992;

    var factor_ = this.debugTextSize_;

    //draw lods
    if (this.drawLods_ == true) {
        text_ = "" + tile_.id_[0];
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]-4*factor_), 4*factor_, text_, [255,0,0,255], pos_[2]);
    }

    //draw indices
    if (this.drawIndices_ == true) {
        var text_ = "" + tile_.id_[1] + " " + tile_.id_[2];
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]-11*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw positions
    if (this.drawPositions_ == true) {
        var text_ = "" + min_[0].toFixed(1) + " " + min_[1].toFixed(1) + " " + min_[2].toFixed(1);
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+3*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw face count
    if (this.drawFaceCount_ == true && mesh_ != null) {
        var text_ = "" + mesh_.faces_ + " - " + mesh_.submeshes_.length;
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [0,255,0,255], pos_[2]);
    }

    //draw distance
    if (this.drawDistance_ == true) {
        var text_ = "" + pixelSize_[1].toFixed(2) + "  " + pixelSize_[0].toFixed(2) + "  " + node_.pixelSize_.toFixed(2);
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+17*factor_), 4*factor_, text_, [255,0,255,255], pos_[2]);
    }

/*
    //draw texture size
    if (this.drawTextureSize_ == true && gpuTile_ != null) {
        var text_ = "" + gpuTile_.texture_.width_ + " x " + gpuTile_.texture_.height_;
        this.drawText(Math.round(pos_[0]-(text_.length*4)*0.5), Math.round(pos_[1]-18), 4, text_, [255,255,255,255], pos_[2]);
    }

    //draw texel size
    if (this.drawTexelSize_ == true) {
*/


};



/**
 * @constructor
 */
Melown.MapFreeLayer = Melown.MapSurface;
/**
 * @constructor
 */
Melown.MapGlue = Melown.MapSurface;
/**
 * @constructor
 */
Melown.MapInterface = function(map_) {
    this.map_ = map_;
};

Melown.MapInterface.prototype.setPosition = function(position_) {
    this.map_.setPosition(position_);
};

Melown.MapInterface.prototype.getPosition = function(type_) {
    return this.map_.getPosition(type_);
};

Melown.MapInterface.prototype.setView = function(view_) {
    this.map_.setView();
};

Melown.MapInterface.prototype.getView = function() {
    return this.map_.getView();
};

Melown.MapInterface.prototype.getCredits = function() {
    return this.map_.getCredits();
};

Melown.MapInterface.prototype.getViews = function() {
    return this.map_.getViews();
};

Melown.MapInterface.prototype.getViewInfo = function(viewId_) {
    return this.map_.getViewInfo(viewId_);
};

Melown.MapInterface.prototype.getBoundLayers = function() {
    return this.map_.getBoundLayers();
};

Melown.MapInterface.prototype.getBoundLayerInfo = function(layerId_) {
    return this.map_.getBoundLayerInfo(layerId_);
};

Melown.MapInterface.prototype.getFreeLayers = function() {
    return this.map_.getFreeLayers();
};

Melown.MapInterface.prototype.getFreeLayerInfo = function(layerId_) {
    return this.map_.getFreeLayers(layerId_);
};

Melown.MapInterface.prototype.getSurfaces = function() {
    return this.map_.getSurfaces();
};

Melown.MapInterface.prototype.getSurfaceInfo = function(surfaceId_) {
    return this.map_.getSurfacesInfo(surfaceId_);
};

Melown.MapInterface.prototype.getReferenceFrame = function() {
    return this.map_.getReferenceFrame();
};

Melown.MapInterface.prototype.pan = function(position_, dx_, dy_) {
    return this.map_.pan(position_, dx_, dy_);
};

Melown.MapInterface.prototype.getCameraInfo = function() {
    var camera_ = this.map_.camera_;
    return {
        "projection-matrix" : camera_.projection_,
        "view-matrix" : camera_.modelview_,
        "view-projection-matrix" : camera_.mvp_,
        "position" : camera_.getPosition(),
        "vector" : [0,0,1]
    };
};

/**
 * @constructor
 */
Melown.MapLoader = function(map_, numThreads_) {
    this.map_ = map_;

    this.numThreads_ = numThreads_ || 1;
    this.usedThreads_ = 0;

    this.pending_ = [];
    this.pendingPath_ = [];
    this.downloading_ = [];
};


Melown.MapLoader.prototype.load = function(path_, downloadFunction_) {
    var index_ = this.downloading_.indexOf(path_);

    if (index_ != -1) {
        return;
    }

    //console.log("MapLoader.prototype.newRequest:" + hashId_);

    // update the pending list

   // put the request to the beginning of the pending list
    var index_ = this.pendingPath_.indexOf(path_);
    if (index_ != -1) {
        this.pending_.splice(index_, 1);
        this.pendingPath_.splice(index_, 1);
    }

    this.pending_.unshift(downloadFunction_);
    this.pendingPath_.unshift(path_);

    // keep the pending list at reasonable length
    if (this.pending_.length > 20) {
        this.pending_.pop();
        this.pendingPath_.pop();
    }
};


Melown.MapLoader.prototype.update = function() {
    if (this.pending_.length > 0) {
        if (this.usedThreads_ < this.numThreads_) {

            var downloadFunction_ = this.pending_.shift();
            var path_ = this.pendingPath_.shift();

            if (this.downloading_.indexOf(path_) == -1 && downloadFunction_ != null) {

                //console.log("MapLoader.prototype.download:" + hashId_);

                this.downloading_.push(path_);
                this.usedThreads_++;

                var onLoaded_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadDONE:" + this.cache_.hash(originalID_));

                    this.downloading_.splice(this.downloading_.indexOf(path_), 1);
                    this.usedThreads_--;

                }).bind(this);

                var onError_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadERROR:" + this.cache_.hash(originalID_));

                    this.downloading_.splice(this.downloading_.indexOf(path_), 1);
                    this.usedThreads_--;

                }).bind(this);

                //downloadFunction_(this.map_, id_, onLoaded_, onError_);
                downloadFunction_(path_, onLoaded_, onError_);
            }
        }
    }
};

Melown.Map.prototype.getSurfaceHeight = function(pos_) {
    this.surfaceHeightTracer_.trace(this.surfaceTree_, pos_, lod_);
    return this.measurements_.height_;
};
/**
 * @constructor
 */
Melown.MapMesh = function(map_, url_) {
    this.generateLines_ = true;
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.mapLoaderUrl_  = url_;

    this.bbox_ = new Melown.BBox();
    this.size_ = 0;
    this.fileSize_ = 0;
    this.faces_ = 0;

    this.cacheItem_ = null;  //store killSubmeshes
    this.gpuCacheItem_ = null; //store killGpuSubmeshes

    this.loadState_ = 0;

    this.submeshes_ = [];
    this.gpuSubmeshes_ = [];
};

Melown.MapMesh.prototype.kill = function() {
    this.bbox_ = null;
    this.killSubmeshes();
    this.killGpuSubmeshes();
};

Melown.MapMesh.prototype.killSubmeshes = function(killedByCache_) {
    for (var i = 0, li = this.submeshes_.length; i < li; i++) {
        this.submeshes_[i].kill();
    }
    this.submeshes_ = [];

    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        this.tile_.validate();
    }

    this.loadState_ = 0;
    this.cacheItem_ = null;
};

Melown.MapMesh.prototype.killGpuSubmeshes = function(killedByCache_) {
    for (var i = 0, li = this.gpuSubmeshes_.length; i < li; i++) {
        this.stats_.gpuMeshesUsed_ -= this.gpuSubmeshes_[i].size_;
        this.gpuSubmeshes_[i].kill();
    }

    this.gpuSubmeshes_ = [];

    if (killedByCache_ != true && this.gpuCacheItem_ != null) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
        this.tile_.validate();
    }

    this.gpuCacheItem_ = null;
};

Melown.MapMesh.prototype.isReady = function () {
    if (this.loadState_ == 2) { //loaded

        if (this.gpuSubmeshes_.length == 0) {
            this.buildGpuSubmeshes();
        }

        this.map_.resourcesCache_.updateItem(this.cacheItem_);
        this.map_.gpuCache_.updateItem(this.gpuCacheItem_);

        return true;
    } else {
        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress
    }

    return false;
};

Melown.MapMesh.prototype.scheduleLoad = function() {
    if (this.mapLoaderUrl_ == null) {
        this.mapLoaderUrl_ = this.map_.makeUrl(this.tile_.surface_.meshUrl_, {lod_:this.tile_.id_[0], ix_:this.tile_.id_[1], iy_:this.tile_.id_[2] });
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this));
};

Melown.MapMesh.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    Melown.loadBinary(url_, this.onLoaded.bind(this), this.onLoadError.bind(this));
    this.loadState_ = 1;
};

Melown.MapMesh.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapMesh.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    this.fileSize_= data_.byteLength;

    var stream_ = {data_:data_, index_:0};
    this.parseMapMesh(stream_);

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killSubmeshes.bind(this, true), this.size_);

    this.mapLoaderCallLoaded_();
    this.loadState_ = 2;
};

//! Returns RAM usage in bytes.
Melown.MapMesh.prototype.size = function () {
    return this.size_;
};

Melown.MapMesh.prototype.fileSize = function () {
    return this.fileSize_;
};

//! Returns RAM usage in bytes.
Melown.MapMesh.prototype.parseMapMesh = function (stream_) {
/*
    struct MapMesh {
        struct MapMeshHeader_ {
            char magic[2];                // letters "ME"
            ushort version;               // currently 1
            double meanUndulation;        // read more about undulation below
            ushort numSubmeshes;          // number of submeshes
        } header;
        struct Submesh submeshes [];      // array of submeshes, size of array is defined by numSubmeshes property
    };
*/

    this.parseMeshHeader(stream_);

    this.submeshes_ = new Array(this.numSubmeshes_);

    for (var i = 0, li = this.numSubmeshes_; i < li; i++) {
        this.submeshes_[i] = new Melown.MapSubmesh(this, stream_);
        this.size_ += this.submeshes_[i].size_;
        this.faces_ += this.submeshes_[i].faces_;
    }

};

Melown.MapMesh.prototype.parseMeshHeader = function (stream_) {
    var streamData_ = stream_.data_;
    var magic_ = "";

    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;
    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;

    if (magic_ != "ME") {
        return;
    }

    var version_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (version_ > 1) {
        return;
    }

    this.meanUndulation_ = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    this.numSubmeshes_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
};

Melown.MapMesh.prototype.addSubmesh = function(submesh_) {
    this.submeshes_.push(submesh_);
    this.size_ += submesh_.size_;
    this.faces_ += submesh_.faces_;
};

Melown.MapMesh.prototype.buildGpuSubmeshes = function() {
    var size_ = 0;
    this.gpuSubmeshes_ = new Array(this.submeshes_.length);

    for (var i = 0, li = this.submeshes_.length; i < li; i++) {
        this.gpuSubmeshes_[i] = this.submeshes_[i].buildGpuMesh();
        size_ += this.gpuSubmeshes_[i].size_;
    }

    this.stats_.gpuMeshesUsed_ += size_;

    this.gpuCacheItem_ = this.map_.gpuCache_.insert(this.killGpuSubmeshes.bind(this, true), size_);
};

Melown.MapMesh.prototype.getSubmeshBoundLayer = function(index_) {
    var submesh_ = this.submeshes_[index_];
    if (submesh_ == null || submesh_.textureLayer_ == 0) {
        return null;
    }

    return map_.getBoundLayerByNumebr(submesh_.textureLayer_);
};

Melown.MapMesh.prototype.drawSubmesh = function (cameraPos_, index_, texture_) {
    if (this.gpuSubmeshes_[index_] == null && this.submeshes_[index_] != null) {
        this.gpuSubmeshes_[index_] = this.submeshes_[index_].buildGpuMesh();
    }

    var submesh_ = this.submeshes_[index_];
    var gpuSubmesh_ = this.gpuSubmeshes_[index_];

    if (gpuSubmesh_ == null) {
        return;
    }
/*
    if (renderer_.onlyDepth_ == true) {
        program_ = this.progDepthTile_; //for hit test use different program
    } else {
        switch (renderer_.drawWireframe_) {
            case 0:
            default: program_ = renderer_.progTile_; break;
            case 1: program_ = renderer_.progWireframeTile_; break;
            case 2: program_ = renderer_.progWireframeTile2_; break;
            case 3: program_ = renderer_.progFlatShadeTile_; break;
        }
    }
*/

    var renderer_ = this.map_.renderer_;
    var program_ = renderer_.progTile_;

    renderer_.gpu_.useProgram(program_, "aPosition", "aTexCoord", "aTexCoord2", renderer_.drawWireframe_ == true ? "aBarycentric" : null);

    var mv_ = Melown.mat4.create();
    Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), submesh_.getWorldMatrix(cameraPos_), mv_);

    var proj_ = renderer_.camera_.getProjectionMatrix();

    program_.setMat4("uMV", mv_);
    program_.setMat4("uProj", proj_);
    renderer_.fogSetup(program_, "uFogDensity");

    if (texture_ == null || texture_.gpuTexture_ == null) {
        proj_ = proj_;
        texture_.isReady();
        return;
    }

    renderer_.gpu_.bindTexture(texture_.gpuTexture_);

    gpuSubmesh_.draw(program_, "aPosition", "aTexCoord", "aTexCoord2", renderer_.drawWireframe_ == true ? "aBarycentric" : null);
    this.stats_.drawnFaces_ += this.faces_;
};


/**
 * @constructor
 */
Melown.MapMetanodeTracer = function(mapTree_, surface_, nodeProcessingFunction_) {
    this.map_ = mapTree_.map_;
    this.surfaceTree_ = mapTree_.surfaceTree_;
    this.metastorageTree_ = mapTree_.metastorageTree_;
    this.metaBinaryOrder_ = mapTree_.metaBinaryOrder_;
    this.rootId_ = mapTree_.rootId_;
    this.surface_ = surface_; //????
    this.nodeProcessingFunction_ = nodeProcessingFunction_;
};

Melown.MapMetanodeTracer.prototype.trace = function(tile_) {
    this.traceTile(this.surfaceTree_);
};

Melown.MapMetanodeTracer.prototype.traceTile = function(tile_) {
    if (tile_ == null) {
        return;
    }

    if (tile_.surface_ == null) {
        this.checkTileSurface(tile_);
    }

    if (tile_.metastorage_ == null) {
        tile_.metastorage_ = Melown.FindMetastorage(this.map_, this.metastorageTree_, this.rootId_, tile_, this.metaBinaryOrder_);
    }

    if (tile_.metanode_ == null) {

        var surface_ = this.surface_ || tile_.surface_;

        if (surface_ == null) {
            return;
        }

        var metatile_ = tile_.metastorage_.getMetatile(surface_);

        if (metatile_ == null) {
            metatile_ = new Melown.MapMetatile(tile_.metastorage_, surface_);
            tile_.metastorage_.addMetatile(metatile_);
        }

        if (metatile_.isReady() == true) {

            tile_.metanode_ = metatile_.getNode(tile_.id_);

            if (tile_.metanode_ == null) {
                tile_.metanode_ = metatile_.getNode(tile_.id_);
            } else {
                /*
                if (tile_.id_[0] == 15) {
                    tile_ = tile_;
                }*/

                tile_.metanode_.tile_ = tile_; //used only for validate

                for (var i = 0; i < 4; i++) {
                    if (tile_.metanode_.hasChild(i) == true) {
                        tile_.addChild(i);
                    } else {
                        tile_.removeChildByIndex(i);
                    }
                }
            }

        } else {
            return;
        }

    }

    if (tile_.metanode_ == null) { //only for wrong data
        return;
    }

    tile_.metanode_.metatile_.used();

    if (this.nodeProcessingFunction_(tile_) == true) {

        if (tile_.id_[0] == 17) {
            tile_ = tile_;
        }

        //trace children
        for (var i = 0; i < 4; i++) {
            this.traceTile(tile_.children_[i]);
        }
    }

};

Melown.MapMetanodeTracer.prototype.checkTileSurface = function(tile_) {
    tile_.surface_ = null;

    var sequence_ = this.map_.surfaceSequence_;

    //find surfaces with content
    for (var i = sequence_.length - 1; i >= 0; i--) {
        if (sequence_[i].hasTile(tile_.id_) == true) {

            var surface_ = sequence_[i];

            //reset tile data
            if (tile_.surface_ != surface_) {
                tile_.surfaceMesh_ = null;
                tile_.surfaceTexture_ = null;
                tile_.surfaceGeodata_ = null;
                tile_.heightMap_ = null;
            }

            tile_.surface_ = surface_;
            tile_.empty_ = false;

            return;
        }
    }

    //find surfaces with metatile
    for (var i = sequence_.length - 1; i >= 0; i--) {
        if (sequence_[i].hasMetatile(tile_.id_) == true) {

            var surface_ = sequence_[i];

            //reset tile data
            if (tile_.surface_ != surface_) {
                tile_.surfaceMesh_ = null;
                tile_.surfaceTexture_ = null;
                tile_.surfaceGeodata_ = null;
                tile_.heightMap_ = null;
            }

            tile_.surface_ = surface_;
            tile_.empty_ = true;

            return;
        }
    }

};
/** @const */ MelownMetanodeFlags_GeometryPresent =  1;
/** @const */ MelownMetanodeFlags_NavtilePresent =  3;
/** @const */ MelownMetanodeFlags_InternalTexturePresent =  7;
/** @const */ MelownMetanodeFlags_CoarsenessControl =  15;
/** @const */ MelownMetanodeFlags_ChildShift =  3;

/**
 * @constructor
 */
Melown.MapMetanode = function(metatile_, id_, stream_) {
    this.metatile_ = metatile_;
    this.map_ = metatile_.map_;
    this.id_ = id_;
    //this.metadata_ = null;
    //this.nodes_ = [];
    //this.children_ = [null, null, null, null];

    this.parseMetanode(stream_);
};

Melown.MapMetanode.prototype.kill = function() {
};

Melown.MapMetanode.prototype.hasChild = function(index_) {
    return ((this.flags_ & (1<<(index_+4))) != 0);
};

Melown.MapMetanode.prototype.hasChildren = function() {
    return ((this.flags_ & ((15)<<4)) != 0);
};

Melown.MapMetanode.prototype.parseExtentBits = function(extentBytes_, extentBits_, index_, maxExtent_) {
    var value_ = 0;

    for (var i = 0, li = extentBits_; i < li; i++) {
        var byteIndex_ = index_ >> 3;
        var bitIndex_ = index_ & 0x7;

        if (extentBytes_[byteIndex_] & (1 << (7-bitIndex_))) {
            value_ = value_ | (1 << (li - i - 1));
        }

        index_ ++;
    }

    value_ /= (1 << li) - 1;
//    value_ *= maxExtent_;

    return value_;
};

Melown.MapMetanode.prototype.hasGeometry = function() {
    return ((this.flags_ & 1) != 0);
};

Melown.MapMetanode.prototype.hasNavtile = function() {
    return ((this.flags_ & (1 << 1)) != 0);
};

Melown.MapMetanode.prototype.usedTexelSize = function() {
    return ((this.flags_ & (1 << 2)) != 0);
};

Melown.MapMetanode.prototype.usedDisplaySize = function() {
    return ((this.flags_ & (1 << 3)) != 0);
};


Melown.MapMetanode.prototype.parseMetanode = function(stream_) {

/*
struct Metanode {
    char flags;                   // #0 - geometry present, #1 - navtile present #2 - applyTexelSize,
                                  // #3 - applyPixelSize, #4,5,6,7 - ul,ur,ll,lr child exists
    char geomExtents[];           // a packed array of 6 bit sequences, each lod+2 long, in the following order:
                                  // minx,maxx,miny,maxy,minz,maxz, undefined if no geometry present
    uchar internalTextureCount;   // number of internal textures in geometry
    hfloat texelSize;             // internal texel size in physical srs units, undef unless applyTexelSize is set
    ushort displaySize;           // desired display size, undef unless applyDisplay size is set
    short minHeight, maxHeight;   // navigation tile value range, undef if no navtile present
}
*/

    var streamData_ = stream_.data_;

    var lastIndex_ = stream_.index_;

    this.flags_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    //if (this.id_[0] == 17) {
        //stream_ = stream_;
    //}

    var extentsSize_ = (((this.id_[0] + 2) * 6 + 7) >> 3);
    var extentsBytes_ = new Uint8Array(extentsSize_);

    for (var i = 0, li = extentsSize_; i < li; i++) {
        extentsBytes_[i] = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
    }

    var extentBits_ = this.id_[0] + 2;

    var minExtents_ = [0,0,0];
    var maxExtents_ = [0,0,0];

    var index_ = 0;
    var spaceExtentSize_ = this.map_.spaceExtentSize_;
    var spaceExtentOffset_ = this.map_.spaceExtentOffset_;

    for (var i = 0; i < 3; i++) {
        minExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_) * spaceExtentSize_[i] + spaceExtentOffset_[i];
        //minExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_, 1.0);
        index_ += extentBits_;
        maxExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_) * spaceExtentSize_[i] + spaceExtentOffset_[i];
        //maxExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_, 1.0);
        index_ += extentBits_;
    }

    this.bbox_ = new Melown.BBox(minExtents_[0], minExtents_[1], minExtents_[2], maxExtents_[0], maxExtents_[1], maxExtents_[2]);

    this.internalTextureCount_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.pixelSize_ = Melown.decodeFloat16( streamData_.getUint16(stream_.index_, true) ); stream_.index_ += 2;
    this.displaySize_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if ((this.flags_ & (1 << 2)) == 0) {
        this.pixelSize_ = Number.POSITIVE_INFINITY;
    }

    if ((this.flags_ & (1 << 3)) == 0) {
        this.displaySize_ = 256;
    }

    this.minHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;
    this.maxHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;

    var nodeSize2_ = stream_.index_ - lastIndex_;

//    console.log("node size: " + JSON.stringify(this.id_) + "  " + nodeSize2_ + "  " + this.metatile_.nodeSize_ + "  " + this.flags_.toString(2));
    //console.log("node size: " + JSON.stringify(this.id_) + "  " + this.pixelSize_);

/*
    if (this.metatile_.nodeSize_ != nodeSize2_) {
        //nodeSize_ = nodeSize_;
        console.log("node parser error: " + JSON.stringify(this.id_));
    }
*/
};


Melown.MapMetanode.prototype.getWorldMatrix = function(geoPos_, matrix_) {
    // Note: the current camera geographic position (geoPos) is not necessary
    // here, in theory, but for numerical stability (OpenGL ES is float only)
    // we get rid of the large UTM numbers in the following subtractions. The
    // camera effectively stays in the position [0,0] and the tiles travel
    // around it. (The Z coordinate is fine and is not handled in this way.)

    var m = matrix_;

    if (m != null) {
        m[0] = this.bbox_.side(0); m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = this.bbox_.side(1); m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = this.bbox_.side(2); m[11] = 0;
        m[12] = this.bbox_.min_[0] - geoPos_[0]; m[13] = this.bbox_.min_[1] - geoPos_[1]; m[14] = this.bbox_.min_[2] - geoPos_[2]; m[15] = 1;
    } else {
        var m = Melown.mat4.create();

        Melown.mat4.multiply( Melown.translationMatrix(this.bbox_.min_[0] - geoPos_[0], this.bbox_.min_[1] - geoPos_[1], this.bbox_.min_[2] - geoPos_[2]),
                       Melown.scaleMatrix(this.bbox_.side(0), this.bbox_.side(1), this.bbox_.side(2)), m);
    }

    return m;
};

Melown.MapMetanode.prototype.drawBBox = function(cameraPos_) {
    var renderer_ = this.map_.renderer_;

    renderer_.gpu_.useProgram(renderer_.progBBox_, "aPosition");

    var mvp_ = Melown.mat4.create();
    var mv_ = Melown.mat4.create();

    Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), this.getWorldMatrix(cameraPos_), mv_);

    var proj_ = renderer_.camera_.getProjectionMatrix();
    Melown.mat4.multiply(proj_, mv_, mvp_);

    renderer_.progBBox_.setMat4("uMVP", mvp_);

    //draw bbox
    renderer_.bboxMesh_.draw(renderer_.progBBox_, "aPosition");

};



/**
 * @constructor
 */
Melown.MapMetastorage = function(map_, parent_, id_) {
    this.id_ = id_;
    this.map_ = map_;
    this.parent_ = parent_;
    this.metatiles_ = [];
    this.children_ = [null, null, null, null];
};

Melown.MapMetastorage.prototype.kill = function() {
    for (var i = 0, li = this.metatiles_.length; i < li; i++) {
        this.metatiles_[i].kill();
    }

    this.metatiles_ = [];

    for (var i = 0; i < 4; i++) {
        if (this.children_[i] != null) {
            this.children_[i].kill();
        }
    }

    this.children_ = [null, null, null, null];

    var parent_ = this.parent_;
    this.parent_ = null;

    if (parent_ != null) {
        parent_.removeChild(this);
    }
};

Melown.MapMetastorage.prototype.validate = function() {

    if (this.metatiles_.length == 0) {
        this.kill();
        return false;
    }

    return true;
};

Melown.MapMetastorage.prototype.getMetatile = function(surface_) {
    var metatiles_ = this.metatiles_;
    for (var i = 0, li = metatiles_.length; i < li; i++) {
        if (metatiles_[i].surface_ == surface_) {
            return metatiles_[i];
        }
    }

    return null;
};

Melown.MapMetastorage.prototype.addMetatile = function(metatile_) {
    this.metatiles_.push(metatile_);
};

Melown.MapMetastorage.prototype.removeMetatile = function(metatile_) {
    for (var i = 0, li = this.metatiles_.length; i < li; i++) {
        if (this.metatiles_[i] == metatile_) {
            this.metatiles_.splice(i, 1);
            break;
        }
    }
};

Melown.MapMetastorage.prototype.addChild = function(index_) {
    var id_ = this.id_;
    var childId_ = [id_[0] + 1, id_[1] << 1, id_[2] << 1];

    switch (index_) {
        case 1: childId_[1]++; break;
        case 2: childId_[2]++; break;
        case 3: childId_[1]++; childId_[2]++; break;
    }

    this.children_[index_] = new Melown.MapMetastorage(this.map_, this, childId_);
};

Melown.MapMetastorage.prototype.removeChild = function(metastorageTile_) {
    for (var i = 0; i < 4; i++) {
        if (this.children_[i] == metastorageTile_) {
            this.children_[i].kill();
            this.children_[i] = null;
        }
    }
};

Melown.FindMetastorage = function(map_, metastorageTree_, rootId_, tile_, agregation_) {
    var id_ = tile_.id_;
    var rootLod_ = rootId_[0];
    var metastorage_ = metastorageTree_;
    var ix_ = ((id_[1] >> agregation_) << agregation_);
    var iy_ = ((id_[2] >> agregation_) << agregation_);


    for (var lod_ = id_[0]; lod_ > rootLod_; lod_--) {
        var i = lod_ - rootLod_;
        var index_ = 0;
        var mask_ = 1 << (i-1);
        if ((ix_ & mask_) != 0) {
            index_ += 1;
        }

        if ((iy_ & mask_) != 0) {
            index_ += 2;
        }

        if (metastorage_.children_[index_] == null) {
            metastorage_.addChild(index_);
        }

        metastorage_ = metastorage_.children_[index_];
    }

    return metastorage_;
};











/**
 * @constructor
 */
Melown.MapMetatile = function(metastorage_, surface_) {
    this.metastorage_= metastorage_; //this is metastorage tile
    this.map_ = metastorage_.map_;
    this.surface_ = surface_;
    this.id_ = metastorage_.id_;
    this.nodes_ = [];
    this.loadState_ = 0;
    this.size_ = 0;

    this.cacheItem_ = null;
};

Melown.MapMetatile.prototype.kill = function(killedByCache_) {
    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.metatileCache_.remove(this.cacheItem_);
    }

    this.metastorage_.removeMetatile(this);
    this.metastorage_.validate();
    this.metastorage_ = null;
    this.loadState_ = 0;
    this.surface_ = 0;
    this.cacheItem_ = null;

    for (var i = 0, li = this.nodes_.length; i < li; i++) {
        if (this.nodes_.tile_ != null) {
            this.nodes_.tile_.validate();
        }
    }

    this.nodes_ = [];
};

Melown.MapMetatile.prototype.isReady = function () {
    if (this.loadState_ == 2) { //loaded
        return true;
    } else {

        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress

        return false;
    }

};

Melown.MapMetatile.prototype.used = function() {
    if (this.cacheItem_ != null) {
        this.map_.metatileCache_.updateItem(this.cacheItem_);
    }

};

Melown.MapMetatile.prototype.getNode = function(id_) {
    var x = id_[1] - this.id_[1] - this.offsetx_;
    var y = id_[2] - this.id_[2] - this.offsety_;
    return this.nodes_[this.sizex_ * y + x];
};

Melown.MapMetatile.prototype.scheduleLoad = function() {
    if (this.mapLoaderUrl_ == null) {
        this.mapLoaderUrl_ = this.map_.makeUrl(this.surface_.metaUrl_, {lod_:this.id_[0], ix_:this.id_[1], iy_:this.id_[2] });
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this));
};

Melown.MapMetatile.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    Melown.loadBinary(url_, this.onLoaded.bind(this), this.onLoadError.bind(this));
    this.loadState_ = 1;
};

Melown.MapMetatile.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapMetatile.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    this.size_ += data_.byteLength * 4;

    this.parseMetatatile({data_:data_, index_: 0});

    this.cacheItem_= this.map_.metatileCache_.insert(this.kill.bind(this, true), this.size_);

    this.mapLoaderCallLoaded_();
    this.loadState_ = 2;
};

Melown.MapMetatile.prototype.parseMetatatile = function(stream_) {

/*
    struct Header {

        char magic[2];                         // letters "MT"
        ushort version;                        // version
        uchar lod;                             // common lod
        uint metatileIdx, metatileIdy;         // id of upper left tile corner (reflected in tile name)
        ushort offsetx, offsety;               // offset of valid data block
        ushort sizex, sizey;                   // dimensions of metanode grid
        uchar nodeSize;                        // size of a metanode in bytes
        uchar creditCount;                     // total number of credit blocks (= number of attributions used by nodes)
        ushort creditSize;                     // size of credit block in bytes
    };
*/

    var streamData_ = stream_.data_;
    var magic_ = "";

    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;
    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;

    if (magic_ != "MT") {
        return;
    }

    var version_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (version_ > 1) {
        return;
    }

    this.lod_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.metatileIdx_ = streamData_.getUint32(stream_.index_, true); stream_.index_ += 4;
    this.metatileIdy_ = streamData_.getUint32(stream_.index_, true); stream_.index_ += 4;

    this.offsetx_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.offsety_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    this.sizex_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.sizey_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    this.nodeSize_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.parseMetatatileCredits(stream_);
    this.parseMetatatileNodes(stream_);
};


Melown.MapMetatile.prototype.parseMetatatileCredits = function(stream_) {

/*
    struct CreditBlock {
       ushort creditId;       // numerical creditId
       char creditMask[];     // bitfield of size header.sizex * header.sizey, row major, row padded
    };
*/

    var streamData_ = stream_.data_;

    this.creditCount_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
    this.creditSize_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (this.creditCount_ == 0) {
        this.credits_ = [];
        return;
    }

    //rounded to bytes
    var sizex8_ = ((this.sizex_+7) >> 3) << 3;

    var bitfieldSize_ = ((this.sizex8_ * this.sizey_) >> 3);

    this.credits_ = new Array(this.creditCount_);

    for (var i = 0; i < this.creditsCount_; i++) {
        var creditId_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
        var bitfield_ = new Uint8Array(bitfieldSize_);

        for (var j = 0; j < bitfieldSize_; j++) {
            bitfield_[j] = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
        }

        this.credits_[i] = { creditId_ : creditId_, creditMask_: bitfield_};
    }

};

Melown.MapMetatile.prototype.parseMetatatileNodes = function(stream_) {
    this.nodes_ = new Array(this.sizex_*this.sizey_);
    var index_ = 0;

    for (var y = 0; y < this.sizey_; y++) {
        for (var x = 0; x < this.sizex_; x++) {
            this.nodes_[index_] = (new Melown.MapMetanode(this, [this.lod_, this.metatileIdx_ + x, this.metatileIdy_ + y], stream_));
            index_++;
        }
    }
};

/**
 * @constructor
 */
Melown.MapRefFrame = function(map_, id_, srs_, extents_, heightRange_, partitioning_) {
    this.map_ = map_;
    this.id_ = id_;
    this.srs_ = this.map_.getMapsSrs(srs_);
    this.extents_ = extents_;
    this.heightRange_ =  heightRange_;
    this.partitioning_ = partitioning_;
};


/**
 * @constructor
 */
Melown.MapMetatile = function(metastorage_, surface_) {
    this.metastorage_= metastorage_; //this is metastorage tile
    this.map_ = metastorage_.map_;
    this.surface_ = surface_;
    this.id_ = metastorage_.id_;
    this.nodes_ = [];
    this.loadState_ = 0;
    this.size_ = 0;

    this.cacheItem_ = null;
};

Melown.MapMetatile.prototype.kill = function(killedByCache_) {
    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.metatileCache_.remove(this.cacheItem_);
    }

    this.metastorage_.removeMetatile(this);
    this.metastorage_.validate();
    this.metastorage_ = null;
    this.loadState_ = 0;
    this.surface_ = 0;
    this.cacheItem_ = null;

    for (var i = 0, li = this.nodes_.length; i < li; i++) {
        if (this.nodes_.tile_ != null) {
            this.nodes_.tile_.validate();
        }
    }

    this.nodes_ = [];
};

Melown.MapMetatile.prototype.isReady = function () {
    if (this.loadState_ == 2) { //loaded
        return true;
    } else {

        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress

        return false;
    }

};

Melown.MapMetatile.prototype.used = function() {
    if (this.cacheItem_ != null) {
        this.map_.metatileCache_.updateItem(this.cacheItem_);
    }

};

Melown.MapMetatile.prototype.getNode = function(id_) {
    var x = id_[1] - this.id_[1] - this.offsetx_;
    var y = id_[2] - this.id_[2] - this.offsety_;
    return this.nodes_[this.sizex_ * y + x];
};

Melown.MapMetatile.prototype.scheduleLoad = function() {
    if (this.mapLoaderUrl_ == null) {
        this.mapLoaderUrl_ = this.map_.makeUrl(this.surface_.metaUrl_, {lod_:this.id_[0], ix_:this.id_[1], iy_:this.id_[2] });
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this));
};

Melown.MapMetatile.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    Melown.loadBinary(url_, this.onLoaded.bind(this), this.onLoadError.bind(this));
    this.loadState_ = 1;
};

Melown.MapMetatile.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapMetatile.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    this.size_ += data_.byteLength * 4;

    this.parseMetatatile({data_:data_, index_: 0});

    this.cacheItem_= this.map_.metatileCache_.insert(this.kill.bind(this, true), this.size_);

    this.mapLoaderCallLoaded_();
    this.loadState_ = 2;
};

Melown.MapMetatile.prototype.parseMetatatile = function(stream_) {

/*
    struct Header {

        char magic[2];                         // letters "MT"
        ushort version;                        // version
        uchar lod;                             // common lod
        uint metatileIdx, metatileIdy;         // id of upper left tile corner (reflected in tile name)
        ushort offsetx, offsety;               // offset of valid data block
        ushort sizex, sizey;                   // dimensions of metanode grid
        uchar nodeSize;                        // size of a metanode in bytes
        uchar creditCount;                     // total number of credit blocks (= number of attributions used by nodes)
        ushort creditSize;                     // size of credit block in bytes
    };
*/

    var streamData_ = stream_.data_;
    var magic_ = "";

    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;
    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;

    if (magic_ != "MT") {
        return;
    }

    var version_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (version_ > 1) {
        return;
    }

    this.lod_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.metatileIdx_ = streamData_.getUint32(stream_.index_, true); stream_.index_ += 4;
    this.metatileIdy_ = streamData_.getUint32(stream_.index_, true); stream_.index_ += 4;

    this.offsetx_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.offsety_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    this.sizex_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.sizey_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    this.nodeSize_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.parseMetatatileCredits(stream_);
    this.parseMetatatileNodes(stream_);
};


Melown.MapMetatile.prototype.parseMetatatileCredits = function(stream_) {

/*
    struct CreditBlock {
       ushort creditId;       // numerical creditId
       char creditMask[];     // bitfield of size header.sizex * header.sizey, row major, row padded
    };
*/

    var streamData_ = stream_.data_;

    this.creditCount_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
    this.creditSize_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (this.creditCount_ == 0) {
        this.credits_ = [];
        return;
    }

    //rounded to bytes
    var sizex8_ = ((this.sizex_+7) >> 3) << 3;

    var bitfieldSize_ = ((this.sizex8_ * this.sizey_) >> 3);

    this.credits_ = new Array(this.creditCount_);

    for (var i = 0; i < this.creditsCount_; i++) {
        var creditId_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
        var bitfield_ = new Uint8Array(bitfieldSize_);

        for (var j = 0; j < bitfieldSize_; j++) {
            bitfield_[j] = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
        }

        this.credits_[i] = { creditId_ : creditId_, creditMask_: bitfield_};
    }

};

Melown.MapMetatile.prototype.parseMetatatileNodes = function(stream_) {
    this.nodes_ = new Array(this.sizex_*this.sizey_);
    var index_ = 0;

    for (var y = 0; y < this.sizey_; y++) {
        for (var x = 0; x < this.sizex_; x++) {
            this.nodes_[index_] = (new Melown.MapMetanode(this, [this.lod_, this.metatileIdx_ + x, this.metatileIdy_ + y], stream_));
            index_++;
        }
    }
};

/**
 * @constructor
 */
Melown.MapRefFrame = function(map_, id_, srs_, extents_, heightRange_, partitioning_) {
    this.map_ = map_;
    this.id_ = id_;
    this.srs_ = this.map_.getMapsSrs(srs_);
    this.extents_ = extents_;
    this.heightRange_ =  heightRange_;
    this.partitioning_ = partitioning_;
};


/**
 * @constructor
 */
Melown.MapRefFrames = function(map_, json_) {
    this.map_ = map_;
    this.proj4_ = map_.proj4_;
    this.valid_ = false;
    this.id_ = json_["id"] || null;
    this.description_ = json_["description"] || "";

    var model_ = json_["model"];

    if (model_ == null) {
        return;
    }

    this.model_ = {
        physicalSrs_ : this.map_.getMapsSrs(model_["physicalSrs"]),
        navigationSrs_ : this.map_.getMapsSrs(model_["navigationSrs"]),
        publicSrs_ : this.map_.getMapsSrs(model_["publicSrs"])
    };

    this.params_ = {};

    if (json_["parameters"] != null) {
        var params_ = json_["parameters"];
        this.params_.metaBinaryOrder_ = params_["metaBinaryOrder"] || 1;
        this.params_.navDelta_ = params_["navDelta"] || 8;
    }

    var division_ = json_["division"];

    if (division_ == null) {
        return;
    }

    this.division_ = {
        rootLod_ : division_["rootLod"] || 0,
        arity_ : division_["arity"] || null,
        heightRange_ : division_["heightRange"] || [0,1]
    };

    var extents_ = this.parseSpaceExtents(division_["extents"]);
    this.division_.extents_ = extents_;

    this.map_.spaceExtentSize_ = [extents_.ur_[0] - extents_.ll_[0], extents_.ur_[1] - extents_.ll_[1], extents_.ur_[2] - extents_.ll_[2]];
    this.map_.spaceExtentOffset_ = extents_.ll_;

    var divisionNodes_ = division_["nodes"];
    this.division_.nodes_ = [];

    if (divisionNodes_ == null) {
        return;
    }

    for (var i = 0, li = divisionNodes_.length; i < li; i++) {
        var node_ = this.parseNode(divisionNodes_[i]);
        this.division_.nodes_.push(node_);
    }

    this.valid_ = true;
};

Melown.MapRefFrames.prototype.parseNode = function(nodeData_) {
    var node_ = {
        srs_ : nodeData_["srs"],
        partitioning_ : nodeData_["partitioning"]
    };

    node_.extents_ = this.parseExtents(nodeData_["extents"]);

    var nodeId_ = nodeData_["id"];

    if (nodeId_ == null) {
        return;
    }

    node_.id_ = {
        lod_ : nodeId_["lod"] || 0,
        position_ : nodeId_["position"] || [0,0]
    };

    node_.refFrame_ = new Melown.MapRefFrame(this.map_, node_.id_, node_.srs_, node_.extents_, this.heightRange_, node_.partitioning_);
    //node_.refFrame_.loadResources();

    return node_;
};

Melown.MapRefFrames.prototype.parseExtents = function(extentsData_) {
    if (extentsData_ == null) {
        return { ll_ : [0,0], ur_ : [1,1] };
    }

    return {
        ll_ : extentsData_["ll"] || [0,0],
        ur_ : extentsData_["ur"] || [1,1]
    };
};

Melown.MapRefFrames.prototype.parseSpaceExtents = function(extentsData_) {
    if (extentsData_ == null) {
        return { ll_ : [0,0,0], ur_ : [1,1,1] };
    }

    return {
        ll_ : extentsData_["ll"] || [0,0,0],
        ur_ : extentsData_["ur"] || [1,1,1]
    };
};

Melown.MapRefFrames.prototype.getRefFrame = function(id_) {
    var lod_ = id_[0];

    var refFrame_ = null;
    var nodes_ = this.division_.nodes_;
    var rootLod_ = this.division_.rootLod_;

    if (lod_ < rootLod_) {
        return null;
    }

    //find root node
    for (var i = 0, li = nodes_.length_; i < li; i++) {
        var nodeId_ = nodes_[i].id_;

        if (rootLod_ == nodeId_.lod_) {
            refFrame_ = nodes_[i].refFrame_;
        }
    }

    //find nearest node
    for (var i = 0, li = nodes_.length_; i < li; i++) {
        var nodeId_ = nodes_[i].id_;

        if (lod_ >= nodeId_.lod_) {
            //TODO: reduce nodeId_ to id_
            var shift_ = (nodeId_.lod_ - lod_);
            var x = id_[1] >> shift_;
            var y = id_[2] >> shift_;

            if (nodeId_.position_[0] == x && nodeId_.position_[1] == y) {
                return nodes_[i].refFrame_;
            }
        }
    }

    return refFrame_;
};

Melown.MapRefFrames.prototype.convertCoords = function(coords_, source_, destination_) {
    var sourceSrs_, destinationSrs_;

    switch(source_) {
        case "public":     sourceSrs_ = this.model_.publicSrs_;     break;
        case "physical":   sourceSrs_ = this.model_.physicalSrs_;   break;
        case "navigation": sourceSrs_ = this.model_.navigationSrs_; break;
    }

    switch(destination_) {
        case "public":     destinationSrs_ = this.model_.publicSrs_;     break;
        case "physical":   destinationSrs_ = this.model_.physicalSrs_;   break;
        case "navigation": destinationSrs_ = this.model_.navigationSrs_; break;
    }

    return sourceSrs_.convertCoordsTo(coords_, destinationSrs_);
};




/**
 * @constructor
 */
Melown.MapSrs = function(map_, json_) {
    this.map_ = map_;
    this.proj4_ = map_.proj4_;
    this.comment_ = json_["comment"] || null;
    this.srsDef_ = json_["srsDef"] || null;
    this.srsModifiers_ = json_["srsModifiers"] || [];
    this.type_ = json_["type"] || "projected";
    this.vdatum_ = json_["vdatum"] || "orthometric";
    //this.srsDefEllps_ = json_["srsDefEllps"] || "";
    this.srsDef_ = json_["srsDefEllps"] || this.srsDef_;
    this.periodicity_ = this.parsePeriodicity(json_["periodicity"]);
    this.srsInfo_ = this.proj4_(this.srsDef_).info();
    this.geoidGrid_ = null;

    if (json_["geoidGrid"]) {
        var geoidGridData_ = json_["geoidGrid"];

        this.geoidGrid_ = {
            definition_ : geoidGridData_["definition"] || null,
            srsDefEllps_ : geoidGridData_["srsDefEllps"] || null,
            valueRange : geoidGridData_["valueRange"] || [0,1]
        };

        if (geoidGridData_["extents"] != null) {
            this.geoidGrid_.extents_ = {
                ll_ : geoidGridData_["extents"]["ll"],
                ur_ : geoidGridData_["extents"]["ur"]
            };
        } else {
            this.geoidGrid_.extents_ = {
                ll_ : [0,0],
                ur_ : [1,1]
            };
        }

    }


    if (this.type_ == "geographic") {
        this.spheroid_ = json_["spheroid"] || null;

        if (this.spheroid_ == null) {
            //TODO: return error
        }
    }

};

Melown.MapSrs.prototype.parsePeriodicity = function(periodicityData_) {
    if (periodicityData_ == null) {
        return null;
    }

    var periodicity_ = {
        "type" : periodicityData_["type"] || "",
        "period" : periodicityData_["period"] || 0
    };

    return periodicity_;
};

Melown.MapSrs.prototype.getSrsInfo = function() {
    return this.srsInfo_;
};

Melown.MapSrs.prototype.convertCoordsTo = function(coords_, srs_) {
    var coords2_ = this.proj4_(this.srsDef_, srs_.srsDef_, coords_);
    return coords2_;
};

Melown.MapSrs.prototype.convertCoordsFrom = function(coords_, srs_) {
    var srsDef_ = (typeof srs_ === "string") ? srs_ : srs_.srsDef_;
//    var coords2_ = this.proj4_(this.srsDef_, srsDef_, coords_);
    var coords2_ = this.proj4_(srsDef_, this.srsDef_, coords_);
//    var coords2_ = this.proj4_(srsDef_, coords_);
    return coords2_;
};



/**
 * @constructor
 */
Melown.MapStats = function(map_) {
    this.map_ = map_;
    this.core_ = map_.core_;
    this.inspector_ = map_.core_.inspector_;
    this.drawnTiles_ = 0;
    this.drawnFaces_ = 0;
    this.counter_ = 0;
    this.statsCycle_ = 0;
    this.fps_ = 0;
    this.frameTime_ = 0;
    this.renderTime_ = 0;
    this.renderTimeTmp_ = 0;
    this.renderTimeBegin_ = 0;

    this.recordGraphs_ = false;
    this.graphsTimeIndex_ = 0;
    this.graphsLastTimeIndex_ = 0;
    this.graphsTimeSamples_ = 500;
    this.graphsRenderTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCreateMeshTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCreateGpuMeshTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCreateTextureTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsFrameTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCpuMemoryMetatiles_ = new Array(this.graphsTimeSamples_);
    this.graphsCpuMemoryUsed_ = new Array(this.graphsTimeSamples_);
    this.graphsGpuMemoryTextures_ = new Array(this.graphsTimeSamples_);
    this.graphsGpuMemoryMeshes_ = new Array(this.graphsTimeSamples_);
    this.graphsPolygons_ = new Array(this.graphsTimeSamples_);
    this.graphsLODs_ = new Array(this.graphsTimeSamples_);
    this.graphsFluxTextures_ = new Array(this.graphsTimeSamples_);
    this.graphsFluxMeshes_ = new Array(this.graphsTimeSamples_);
    this.graphsFluxTexture_ = [[0,0],[0,0]];
    this.graphsFluxMesh_ = [[0,0],[0,0]];
    this.graphsCreateTextureTime_ = 0;
    this.graphsCreateGpuMeshTime_ = 0;
    this.graphsCreateMeshTime_ = 0;
    this.resetGraphs();

    this.gpuMeshesUsed_ = 0;
    this.gpuTexturesUsed_ = 0;
    this.gpuUsed_ = 0;
    this.resourcesUsed_ = 0;
    this.metaUsed_ = 0;

};

Melown.MapStats.prototype.resetGraphs = function() {
    this.graphsTimeIndex_ = 0;

    for (var i = 0; i < this.graphsTimeSamples_; i++) {
        this.graphsRenderTimes_[i] = 0;
        this.graphsCreateMeshTimes_[i] = 0;
        this.graphsCreateGpuMeshTimes_[i] = 0;
        this.graphsCreateTextureTimes_[i] = 0;
        this.graphsFrameTimes_[i] = 0;
        this.graphsCpuMemoryUsed_[i] = 0;
        this.graphsCpuMemoryMetatiles_[i] = 0;
        this.graphsGpuMemoryTextures_[i] = 0;
        this.graphsGpuMemoryMeshes_[i] = 0;
        this.graphsPolygons_[i] = 0;
        this.graphsLODs_[i] = [0,[]];
        this.graphsFluxTextures_[i] = [[0,0],[0,0]];
        this.graphsFluxMeshes_[i] = [[0,0],[0,0]];
    }
};

Melown.MapStats.prototype.begin = function() {
    this.drawnTiles_ = 0;
    this.drawnFaces_ = 0;
    this.counter_++;
    this.statsCycle_++;

    this.renderTimeBegin_ = performance.now();

};

Melown.MapStats.prototype.end = function() {

    var timer_ = performance.now();

    var renderTime_ = timer_ - this.renderTimeBegin_;
    var frameTime_ = timer_ - this.frameTime_;
    this.frameTime_ = timer_;
    this.renderTimeTmp_ += renderTime_;

    if (this.recordGraphs_) {
        var i = this.graphsTimeIndex_;

        this.graphsRenderTimes_[i] = renderTime_;
        this.graphsCreateMeshTimes_[i] = 0;
        this.graphsCreateGpuMeshTimes_[i] = 0;
        this.graphsCreateTextureTimes_[i] = 0;
        this.graphsFrameTimes_[i] = frameTime_;
        this.graphsCpuMemoryUsed_[i] = this.map_.resourcesCache_.totalCost_;
        this.graphsCpuMemoryMetatiles_[i] = this.map_.metatileCache_.totalCost_;
        this.graphsGpuMemoryTextures_[i] = this.gpuTexturesUsed_;
        this.graphsGpuMemoryMeshes_[i] = this.gpuMeshesUsed_;
        this.graphsPolygons_[i] = this.drawnFaces_;

        this.graphsTimeIndex_ = (this.graphsTimeIndex_ + 1) % this.graphsTimeSamples_;
        this.inspector_.updateGraphs(this);
    }


    if ((this.statsCycle_ % 100) == 0) {
        this.renderTime_ = this.renderTimeTmp_ / 100;
        this.fps_ = 1000 / this.renderTime_;
        this.renderTimeTmp_ = 0;

        if (this.inspector_ != null) {
            this.gpuUsed_ = this.map_.gpuCache_.totalCost_;
            this.resourcesUsed_ = this.map_.resourcesCache_.totalCost_;
            this.metaUsed_ = this.map_.metatileCache_.totalCost_;

            this.inspector_.updateStatsPanel(this);
        }
    }
};



//! An index-less mesh. Each triangle has three items in the array 'vertices'.

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

/** @const */ MelownSubmeshFlags_InternalTexcoords =  1;
/** @const */ MelownSubmeshFlags_ExternalTexcoords =  2;
/** @const */ MelownSubmeshFlags_PerVertexUndulation =  4;
/** @const */ MelownSubmeshFlags_TextureMode =  8;

/**
 * @constructor
 */
Melown.MapSubmesh = function(mesh_, stream_) {
    this.generateLines_ = true;
    this.map_ = mesh_.map_;
    this.vertices_ = null;
    this.internalUVs_ = null;
    this.externalUVs_ = null;
    this.undulationDeltas_ = null;

    this.bbox_ = new Melown.BBox();
    this.size_ = 0;
    this.faces_ = 0;

    if (stream_ != null) {
        this.parseSubmesh(stream_);
    }
};

Melown.MapSubmesh.prototype.kill = function () {
    this.vertices_ = null;
    this.internalUVs_ = null;
    this.externalUVs_ = null;
    this.undulationDeltas_ = null;
};

//! Reads the mesh from the binary representation.
Melown.MapSubmesh.prototype.parseSubmesh = function (stream_) {

/*
struct MapSubmesh {
    struct MapSubmeshHeader header;
    struct VerticesBlock vertices;
    struct TexcoordsBlock internalTexcoords;   // if header.flags & ( 1 << 0 )
    struct FacesBlock faces;
};
*/
    this.parseHeader(stream_);
    this.parseVertices(stream_);

    if (this.flags_ & MelownSubmeshFlags_InternalTexcoords) {
        this.parseTexcoords(stream_);
    }

    this.parseFaces(stream_);
};

Melown.MapSubmesh.prototype.parseHeader = function (stream_) {

/*
struct MapSubmeshHeader {
    char flags;                    // bit 0 - contains internal texture coords
                                   // bit 1 - contains external texture coords
                                   // bit 2 - contains per vertex undulation
                                   // bit 3 - texture mode (0 - internal, 1 - external)

    ushort textureLayer;           // applicable if texture mode is external: texture layer numeric id
    double boundingBox[2][3];      // read more about bounding box bellow
};
*/

    var streamData_ = stream_.data_;

    this.flags_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.textureLayer_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    var bboxMin_ = this.bbox_.min_;
    var bboxMax_ = this.bbox_.max_;

    bboxMin_[0] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMin_[1] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMin_[2] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;

    bboxMax_[0] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMax_[1] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMax_[2] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
};

Melown.MapSubmesh.prototype.parseVertices = function (stream_) {
/*
struct VerticesBlock {
    ushort numVertices;              // number of vertices

    struct Vertex {                  // array of vertices, size of array is defined by numVertices property
        // vertex coordinates
        ushort x;
        ushort y;
        ushort z;

        // if header.flags & ( 1 << 1 ): external texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort eu;
        ushort ev;

        // if header.flags & ( 1 << 2 ): undulation delta
        float16 undulationDelta;
    } vertices[];
};
*/

    var data_ = stream_.data_;
    var index_ = stream_.index_;

    var numVertices_ = data_.getUint16(stream_.index_, true); index_ += 2;

    var externalUVs_ = null;
    var undulationDeltas_ = null;

    var vertices_ = new Float32Array(numVertices_ * 3);//[];

    if (this.flags_ & MelownSubmeshFlags_ExternalTexcoords) {
        externalUVs_ = new Float32Array(numVertices_ * 2);//[];
    }

    if (this.flags_ & MelownSubmeshFlags_PerVertexUndulation) {
        undulationDeltas_ = new Float32Array(numVertices_);//[];
    }

    var uvfactor_ = 1.0 / 65535;
    var vfactor_ = uvfactor_;
    var ufactor_ = uvfactor_;

    for (var i = 0; i < numVertices_; i++) {
        var vindex_ = i * 3;
        vertices_[vindex_] = data_.getUint16(index_, true) * vfactor_; index_ += 2;
        vertices_[vindex_+1] = data_.getUint16(index_, true) * vfactor_; index_ += 2;
        vertices_[vindex_+2] = data_.getUint16(index_, true) * vfactor_; index_ += 2;

        if (externalUVs_ != null) {
            var uvindex_ = i * 2;
            externalUVs_[uvindex_] = data_.getUint16(index_, true) * uvfactor_; index_ += 2;
            externalUVs_[uvindex_+1] = data_.getUint16(index_, true) * uvfactor_; index_ += 2;
        }

        if (undulationDeltas_ != null) {
            undulationDeltas_[i] = data_.getUint16(index_, true) * ufactor_; index_ += 2;
        }
    }


    this.tmpVertices_ = vertices_;
    this.tmpExternalUVs_ = externalUVs_;
    this.undulationDeltas_ = undulationDeltas_;

    stream_.index_ = index_;

};

Melown.MapSubmesh.prototype.parseTexcoords = function (stream_) {
/*
struct TexcoorsBlock {
    ushort numTexcoords;              // number of texture coordinates

    struct TextureCoords {            // array of texture coordinates, size of array is defined by numTexcoords property

        // internal texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort u;
        ushort v;
    } texcoords[];
};
*/

    var data_ = stream_.data_;
    var index_ = stream_.index_;

    var numUVs_ = data_.getUint16(stream_.index_, true); index_ += 2;

    var internalUVs_ = new Float32Array(numUVs_ * 2);//[];
    var uvfactor_ = 1.0 / 65535;

    for (var i = 0, li = numUVs_ * 2; i < li; i+=2) {
        internalUVs_[i] = data_.getUint16(index_, true) * uvfactor_; index_ += 2;
        internalUVs_[i+1] = (65535 - data_.getUint16(index_, true)) * uvfactor_; index_ += 2;
    }

    this.tmpInternalUVs_ = internalUVs_;

    stream_.index_ = index_;
};

Melown.MapSubmesh.prototype.parseFaces = function (stream_) {
/*
struct FacesBlock {
    ushort numFaces;              // number of faces

    struct Face {                 // array of faces, size of array is defined by numFaces property

        ushort v[3]; // array of indices to stored vertices
        ushort t[3]; // if header.flags & ( 1 << 0 ): array of indices to stored internal texture coords

    } faces[];
};
*/

    var data_ = stream_.data_;
    var index_ = stream_.index_;

    var numFaces_ = data_.getUint16(stream_.index_, true); index_ += 2;

    var internalUVs_ = null;
    var externalUVs_ = null;

    var vertices_ = new Float32Array(numFaces_ * 3 * 3);//[];

    if (this.flags_ & MelownSubmeshFlags_InternalTexcoords) {
        internalUVs_ = new Float32Array(numFaces_ * 3 * 2);//[];
    }

    if (this.flags_ & MelownSubmeshFlags_ExternalTexcoords) {
        externalUVs_ = new Float32Array(numFaces_ * 3 * 2);//[];
    }

    var vtmp_ = this.tmpVertices_;
    var eUVs_ = this.tmpExternalUVs_;
    var iUVs_ = this.tmpInternalUVs_;
    //var uds = this.undulationDeltas_;

    for (var i = 0; i < numFaces_; i++) {
        var vindex_ = i * (3 * 3);
        var v1 = data_.getUint16(index_, true); index_ += 2;
        var v2 = data_.getUint16(index_, true); index_ += 2;
        var v3 = data_.getUint16(index_, true); index_ += 2;

        //var dindex_ = i * (3 * 3);
        var sindex_ = v1 * 3;
        vertices_[vindex_] = vtmp_[sindex_];
        vertices_[vindex_+1] = vtmp_[sindex_+1];
        vertices_[vindex_+2] = vtmp_[sindex_+2];

        sindex_ = v2 * 3;
        vertices_[vindex_+3] = vtmp_[sindex_];
        vertices_[vindex_+4] = vtmp_[sindex_+1];
        vertices_[vindex_+5] = vtmp_[sindex_+2];

        sindex_ = v3 * 3;
        vertices_[vindex_+6] = vtmp_[sindex_];
        vertices_[vindex_+7] = vtmp_[sindex_+1];
        vertices_[vindex_+8] = vtmp_[sindex_+2];

        if (externalUVs_ != null) {
            vindex_ = i * (3 * 2);
            externalUVs_[vindex_] = eUVs_[v1*2];
            externalUVs_[vindex_+1] = eUVs_[v1*2+1];
            externalUVs_[vindex_+2] = eUVs_[v2*2];
            externalUVs_[vindex_+3] = eUVs_[v2*2+1];
            externalUVs_[vindex_+4] = eUVs_[v3*2];
            externalUVs_[vindex_+5] = eUVs_[v3*2+1];
        }

        if (internalUVs_ != null) {
            v1 = data_.getUint16(index_, true); index_ += 2;
            v2 = data_.getUint16(index_, true); index_ += 2;
            v3 = data_.getUint16(index_, true); index_ += 2;

            vindex_ = i * (3 * 2);
            internalUVs_[vindex_] = iUVs_[v1*2];
            internalUVs_[vindex_+1] = iUVs_[v1*2+1];
            internalUVs_[vindex_+2] = iUVs_[v2*2];
            internalUVs_[vindex_+3] = iUVs_[v2*2+1];
            internalUVs_[vindex_+4] = iUVs_[v3*2];
            internalUVs_[vindex_+5] = iUVs_[v3*2+1];
        }
    }

    this.vertices_ = vertices_;
    this.internalUVs_ = internalUVs_;
    this.externalUVs_ = externalUVs_;
    //this.undulationDeltas_ = undulationDeltas_;

    this.tmpVertices_ = null;
    this.tmpInternalUVs_ = null;
    this.tmpExternalUVs_ = null;

    stream_.index_ = index_;

    this.size_ = this.vertices_.length;
    if (this.internalUVs_) this.size_ += this.internalUVs_.length;
    if (this.externalUVs_) this.size_ += this.externalUVs_.length;
    if (this.undulationDeltas_) this.size_ += this.undulationDeltas_.length;
    this.size_ *= 4;
    this.faces_ = numFaces_;

};


//! Returns RAM usage in bytes.
Melown.MapSubmesh.prototype.size = function () {
    return this.size_;
};

Melown.MapSubmesh.prototype.fileSize = function () {
    return this.fileSize_;
};

Melown.MapSubmesh.prototype.buildGpuMesh = function () {
    return new Melown.GpuMesh(this.map_.renderer_.gpu_, {
            bbox_: this.bbox_,
            vertices_: this.vertices_,
            uvs_: this.internalUVs_,
            uvs2_: this.externalUVs_
        }, 1, this.map_.core_);
};

Melown.MapSubmesh.prototype.getWorldMatrix = function(geoPos_, matrix_) {
    // Note: the current camera geographic position (geoPos) is not necessary
    // here, in theory, but for numerical stability (OpenGL ES is float only)
    // we get rid of the large UTM numbers in the following subtractions. The
    // camera effectively stays in the position [0,0] and the tiles travel
    // around it. (The Z coordinate is fine and is not handled in this way.)

    var m = matrix_;

    if (m != null) {
        m[0] = this.bbox_.side(0); m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = this.bbox_.side(1); m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = this.bbox_.side(2); m[11] = 0;
        m[12] = this.bbox_.min_[0] - geoPos_[0]; m[13] = this.bbox_.min_[1] - geoPos_[1]; m[14] = this.bbox_.min_[2] - geoPos_[2]; m[15] = 1;
    } else {
        var m = Melown.mat4.create();

        Melown.mat4.multiply( Melown.translationMatrix(this.bbox_.min_[0] - geoPos_[0], this.bbox_.min_[1] - geoPos_[1], this.bbox_.min_[2] - geoPos_[2]),
                       Melown.scaleMatrix(this.bbox_.side(0), this.bbox_.side(1), this.bbox_.side(2)), m);
    }

    return m;
};

Melown.MapSubmesh.prototype.drawBBox = function(cameraPos_) {
    var renderer_ = this.map_.renderer_;

    renderer_.gpu_.useProgram(renderer_.progBBox_, "aPosition");

    var mvp_ = Melown.mat4.create();
    var mv_ = Melown.mat4.create();

    Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), this.getWorldMatrix(cameraPos_), mv_);

    var proj_ = renderer_.camera_.getProjectionMatrix();
    Melown.mat4.multiply(proj_, mv_, mvp_);

    renderer_.progBBox_.setMat4("uMVP", mvp_);

    //draw bbox
    renderer_.bboxMesh_.draw(renderer_.progBBox_, "aPosition");
};

/**
 * @constructor
 */
Melown.MapSurface = function(map_, json_) {
    this.map_ = map_;
    this.id_ = json_["id"] || null;
    this.metaBinaryOrder_ = json_["metaBinaryOrder"] || 1;
    this.metaUrl_ = json_["metaUrl"] || "";
    this.navUrl_ = json_["navUrl"] || "";
    this.navDelta_ = json_["navDelta"] || 1;
    this.meshUrl_ = json_["meshUrl"] || "";
    this.textureUrl_ = json_["textureUrl"] || "";
    this.lodRange_ = json_["lodRange"] || [0,0];
    this.tileRange_ = json_["tileRange"] || [[0,0],[0,0]];
};

Melown.MapSurface.prototype.hasTile = function(id_) {
    var shift_ = id_[0] - this.lodRange_[0];

    if (shift_ < 0) {
        return false;
    }

    var x = id_[1] >> shift_;
    var y = id_[2] >> shift_;

    if (id_[0] < this.lodRange_[0] || id_[0] > this.lodRange_[1] ||
        x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
        y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
        return false;
    }

    return true;
};

Melown.MapSurface.prototype.hasMetatile = function(id_) {
    if (id_[0] > this.lodRange_[1]) {
        return false;
    }

    var shift_ = id_[0] - this.lodRange_[0];

    if (shift_ >= 0) {
        var x = id_[1] >> shift_;
        var y = id_[2] >> shift_;

        if (x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
            y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
            return false;
        }

    } else {
        shift_ = -shift_;

        if (id_[1] < (this.tileRange_[0][0]>>shift_) || id_[1] > (this.tileRange_[1][0]>>shift_) ||
            id_[2] < (this.tileRange_[0][1]>>shift_) || id_[2] > (this.tileRange_[1][1]>>shift_) ) {
            return false;
        }
    }

    return true;
};

Melown.MapSurface.prototype.getMetaUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.metaUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getNavUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.navUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getMeshUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.meshUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getTexureUrl = function(id_, subId_, skipBaseUrl_) {
    return this.map_.makeUrl(this.textureUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, subId_, skipBaseUrl_);
};








/**
 * @constructor
 */
Melown.MapTexture = function(map_, path_) {
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.image_ = null;
    this.gpuTexture_ = null;
    this.loadState_ = 0;
    this.mapLoaderUrl_ = path_;

    this.cacheItem_ = null; //store killImage
    this.gpuCacheItem_ = null; //store killGpuTexture
};

Melown.MapTexture.prototype.kill = function() {
    this.texture_ = null;
    this.killImage();
    this.killGpuTexture();
    this.tile_.validate();
};

Melown.MapTexture.prototype.killImage = function(killedByCache_) {
    this.image_ = null;

    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        this.tile_.validate();
    }

    this.loadState_ = 0;
    this.cacheItem_ = null;
};

Melown.MapTexture.prototype.killGpuTexture = function(killedByCache_) {
    if (this.gpuTexture_ != null) {
        this.stats_.gpuTexturesUsed_ -= this.gpuTexture_.size_;
        this.gpuTexture_.kill();
    }

    this.gpuTexture_ = null;

    if (killedByCache_ != true && this.gpuCacheItem_ != null) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
        this.tile_.validate();
    }

    this.gpuCacheItem_ = null;
};

Melown.MapTexture.prototype.isReady = function() {
    if (this.loadState_ == 2) { //loaded
        if (this.gpuTexture_ == null) {
            this.buildGpuTexture();
        }

        this.map_.resourcesCache_.updateItem(this.cacheItem_);
        this.map_.gpuCache_.updateItem(this.gpuCacheItem_);

        return true;
    } else {
        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress
    }

    return false;
};

Melown.MapTexture.prototype.scheduleLoad = function() {
    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this));
};

Melown.MapTexture.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    var image_ = new Image();
    image_.onerror = this.onLoadError.bind(this);
    image_.onload = this.onLoaded.bind(this);
    image_.crossOrigin = Melown.isSameOrigin(url_) ? "use-credentials" : "anonymous";
    image_.src = url_;

    this.image_ = image_;

    this.loadState_ = 1;
};

Melown.MapTexture.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapTexture.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    var size_ = this.image_.naturalWidth * this.image_.naturalHeight * 3;

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killImage.bind(this, true), size_);

    this.loadState_ = 2;
    this.mapLoaderCallLoaded_();
};

Melown.MapTexture.prototype.buildGpuTexture = function () {
    this.gpuTexture_ = new Melown.GpuTexture(this.map_.renderer_.gpu_, null, this.map_.core_);
    this.gpuTexture_.createFromImage(this.image_, "linear", false);
    this.stats_.gpuTexturesUsed_ += this.gpuTexture_.size_;

    this.gpuCacheItem_ = this.map_.gpuCache_.insert(this.killGpuTexture.bind(this, true), this.gpuTexture_.size_);
};

/**
 * @constructor
 */
Melown.MapTile = function(map_, parent_, id_) {
    this.map_ = map_;
    this.id_ = id_;
    this.parent_ = parent_;
    this.viewCoutner_ = 0;

    this.metanode_ = null;  //[metanode, cacheItem]
    this.metastorage_ = null; //link to metatile storage

    this.surface_ = null; //surface or glue
    this.surfaceMesh_ = null;
    this.surfaceGeodata_ = null; //probably only used in free layers
    this.surfaceTextures_ = [];

    this.empty_ = true;

    this.updateBounds_ = false;
    this.boundTextures_ = {};

    this.heightMap_ = null;

    this.children_ = [null, null, null, null];
};

Melown.MapTile.prototype.kill = function() {
    //kill children
    for (var i = 0; i < 4; i++) {
        if (this.children_[i] != null) {
            this.children_[i].kill();
        }
    }

    if (this.surfaceMesh_ != null) {
        this.surfaceMesh_.kill();
    }

    for (var key in this.surfaceTextures_) {
        if (this.surfaceTextures_[key_] != null) {
            this.surfaceTextures_[key_].kill();
        }
    }

    if (this.surfaceGeodata_ != null) {
        this.surfaceGeodata_.kill();
    }

    if (this.heightMap_ != null) {
        this.heightMap_.kill();
    }

    for (var key in this.layerTextures_) {
        if (this.layerTextures_[key_] != null) {
            this.layerTextures_[key_].kill();
        }
    }

    this.metanode_ = null;
    this.metastorage_ = null;

    this.surface_ = null;
    this.surfaceMesh_ = null;
    this.surfaceTextures_ = [];
    this.surfaceGeodata_ = null;

    this.layerIndex_ = null;
    this.layerTextures_ = [];

    this.heightMap_ = null;

    this.children_ = [null, null, null, null];

    var parent_ = this.parent_;
    this.parent_ = null;

    if (parent_ != null) {
        parent_.removeChild(this);
    }
};

Melown.MapTile.prototype.validate = function() {
    //is tile empty?
    if (this.metastorage_ == null || this.metastorage_.getMetatile(this.surface_) == false) {
        this.kill();
    }

};

Melown.MapTile.prototype.addChild = function(index_) {
    var id_ = this.id_;
    var childId_ = [id_[0] + 1, id_[1] << 1, id_[2] << 1];

    switch (index_) {
        case 1: childId_[1]++; break;
        case 2: childId_[2]++; break;
        case 3: childId_[1]++; childId_[2]++; break;
    }

    this.children_[index_] = new Melown.MapTile(this.map_, this, childId_);
};

Melown.MapTile.prototype.removeChildByIndex = function(index_) {
    if (this.children_[index_] != null) {
        this.children_[index_].kill();
        this.children_[index_] = null;
    }
};

Melown.MapTile.prototype.removeChild = function(tile_) {
    for (var i = 0; i < 4; i++) {
        if (this.children_[i] == tile_) {
            this.children_[i].kill();
            this.children_[i] = null;
        }
    }
};


//MapTileMetacache

//MapTileData

/**
 * @constructor
 */
Melown.MapTree = function(map_, rootId_, refFrame_, freeLayer_) {
    this.map_ = map_;
    this.camera_ = map_.camera_;
    this.rootId_ = rootId_;
    this.refFrame_ = refFrame_;
    this.freeLayer_ = freeLayer_;
    this.metaBinaryOrder_ = this.map_.referenceFrames_.params_.metaBinaryOrder_;
    this.initialized_ = false;

    this.surfaceTree_ = new Melown.MapTile(this.map_, null, rootId_);
    this.metastorageTree_ = new Melown.MapMetastorage(this.map_, null, rootId_);

    this.surfaceTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceSurfaceTile.bind(this));

    if (freeLayer_ != true) {
        this.heightTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceSurfaceTileHeight.bind(this));
    }

    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = 1.0;
};

Melown.MapTree.prototype.kill = function() {
    this.surfaceTree_ = null;
    this.metastorageTree_ = null;
    this.surfaceTracer_ = null;
    this.heightTracer_ = null;
};

Melown.MapTree.prototype.init = function() {
    var url_ = this.map_.makeUrl(surface.metaUrl_, {lod_:result_[0], ix_:result_[1], iy_:result_[2] });
    map_.loader_.load(url_, metatile_.load_.bind(metatile_, url_));

    this.metatileTree_.load();
    this.surfaceTree_.metatile_ = 1;

    this.initialized_ = true;
};

Melown.MapTree.prototype.draw = function() {
    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = this.map_.ndcToScreenPixel_;

    var refFrame_ = this.refFrame_;
    var periodicity_ = this.refFrame_.srs_.periodicity_;

    if (periodicity_ != null) {
        this.drawSurface([0,0,0]);

        if (periodicity_.type_ == "X") {
            this.drawSurface([periodicity_.period_,0,0]);
            this.drawSurface([-periodicity_.period_,0,0]);
        }

    } else {
        this.drawSurface([0,0,0]);
    }
};

Melown.MapTree.prototype.drawSurface = function(shift_) {
    this.surfaceTracer_.trace(this.rootId_);
};

Melown.MapTree.prototype.traceSurfaceTile = function(tile_, pos_, lod_) {

    var node_ = tile_.metanode_;

    if (node_ == null) {
        return false;
    }

    var cameraPos_ = this.map_.navCameraPosition_;

    if (this.camera_.bboxVisible(node_.bbox_, cameraPos_) != true) {
        return false;
        //return true;
    }

    var pixelSize_;

    if (node_.hasGeometry()) {
        var screenPixelSize_ = Number.POSITIVE_INFINITY;

        if (node_.usedTexelSize()) {
            screenPixelSize_ = this.ndcToScreenPixel_ * node_.pixelSize_;
        } else if (node_.usedDisplaySize()) {
            screenPixelSize_ = this.ndcToScreenPixel_ * (node_.bbox_.maxSize_ / node_.displaySize_);
        }

        if (this.camera_.ortho_ == true) {
            var height_ = this.camera_.getViewHeight();
            pixelSize_ = [(screenPixelSize_*2.0) / height_, height_];
        } else {
            pixelSize_ = this.tilePixelSize(node_.bbox_, screenPixelSize_, cameraPos_, cameraPos_, true);
        }
    } else {
        pixelSize_ = [Number.POSITIVE_INFINITY, 99999];
    }


    if (node_.hasChildren() == false || pixelSize_[0] < 1.1) {

        this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_);

        return false;
    }



    //node_.drawBBox(cameraPos_);

/*
    if (this.camera_.bboxVisible(node_.bbox_) != true) {
        return false;
    }
*/

    //if (node_.id_[0] <= 11) {
    //    return true;
        //node_.drawBBox(cameraPos_);
    //}


//    if (true && node_.id_[0] == 19 && tile_.surface_ != null) {


    //if (tile_.metanode_.bbox_)

    return true;
};

Melown.MapTree.prototype.traceSurfaceTileHeight = function(tile_, pos_, lod_) {
    if (lod_ >= tile_.lod_) {

        //get height from height map

        if (tile_.heightMap_ == null) {
            //load height map
        }

        //compute height map coords
        //get height form height map

        this.measurements_.height_ = height_;
        return false;

    } else {

        //get needed child

    }

    return true;
};


Melown.MapTree.prototype.tilePixelSize = function(bbox_, screenPixelSize_, cameraPos_, worldPos_, returnDistance_) {
    var min_ = bbox_.min_;
    var max_ = bbox_.max_;
    /*
    var tileSize_ = max_[0]-min_[0]; //get tile size
    var tilePos_ = [min_[0]-worldPos_[0], min_[1]-worldPos_[1], min_[2]-worldPos_[2]]; //get global pos
    var tilePos2_ = [tilePos_[0] + tileSize_, tilePos_[1], tilePos_[2]];
    var tilePos3_ = [tilePos_[0] + tileSize_, tilePos_[1] + tileSize_, tilePos_[2]];
    var tilePos4_ = [tilePos_[0], tilePos_[1] + tileSize_, tilePos_[2]];
    */

    var tilePos_ = [min_[0] - cameraPos_[0], min_[1] - cameraPos_[1]];
    var tilePos2_ = [max_[0] - cameraPos_[0], min_[1] - cameraPos_[1]];
    var tilePos3_ = [max_[0] - cameraPos_[0], max_[1] - cameraPos_[1]];
    var tilePos4_ = [min_[0] - cameraPos_[0], max_[1] - cameraPos_[1]];

    var h1_ = min_[2] - cameraPos_[2];
    var h2_ = max_[2] - cameraPos_[2];

    var factor_ = 0;

    //find bbox sector
    if (0 < tilePos_[1]) { //top row
        if (0 < tilePos_[0]) { // left top corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], 0], returnDistance_);
            }
        } else if (0 > tilePos2_[0]) { // right top corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], 0], returnDistance_);
            }
        } else { //top side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], 0], returnDistance_);
            }
        }
    } else if (0 > tilePos4_[1]) { //bottom row
        if (0 < tilePos4_[0]) { // left bottom corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], 0], returnDistance_);
            }
        } else if (0 > tilePos3_[0]) { // right bottom corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], 0], returnDistance_);
            }
        } else { //bottom side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], 0], returnDistance_);
            }
        }
    } else { //middle row
        if (0 < tilePos4_[0]) { // left side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, 0], returnDistance_);
            }
        } else if (0 > tilePos3_[0]) { // right side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, 0], returnDistance_);
            }
        } else { //center
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, 0, 0], returnDistance_);
            }
        }
    }

    //console.log("new: " + (factor_ * screenPixelSize_) + " old:" + this.tilePixelSize2(node_) );

    if (returnDistance_ == true) {
        return [(factor_[0] * screenPixelSize_), factor_[1]];
    }

    return (factor_ * screenPixelSize_);
};

Melown.Map.prototype.quad = function(lod_, ix, iy) {
    var quadKey = "";
    //ty = Math.pow(2,zoom - 1) - ty;
    for (i = lod_; i > 0; i--) {
        var digit = 0;
        var mask = 1 << (i-1);
        if ((ix & mask) != 0) {
            digit += 1;
        }

        if ((iy & mask) != 0) {
            digit += 2;
        }

        quadKey += digit;
    }

    return quadKey;
};

Melown.Map.prototype.msDigit = function(iy, ix) {
    return (((iy & 3) << 1) + (ix & 1));
};

Melown.Map.prototype.processUrlFunction = function(id_, counter_, string_) {
    if (typeof string_ == "string") {
        if (string_.indexOf("quad") != -1) {
            var string2_ = "(function(lod,x,y){" + string_.replace("quad", "return this.quad") + "})";

            try {
                var fc_ = eval(string2_).bind(this);
                return fc_(id_.lod_, id_.ix_, id_.iy_);
            } catch(e) {
                return string_;
            }
        } else if (string_.indexOf("ms_digit") != -1) {
            var string2_ = "(function(x,y){" + string_.replace("ms_digit", "return this.msDigit") + "})";

            try {
                var fc_ = eval(string2_).bind(this);
                return fc_(id_.ix_, id_.iy_);
            } catch(e) {
                return string_;
            }

        } else if (string_.indexOf("alt") != -1) {

            var result_ = /\(([^)]*)\)/.exec(string_);

            if (result_ && result_[1]) {
                var strings_ = result_[1].match(/([^,]+)/g);

                if (strings_.length > 0) {
                    return strings_[(counter_ % strings_.length)];
                }
            }

            return string_;

        } else {
            return string_;
        }

    } else {
        return string_;
    }

};

Melown.Map.prototype.makeUrl = function(templ_, id_, subId_, skipBaseUrl_) {
    //if (templ_.indexOf("jpg") != -1) {
       //templ_ = "{lod}-{easting}-{northing}.jpg?v=4";
       //templ_ = "{lod}-{x}-{y}.jpg?v=4";
       //templ_ = "{quad(lod,x,y)}.jpg?v=4";
       //templ_ = "{quad(lod,x+1,y*2)}.jpg?v=4";
       //templ_ = "{lod}-{ms_digit(x,y)}.jpg?v=4";
    //}
    //templ_ = "maps{alt(1,2,3,4)}.irist-test.citationtech.net/map/{lod}-{x}-{y}.jpg?v=4";

    //var worldParams_ = id_.getWorldParams();
    //var url_ = Melown.simpleFmtObjOrCall(templ_, {"lod":id_.lod_, "easting":Melown.padNumber(worldParams_[0], 7), "northing":Melown.padNumber(worldParams_[1], 7),
    var url_ = Melown.simpleFmtObjOrCall(templ_, {"lod":id_.lod_,  "x":id_.ix_, "y":id_.iy_, "sub": subId_,
                                                    "here_app_id": "abcde", "here_app_code":"12345"},
                                           this.processUrlFunction.bind(this, id_, this.urlCounter_));

    this.urlCounter_++;

    if (skipBaseUrl_) {
        return url_;
    } else {
        return this.baseURL_ + url_;
    }
};

/**
 * @constructor
 */
Melown.MapView = function(map_, json_) {
    this.map_ = map_;
    this.id_ = json_["id"] || null;
    this.description_ = json_["description"] || "";
    this.surfaces_ = json_["surfaces"] || [];
    this.boundLayers_ = json_["type"] || [];
    this.freeLayers_ = json_["freeLayers"] || [];
};/**
 * @constructor
 */
Melown.Core = function(element_, options_) {
    this.element_ = element_;
    this.options_ = options_;
    this.coreConfig_ = new Melown.CoreConfig(options_);
    this.ready_ = false;
    this.killed_ = false;
    this.listeners_ = [];
    this.listenerCounter_ = 0;
    this.inspector_ = (Melown.Inspector != null) ? (new Melown.Inspector(this)) : null;

    this.map_ = null;
    this.mapInterface_ = null;
    this.renderer_ = new Melown.Renderer(this, this.element_, null, false);
    this.rendererInterface_ = new Melown.RendererInterface(this.renderer_);
    this.proj4_ = window["_mproj4_"];

    //platform detection
    Melown.Platform.init();

    this.loadMap(this.coreConfig_.map_);

    window.requestAnimFrame(this.onUpdate.bind(this));
};

Melown.Core.prototype.loadMap = function(path_) {
    if (this.map_ != null) {
        this.map_.kill();
        this.map_ = null;
        this.mapInterface_ = null;
        this.callListener("map-unloaded", {});
    }

    if (path_ == null) {
        return;
    }

    var onLoaded_ = (function(data_) {
        this.map_ = new Melown.Map(this, data_, path_);
        this.mapInterface_ = new Melown.MapInterface(this.map_);
        this.callListener("map-loaded", {});
    }).bind(this);

    var onError_ = (function() {
    }).bind(this);


    Melown.loadJSON(path_, onLoaded_, onError_);
};

Melown.Core.prototype.getMap = function() {
    return this.map_;
};

Melown.Core.prototype.getMapInterface = function() {
    return this.mapInterface_;
};

Melown.Core.prototype.getRenderer = function() {
    return this.renderer_;
};

Melown.Core.prototype.getRendererInterface = function() {
    return this.rendererInterface_;
};

Melown.Core.prototype.getProj4 = function() {
    return this.proj4_;
};

Melown.Core.prototype.getOption = function(key_, value_) {
};

Melown.Core.prototype.setOption = function(key_, value_) {
};

Melown.Core.prototype.on = function(name_, listener_) {

    if (this.killed_ == true) { // || this.renderer_ == null) {
        return;
    }

    if (listener_ == null) {
        return;
    }

    this.listenerCounter_++;
    this.listeners_.push({ name_ : name_, listener_ : listener_, id_ : this.listenerCounter_ });

    return (function(id_){ this.removeListener(id_); }).bind(this, this.listenerCounter_);
};


// private
Melown.Core.prototype.callListener = function(name_, event_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].name_ == name_) {
            this.listeners_[i].listener_(event_);
        }
    }
};

// private
Melown.Core.prototype.removeListener = function(id_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].id_ == id_) {
            //this.listeners_[i].splice(i, 1);
            this.listeners_.splice(i, 1);
            return;
        }
    }
};


/*
string getVersion()

    Returns string with Melown version
*/

Melown.getCoreVersion = function() {
    return "1.65";
};


/*
bool checkSupport()

    Returns true if the environment is capable of running the WebGL browser, false otherwise.
*/

Melown.checkSupport = function()
{
    Melown.Platform.init();

    //is webgl supported
    var canvas_ = document.createElement("canvas");

    if (canvas_ == null) {
        return false;
    }

    canvas_.width = 1024;
    canvas_.height = 768;

    if (canvas_.getContext == null) {
        return false;
    }

    var gl_ = null;

    try {
        gl_ = canvas_.getContext("webgl") || canvas_.getContext("experimental-webgl");
    } catch(e) {
        return false;
    }

    if (!gl_) {
        return false;
    }

    return true;
};







Melown.MapCore = function(element_, config_) {
    element_ = (typeof element_ !== "string") ? element_ : document.getElementById(element_);

    if (Melown.checkSupport()) {
        return new Melown.CoreInterface(element_, config_);
    } else {
        return null;
    }
};

/**
 * @constructor
 */
Melown.CoreInterface = function(element_, config_) {
    this.core_ = new Melown.Core(element_, config_);
    this.map_ = this.core_.getMap();
};

Melown.CoreInterface.prototype.getMap = function() {
    return this.core_.getMapInterface();
};

Melown.CoreInterface.prototype.getRenderer = function() {
    return this.core_.getRendererInterface();
};

Melown.CoreInterface.prototype.on = function(eventName_, call_) {
    this.core_.on(eventName_, call_);
};


//prevent minification
Melown["MapCore"] = Melown.MapCore;
Melown.CoreInterface.prototype["getMap"] = Melown.CoreInterface.prototype.getMap;
Melown.CoreInterface.prototype["getRenderer"] = Melown.CoreInterface.prototype.getRenderer;
Melown.CoreInterface.prototype["on"] = Melown.CoreInterface.prototype.on;
Melown["getVersion"] = Melown.getVersion;
Melown["checkSupport"] = Melown.checkSupport;







/**
 * @constructor
 */
Melown.CoreConfig = function(json_)
{
    this.cacheSize_ = (1024*1024*1024);
    this.gpuCacheSize_ = (420*1024*1024);
    this.numThreads_ = 4;

    this.cameraFOV_ = 45.0;
    //this.cameraVisibility_ = 40000.0;
    this.cameraVisibility_ = 1200000.0;
    this.cameraMinDistance_ = 180.0; //seznam 180
    this.cameraMaxDistance_ = this.cameraVisibility_;
    this.cameraMinTilt_ = -90.0;

    this.heightLod_ = 14;

    if (SEZNAMCZ != true) {
        this.cameraMaxTilt_ = 90.0; //seznam -10
        this.cameraConstrainMode_ = "aboveTerrainByPixelSize";
        //this.cameraConstrainMode_ = "aboveTerrainByGSD";
    } else {
        this.cameraMaxTilt_ =  -10;
        this.cameraConstrainMode_ = "aboveTerrainOnly";
    }

    //this.cameraConstrainDistance_ = this.cameraMinDistance_ / 5.0;
    this.cameraConstrainDistance_ = this.cameraMinDistance_ * 0.5;

    this.gridEmbeddingFactor_ = 8;
    this.gridMinTileSize_ = 32.0;

    this.hitTextureSize_ = 1024;
    this.skydomeTexture_ = "./skydome.jpg";

    if (window["MelownScreenScaleFactor_"] < 0.8) {
        this.hitTextureSize_ = 512;
        this.skydomeTexture_ = "./skydome-small.jpg";
    }

    this.controlInertia_ = [0.80, 0.80, 0.80];
    this.controlMode_ = "observer";

    this.map_ = null;

    if (json_ != null) {
        this.map_ = json_["map"];

        if (json_["cacheSize"] != null)     this.cacheSize_ = json_["cacheSize"];
        if (json_["gpuCacheSize"] != null)  this.gpuCacheSize_ = json_["gpuCacheSize"];
        if (json_["numThreads"] != null)    this.numThreads_ = json_["numThreads"];

        if (json_["cameraFOV"] != null)               this.cameraFOV_ = json_["cameraFOV"];
        if (json_["cameraVisibility"] != null)        this.cameraVisibility_ = json_["cameraVisibility"];
        if (json_["cameraMinDistance"] != null)       this.cameraMinDistance_ = json_["cameraMinDistance"];
        if (json_["cameraMaxDistance"] != null)       this.cameraMaxDistance_ = json_["cameraMaxDistance"];
        if (json_["cameraMinTilt"] != null)           this.cameraMinTilt_ = json_["cameraMinTilt"];
        if (json_["cameraMaxTilt"] != null)           this.cameraMaxTilt_ = json_["cameraMaxTilt"];
        if (json_["cameraConstrainMode"] != null)     this.cameraConstrainMode_ = json_["cameraConstrainMode"], this.cameraConstrainDistance_ = this.cameraMinDistance_ / 5.0;

        if (json_["gridEmbeddingFactor"] != null) this.gridEmbeddingFactor_ = json_["gridEmbeddingFactor"];
        if (json_["gridMinTileSize"] != null)     this.gridMinTileSize_ = json_["gridMinTileSize"];

        if (json_["skydomeTexture"] != null)      this.skydomeTexture_ = json_["skydomeTexture"];
        if (json_["hitTextureSize"] != null)      this.hitTextureSize_ = json_["hitTextureSize"];

        if (json_["heightLod"] != null)           this.heightLod_ = json_["heightLod"];
        if (json_["controlMode"] != null)         this.controlMode_ = json_["controlMode"];
        if (json_["controlInertia"] != null) {
            for (var i = 0; i < 3; i++) {
                this.controlInertia_[i] = json_["controlInertia"][i];
            }
        }
    }
};

Melown.CoreConfig.prototype.clone = function() {
    var json_ = {};
    json_["cacheSize"] =            this.cacheSize_;
    json_["gpuCacheSize"] =         this.gpuCacheSize_;
    json_["numThreads"] =           this.numThreads_;
    json_["cameraFOV"] =            this.cameraFOV_;
    json_["cameraVisibility"] =     this.cameraVisibility_;
    json_["cameraMinDistance"] =    this.cameraMinDistance_;
    json_["cameraMaxDistance"] =    this.cameraMaxDistance_;
    json_["cameraMinTilt"] =        this.cameraMinTilt_;
    json_["cameraMaxTilt"] =        this.cameraMaxTilt_;
    json_["cameraConstrainMode"] =  this.cameraConstrainMode_;
    json_["gridEmbeddingFactor"] =  this.gridEmbeddingFactor_;
    json_["gridMinTileSize"] =      this.gridMinTileSize_;
    json_["skydomeTexture"] =       this.skydomeTexture_;
    json_["hitTextureSize"] =       this.hitTextureSize_;
    json_["heightLod"] =            this.heightLod_;
    json_["controlMode"] =          this.controlMode_;
    json_["controlInertia"] =       [this.controlInertia_[0], this.controlInertia_[1], this.controlInertia_[2]];
    return json_;
};





Melown.Core.prototype.onUpdate = function() {

    if (this.map_ != null) {
        this.map_.update();
    }

    //TODO: detect view change
    //this.callListener("view-update", {"position": position_, "orientaion":orientation_,
    //                                  "fov": renderer_.camera_.getFov()});

    //this.callListener("render-update", { "dirty": true, "message": "DOM element does not exist" });

    this.callListener("tick", {});

    window.requestAnimFrame(this.onUpdate.bind(this));
};




