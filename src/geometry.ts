export const SQUARE_VERTICES = new Float32Array([
  -1.0, -1.0,
  1.0, -1.0,
  1.0, 1.0,
  -1.0, 1.0
]);

export const SQUARE_INDICES = new Uint16Array([
  0, 1, 2,
  0, 2, 3,
]);

export function createPositionBufferVao(
  gl: WebGL2RenderingContext,
  positionBuffer: WebGLBuffer, indexBuffer: WebGLBuffer,
  positionAttribLocation: number,
  positionSize: number
) {
  const vao = gl.createVertexArray();
  if (!vao) {
    console.error("Falied to make vertex array");
  }

  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttribLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttribLocation, positionSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return vao;
}

export * as Geometry from "./geometry"
