export default `

uniform mat3 projectionMatrix;
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform vec2 uPosition;
uniform float uAlpha;
uniform float uColorMultiplier;
uniform vec3 uColorOffset;

varying vec2 vTextureCoord;
varying float vAlpha;
varying float vColorMultiplier;
varying vec3 vColorOffset;

uniform sampler2D stateTex0;
attribute vec2 aParticleIndex;

const float PI = 3.14159;
const float DOUBLE_PI = 3.14159 * 2.0;

void main(void){

    vec4 state;

    state = texture2D(stateTex0, aParticleIndex);

    vec2 position = (state.xy - 0.5);
    float rotation = state.z * DOUBLE_PI;
    float scale = state.w;

    float skewX = 0.0;
    float skewY = 0.0;
    float alpha = 1.0;
    float colorMultiplier = 1.0;
    vec3 colorOffset = vec3(0.0, 0.0, 0.0);

    float a = cos(rotation + skewY);
    float b = sin(rotation + skewY);
    float c = sin(rotation - skewX);
    float d = cos(rotation - skewX);

    vec2 v = vec2(0, 0);

    v.x = aVertexPosition.x * a - aVertexPosition.y * c;
    v.y = aVertexPosition.x * b + aVertexPosition.y * d;

    v *= scale;
    v += position + uPosition;

    gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;

    vAlpha = alpha * uAlpha;
    vColorMultiplier = colorMultiplier * uColorMultiplier;
    vColorOffset = colorOffset + uColorOffset;
}

`;
