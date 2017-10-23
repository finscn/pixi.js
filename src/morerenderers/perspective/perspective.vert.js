export default `

varying vec2 vTextureCoord;

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

// uniform mat3 quadToSquareMatrix;
// uniform mat3 squareToQuadMatrix;
uniform mat3 perspectiveMatrix;

void main(void) {

    mat4 perM4 = mat4(
        perspectiveMatrix[0][0],  perspectiveMatrix[0][1],  0,  perspectiveMatrix[0][2],
        perspectiveMatrix[1][0],  perspectiveMatrix[1][1],  0,  perspectiveMatrix[1][2],
        0,                        0,                        1,  0,
        perspectiveMatrix[2][0],  perspectiveMatrix[2][1],  0,  perspectiveMatrix[2][2]
    );

    gl_Position = projectionMatrix * worldMatrix * perM4 * vec4(aVertexPosition.xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}

`;
