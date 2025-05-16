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
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
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
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_mouseLastX = null;
let g_mouseLastY = null;
let g_mouseDragging = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events
  document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false; };
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true; };
  document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false; };
  document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true; };

  // Color Slider Events
  document.getElementById('yellowSlide').addEventListener('mousemove',  function() { g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById('magentaSlide').addEventListener('mousemove',  function() { g_magentaAngle = this.value; renderAllShapes(); });

  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
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
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

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
  image.onload = function() {
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
  // canvas.onmousedown = click;
  //canvas.onmousemove = click;
  // canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  document.onkeydown = keydown;
  
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Render
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  
  // Update Animation Angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }

}

function keydown(ev) {
  if (ev.keyCode == 87) { // W
    g_camera.forward();
  } else if (ev.keyCode == 83) { // S
    g_camera.back();
  } else if (ev.keyCode == 65) { // A
    g_camera.left();
  } else if (ev.keyCode == 68) { // D
    g_camera.right();
  } else if (ev.keyCode == 81) { // Q
    g_camera.panleft();
  } else if (ev.keyCode == 69) { // E
    g_camera.panright();
  } else if (ev.keyCode == 71) { // Add block
    addBlockInFront();
  } else if (ev.keyCode == 72) { // Remove block
    removeBlockInFront();
  }
  renderAllShapes();
  console.log(`Eye: ${g_camera.eye}, At: ${g_camera.at}`);
}

function getMapCoordsInFront() {
  let forward = new Vector3();
  forward.set(g_camera.at);
  forward.sub(g_camera.eye);
  forward.normalize();

  let targetX = Math.floor(g_camera.eye.x + forward.x);
  let targetZ = Math.floor(g_camera.eye.z + forward.z);

  // Clamp within map bounds
  targetX = Math.max(0, Math.min(31, targetX));
  targetZ = Math.max(0, Math.min(31, targetZ));

  return [targetX, targetZ];
}

function addBlockInFront() {
  const [x, z] = getMapCoordsInFront();

  // Initialize column if needed
  if (!g_map[x]) g_map[x] = [];
  g_map[x][z] = 1;
}

function removeBlockInFront() {
  const [x, z] = getMapCoordsInFront();

  if (g_map[x]) {
    g_map[x][z] = 0;
  }
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
  for (let x = 0; x < 32; x++) {
    for (let z = 0; z < 32; z++) {
      if (g_map[x] && g_map[x][z] === 1) {
        let cube = new Cube();
        cube.textureNum = 1;
        cube.matrix.translate(x - 16, -0.75, z - 16);
        cube.render();
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
  projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_camera.eye.x, g_camera.eye.y, g_camera.eye.z,
    g_camera.at.x,  g_camera.at.y,  g_camera.at.z,
    g_camera.up.x,  g_camera.up.y,  g_camera.up.z);
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
  body.color = [1.0,0.0,0.0,1.0];
  body.textureNum = 1;
  body.matrix.translate(0, -.75, 0.0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-.5, 0, -0.5);
  body.render();

  // Draw the sky
  var sky = new Cube();
  sky.color = [1.0,0.0,0.0,1.0];
  sky.textureNum = 0;
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-.5, -.5, -0.5);
  sky.render();

  // Draw the body cube
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.matrix.translate(-.25, -.75, 0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, .3, .5);
  body.render();

  // Yellow arm
  var yellow = new Cube();
  yellow.color = [1,1,0,1];
  yellow.matrix.setTranslate(0, -.5, 0.0);
  yellow.matrix.rotate(-5,1,0,0);
  yellow.matrix.rotate(-g_yellowAngle, 0,0,1);
  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, .7, .5);
  yellow.matrix.translate(-.5,0,0);
  yellow.render();

  // Magenta box
  var magenta = new Cube();
  magenta.color = [1,0,1,1];
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(0, 0.65, 0);
  magenta.matrix.rotate(g_magentaAngle,0,0,1);
  magenta.matrix.scale(.3,.3,.3);
  magenta.matrix.translate(-.5,0, -0.001);
  magenta.render();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML( " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

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