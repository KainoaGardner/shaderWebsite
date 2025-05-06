export const SQUARE_VERTEX_SHADER = `#version 300 es
precision mediump float;

in vec2 aPosition;

void main() {

  gl_Position = vec4(aPosition,0.0,1.0);
}`;

export const SQUARE_TEXTURE_VERTEX_SHADER = `#version 300 es
precision mediump float;

in vec2 aPosition;

in vec2 aTexCoord;
out vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;

  gl_Position = vec4(aPosition,0.0,1.0);
}`;

export * as VERTEX from "./vertex"
