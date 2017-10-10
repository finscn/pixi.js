export default `

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
// uniform vec4 uColor;
uniform float uAlpha;

varying vec2 vTextureCoord;
// varying vec4 vColor;
varying float vAlpha;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

uniform mat3 perspectiveMatrix;
// uniform mat3 quadToSquareMatrix;
// uniform mat3 squareToQuadMatrix;


void main(void) {

    mat4 perM4 = mat4(
        perspectiveMatrix[0][0],  perspectiveMatrix[0][1],  0,  perspectiveMatrix[0][2],
        perspectiveMatrix[1][0],  perspectiveMatrix[1][1],  0,  perspectiveMatrix[1][2],
        0,            0,            1,  0,
        perspectiveMatrix[2][0],  perspectiveMatrix[2][1],  0,  perspectiveMatrix[2][2]
    );

    // vColor = vec4(uColor.rgb * uColor.a, uColor.a);
    vAlpha = uAlpha;

    gl_Position = projectionMatrix * worldMatrix * perM4 * vec4(aVertexPosition.xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}

`;
