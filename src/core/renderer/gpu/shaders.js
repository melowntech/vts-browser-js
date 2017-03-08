
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

Melown.line4VertexShader =
    "attribute vec3 aPosition;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec3 uScale;\n"+
    "uniform vec3 uPoints[32];\n"+
    "void main(){ \n"+
        "vec4 pp0 = (uMVP * vec4(uPoints[int(aPosition.x)], 1.0));\n"+
        "if (aPosition.y < 0.0) {\n"+
            "if (aPosition.y == -1.0) {\n"+
                "gl_Position = pp0;\n"+
            "} else {\n"+
                "gl_Position = pp0 + vec4((vec3(-sin(aPosition.z)*uScale.x*uScale.z, cos(aPosition.z)*uScale.y*uScale.z, 0.0)), 0.0);\n"+
            "}\n"+
        "} else {\n"+
            "vec2 pp1 = pp0.xy / pp0.w;\n"+
            "vec4 pp3 = (uMVP * vec4(uPoints[int(aPosition.y)], 1.0));\n"+
            "vec2 pp2 = pp3.xy / pp3.w;\n"+
            "vec2 n = normalize(pp2 - pp1);\n"+
            "gl_Position = pp0 + vec4((vec3(-n.y*uScale.x*aPosition.z*uScale.z, n.x*uScale.y*aPosition.z*uScale.z, 0.0)), 0.0);\n"+
        "}\n"+
    "}";

Melown.line4FragmentShader = "precision mediump float;\n"+
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
    "attribute vec4 aPosition;\n"+
    "attribute vec4 aTexCoord;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec4 uVec;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "vTexCoord = aTexCoord.xy;\n"+
        "if (dot(uVec.xyz, vec3(aTexCoord.z, aTexCoord.w, aPosition.w)) < 0.0) {\n"+
            "gl_Position = uMVP * vec4(2.0, 0.0, 0.0, 1.0);\n"+
        "}else{\n"+
            "gl_Position = uMVP * vec4(aPosition.xyz, 1.0);\n"+
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
    "attribute vec4 aPosition;\n"+
    "attribute vec4 aTexCoord;\n"+
    "attribute vec3 aOrigin;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec4 uScale;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main(){ \n"+
        "vTexCoord = aTexCoord.xy * uScale[2];\n"+
        "vec4 pos = (uMVP * vec4(aOrigin, 1.0));\n"+
        //"pos.xy = pos.xy / pos.w;\n"+
        "gl_Position = pos + vec4(aPosition.x*uScale.x*pos.w, (aPosition.y+uScale.w)*uScale.y*pos.w, 0.0, 0.0);\n"+
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

Melown.stardomeFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main() {\n"+
        "gl_FragColor = texture2D(uSampler, vTexCoord);\n"+
    "}";

Melown.atmoVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform mat3 uNorm;\n"+
    "varying vec3 vNormal;\n"+
    "varying vec4 vPosition;\n"+
    "void main(){ \n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "vec4 c = uMV * vec4(aPosition, 1.0);\n"+

//        "vNormal = uNorm * (aPosition.xyz - vec3(0.5));\n"+
        "vNormal = (aPosition.xyz - vec3(0.5));\n"+

        "vPosition = camSpacePos;\n"+
    "}";

Melown.atmoFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
//    "uniform float uNFactor;\n"+
    "uniform vec4 uParams;\n"+       //[radius, atmoSize, 0 ,0]
    "uniform vec4 uParams2;\n"+       //[radius, atmoSize, 0 ,0]
    "varying vec4 vPosition;\n"+
    "varying vec3 vNormal;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "const vec4 fogColor2 = vec4(72.0/255.0, 154.0/255.0, 255.0/255.0, 1.0);\n"+
    "void main() {\n"+
  //      "vec3 ldir = normalize(-vPosition.xyz);\n"+
//        "vec4 c = texture2D(uSampler, vec2(0,0));\n"+
        //"c.y = 1.0+dot(normalize(vNormal),ldir)*4.0;\n"+
        
        //"float l = dot(normalize(vNormal*uParams[0]),ldir);\n"+
        //"c = mix(vec4(0.0,0.0,0.0,1.0),fogColor, 1.0 - clamp(-l, 0.0, uParams[1]) / uParams[1]);\n"+
        
//        "float l = dot(normalize(vNormal),ldir);\n"+
        "float l = dot(normalize(vNormal),-uParams2.xyz);\n"+
        //"l = cos(acos(l) - uParams.x);\n"+  //anguler shift
//        "l = (1.0-(abs(l)));\n"+

//        "l = (1.0-pow(abs(l),2.0));\n"+
//        "l += pow(l,2.0);\n"+

        "l = (1.0-pow(abs(l),uParams.x));\n"+

        //"l = clamp(pow(l,12.0)*uParams.w, 0.0, 1.0);\n"+

//        "vec4 c = vec4(fogColor.xyz*pow(0.85 - l, 13.0), 1.0);\n"+
        "vec4 c = vec4(mix(fogColor2.xyz, fogColor.xyz, l), l);\n"+
        
        "gl_FragColor = c;\n"+
    "}";

Melown.atmoFragmentShader2 = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform float uNFactor;\n"+
    "uniform vec2 uRadius;\n"+
    "uniform vec3 uPos;\n"+
    "varying vec4 vPosition;\n"+
    "varying vec3 vNormal;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "vec3 ldir = normalize(-vPosition.xyz);\n"+
        "vec3 diff = uPos;\n"+
        "float a = dot(ldir, ldir);\n"+
        "float b = 2 * dot(ldir, diff);\n"+
        "float c = dot(diff, diff) - (uRadius[0] * uRadius[0]);\n"+
        "float i = 0;\n"+
        "float discr = b * b - 4 * a * c;\n"+
        "if (discr > 0.0) {}\n"+

        "}\n"+
        //"vec4 c = texture2D(uSampler, vec2(0,0));\n"+
        //"c.y = 1.0+dot(normalize(vNormal),ldir)*4.0;\n"+
        //"float l = dot(normalize(vNormal*uNFactor),ldir);\n"+
        //"c = mix(vec4(0.0,0.0,0.0,1.0),fogColor,max(0.0,-l*3.0));\n"+
        "gl_FragColor = fogColor;\n"+
    "}";


Melown.atmoVertexShader3 =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    //"uniform mat3 uNorm;\n"+
    "uniform vec4 uParams;\n"+       //[surfaceRadius, surfaceRadius, strech ,safetyfactor]
    "uniform vec4 uParams2;\n"+       //[cameraPos, 1]

    "varying vec2 vTexcoords;\n"+

    "void main(){ \n"+
        "gl_Position = uProj * (uMV * vec4(aPosition, 1.0));\n"+

        "vec3 position = (aPosition.xyz - vec3(0.5)) * vec3(uParams.w * 2.0);\n"+
        "vec4 camPos = uParams2;\n"+
        "float SurfaceRadius = uParams.x;\n"+ 
        "float AtmosphereRadius = uParams.y;\n"+ 
        "float StretchAmt = uParams.z;\n"+ 
     
        //"oPosition = mul(Po, WorldViewProj);\n"+ 
     
        //"float radius = length(position);\n"+
        //"float radius2 = radius * radius;\n"+ 
        "float camHeight = length(camPos.xyz);\n"+
        "vec3 camToPos = position - camPos.xyz;\n"+
        "float farDist = length(camToPos);\n"+
     
        //"vec3 normal = normalize(position);\n"+
     
        //"vec3 rayDir = camToPos / farDist;\n"+
        //"float camHeight2 = camHeight * camHeight;\n"+
     
        // Calculate the closest intersection of the ray with the outer atmosphere
        //"float B = 2.0 * dot(camPos.xyz, rayDir);\n"+
        //"float C = camHeight2 - radius2;\n"+
        //"float det = max(0.0, B*B - 4.0 * C);\n"+
        //"float nearDist = 0.5 * (-B - sqrt(det));\n"+
        //"vec3 nearPos = camPos.xyz + (rayDir * nearDist);\n"+
        //"vec3 nearNormal = normalize(nearPos);\n"+
    
        // get distance to surface horizon
        "float altitude = max(0.0,camHeight - SurfaceRadius);\n"+
        "float horizonDist = sqrt((altitude*altitude) + (2.0 * SurfaceRadius * altitude));\n"+
        "float maxDot = horizonDist / camHeight;\n"+
     
        // get distance to atmosphere horizon - use max(0,...) because we can go into the atmosphere
        "altitude = max(0.0,camHeight - AtmosphereRadius);\n"+
        "horizonDist = sqrt((altitude*altitude) + (2.0 * AtmosphereRadius * altitude));\n"+
     
        // without this, the shift between inside and outside atmosphere is  jarring
        "float tweakAmount = 0.1;\n"+
        "float minDot = max(tweakAmount,horizonDist / camHeight);\n"+
     
        // scale minDot from 0 to -1 as we enter the atmosphere
        "float minDot2 = ((camHeight - SurfaceRadius) * (1.0 / (AtmosphereRadius  - SurfaceRadius))) - (1.0 - tweakAmount);\n"+
        "minDot = min(minDot, minDot2);\n"+
      
        // get dot product of the vertex we're looking out
        "float posDot = dot(camToPos / farDist,-camPos.xyz / camHeight) - minDot;\n"+
     
        // calculate the height from surface in range 0..1
        "float height = posDot * (1.0 / (maxDot - minDot));\n"+
    
        "vTexcoords.y = height;\n"+ 
     
        "height -= min(0.0,minDot2 + ((1.0 + StretchAmt) * minDot2));\n"+
        "vTexcoords.x = height;\n"+
    "}";

Melown.atmoFragmentShader3 = "precision mediump float;\n"+
    "varying vec2 vTexcoords;\n"+
    "uniform vec4 uParams3;\n"+       //[treshold, mutiplier, 0,0]
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "const vec4 fogColor2 = vec4(72.0/255.0, 154.0/255.0, 255.0/255.0, 1.0);\n"+
    "const vec4 fogColor3 = vec4(0.0/255.0, 0.0/255.0, 0.0/255.0, 1.0);\n"+

    "void main() {\n"+
//        "gl_FragColor = vec4(1.0 - exp(((fogColor * vTexcoords.x) * (1.0 + vTexcoords.y)) * -1.5));\n"+
//        "gl_FragColor = vec4(vec3(fract(vTexcoords.y)),1.0);\n"+
//        "gl_FragColor = vec4(vec3(1.0),fract(vTexcoords.y));\n"+
//        "gl_FragColor = vec4(vec3(1.0),1.0 - exp(((fogColor * vTexcoords.x)) * -1.5));\n"+

//        "gl_FragColor = vec4(vec3(vTexcoords.y),1.0);\n"+
        //"gl_FragColor = vec4(fogColor.xyz, vTexcoords.y);\n"+

        "float l = vTexcoords.y;\n"+
        "if (l > uParams3.z){ discard; } else {\n"+
            "float l2 = clamp((l*l)*0.9+0.1, 0.0, 1.5);\n"+
            "gl_FragColor = vec4(mix(fogColor2.xyz, fogColor.xyz, l2), l);\n"+
        
            "if (l > uParams3.x){ gl_FragColor.xyz = mix(gl_FragColor.xyz, fogColor3.xyz, (l-uParams3.x)*uParams3.y); }\n"+

//          "gl_FragColor = vec4(vec3(1.0),1.0 - exp(((fogColor * vTexcoords.x) * (1.0 + vTexcoords.y)) * -1.5));\n"+
        "}"+

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
    
Melown.planeVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
//    "uniform vec4 uParams;\n"+    //[zfactor, fogDensity, indexFactor, 0]
//    "uniform vec4 uParams2;\n"+    //[uGridStep1, uGridStep2, uGridBlend, 0]
    "uniform vec4 uParams;\n"+    //[uGridStep1, fogDensity, indexFactor, uGridStep2]
    "uniform vec4 uParams3;\n"+    //[px, py, sx, sy]
    "uniform float uPoints[9*3];\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec2 vTexCoord2;\n"+
    "varying float vFogFactor;\n"+
    "vec3 quadPoint(int i1, int i2, int i3, float t, float t2) {\n"+
        "float p1x = uPoints[i1], p1y = uPoints[i1+1], p1z = uPoints[i1+2];\n"+
        "float p3x = uPoints[i3], p3y = uPoints[i3+1], p3z = uPoints[i3+2];\n"+
        "float p2x = 2.0*uPoints[i2]-p1x*0.5-p3x*0.5;\n"+
        "float p2y = 2.0*uPoints[i2+1]-p1y*0.5-p3y*0.5;\n"+
        "float p2z = 2.0*uPoints[i2+2]-p1z*0.5-p3z*0.5;\n"+
        "return vec3(t2*t2*p1x+2.0*t2*t*p2x+t*t*p3x, t2*t2*p1y+2.0*t2*t*p2y+t*t*p3y, t2*t2*p1z+2.0*t2*t*p2z+t*t*p3z); }\n"+
    "void main() {\n"+
        "vec3 indices = aPosition;\n"+
        "float t = aPosition.y * uParams[2];\n"+  //vertical index
        "float t2 = (1.0-t);\n"+
        "vec3 p1 = quadPoint(0, 3, 6, t, t2);\n"+
        "vec3 p2 = quadPoint(9, 9+3, 9+6, t, t2);\n"+
        "vec3 p3 = quadPoint(18, 18+3, 18+6, t, t2);\n"+
        "t = aPosition.x * uParams[2];\n"+  //horizontal index
        "t2 = (1.0-t);\n"+
        "float p2x = 2.0*p2.x-p1.x*0.5-p3.x*0.5;\n"+
        "float p2y = 2.0*p2.y-p1.y*0.5-p3.y*0.5;\n"+
        "float p2z = 2.0*p2.z-p1.z*0.5-p3.z*0.5;\n"+
        "vec4 p = vec4(t2*t2*p1.x+2.0*t2*t*p2x+t*t*p3.x, t2*t2*p1.y+2.0*t2*t*p2y+t*t*p3.y, t2*t2*p1.z+2.0*t2*t*p2z+t*t*p3.z, 1);\n"+
        "vec4 camSpacePos = uMV * p;\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uParams[1] * camDist);\n"+
        "vec2 uv = aTexCoord;\n"+
        "uv.x = uv.x * uParams3[2] + uParams3[0];\n"+
        "uv.y = uv.y * uParams3[3] + uParams3[1];\n"+
        "vTexCoord = uv;\n"+
    "}";

Melown.planeFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform vec4 uParams2;\n"+    //[uGridStep1, uGridStep2, uGridBlend, 0]
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
//    "const vec4 fogColor = vec4(0.8274, 0.9137, 0.9725, 1.0);\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "vec4 c = mix(texture2D(uSampler, vTexCoord), texture2D(uSampler, vTexCoord*8.0), uParams2[2]);\n"+
        "gl_FragColor = mix(fogColor, c, vFogFactor);\n"+
    "}";


Melown.planeVertex2Shader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
//    "uniform vec4 uParams;\n"+    //[zfactor, fogDensity, indexFactor, 0]
//    "uniform vec4 uParams2;\n"+    //[uGridStep1, uGridStep2, uGridBlend, 0]
    "uniform vec4 uParams;\n"+    //[uGridStep1, fogDensity, indexFactor, uGridStep2]
    "uniform vec4 uParams3;\n"+    //[px, py, sx, sy]
    "uniform float uPoints[9*3];\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec2 vTexCoord2;\n"+
    "varying float vFogFactor;\n"+
    "vec3 quadPoint(int i1, int i2, int i3, float t, float t2) {\n"+
        "float p1x = uPoints[i1], p1y = uPoints[i1+1], p1z = uPoints[i1+2];\n"+
        "float p3x = uPoints[i3], p3y = uPoints[i3+1], p3z = uPoints[i3+2];\n"+
        "float p2x = 2.0*uPoints[i2]-p1x*0.5-p3x*0.5;\n"+
        "float p2y = 2.0*uPoints[i2+1]-p1y*0.5-p3y*0.5;\n"+
        "float p2z = 2.0*uPoints[i2+2]-p1z*0.5-p3z*0.5;\n"+
        "return vec3(t2*t2*p1x+2.0*t2*t*p2x+t*t*p3x, t2*t2*p1y+2.0*t2*t*p2y+t*t*p3y, t2*t2*p1z+2.0*t2*t*p2z+t*t*p3z); }\n"+
    "void main() {\n"+
        "vec3 indices = aPosition;\n"+
        "float t = aPosition.y * uParams[2];\n"+  //vertical index
        "float t2 = (1.0-t);\n"+
        "vec3 p1 = quadPoint(0, 3, 6, t, t2);\n"+
        "vec3 p2 = quadPoint(9, 9+3, 9+6, t, t2);\n"+
        "vec3 p3 = quadPoint(18, 18+3, 18+6, t, t2);\n"+
        "t = aPosition.x * uParams[2];\n"+  //horizontal index
        "t2 = (1.0-t);\n"+
        "float p2x = 2.0*p2.x-p1.x*0.5-p3.x*0.5;\n"+
        "float p2y = 2.0*p2.y-p1.y*0.5-p3.y*0.5;\n"+
        "float p2z = 2.0*p2.z-p1.z*0.5-p3.z*0.5;\n"+
        "vec4 p = vec4(t2*t2*p1.x+2.0*t2*t*p2x+t*t*p3.x, t2*t2*p1.y+2.0*t2*t*p2y+t*t*p3.y, t2*t2*p1.z+2.0*t2*t*p2z+t*t*p3.z, 1);\n"+
        "vec4 camSpacePos = uMV * p;\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uParams[1] * camDist);\n"+
        "vec2 uv = aTexCoord;\n"+
        "uv.x = uv.x * uParams3[2] + uParams3[0];\n"+
        "uv.y = uv.y * uParams3[3] + uParams3[1];\n"+
        "vTexCoord = uv;\n"+
        "vTexCoord2 = p.xy;\n"+
    "}";

Melown.planeFragment2Shader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform vec4 uParams2;\n"+    //[uGridStep1, uGridStep2, uGridBlend, 0]
    "uniform vec4 uParams4;\n"+    //[pole-x, pole-y, pole-radius, 0]
    "varying vec2 vTexCoord;\n"+
    "varying vec2 vTexCoord2;\n"+
    "varying float vFogFactor;\n"+
//    "const vec4 fogColor = vec4(0.8274, 0.9137, 0.9725, 1.0);\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "if (length(uParams4.xy - vTexCoord2.xy) > uParams4.z){ discard; }"+ 
        "vec4 c = mix(texture2D(uSampler, vTexCoord), texture2D(uSampler, vTexCoord*8.0), uParams2[2]);\n"+
        "gl_FragColor = mix(fogColor, c, vFogFactor);\n"+

        //"gl_FragColor = mix(texture2D(uSampler, vTexCoord), texture2D(uSampler, vTexCoord*8.0), uParams2[2]);\n"+
    "}";



    
//textured tile mesh
Melown.tileVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform vec4 uParams;\n"+    //[zfactor, fogDensity, 0, 0]
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
//        "gl_Position = uProj * camSpacePos; gl_Position.z*=1.0+uParams[0]*abs(gl_Position.w/gl_Position.z);\n"+
//        "gl_Position = uProj * camSpacePos; gl_Position.z*=1.0+uParams[0]*abs(gl_Position.z/gl_Position.w);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uParams[1] * camDist);\n"+
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

//textured tile mesh
Melown.tile2VertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord2;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform vec4 uParams;\n"+    //[zfactor, fogDensity, 0, 0]
    "uniform vec4 uTransform;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
//        "gl_Position = uProj * camSpacePos; gl_Position.z*=1.0+uParams[0]*abs(gl_Position.w/gl_Position.z);\n"+
//        "gl_Position = uProj * camSpacePos; gl_Position.z*=1.0+uParams[0]*abs(gl_Position.z/gl_Position.w);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uParams[1] * camDist);\n"+
        "vTexCoord = vec2(uTransform[0] * aTexCoord2[0] + uTransform[2], uTransform[1] * aTexCoord2[1] + uTransform[3]);\n"+
    "}";

Melown.tile2FragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform float uAlpha;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "vec4 c = texture2D(uSampler, vTexCoord);\n"+
        "gl_FragColor = mix(fogColor, c, vFogFactor);\n"+
        //"gl_FragColor = texture2D(uSampler, vTexCoord);\n"+
        "gl_FragColor[3] = c.w * uAlpha;\n"+
    "}";

Melown.tile3FragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform sampler2D uSampler2;\n"+
    "uniform float uAlpha;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "vec4 c = texture2D(uSampler, vTexCoord);\n"+
        "vec4 c2 = texture2D(uSampler2, vTexCoord);\n"+
        "gl_FragColor = mix(fogColor, c, vFogFactor);\n"+
        //"gl_FragColor = texture2D(uSampler, vTexCoord);\n"+
        "gl_FragColor[3] = c.w * uAlpha * c2.x;\n"+
    "}";

//fog only tile mesh
Melown.fogTileVertexShader =
    "attribute vec3 aPosition;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uFogDensity * camDist);\n"+
    "}";

Melown.fogTileFragmentShader = "precision mediump float;\n"+
    "varying float vFogFactor;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "gl_FragColor = vec4(fogColor.xyz, 1.0-vFogFactor);\n"+
    "}";


//textured shaded tile mesh
Melown.tileTShadedVertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord;\n"+
    "attribute vec3 aNormal;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform mat3 uNorm;\n"+
    "uniform float uFogDensity;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec4 vPosition;\n"+
    "varying vec3 vNormal;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uFogDensity * camDist);\n"+
        "vTexCoord = aTexCoord;\n"+
        "vPosition = camSpacePos;\n"+
        "vNormal = aNormal * uNorm;\n"+
    "}";

Melown.tileTShadedFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec4 vPosition;\n"+
    "varying vec3 vNormal;\n"+
    "uniform mat4 uMaterial;\n"+
    "varying float vFogFactor;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "vec3 ldir = normalize(-vPosition.xyz);\n"+
        "vec3 normal = normalize(vNormal);\n"+
        "vec3 eyeDir = ldir;\n"+
        "vec3 refDir = reflect(-ldir, normal);\n"+
        "float specW = pow(max(dot(refDir, eyeDir), 0.0), uMaterial[3][0]);\n"+
        "float diffW = max(dot(normal, ldir), 0.0);\n"+
        "vec4 lcolor = uMaterial[0]+(uMaterial[1]*diffW)+(uMaterial[2]*specW);\n"+
        "vec4 tcolor = texture2D(uSampler, vTexCoord);\n"+
        "gl_FragColor = mix(fogColor, vec4(lcolor.xyz*(1.0/255.0), 1.0) * tcolor, vFogFactor);\n"+
    "}";

Melown.tileShadedFragmentShader = "precision mediump float;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying vec4 vPosition;\n"+
    "varying vec3 vNormal;\n"+
    "uniform mat4 uMaterial;\n"+
    "varying float vFogFactor;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "vec3 ldir = normalize(-vPosition.xyz);\n"+
        "vec3 normal = normalize(vNormal);\n"+
        "vec3 eyeDir = ldir;\n"+
        "vec3 refDir = reflect(-ldir, normal);\n"+
        "float specW = pow(max(dot(refDir, eyeDir), 0.0), uMaterial[3][0]);\n"+
        "float diffW = max(dot(normal, ldir), 0.0);\n"+
        "vec4 lcolor = uMaterial[0]+(uMaterial[1]*diffW)+(uMaterial[2]*specW);\n"+
        //"gl_FragColor = vec4(lcolor.xyz*(1.0/255.0),1.0);\n"+
        "gl_FragColor = mix(fogColor, vec4(lcolor.xyz*(1.0/255.0), 1.0), vFogFactor);\n"+

        //"gl_FragColor = mix(fogColor, vec4(lcolor.xyz*(1.0/255.0), 1.0), vFogFactor); gl_FragColor.w=uMaterial[3][1]*(1.0/255.0);\n"+
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
        //"gl_FragColor = vec4( mix(vec3(0.0), vec3(0.5), edgeFactor()) , 1.0);\n"+
        "if (edgeFactor() < 0.5){ gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); } else { discard; }"+ 
        //"gl_FragColor = mix(vec4(0.0, 0.0, 0.0, 1.0), vec4(0.0, 0.0, 0.0, 0.0), edgeFactor());\n"+
    "}";

//textured wire frame tile mesh
Melown.tileWireframe3VertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord2;\n"+
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
        "vTexCoord = aTexCoord2;\n"+
        "vBarycentric = aBarycentric;\n"+
    "}";

//depth encoded tile mesh
Melown.tileDepthVertexShader =
    "attribute vec3 aPosition;\n"+
    //"attribute vec2 aTexCoord;\n"+
    "uniform mat4 uMV, uProj;\n"+
    //"uniform float uFogDensity;\n"+
    //"varying vec2 vTexCoord;\n"+
    "varying float vDepth;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vDepth = camDist;\n"+
        //"vTexCoord = aTexCoord;\n"+
    "}";

Melown.tileDepthFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "varying float vDepth;\n"+
    "void main() {\n"+

//        "gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);\n"+
        "gl_FragColor = fract(vec4(1.0, 1.0/255.0, 1.0/65025.0, 1.0/16581375.0) * vDepth) + (-0.5/255.0);\n"+
//        "gl_FragColor.w=1.0;"+
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

        "vec4 c=uColor;\n"+
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







