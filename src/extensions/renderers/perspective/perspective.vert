attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat3 projectionMatrix;
// uniform vec4 uColor;
uniform float uAlpha;
varying vec2 vTextureCoord;
// varying vec4 vColor;
varying float vAlpha;

// uniform mat3 quadToSquareMatrix;
// uniform mat3 squareToQuadMatrix;
uniform mat3 perspectiveMatrix;
uniform mat3 worldMatrix;

void main(void) {
    // vColor = vec4(uColor.rgb * uColor.a, uColor.a);
    vAlpha = uAlpha;

    mat3 proM3 = projectionMatrix;
    mat3 worldM3 = worldMatrix;
    mat3 perM3 = perspectiveMatrix;
    // mat3 perM3 = quadToSquareMatrix * squareToQuadMatrix;

    mat4 proM4;
    proM4[0]=vec4( proM3[0][0],  proM3[0][1],  0,  proM3[0][2] );
    proM4[1]=vec4( proM3[1][0],  proM3[1][1],  0,  proM3[1][2] );
    proM4[2]=vec4( 0,            0,            1,  0           );
    proM4[3]=vec4( proM3[2][0],  proM3[2][1],  0,  proM3[2][2] );

    mat4 worldM4;
    worldM4[0]=vec4( worldM3[0][0],  worldM3[0][1],  0,  worldM3[0][2] );
    worldM4[1]=vec4( worldM3[1][0],  worldM3[1][1],  0,  worldM3[1][2] );
    worldM4[2]=vec4( 0,              0,              1,  0             );
    worldM4[3]=vec4( worldM3[2][0],  worldM3[2][1],  0,  worldM3[2][2] );

    mat4 perM4;
    perM4[0]=vec4( perM3[0][0],  perM3[0][1],  0,  perM3[0][2] );
    perM4[1]=vec4( perM3[1][0],  perM3[1][1],  0,  perM3[1][2] );
    perM4[2]=vec4( 0,            0,            1,  0           );
    perM4[3]=vec4( perM3[2][0],  perM3[2][1],  0,  perM3[2][2] );

    gl_Position = proM4 * worldM4 * perM4 * vec4(aVertexPosition.xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}
