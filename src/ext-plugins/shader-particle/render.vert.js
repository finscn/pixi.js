export default `

precision mediump float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

uniform float uFlipY;

void main(void){
    gl_Position = vec4(aVertexPosition.x, aVertexPosition.y * uFlipY, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}

`;
