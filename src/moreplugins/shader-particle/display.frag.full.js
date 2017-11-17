export default `

uniform sampler2D uTexture;
varying vec2 vTextureCoord;

varying float vAlpha;
varying float vColorMultiplier;
varying vec3 vColorOffset;

void main(void){
  vec4 color = texture2D(uTexture, vTextureCoord) * vAlpha;
  color.rgb *= vColorMultiplier;
  color.rgb += vColorOffset * color.a;

  gl_FragColor = color;
}

`;
