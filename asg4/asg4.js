// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {

    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);

    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;

    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV,1.0,1.0);

    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }

    vec3 lightVector = u_lightPos-vec3(v_VertPos);
    float r=length(lightVector);

    // Red/Green Distance Visualization
    // if (r<1.0) {
    //   gl_FragColor = vec4(1,0,0,1);
    // } else if (r<2.0) {
    //   gl_FragColor = vec4(0,1,0,1);
    // }

    // Light Falloff Visualization 1/r^2
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(E,R), 0.0),64.0) * 0.8;

    vec3 diffuse = vec3(1.0,1.0,0.9) * vec3(gl_FragColor) * nDotL *0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if (u_lightOn) {
      if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    }
  }`


// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_lightPos;
let u_cameraPos;

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

  // // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_lightOn
  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_lightPos
  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  // Get the storage location of u_cameraPos
  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
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

  // Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }
  // Get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }


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
let g_yellowAnimation = true;
let g_magentaAnimation = false;
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos = [0,1,-2];

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

  // Button Events
  document.getElementById('lightOn').onclick = function() {g_lightOn=true;};
  document.getElementById('lightOff').onclick = function() {g_lightOn=false;};
  document.getElementById('normalOn').onclick = function() {g_normalOn=true;};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false;};
  document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation = false; };
  document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation = true; };
  document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation = false; };
  document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation = true; };

  // Color Slider Events
  document.getElementById('yellowSlide').addEventListener('mousemove',  function(ev) { if(ev.buttons == 1) {g_yellowAngle = this.value; renderAllShapes();}});
  document.getElementById('magentaSlide').addEventListener('mousemove',  function(ev) {if(ev.buttons == 1) { g_magentaAngle = this.value; renderAllShapes();}});
  document.getElementById('lightSlideX').addEventListener('mousemove',  function(ev) {if(ev.buttons == 1) { g_lightPos[0] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideY').addEventListener('mousemove',  function(ev) {if(ev.buttons == 1) { g_lightPos[1] = this.value/100; renderAllShapes();}});
  document.getElementById('lightSlideZ').addEventListener('mousemove',  function(ev) {if(ev.buttons == 1) { g_lightPos[2] = this.value/100; renderAllShapes();}});

  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Size Slider Events
  //document.getElementById('angleSlide').addEventListener('mouseup',  function() { g_globalAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

}

function initTextures() {
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendImageToTEXTURE0( image0); };
  // Tell the browser to load an image
  image0.src = 'grass.jpeg';

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendImageToTEXTURE1( image1); };
  // Tell the browser to load an image
  image1.src = 'sky.jpg';

  // Add more texture loading

  return true;
}

function sendImageToTEXTURE0( image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  //gl.clear(gl.COLOR_BUFFER_BIT);

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1( image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  // Enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  //gl.clear(gl.COLOR_BUFFER_BIT);

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
  console.log('finished loadTexture');
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

  g_lightPos[0] = 2.0*Math.cos(g_seconds);
}

function keydown(ev) {
  if (ev.keyCode==39) {
    g_camera.panright();
  } else
  if (ev.keyCode == 37) {
    g_camera.panleft();
  }
  if (ev.keyCode == 87) { g_camera.forward();}
  if (ev.keyCode == 83) { g_camera.back(); }
  if (ev.keyCode == 65) { g_camera.left(); }
  if (ev.keyCode == 68) { g_camera.right(); }
  if (ev.keyCode == 81) { g_camera.panleft(); }
  if (ev.keyCode == 69) { g_camera.panright(); }

  renderAllShapes();
  console.log(ev.keyCode);
}


//var g_eye = [0,0,3];
//var g_at = [0,0,-100];
//var g_up = [0,1,0];
var g_camera = new Camera();

var g_map = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1]
];

function drawMap() {
  var body = new Cube();
  for (i=0;i<2;i++) {
    for (x=0;x<32;x++) {
      for (y=0;y<32;y++) {
        


        body.color = [0.8,1.0,1.0,1.0];
        body.matrix.setTranslate(0,-.75,0);
        body.matrix.scale(.4,.4,.4);
        body.matrix.translate(x-16, 0, y-16);
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
  projMat.setPerspective(90, 1*canvas.width/canvas.height, .1, 100);
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
  //drawMap();

  // Pass the light position to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  // Pass the camera position to GLSL
  gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);

  // Pass the light status
  gl.uniform1i(u_lightOn, g_lightOn);

  // Draw the light
  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0],g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();

  // Draw Sphere
  var sp = new Sphere();
  sp.textureNum = 0;
  if (g_normalOn) sp.textureNum = -3;
  sp.matrix.translate(-1,-1.5,-1.5);
  //sp.matrix.scale(.4,.4,.4);
  sp.render();

  // Draw the floor
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.textureNum = 0;
  body.matrix.translate(0, -2.49, 0.0);
  body.matrix.scale(10, 0, 10);
  body.matrix.translate(-.5, 0, -0.5);
  body.render();

  // Draw the sky
  var sky = new Cube();
  sky.color = [0.8,0.8,0.8,1.0];
  if (g_normalOn) sky.textureNum = -3;
  sky.matrix.scale(-5,-5,-5);
  sky.matrix.translate(-.5, -.5, -0.5);
  sky.render();

  // Draw the body cube
  var body = new Cube();
  body.color = [1.0,0.5,0.5,1.0];
  if (g_normalOn) body.textureNum = -3;
  body.matrix.translate(.25, -1.75, -1.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, .3, .5);
  body.render();

  // Yellow arm
  var yellow = new Cube();
  yellow.textureNum = -3;
  yellow.color = [1,1,.5,1];
  yellow.matrix.setTranslate(0.5, -1.5, -1.0);
  yellow.matrix.rotate(-5,1,0,0);
  yellow.matrix.rotate( g_yellowAngle, 0,0,1);
  var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, .7, .5);
  yellow.matrix.translate(-.5,0,0);
  yellow.render();


  // Magenta box
  var magenta = new Cube();
  magenta.color = [.5,.5,1,1];
  if (g_normalOn) magenta.textureNum = -3;
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