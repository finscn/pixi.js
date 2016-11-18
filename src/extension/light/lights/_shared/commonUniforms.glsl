uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

// size of the viewport
uniform vec2 uViewSize;

// light color, alpha channel used for intensity.
uniform vec4 uLightColor;

// light attenuation coefficients (constant, linear, quadratic)
uniform vec3 uLightFalloff;

 // light height above the viewport
uniform float uLightHeight;

varying vec2 vTextureCoord;

