
#pragma glslify: import("../_shared/commonHead.vert.glsl")

varying float flippedY;

void main(void) {
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
    vNormalTextureCoord = aNormalTextureCoord;

    flippedY = projectionMatrix[1][1] < 0.0 ? 1.0 : 0.0;
}
