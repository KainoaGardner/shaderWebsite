export function createStaticVertexBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.error("Falied to createbuffer")
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return buffer;
}

export function createStaticIndexBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    console.error("Falied to createbuffer")
    return null;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return buffer;
}

export function createProgram(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  const program = gl.createProgram();

  if (!vertexShader || !fragmentShader || !program) {
    console.error("could not create program")
    return null;
  }

  gl.shaderSource(vertexShader, vertexShaderSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    const compileError = gl.getShaderInfoLog(vertexShader);
    console.error(`Vertex: ${compileError}`);
    return null;
  }

  gl.shaderSource(fragmentShader, fragmentShaderSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    const compileError = gl.getShaderInfoLog(fragmentShader);
    console.error(`Fragment: ${compileError}`);
    return null;
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const compileError = gl.getProgramInfoLog(program);
    console.error(`Program Link: ${compileError}`);
    return null;
  }

  return program;

}

export function addShader(shaders: doubleShader[], shader: doubleShader | null) {
  if (!shader) {
    console.error("could not make shader")
    return
  }
  shaders.push(shader)
}




export interface shader {
  gl: WebGL2RenderingContext;
  vao: WebGLVertexArrayObject;
  indicesLength: number;
  program: WebGLProgram;
  uniform: WebGLUniformLocation[] | null[]; //0=canvasSize,1=timePassed,2=mousePos,3=image
}

export interface mousePos {
  mousePosX: number;
  mousePosY: number;
}

export interface doubleShader {
  context0: shader;
  context1: shader;
}



