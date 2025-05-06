export const FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;

in vec2 vTexCoord;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

uniform sampler2D uImage;


void main(){
	outputColor = texture(uImage,vTexCoord);
}`


export const SIERPINSKI_CARPET_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

const int maxIterations=6;

// vec2 rot(vec2 uv,float a){
// 	return vec2(uv.x*cos(a)-uv.y*sin(a),uv.y*cos(a)+uv.x*sin(a));
// }

vec2 rotateCenter(vec2 uv,float a){
  uv -= 0.5;
  mat2 rotMat = mat2(cos(a),-sin(a),sin(a),cos(a));
  uv *= rotMat;
  uv += 0.5;
  return uv;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution;

  float t = uTime * 0.5;
  uv = rotateCenter(uv,t);

  float zoomAmount = mod(t * 0.5,1.0);
  float scale = pow(3.0,zoomAmount);
  vec2 targetTile = vec2(1.0);
  uv = (uv - targetTile) / scale + targetTile;

  vec3 color = vec3(1.0);

  vec2 hole = step(1.0 / 3.0,uv) - step(2.0 / 3.0,uv);
  float result = hole.x * hole.y;
  for (int i = 0;i < maxIterations;i++){
    uv = fract(uv);
    hole = step(1.0 / 3.0,uv) - step(2.0 / 3.0,uv);
    result = hole.x * hole.y;
    if (result == 1.0){
      break;
    }
    uv *= 3.0;
  }

  color = mix(vec3(0.0),color,result);
	outputColor = vec4(color,1.0);
}`


export const MOVE_GRID_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform float uTime;

float box(vec2 position,float size){
  vec2 result = step(vec2(0.5) - size,position) - step(vec2(0.5) + size,position);
  return result.x * result.y;
}

vec2 brickTile(vec2 position, float zoom,float speed){
  float time = uTime * speed;
  float move = step(1.0,mod(time,2.0));
  position *= zoom;

  float oddRow = step(1.0,mod(position.y,2.0));
  oddRow = oddRow * 2.0 - 1.0;
  position.x += oddRow * time * move;

  float oddCol = step(1.0,mod(position.x,2.0));
  oddCol = oddCol * 2.0 - 1.0;
  position.y += oddCol * time * (1.0 - move);

  return fract(position);
}

void main() {
  vec2 position = gl_FragCoord.xy / uResolution;
  vec3 color = vec3(uTime);
  float speed = 5.0;

  position = brickTile(position,5.0,speed);
  
  color = vec3(box(position,0.1));

  outputColor = vec4(color, 1.0);
} `


export const COLOR_PICKER_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

#define TWO_PI 6.28318530718

out vec4 outputColor;

uniform vec2 uResolution;
uniform vec2 uMouse;

vec3 rgb2hsb( in vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
  vec4(c.gb, K.xy),
  step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
    vec4(c.r, p.yzx),
    step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
    d / (q.x + e),
    q.x);
}

vec3 hsb2rgb( in vec3 c){
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0),
  6.0) - 3.0) - 1.0,
  0.0,
  1.0);
  rgb = rgb * rgb * (3.0 - 2.0 * rgb);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

void main() {
  vec2 position = gl_FragCoord.xy / uResolution;
  vec2 mousePos = uMouse / uResolution;

  vec2 toCenter = vec2(0.5) - position;
  float angleToCenter = atan(toCenter.y, toCenter.x);
  float radius = length(toCenter) * 2.0;
  float normalizedAngle = (angleToCenter / TWO_PI) + 0.5;

  vec2 mouseToCenter = vec2(0.5) - mousePos;
  float mouseAngleToCenter = atan(mouseToCenter.y, mouseToCenter.x);
  float mouseRadius = length(mouseToCenter) * 2.0;
  float mouseNormalizedAngle = (mouseAngleToCenter / TWO_PI) + 0.5;
  vec3 mouseColor = hsb2rgb(vec3(mouseNormalizedAngle, mouseRadius, 1.0));

  float distanceToMouse = distance(position, mousePos);
  float closePercent = step(0.08, distanceToMouse);
  float edgePercent = step(0.08, distanceToMouse) - step(0.085, distanceToMouse);

  vec3 color = hsb2rgb(vec3(normalizedAngle, radius, 1.0));
  
  vec3 finalColor = mix(mouseColor, color, closePercent);
  finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), edgePercent);

  outputColor = vec4(finalColor, 1.0);
} `



export const NOISE_CIRCLE_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform float uTime;

#define PI 3.14159265358979323846

float random(float x){
  return fract(sin(x)*1e4);
}

float random(vec2 position){
  vec2 multvec = vec2(12.9898,78.233);
  float multfloat = 43758.5453123 ;
  return fract(sin(dot(position.xy,multvec)) * multfloat);
}

float noise (in vec2 position){
  vec2 iPos = floor(position);
  vec2 fPos = fract(position);

  float a = random(iPos);
  float b = random(iPos + vec2(1.0,0.0));
  float c = random(iPos + vec2(0.0,1.0));
  float d = random(iPos + vec2(1.0,1.0));

  vec2 u = fPos * fPos * (3.0 - 2.0 * fPos);
  
  float ab = mix(a,b,u.x);
  float cd = mix(c,d,u.x);
  return mix(ab,cd,u.y);
}

float circle(vec2 position,float radius,float strength,float time){
  float distance = distance(position,vec2(0.5));
  float distancePast = max(distance - radius,1e-5) * strength;
  float noise = noise((position + vec2(time)) * 10.0);
  float fadeOut = 1.0 - smoothstep(radius,radius + 0.3,distance);

  noise = noise / distancePast * fadeOut;
  
  float circleIn = step(distance,radius);
  float result = circleIn + noise;

  return result;
}

void main() {
  vec2 position = gl_FragCoord.xy / uResolution;
  vec3 color = vec3(0.0);
  
  float size = 10.0;
  
  float speed = 1.0;
  float baseTime = uTime * speed;
  float iTime = floor(baseTime);
  float fTime = fract(baseTime);

  float noise1 = circle(position,0.3,10.0,iTime);
  float noise2 = circle(position,0.3,10.0,iTime + 1.0);

  color = vec3(mix(noise1,noise2,fTime));
  outputColor = vec4(color, 1.0);
} `


export const NOISE_1D_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform float uTime;

#define PI 3.14159265358979323846

float circle(vec2 position,float radius,float speed){
  float distance = distance(position,vec2(0.5) + vec2(speed,0.0)); 
  return step(distance,radius);
}

float random(float x){
  return fract(sin(x)*1e4);
}

float random(vec2 position){
  vec2 multvec = vec2(12.9898,78.233);
  float multfloat = 43758.5453123;
  return fract(sin(dot(position.xy,multvec)) * multfloat);
}

void main() {
  vec2 position = gl_FragCoord.xy / uResolution;
  vec3 color = vec3(position.x);

  float speed = uTime * 1.0;

  vec2 grid1 = position * vec2(1.0,1.0);
  grid1.x += speed;
  float iPos = floor(grid1.x);
  float fPos = fract(grid1.x);
  float yOffset = mix(random(iPos),random(iPos + 1.0),smoothstep(0.0,1.0,fPos)) - 0.5;
  grid1.y += yOffset;
  float size = 0.5;

  color = vec3(circle(grid1,size,speed));
  outputColor = vec4(color, 1.0);
} `

export const BLOOD_CELL_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

#define PI 3.14159265358979323846

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main() {
  vec2 position = gl_FragCoord.xy / uResolution;
  vec3 color = vec3(0.5,0.0,0.0);
  float size = 3.0;

  position *= size;

  vec2 iPos = floor(position);
  vec2 fPos = fract(position);

  float minDist = 1.0;

  for (int y = -1;y <= 1;y++){
    for (int x = -1;x <= 1;x++){
      vec2 neighbor = vec2(float(x),float(y));
      vec2 point = random2(iPos + neighbor);
      point = 0.5 + 0.5 * sin(uTime + 5.8123 * point);

      float dist = distance(fPos,point + neighbor);
      minDist = min(minDist,dist);
    }
  }

  vec2 mousePos = uMouse / uResolution * size;
  float dist = distance(position,mousePos);
  minDist = min(minDist,dist);

  color += minDist;
  color.r += 1.0 - step(0.02,minDist);

  // color.r += step(0.99,fPos.x) + step(0.99,fPos.y);
  outputColor = vec4(color, 1.0);
} `

export * as FRAGMENT from "./fragment"
