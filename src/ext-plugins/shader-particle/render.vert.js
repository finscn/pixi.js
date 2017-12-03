export default `

precision mediump float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
varying vec2 vTextureCoord;

uniform float flipY;

void main(void){
    gl_Position = vec4(aVertexPosition.x, aVertexPosition.y * flipY, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}

`;
