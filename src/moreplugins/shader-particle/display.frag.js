export default `

uniform sampler2D uTexture;
varying vec2 vTextureCoord;

void main(void){
  gl_FragColor = texture2D(uTexture, vTextureCoord);
}

`;
