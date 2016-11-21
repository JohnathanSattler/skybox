var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI  / 180;
}

var skyboxVertexPositionBuffer;
var skyboxVertexTextureCoordBuffer
var skyboxVertexNormalBuffer;
var skyboxVertexIndexBuffer;

function initBuffers() {

    skyboxVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexPositionBuffer);
    var vertices = [
        // Front face
        -1.0, -1.0, 1.0,
         1.0, -1.0, 1.0, 
         1.0,  1.0, 1.0,
        -1.0,  1.0, 1.0,

         // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

         // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0,  1.0,
         1.0, 1.0,  1.0,
         1.0, 1.0, -1.0,

         // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left fae
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];
    for (var i = 0; i < vertices.length; i++) {
        vertices[i] *= 10;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    skyboxVertexPositionBuffer.itemSize = 3;
    skyboxVertexPositionBuffer.numItems = 24;

    skyboxVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexTextureCoordBuffer);
    /*var textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0, 
        1.0, 1.0,
        0.0, 1.0, 
        0.0, 0.0,

        // Top face
        0.0, 1.0, 
        0.0, 0.0, 
        1.0, 0.0, 
        1.0, 1.0, 

        // Bottom face
        1.0, 1.0, 
        0.0, 1.0, 
        0.0, 0.0, 
        1.0, 0.0, 

        // Right face
        1.0, 0.0, 
        1.0, 1.0, 
        0.0, 1.0, 
        0.0, 0.0, 

        // Left face
        0.0, 0.0, 
        1.0, 0.0, 
        1.0, 1.0, 
        0.0, 1.0
    ];*/
    /*var textureCoords = [
        // Front face
        1.0, 0.0,
        0.75, 0.0,
        0.75, 0.5,
        1.0, 0.5,

        // Back face
        0.25, 0.0, 
        0.25, 0.5,
        0.5, 0.5, 
        0.5, 0.0,

        // Top face
        0.25, 0.5, 
        0.25, 1.0, 
        0.5, 1.0, 
        0.5, 0.5, 

        // Bottom face
        0.0, 0.5, 
        0.25, 0.5, 
        0.25, 1.0, 
        0.0, 1.0, 

        // Right face
        0.5, 0.0, 
        0.5, 0.5, 
        0.75, 0.5, 
        0.75, 0.0, 

        // Left face
        0.25, 0.0, 
        0.0, 0.0, 
        0.0, 0.5, 
        0.25, 0.5
    ];*/
    var textureCoords = [
        // Front face
        1.0,  0.34,
        0.75, 0.34,
        0.75, 0.66,
        1.0,  0.66,

        // Back face
        0.25, 0.34, 
        0.25, 0.66,
        0.5,  0.66, 
        0.5,  0.34,

        // Top face
        0.25, 0.66, 
        0.25, 1.0, 
        0.5,  1.0, 
        0.5,  0.66, 

        // Bottom face
        0.25, 0.34, 
        0.5,  0.34, 
        0.5,  0.0, 
        0.25, 0.0, 

        // Right face
        0.5,  0.34, 
        0.5,  0.66, 
        0.75, 0.66, 
        0.75, 0.34, 

        // Left face
        0.25, 0.34, 
        0.0,  0.34, 
        0.0,  0.66, 
        0.25, 0.66
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    skyboxVertexTextureCoordBuffer.itemSize = 2;
    skyboxVertexTextureCoordBuffer.numItems = 24;

    skyboxVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxVertexIndexBuffer);
    var cubeVertexIndices = [
         0,  1,  2,      0,  2,  3, // Front face
         4,  5,  6,      4,  6,  7, // Back face
         8,  9, 10,      8, 10, 11, // Top face
        12, 13, 14,     12, 14, 15, // Bottom face
        16, 17, 18,     16, 18, 19, // Right face
        20, 21, 22,     20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    skyboxVertexIndexBuffer.itemSize = 1;
    skyboxVertexIndexBuffer.numItems = 36;

    initCube();
}

var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer
var cubeVertexNormalBuffer;
var cubeVertexIndexBuffer;

function initCube() {


    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    var vertices = [
        // Front face
        -1.0, -1.0, 1.0,
         1.0, -1.0, 1.0, 
         1.0,  1.0, 1.0,
        -1.0,  1.0, 1.0,

         // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,

         // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0,  1.0,
         1.0, 1.0,  1.0,
         1.0, 1.0, -1.0,

         // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,

        // Left fae
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
    ];
    for (var i = 0; i < vertices.length; i++) {
        vertices[i] *= 1.0;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    var textureCoords = [
        // Front face
        1.0,  0.34,
        0.75, 0.34,
        0.75, 0.66,
        1.0,  0.66,

        // Back face
        0.25, 0.34, 
        0.25, 0.66,
        0.5,  0.66, 
        0.5,  0.34,

        // Top face
        0.25, 0.66, 
        0.25, 1.0, 
        0.5,  1.0, 
        0.5,  0.66, 

        // Bottom face
        0.25, 0.0, 
        0.5,  0.0, 
        0.5,  0.34, 
        0.25, 0.34, 

        // Right face
        0.5,  0.34, 
        0.5,  0.66, 
        0.75, 0.66, 
        0.75, 0.34, 

        // Left face
        0.25, 0.34, 
        0.0,  0.34, 
        0.0,  0.66, 
        0.25, 0.66
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;
    cubeVertexTextureCoordBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var cubeVertexIndices = [
         0,  1,  2,      0,  2,  3, // Front face
         4,  5,  6,      4,  6,  7, // Back face
         8,  9, 10,      8, 10, 11, // Top face
        12, 13, 14,     12, 14, 15, // Bottom face
        16, 17, 18,     16, 18, 19, // Right face
        20, 21, 22,     20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

var textureImage;
function initTextures() {
    textureImage = gl.createTexture();
    textureImage.image = new Image();
    textureImage.image.onload = function() {
        handleLoadedTexture(textureImage)
    }

    textureImage.image.src = "image.gif";
}

var xRot = 10;
var yRot = 0;
var zRot = 0;
function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [0, 0.0, -7.5]);

    mat4.rotate(mvMatrix, degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mvMatrix, degToRad(yRot), [0, 1, 0]);
    mat4.rotate(mvMatrix, degToRad(zRot), [0, 0, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, skyboxVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, skyboxVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureImage);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skyboxVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, skyboxVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    // render smaller cube
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureImage);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


var lastTime = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        //xRot += (90 * elapsed) / 1000.0;
        yRot += (90 * elapsed) / 1000.0 / 5;
        //zRot += (90 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}

function webGLStart() {
    var canvas = document.getElementById("myCanvas");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    initGL(canvas);
    initShaders();
    initBuffers();
    initTextures();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}