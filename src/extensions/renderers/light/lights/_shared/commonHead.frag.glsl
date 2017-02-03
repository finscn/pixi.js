uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

// light color, has multiplied bright for intensity.
uniform vec3 uLightColor;

// light attenuation coefficients (constant, linear, quadratic)
uniform vec3 uLightFalloff;

varying vec2 vTextureCoord;
varying vec2 vNormalTextureCoord;

uniform vec2 uViewSize;

uniform mat3 uWorldMatrix;
uniform bool uFixedNormal;
