// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 30.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`


// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events (Shape Type)
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick   = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() {g_shapesList = []; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT};
  document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE};

  document.getElementById('myDrawingButton').onclick = drawMyDrawing;

  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup',   function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value/100; });

  // Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup',  function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });

}

function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

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
  point.position = [x,y];
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

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}


// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw each shape in the list
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

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

function drawMyDrawing() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // === Sky Background ===
  gl.uniform4f(u_FragColor, 0.6, 0.85, 1.0, 1.0); // Light blue

  // Sky - upper left triangle
  drawTriangle([
    -1.0, 0.0,
     1.0, 0.0,
    -1.0, 1.0
  ]);

  // Sky - upper right triangle
  drawTriangle([
     1.0, 0.0,
     1.0, 1.0,
    -1.0, 1.0
  ]);

  // === Helmet ===
  gl.uniform4f(u_FragColor, 0.3, 0.3, 0.3, 1.0); // Steel gray
  drawTriangle([
    0.0,  0.65,
   -0.12, 0.4,
    0.12, 0.4
  ]);

  // === Helmet Eye Holes ===
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // Black holes
  drawTriangle([
    -0.06, 0.48,
    -0.04, 0.46,
    -0.08, 0.46
  ]);
  drawTriangle([
     0.06, 0.48,
     0.08, 0.46,
     0.04, 0.46
  ]);

  // === Body ===
  gl.uniform4f(u_FragColor, 0.0, 0.4, 0.8, 1.0); // Blue tunic
  drawTriangle([
     0.0,  0.4,
    -0.15, 0.1,
     0.15, 0.1
  ]);

  // === Armor Plate ===
  gl.uniform4f(u_FragColor, 0.5, 0.5, 0.5, 1.0); // Silver armor
  drawTriangle([
     0.0, 0.38,
    -0.1, 0.15,
     0.1, 0.15
  ]);

  // === Left Arm ===
  gl.uniform4f(u_FragColor, 0.0, 0.4, 0.8, 1.0);
  drawTriangle([
    -0.15, 0.35,
    -0.25, 0.2,
    -0.15, 0.1
  ]);

  // === Shield ===
  gl.uniform4f(u_FragColor, 0.5, 0.3, 0.1, 1.0); // Outer shield
  drawTriangle([
    -0.25, 0.25,
    -0.35, 0.15,
    -0.25, 0.05
  ]);
  gl.uniform4f(u_FragColor, 0.7, 0.5, 0.2, 1.0); // Inner highlight
  drawTriangle([
    -0.25, 0.23,
    -0.33, 0.15,
    -0.25, 0.07
  ]);

  // === Right Arm ===
  gl.uniform4f(u_FragColor, 0.0, 0.4, 0.8, 1.0);
  drawTriangle([
     0.15, 0.35,
     0.25, 0.2,
     0.15, 0.1
  ]);

  // === Shoulder Pads ===
  gl.uniform4f(u_FragColor, 0.6, 0.6, 0.6, 1.0); // Light silver for metal pads

  // Left shoulder pad
  drawTriangle([
    -0.15, 0.4,
    -0.25, 0.35,
    -0.15, 0.3
  ]);

  // Right shoulder pad
  drawTriangle([
    0.15, 0.4,
    0.25, 0.35,
    0.15, 0.3
  ]);

  // === Sword ===

  // Sword Blade (composed of two narrow triangles)
  gl.uniform4f(u_FragColor, 0.8, 0.8, 0.9, 1.0); // Bright blade
  drawTriangle([
    0.25, 0.25,
    0.27, 0.05,
    0.23, 0.05
  ]);
  drawTriangle([
    0.25, 0.25,
    0.27, 0.2,
    0.23, 0.2
  ]);

  // Sword Hilt
  gl.uniform4f(u_FragColor, 0.3, 0.2, 0.1, 1.0); // Brown/wood
  drawTriangle([
    0.23, 0.25,
    0.27, 0.25,
    0.25, 0.23
  ]);

  // === Legs ===
  gl.uniform4f(u_FragColor, 0.2, 0.2, 0.2, 1.0); // Dark pants
  drawTriangle([
    -0.05, 0.1,
    -0.1, -0.2,
     0.0, -0.2
  ]);
  drawTriangle([
     0.05, 0.1,
     0.0, -0.2,
     0.1, -0.2
  ]);

  // === Ground ===
  gl.uniform4f(u_FragColor, 0.0, 0.6, 0.0, 1.0); // Green

  // Ground - lower left triangle
  drawTriangle([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0, 0.0
  ]);

  // Ground - lower right triangle
  drawTriangle([
     1.0, -1.0,
     1.0, 0.0,
    -1.0, 0.0
  ]);
}