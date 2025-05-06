import { Geometry } from "./geometry"
import { VERTEX } from "./shaders/vertex"
import { FRAGMENT } from "./shaders/fragment"
import {
  createProgram,
  createStaticVertexBuffer,
  createStaticIndexBuffer,
  shader,
  doubleShader,
  mousePos,
  addShader
} from "./utils.ts"


let shaderShiftIndex = 0;
let startTime = performance.now();
const shaders: doubleShader[] = [];
let move = 0; //0 = not clicked, 1 = prev, 2 = next

function main() {
  const canvas0 = document.getElementById("canvas0") as HTMLCanvasElement;
  const canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;
  if (!canvas0 || !canvas1) {
    console.error("cant find canvases");
    return
  }

  moveAnimation(canvas0, canvas1)

  const gl0 = canvas0.getContext("webgl2")
  const gl1 = canvas1.getContext("webgl2")
  if (!gl0 || !gl1) {
    console.error("could not get webgl context")
    return;
  }

  const mousePos0 = { mousePosX: 0, mousePosY: 0 };
  const mousePos1 = { mousePosX: 0, mousePosY: 0 };

  document.addEventListener("mousemove", function(event) {
    const rect0 = canvas0.getBoundingClientRect()
    const mousePosX0 = event.clientX - rect0.left;
    const mousePosY0 = canvas0.height - event.clientY + rect0.top;

    const rect1 = canvas1.getBoundingClientRect()
    const mousePosX1 = event.clientX - rect1.left;
    const mousePosY1 = canvas1.height - event.clientY + rect1.top;

    mousePos0.mousePosX = mousePosX0
    mousePos0.mousePosY = mousePosY0
    mousePos1.mousePosX = mousePosX1
    mousePos1.mousePosY = mousePosY1
  });


  const testShader = createDoubleShader(gl0, gl1,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    VERTEX.SQUARE_VERTEX_SHADER,
    FRAGMENT.FRAGMENT_SHADER,
    [true, false, false],
  );


  const sierpinskiCarpetShader = createDoubleShader(gl0, gl1,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    VERTEX.SQUARE_VERTEX_SHADER,
    FRAGMENT.SIERPINSKI_CARPET_FRAGMENT_SHADER,
    [true, true, false],
  );

  const moveGridShader = createDoubleShader(gl0, gl1,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    VERTEX.SQUARE_VERTEX_SHADER,
    FRAGMENT.MOVE_GRID_FRAGMENT_SHADER,
    [true, true, false],
  );

  const colorPickerShader = createDoubleShader(gl0, gl1,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    VERTEX.SQUARE_VERTEX_SHADER,
    FRAGMENT.COLOR_PICKER_FRAGMENT_SHADER,
    [true, false, true],
  );

  const noise1DCircleShader = createDoubleShader(gl0, gl1,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    VERTEX.SQUARE_VERTEX_SHADER,
    FRAGMENT.NOISE_1D_FRAGMENT_SHADER,
    [true, true, false],
  );

  const noiseCircleShader = createDoubleShader(gl0, gl1,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    VERTEX.SQUARE_VERTEX_SHADER,
    FRAGMENT.NOISE_CIRCLE_FRAGMENT_SHADER,
    [true, true, false],
  );

  const bloodCellShader = createDoubleShader(gl0, gl1,
    Geometry.SQUARE_VERTICES,
    Geometry.SQUARE_INDICES,
    VERTEX.SQUARE_VERTEX_SHADER,
    FRAGMENT.BLOOD_CELL_FRAGMENT_SHADER,
    [true, true, true],
  );

  addShader(shaders, testShader)
  addShader(shaders, sierpinskiCarpetShader)
  addShader(shaders, moveGridShader)
  addShader(shaders, colorPickerShader)
  addShader(shaders, noiseCircleShader)
  addShader(shaders, noise1DCircleShader)
  addShader(shaders, bloodCellShader)


  // let lastFrameTime = performance.now();
  const frame = function() {
    // const currFrameTime = performance.now();
    // const dt = (currFrameTime - lastFrameTime) / 1000;
    // lastFrameTime = currFrameTime;


    drawShader(false, canvas0, gl0, shaders, shaderShiftIndex, startTime, mousePos0);
    drawShader(true, canvas1, gl1, shaders, (shaderShiftIndex + 1) % shaders.length, startTime, mousePos1);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function createDoubleShader(
  gl0: WebGL2RenderingContext,
  gl1: WebGL2RenderingContext,
  vertices: Float32Array,
  vertexIndices: Uint16Array,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  uniforms: Boolean[],
): doubleShader | null {

  const shader0 = createShader(gl0,
    vertices,
    vertexIndices,
    vertexShaderSource,
    fragmentShaderSource,
    uniforms,
  );

  const shader1 = createShader(gl1,
    vertices,
    vertexIndices,
    vertexShaderSource,
    fragmentShaderSource,
    uniforms,
  );

  if (!shader0 || !shader1) {
    console.error("could not make double Shader")
    return null
  }

  return { context0: shader0, context1: shader1 }
}

function createDoubleTextureShader(
  gl0: WebGL2RenderingContext,
  gl1: WebGL2RenderingContext,
  vertices: Float32Array,
  vertexIndices: Uint16Array,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  uniforms: Boolean[],
): doubleShader | null {

  const shader0 = createShader(gl0,
    vertices,
    vertexIndices,
    vertexShaderSource,
    fragmentShaderSource,
    uniforms,
  );

  const shader1 = createShader(gl1,
    vertices,
    vertexIndices,
    vertexShaderSource,
    fragmentShaderSource,
    uniforms,
  );

  if (!shader0 || !shader1) {
    console.error("could not make double Shader")
    return null
  }

  return { context0: shader0, context1: shader1 }
}

function createShader(
  gl: WebGL2RenderingContext,
  vertices: Float32Array,
  vertexIndices: Uint16Array,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  uniforms: Boolean[],
): shader | null {

  const vertexBuffer = createStaticVertexBuffer(gl, vertices);
  const vertexIndexBuffer = createStaticIndexBuffer(gl, vertexIndices);
  if (!vertexBuffer || !vertexIndexBuffer) {
    console.error("could not make vertexBuffer")
    return null
  }

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  if (!program) {
    console.error("could not make program")
    return null
  }

  const vertexPositionAttribute = gl.getAttribLocation(program, "aPosition");
  if (vertexPositionAttribute < 0) {
    console.error("Could not find attribuites")
    return null
  }

  const vao = Geometry.createPositionBufferVao(gl, vertexBuffer, vertexIndexBuffer, vertexPositionAttribute, vertexIndices.length / 3);
  if (!vao) {
    console.error("could not make vao")
    return null
  }


  const uniformLocations: WebGLUniformLocation[] | null[] = new Array(4);

  if (uniforms[0]) {
    const canvasSizeUniform = gl.getUniformLocation(program, "uResolution")
    if (canvasSizeUniform === null) {
      console.error("Could not find canvas size uniform")
      return null;
    }
    uniformLocations[0] = canvasSizeUniform;
  }

  if (uniforms[1]) {
    const timePassedUniform = gl.getUniformLocation(program, "uTime")
    if (timePassedUniform === null) {
      console.error("Could not find start time uniform")
      return null;
    }
    uniformLocations[1] = timePassedUniform;
  }

  if (uniforms[2]) {
    const mousePosUniform = gl.getUniformLocation(program, "uMouse")
    if (mousePosUniform === null) {
      console.error("Could not find mouse pos uniform")
      return null;
    }
    uniformLocations[2] = mousePosUniform;
  }

  uniformLocations[3] = null

  const shader: shader = { gl: gl, vao: vao, indicesLength: vertexIndices.length, program: program, uniform: uniformLocations };
  return shader
}

function createTextureShader(
  gl: WebGL2RenderingContext,
  vertices: Float32Array,
  vertexIndices: Uint16Array,
  textureVertices: Float32Array,
  textureIndices: Uint16Array,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  uniforms: Boolean[],
  image: HTMLImageElement,
): shader | null {

  const vertexBuffer = createStaticVertexBuffer(gl, vertices);
  const vertexIndexBuffer = createStaticIndexBuffer(gl, vertexIndices);
  if (!vertexBuffer || !vertexIndexBuffer) {
    console.error("could not make vertexBuffer")
    return null
  }

  const textureBuffer = createStaticVertexBuffer(gl, textureVertices);
  const textureIndexBuffer = createStaticIndexBuffer(gl, textureIndices);
  if (!textureBuffer || !textureIndexBuffer) {
    console.error("could not make texture vertex Buffer")
    return null
  }

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  if (!program) {
    console.error("could not make program")
    return null
  }

  const vertexPositionAttribute = gl.getAttribLocation(program, "aPosition");
  if (vertexPositionAttribute < 0) {
    console.error("Could not find attribuites")
    return null
  }

  const textureCoordAttribute = gl.getAttribLocation(program, "aTexCoord");
  if (textureCoordAttribute < 0) {
    console.error("Could not find texturecoord attribuites")
    return null
  }

  const vao = Geometry.createTextureBufferVao(
    gl,
    vertexBuffer,
    vertexIndexBuffer,
    vertexPositionAttribute,
    vertexIndices.length / 3,
    textureBuffer,
    textureIndexBuffer,
    textureCoordAttribute,
    textureIndices.length / 3
  );
  if (!vao) {
    console.error("could not make vao")
    return null
  }


  const uniformLocations: WebGLUniformLocation[] = new Array(4);

  if (uniforms[0]) {
    const canvasSizeUniform = gl.getUniformLocation(program, "uResolution")
    if (canvasSizeUniform === null) {
      console.error("Could not find canvas size uniform")
      return null;
    }
    uniformLocations[0] = canvasSizeUniform;
  }

  if (uniforms[1]) {
    const timePassedUniform = gl.getUniformLocation(program, "uTime")
    if (timePassedUniform === null) {
      console.error("Could not find start time uniform")
      return null;
    }
    uniformLocations[1] = timePassedUniform;
  }

  if (uniforms[2]) {
    const mousePosUniform = gl.getUniformLocation(program, "uMouse")
    if (mousePosUniform === null) {
      console.error("Could not find mouse pos uniform")
      return null;
    }
    uniformLocations[2] = mousePosUniform;
  }

  const imageUniform = gl.getUniformLocation(program, "uImage")
  if (imageUniform === null) {
    console.error("Could not find image uniform")
    return null;
  }

  uniformLocations[2] = imageUniform;

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture)

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

  const shader: textureShader = { gl: gl, vao: vao, indicesLength: vertexIndices.length, program: program, uniform: uniformLocations };
  return shader
}


function moveAnimation(canvas0: HTMLCanvasElement, canvas1: HTMLCanvasElement) {
  const nextArrow = document.getElementById("nextArrow") as HTMLElement;
  const prevArrow = document.getElementById("prevArrow") as HTMLElement;
  if (!nextArrow || !prevArrow) {
    return;
  }

  prevArrow.addEventListener("click", function() {
    if (move !== 0) {
      return;
    }
    canvas0.style.animation = "moveOut 0.5s ease-in-out reverse"
    canvas1.style.animation = "moveIn 0.5s ease-in-out reverse"
    move = 1

    shaderShiftIndex--;
    if (shaderShiftIndex < 0) {
      shaderShiftIndex = shaders.length - 1;
    }

    startTime = performance.now()
  });

  nextArrow.addEventListener("click", function() {
    if (move !== 0) {
      return;
    }
    canvas0.style.animation = "moveOut 0.5s ease-in-out"
    canvas1.style.animation = "moveIn 0.5s ease-in-out"
    move = 2

    startTime = performance.now()
  });

  canvas0.addEventListener("animationend", function() {
    canvas0.style.animation = ""

    if (move === 2) {
      shaderShiftIndex++;
      if (shaderShiftIndex >= shaders.length) {
        shaderShiftIndex = 0
      }
    }
    move = 0
  })

  canvas1.addEventListener("animationend", function() {
    canvas1.style.animation = ""
  })
}

function drawShader(
  context: boolean,//false 0,true 1
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  shaders: doubleShader[],
  shaderShiftIndex: number,
  startTime: number,
  mousePos: mousePos
) {
  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  let currShader: shader;
  if (!context) {
    currShader = shaders[shaderShiftIndex].context0;
  } else {
    currShader = shaders[shaderShiftIndex].context1;
  }

  gl.clearColor(0.02, 0.02, 0.02, 1.0);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.viewport(0, 0, canvas.width, canvas.height)

  currShader.gl.useProgram(currShader.program)

  if (currShader.uniform[0]) {
    gl.uniform2f(currShader.uniform[0], canvas.width, canvas.height);
  }

  if (currShader.uniform[1]) {
    const currFrameTime = performance.now();
    const timePassed = (currFrameTime - startTime) / 1000;
    gl.uniform1f(currShader.uniform[1], timePassed);
  }

  if (currShader.uniform[2]) {
    gl.uniform2f(currShader.uniform[2], mousePos.mousePosX, mousePos.mousePosY);
  }

  if (currShader.uniform[3]) {
    gl.uniform1i(currShader.uniform[3], 0);
  }

  gl.bindVertexArray(currShader.vao)
  gl.drawElements(gl.TRIANGLES, currShader.indicesLength, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArray(null)
}


const images: HTMLImageElement[] = [];
function setup() {
  const image = new Image();
  if (!image) {
    console.error("Could not load image")
    return
  }
  image.src = "./imgs/wave.jpg"
  image.onload = function() {
    images.push(image);
    console.log(image)
    main();
  }

}


setup();
