
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

//textured tile mesh
Melown.tile2VertexShader =
    "attribute vec3 aPosition;\n"+
    "attribute vec2 aTexCoord2;\n"+
    "uniform mat4 uMV, uProj;\n"+
    "uniform float uFogDensity;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
    "void main() {\n"+
        "vec4 camSpacePos = uMV * vec4(aPosition, 1.0);\n"+
        "gl_Position = uProj * camSpacePos;\n"+
        "float camDist = length(camSpacePos.xyz);\n"+
        "vFogFactor = exp(uFogDensity * camDist);\n"+
        "vTexCoord = aTexCoord2;\n"+
    "}";

Melown.tile2FragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "uniform float uAlpha;\n"+
    "varying vec2 vTexCoord;\n"+
    "varying float vFogFactor;\n"+
    "const vec4 fogColor = vec4(216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0);\n"+
    "void main() {\n"+
        "gl_FragColor = mix(fogColor, texture2D(uSampler, vTexCoord), vFogFactor);\n"+
        //"gl_FragColor = texture2D(uSampler, vTexCoord);\n"+
        "gl_FragColor[3] = uAlpha;\n"+
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







