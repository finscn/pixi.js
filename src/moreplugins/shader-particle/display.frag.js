export default `

uniform sampler2D uTexture;
varying vec2 vTextureCoord;

uniform float uAlpha;
uniform float uColorMultiplier;
uniform vec3 uColorOffset;

void main(void) {
  vec4 color = texture2D(uTexture, vTextureCoord) * uAlpha;
  color.rgb *= uColorMultiplier;
  color.rgb += uColorOffset * color.a;

  gl_FragColor = color;
}

`;
