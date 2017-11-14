export default `

uniform sampler2D uSampler;
varying vec2 vTextureCoord;

varying float vAlpha;
varying float vColorMultiplier;
varying vec3 vColorOffset;

void main(void){
  vec4 color = texture2D(uSampler, vTextureCoord) * vAlpha;
  color.rgb *= vColorMultiplier;
  color.rgb += vColorOffset;

  gl_FragColor = color;
}

`;
