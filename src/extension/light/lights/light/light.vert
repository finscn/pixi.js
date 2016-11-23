precision lowp float;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec2 aNormalTextureCoord;
uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
varying vec2 vNormalTextureCoord;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
    vNormalTextureCoord = aNormalTextureCoord;
}
