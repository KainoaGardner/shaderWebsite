export const CLOCK_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform vec3 uCurrTime; //hr,min,sec

float bin(vec2 iPos, float n){
  float remain = mod(n,33554432.);
  for (float i = 0.; i < 25.; i++){
    if (floor(i/3.) == iPos.y && mod(i,3.) == iPos.x){
      return step(1.,mod(remain,2.));
    }
    remain = ceil(remain / 2.);
  }

  return 0.0;
}

float char(vec2 st,float n, vec2 scale,vec2 translate){
  st.x = st.x * scale.x - translate.x;
  st.y = st.y * scale.y - translate.y;
  
  vec2 grid = vec2(3.,5.);
  
  vec2 iPos = floor(st * grid);
  vec2 fPos = fract(st * grid);

  n = floor(mod(n,11.));
  float digit = 0.0;
  if (n < 1.) { digit = 31600.;}
  else if (n < 2.) { digit = 9363.;}
  else if (n < 3.) { digit = 31184.;}
  else if (n < 4.) { digit = 31208.;}
  else if (n < 5.) { digit = 23525.;}
  else if (n < 6.) { digit = 29672.;}
  else if (n < 7.) { digit = 29680.;}
  else if (n < 8.) { digit = 31013.;}
  else if (n < 9.) { digit = 31728.;}
  else if (n < 10.) { digit = 31717.;}
  else if (n < 11.) { digit = 1041.;}
  float pct = bin(iPos,digit);

  vec2 borders = vec2(1.);
  borders *= step(0.1,fPos.x) * step(0.1,fPos.y); //inner
  borders *= step(0.0,st) * step(0.0,1. - st); //outer
  
  return step(0.5,1. - pct) * borders.x * borders.y;
  
}

void main(){
  vec2 st = gl_FragCoord.xy / uResolution;

  float sec = mod(uCurrTime.z,60.);
  float min = mod(uCurrTime.y,60.);
  float hour = mod(uCurrTime.x,12.);

  float digit0 = mod(sec,10.);
  float digit1 = mod(sec / 10.,10.);
  float digit2 = mod(min,10.);
  float digit3 = mod(min / 10.,10.);
  float digit4 = mod(hour,10.);
  float digit5 = mod(hour / 10.,10.);
  float digits[6] = float[6](digit0,digit1,digit2,digit3,digit4,digit5);
  
  vec2 zoom = vec2(6.,1.);

  st -= vec2(0.5);
  st *= zoom;
  st += vec2(0.5 * zoom);

  vec2 iPos = floor(st);
  vec2 fPos = fract(st);

  // vec2 offset = vec2(mod(iPos.x,2.) * -0.5,zoom.x / 2. - 0.5);
  vec2 offset = vec2(0.,zoom.x / 2. - 0.5);
  fPos *= vec2(1.,zoom.x);
  fPos -= vec2(offset);

  int col = int(5. - iPos.x);
  vec2 scale = vec2(1.25,1.2);
  vec2 translate = vec2(0.125,0.1);
  vec3 charPct = vec3(char(fPos,digits[col],scale,translate));

  st += vec2(0.5,0.);

  iPos = floor(st);
  fPos = fract(st);

  zoom *= vec2(3.,0.);
  fPos *= vec2(1.,zoom.x);
  fPos -= vec2(0.,zoom.x / 2. - 0.5);

  scale = vec2(2.,1.2);
  translate = vec2(.523,.1);
  float colonPct = char(fPos,10.,scale,translate);
  colonPct *= mod(iPos.x + 1.,2.) * (step(2.,iPos.x) - step(5.,iPos.x));

  vec3 color = vec3(charPct + colonPct);
  // vec3 color = vec3(charPct);

  
  vec2 st0 = gl_FragCoord.xy / uResolution;

  //do the clock hands code here
  outputColor = vec4(color,1.0);
}`


export const WALDO_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;
in vec2 vTexCoord;

uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform vec2 uMouse;
uniform float uTime;

uniform sampler2D uImage;

float circle(vec2 pos,vec2 mousePos,float r){
  float d = distance(pos,mousePos);
  float result = step(d,r);

  return result;
}

float circleBorder(vec2 pos,vec2 mousePos,float r,float borderSize){
  float d = distance(pos,mousePos);
  float result = step(d,r) - step(d + borderSize,r);

  return result;
}

void main(){
  vec2 mousePos = uMouse / uResolution;
  mousePos.y = 1.0 - mousePos.y;
  float zoom = 1.0 / 3.0;

  vec2 uv = vec2(vTexCoord.x,1.0 - vTexCoord.y);
  vec2 zoomUV = (uv - mousePos) * zoom + mousePos;

  float inCircleBorder = circleBorder(uv,mousePos,0.15,0.01);
  float inCircle = circle(uv,mousePos,0.15);
  vec3 color = texture(uImage,uv).xyz;
  vec3 colorZoom = texture(uImage,zoomUV).xyz;
  
  float d = distance(mousePos,uv);
  color = mix(color,vec3(0.0),min(pow(d,0.5),0.95));

  color = mix(color,colorZoom,inCircle);
  color = mix(color,vec3(1.0),inCircleBorder);


  outputColor = vec4(color,1.0);
}`


export const WAVE_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;

in vec2 vTexCoord;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

uniform sampler2D uImage;

vec2 rotateCenter(vec2 pos,float a){
  pos -= 0.5;
  mat2 rotMat = mat2(cos(a),-sin(a),sin(a),cos(a));
  pos *= rotMat;
  pos += 0.5;
  return pos;
}

void main(){
  vec2 uv = vec2(vTexCoord.x,1.0 - vTexCoord.y);
  uv += vec2(uTime,0.0);
  // uv = rotateCenter(uv,uTime);
  outputColor = texture(uImage,uv);
}`

export const MUY_BRIDGE_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;

in vec2 vTexCoord;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uImageResolution;

uniform sampler2D uImage;



vec2 rotateCenter(vec2 pos,float a){
  pos -= 0.5;
  mat2 rotMat = mat2(cos(a),-sin(a),sin(a),cos(a));
  pos *= rotMat;
  pos += 0.5;
  return pos;
}

void main(){
  vec2 gridSize = vec2(5.0,4.0);
  vec2 uv = vec2(vTexCoord.x,1.0 - vTexCoord.y);
  uv = rotateCenter(uv,uTime);
  
  uv /= gridSize;

  float timeX = uTime * 10.0;
  float timeY = floor(timeX / gridSize.x);
  vec2 offset = vec2(floor(timeX) / gridSize.x,floor(timeY) / gridSize.y);
  
  uv = fract(uv + offset);

  vec4 color = texture(uImage,uv);
  outputColor = vec4(color.rgb,color.a);
}`


export const SIERPINSKI_CARPET_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

out vec4 outputColor;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

const int maxIterations=6;

// vec2 rot(vec2 pos,float a){
// 	return vec2(pos.x*cos(a)-pos.y*sin(a),pos.y*cos(a)+pos.x*sin(a));
// }

vec2 rotateCenter(vec2 pos,float a){
  pos -= 0.5;
  mat2 rotMat = mat2(cos(a),-sin(a),sin(a),cos(a));
  pos *= rotMat;
  pos += 0.5;
  return pos;
}

void main(){
  vec2 pos = gl_FragCoord.xy / uResolution;

  float t = uTime * 0.5;
  pos = rotateCenter(pos,t);

  float zoomAmount = mod(t * 0.5,1.0);
  float scale = pow(3.0,zoomAmount);
  vec2 targetTile = vec2(1.0);
  pos = (pos - targetTile) / scale + targetTile;

  vec3 color = vec3(1.0);

  vec2 hole = step(1.0 / 3.0,pos) - step(2.0 / 3.0,pos);
  float result = hole.x * hole.y;
  for (int i = 0;i < maxIterations;i++){
    pos = fract(pos);
    hole = step(1.0 / 3.0,pos) - step(2.0 / 3.0,pos);
    result = hole.x * hole.y;
    if (result == 1.0){
      break;
    }
    pos *= 3.0;
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

  float pickerSize = 0.1;
  float pickerBorderSize = 0.005;

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
  float closePercent = step(pickerSize, distanceToMouse);
  float edgePercent = step(pickerSize, distanceToMouse) - step(pickerSize + pickerBorderSize, distanceToMouse);

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
