
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
    "attribute vec3 aPosition;\n"+
    "attribute vec4 aNormal;\n"+
    "attribute vec4 aNormal2;\n"+
    //"attribute vec4 aNormal3;\n"+
    "uniform mat4 uMVP;\n"+
    "uniform vec4 uColor;\n"+
    "uniform vec2 uScale;\n"+
    "varying vec4 vColor;\n"+
    "varying vec2 vTexcoords;\n"+
    "void main(){ \n"+
        "vColor = uColor;\n"+
        "vec4 p1 = (uMVP * vec4(aPosition, 1.0));\n"+
        "if (aNormal.w == 0.0) {\n"+
            "gl_Position = p1 + vec4((vec3(aNormal.x*uScale.x*p1.w, aNormal.y*uScale.y*p1.w, 0.0)), 0.0);\n"+
        "} else {\n"+
            //"vColor = vec4(aNormal2.xyz, 1.0);\n"+
            "vec2 pp1 = p1.xy / p1.w;\n"+
            "vec4 p2 = (uMVP * vec4(aNormal.xyz, 1.0));\n"+
            "vec2 pp2 = p2.xy / p2.w;\n"+
            "vec4 p3 = (uMVP * vec4(aNormal2.xyz, 1.0));\n"+
            "vec2 pp3 = p3.xy / p3.w;\n"+

            "vec2 n = normalize(pp2 - pp1);\n"+
            "vec2 n2 = normalize(pp1 - pp3);\n"+

            "n = normalize(n + n2);\n"+

            "vTexcoords = vec2(aNormal2.w, aNormal.w < 0.0 ? 0.0 : 1.0);\n"+

            "gl_Position = p1 + vec4((vec3(-n.y*uScale.x*aNormal.w*p1.w, n.x*uScale.y*aNormal.w*p1.w, 0.0)), 0.0);\n"+
        "}\n"+
    "}";

Melown.line3FragmentShader = "precision mediump float;\n"+
    "varying vec4 vColor;\n"+
    "varying vec2 vTexcoords;\n"+
    "void main() {\n"+
        "gl_FragColor = vec4(vTexcoords.x, vTexcoords.y, 1.0, vColor.w);\n"+
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

Melown.textFragmentShader = "precision mediump float;\n"+
    "uniform sampler2D uSampler;\n"+
    "varying vec2 vTexCoord;\n"+
    "void main() {\n"+
        "vec4 c=texture2D(uSampler, vTexCoord);\n"+
        "if(c.w < 0.01){ discard; }\n"+
        "gl_FragColor = c;\n"+
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







