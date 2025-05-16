// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;

  uniform int u_whichTexture;

  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }
  }`


// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }


    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get and set sampler uniform locations
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

    if (!u_Sampler0 || !u_Sampler1) {
        console.log('Failed to get one or more u_Sampler uniform locations');
        return;
    }

    // Assign texture units to each sampler
    gl.uniform1i(u_Sampler0, 0); // TEXTURE0
    gl.uniform1i(u_Sampler1, 1); // TEXTURE1

    // Set an initial value for this matrix to Indentity
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_tail1Angle = 0;
let g_tail2Angle = 0;
let g_tail3Angle = 0;
let g_leg1Angle = 0;
let g_leg2Angle = 0;
let g_leg3Angle = 0;
let g_leg4Angle = 0;
let g_ear1Angle = 0;
let g_ear2Angle = 0;
let g_tail1Animation = false;
let g_tail2Animation = false;
let g_tail3Animation = false;
let g_leg1Animation = false;
let g_leg2Animation = false;
let g_leg3Animation = false;
let g_leg4Animation = false;
let g_ear1Animation = false;
let g_ear2Animation = false;
let g_mouseLastX = null;
let g_mouseLastY = null;
let g_mouseDragging = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

    // Button Events
    document.getElementById('animationTail1OffButton').onclick = function () { g_tail1Animation = false; };
    document.getElementById('animationTail1OnButton').onclick = function () { g_tail1Animation = true; };
    document.getElementById('animationTail2OffButton').onclick = function () { g_tail2Animation = false; };
    document.getElementById('animationTail2OnButton').onclick = function () { g_tail2Animation = true; };
    document.getElementById('animationTail3OffButton').onclick = function () { g_tail3Animation = false; };
    document.getElementById('animationTail3OnButton').onclick = function () { g_tail3Animation = true; };
    document.getElementById('animationLeg1OffButton').onclick = function () { g_leg1Animation = false; };
    document.getElementById('animationLeg1OnButton').onclick = function () { g_leg1Animation = true; };
    document.getElementById('animationLeg2OffButton').onclick = function () { g_leg2Animation = false; };
    document.getElementById('animationLeg2OnButton').onclick = function () { g_leg2Animation = true; };
    document.getElementById('animationLeg3OffButton').onclick = function () { g_leg3Animation = false; };
    document.getElementById('animationLeg3OnButton').onclick = function () { g_leg3Animation = true; };
    document.getElementById('animationLeg4OffButton').onclick = function () { g_leg4Animation = false; };
    document.getElementById('animationLeg4OnButton').onclick = function () { g_leg4Animation = true; };
    document.getElementById('animationEar1OffButton').onclick = function () { g_ear1Animation = false; };
    document.getElementById('animationEar1OnButton').onclick = function () { g_ear1Animation = true; };
    document.getElementById('animationEar2OffButton').onclick = function () { g_ear2Animation = false; };
    document.getElementById('animationEar2OnButton').onclick = function () { g_ear2Animation = true; };

    // Tail Slider Events
    document.getElementById('tail1Slide').addEventListener('mousemove', function () { g_tail1Angle = this.value; renderAllShapes(); });
    document.getElementById('tail2Slide').addEventListener('mousemove', function () { g_tail2Angle = this.value; renderAllShapes(); });
    document.getElementById('tail3Slide').addEventListener('mousemove', function () { g_tail3Angle = this.value; renderAllShapes(); });
    document.getElementById('leg1Slide').addEventListener('mousemove', function () { g_leg1Angle = this.value; renderAllShapes(); });
    document.getElementById('leg2Slide').addEventListener('mousemove', function () { g_leg2Angle = this.value; renderAllShapes(); });
    document.getElementById('leg3Slide').addEventListener('mousemove', function () { g_leg3Angle = this.value; renderAllShapes(); });
    document.getElementById('leg4Slide').addEventListener('mousemove', function () { g_leg4Angle = this.value; renderAllShapes(); });
    document.getElementById('ear1Slide').addEventListener('mousemove', function () { g_ear1Angle = this.value; renderAllShapes(); });
    document.getElementById('ear2Slide').addEventListener('mousemove', function () { g_ear2Angle = this.value; renderAllShapes(); });

    canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };
    canvas.addEventListener('mousedown', (e) => {
        g_mouseDragging = true;
        g_mouseLastX = e.clientX;
        g_mouseLastY = e.clientY;
    });

    canvas.addEventListener('mouseup', (e) => {
        g_mouseDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!g_mouseDragging) return;
        onMouseMove(e);
    });

    // Size Slider Events
    //document.getElementById('angleSlide').addEventListener('mouseup',  function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('angleSlide').addEventListener('input', function () { g_globalAngle = this.value; renderAllShapes(); });

}

function onMouseMove(ev) {
    let dx = ev.clientX - g_mouseLastX;
    let dy = ev.clientY - g_mouseLastY;

    // Adjust this sensitivity if needed
    let sensitivity = 0.5;

    if (dx > 0) {
        g_camera.panleft(-dx * sensitivity);
    } else {
        g_camera.panright(dx * sensitivity);
    }

    g_mouseLastX = ev.clientX;
    g_mouseLastY = ev.clientY;

    renderAllShapes();
}

function initTextures() {
    loadTexture('sky.jpg', 0);
    loadTexture('grass.jpeg', 1);
}

function loadTexture(src, texUnit) {
    let image = new Image();
    image.onload = function () {
        sendImageToTextureUnit(image, texUnit);
    };
    image.src = src;
}

function sendImageToTextureUnit(image, texUnit) {
    let texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
}

function main() {

    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = click;
    //canvas.onmousemove = click;
    // canvas.onmousemove = function (ev) { if (ev.buttons == 1) { click(ev) } };

    document.onkeydown = keydown;

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Render
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
    // Save the current time
    g_seconds = performance.now() / 1000.0 - g_startTime;

    // Update Animation Angles
    updateAnimationAngles();

    // Draw everything
    renderAllShapes();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
    if (g_tail1Animation) {
        g_tail1Angle = (30 * Math.sin(g_seconds));
    }
    if (g_tail2Animation) {
        g_tail2Angle = (20 * Math.sin(g_seconds));
    }
    if (g_tail3Animation) {
        g_tail3Angle = (10 * Math.sin(g_seconds));
    }
    if (g_leg1Animation) {
        g_leg1Angle = (10 * Math.sin(g_seconds));
    }
    if (g_leg2Animation) {
        g_leg2Angle = (10 * Math.sin(g_seconds));
    }
    if (g_leg3Animation) {
        g_leg3Angle = (10 * Math.sin(g_seconds));
    }
    if (g_leg4Animation) {
        g_leg4Angle = (10 * Math.sin(g_seconds));
    }
    if (g_ear1Animation) {
        g_ear1Angle = (10 * Math.sin(g_seconds));
    }
    if (g_ear2Animation) {
        g_ear2Angle = (10 * Math.sin(g_seconds));
    }
}

function keydown(ev) {
    if (ev.keyCode == 87) { // W
        g_camera.forward();
    } else
        if (ev.keyCode == 83) { // S
            g_camera.back();
        } else
            if (ev.keyCode == 65) { // A
                g_camera.left();
            } else
                if (ev.keyCode == 68) { // D
                    g_camera.right();
                } else
                    if (ev.keyCode == 81) { // Q
                        g_camera.panleft();
                    } else
                        if (ev.keyCode == 69) { // E
                            g_camera.panright();
                        }
    renderAllShapes();
    console.log(`Eye: ${camera.eye}, At: ${camera.at}`);
}


//var g_eye = [0,0,3];
//var g_at = [0,0,-100];
//var g_up = [0,1,0];
var g_camera = new Camera();

var g_map = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
];

function drawMap() {
    for (x = 0; x < 32; x++) {
        for (y = 0; y < 32; y++) {
            //console.log(x,y);
            if (x < 1 || x == 31 || y == 0 || y == 31) {
                var body = new Cube();
                body.color = [0.8, 1.0, 1.0, 1.0];
                body.matrix.translate(0, -.75, 0);
                body.matrix.scale(.4, .4, .4);
                body.matrix.translate(x - 16, 0, y - 16);
                body.render();
            }
        }
    }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

    // Check the time at the start of this function
    var startTime = performance.now();

    // Pass the projection matrix
    var projMat = new Matrix4();
    projMat.setPerspective(50, 1 * canvas.width / canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    // Pass the view matrix
    var viewMat = new Matrix4();
    viewMat.setLookAt(
        g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
        g_camera.at.x, g_camera.at.y, g_camera.at.z,
        g_camera.up.x, g_camera.up.y, g_camera.up.z);
    //viewMat.setLookAt(0,0,3,  0,0,-100,  0,1,0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // Pass the matrix to u_ModelMatrix attribute
    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the map
    drawMap();

    // Draw the floor
    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.textureNum = 1;
    body.matrix.translate(0, -.75, 0.0);
    body.matrix.scale(10, 0, 10);
    body.matrix.translate(-.5, 0, -0.5);
    body.render();

    // Draw the sky
    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0];
    sky.textureNum = 0;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -0.5);
    sky.render();

    // Body
    var body = new Cube();
    body.color = [0.3, 0.4, 0.5, 1.0];
    body.matrix.translate(-0.5, -0.25, -0.25);
    body.matrix.scale(0.75, 0.3, 0.5);
    body.render();

    // Back Right Leg
    var leg1 = new Cube();
    leg1.color = [0.3, 0.5, 0.7, 1.0];
    leg1.matrix.rotate(180, 0, 0, 1);
    leg1.matrix.translate(0.3, 0.25, -0.2);
    leg1.matrix.rotate(g_leg1Angle, 0, 0, 1);
    leg1.matrix.scale(0.1, 0.25, 0.1);
    leg1.render();

    // Back Left Leg
    var leg2 = new Cube();
    leg2.color = [0.3, 0.5, 0.7, 1.0];
    leg2.matrix.rotate(180, 0, 0, 1);
    leg2.matrix.translate(0.3, 0.25, 0.1);
    leg2.matrix.rotate(g_leg2Angle, 0, 0, 1);
    leg2.matrix.scale(0.1, 0.25, 0.1);
    leg2.render();

    // Front Right Leg
    var leg3 = new Cube();
    leg3.color = [0.3, 0.5, 0.7, 1.0];
    leg3.matrix.rotate(180, 0, 0, 1);
    leg3.matrix.translate(-0.15, 0.25, -0.2);
    leg3.matrix.rotate(g_leg3Angle, 0, 0, 1);
    leg3.matrix.scale(0.1, 0.25, 0.1);
    leg3.render();

    // Front Left Leg
    var leg4 = new Cube();
    leg4.color = [0.3, 0.5, 0.7, 1.0];
    leg4.matrix.rotate(180, 0, 0, 1);
    leg4.matrix.translate(-0.15, 0.25, 0.1);
    leg4.matrix.rotate(g_leg4Angle, 0, 0, 1);
    leg4.matrix.scale(0.1, 0.25, 0.1);
    leg4.render();

    // Head
    var head = new Cube();
    head.color = [0.6, 0.6, 0.6, 1.0];
    head.matrix.translate(0.25, -0.175, -0.125);
    head.matrix.scale(0.25, 0.25, 0.25);
    head.render();

    // Nose
    var nose = new Cube();
    nose.color = [0.6, 0.3, 0.0, 1.0];
    nose.matrix.translate(0.5, -0.125, -0.05);
    nose.matrix.scale(0.1, 0.1, 0.1);
    nose.render();

    // Right Eye
    var eye1 = new Cube();
    eye1.color = [1.0, 1.0, 0.0, 1.0];
    eye1.matrix.translate(0.5, -0.05, -0.1);
    eye1.matrix.scale(0.025, 0.05, 0.05);
    eye1.render();

    // Left Eye
    var eye2 = new Cube();
    eye2.color = [1.0, 1.0, 0.0, 1.0];
    eye2.matrix.translate(0.5, -0.05, 0.05);
    eye2.matrix.scale(0.025, 0.05, 0.05);
    eye2.render();

    // Right Ear
    var ear1 = new Cube();
    ear1.color = [0.3, 0.5, 0.7, 1.0];
    ear1.matrix.translate(0.25, 0.075, -0.10);
    ear1.matrix.rotate(g_ear1Angle, 0, 0, 1);
    ear1.matrix.scale(0.1, 0.15, 0.075);
    ear1.render();

    // Left Ear
    var ear2 = new Cube();
    ear2.color = [0.3, 0.5, 0.7, 1.0];
    ear2.matrix.translate(0.25, 0.075, 0.05);
    ear2.matrix.rotate(g_ear2Angle, 0, 0, 1);
    ear2.matrix.scale(0.1, 0.15, 0.075);
    ear2.render();

    // Right Teeth
    var teeth1 = new Cube();
    teeth1.color = [1.0, 1.0, 1.0, 1.0];
    teeth1.matrix.translate(0.4, -0.25, -0.10);
    teeth1.matrix.scale(0.05, 0.075, 0.05);
    teeth1.render();

    // Left Teeth
    var teeth2 = new Cube();
    teeth2.color = [1.0, 1.0, 1.0, 1.0];
    teeth2.matrix.translate(0.4, -0.25, 0.05);
    teeth2.matrix.scale(0.05, 0.075, 0.05);
    teeth2.render();

    // Tail
    var tail = new Cube();
    tail.color = [0.3, 0.5, 0.7, 1.0];
    tail.matrix.translate(-0.4, -0.175, -0.125);
    tail.matrix.rotate(90, 0, 0, 1);
    tail.matrix.rotate(g_tail1Angle, 0, 0, 1);
    var tailCoordinatesMat = new Matrix4(tail.matrix);
    tail.matrix.scale(0.15, 0.2, 0.15);
    tail.render();

    // Small Tail
    var tail2 = new Cube();
    tail2.color = [0.3, 0.4, 0.5, 1.0];
    tail2.matrix = tailCoordinatesMat;
    tail2.matrix.rotate(g_tail2Angle, 0, 0, 1);
    var tail2CoordinatesMat = new Matrix4(tail2.matrix);
    tail2.matrix.scale(0.1, 0.35, 0.1);
    tail2.render();

    // Smaller Tail
    var tail3 = new Cube();
    tail3.color = [0.6, 0.6, 0.6, 1.0];
    tail3.matrix = tail2CoordinatesMat;
    tail3.matrix.rotate(g_tail3Angle, 0, 0, 1);
    tail3.matrix.scale(0.075, 0.5, 0.075);
    tail3.render();

    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

var g_shapesList = [];

function click(ev) {

    // Extract the event click and return it in WebGL coordinates
    let [x, y] = convertCoordinatesEventToGL(ev);

    // Create and store the new point
    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    } else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_selectedSegments;
    }
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();

}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}