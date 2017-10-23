export default `

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
uniform mat3 projectionMatrix;
varying vec2 vTextureCoord;

// uniform mat3 quadToSquareMatrix;
// uniform mat3 squareToQuadMatrix;
uniform mat3 perspectiveMatrix;

uniform mat3 worldMatrix;
uniform mat3 worldMatrixT;

uniform float spriteScaleX;
uniform float spriteScaleY;
uniform float spriteWidth;
uniform float spriteHeight;

void main(void) {
    mat3 proM3 = projectionMatrix;
    mat3 worldM3 = worldMatrix;
    mat3 worldM3T = worldMatrixT;
    // mat3 perM3 = quadToSquareMatrix * squareToQuadMatrix;
    mat3 perM3 = perspectiveMatrix;

    mat4 proM4;
    proM4[0]=vec4( proM3[0][0],  proM3[0][1],  0,  proM3[0][2] );
    proM4[1]=vec4( proM3[1][0],  proM3[1][1],  0,  proM3[1][2] );
    proM4[2]=vec4( 0,            0,            1,  0           );
    proM4[3]=vec4( proM3[2][0],  proM3[2][1],  0,  proM3[2][2] );

    mat4 perM4;
    perM4[0]=vec4( perM3[0][0],  perM3[0][1],  0,  perM3[0][2] );
    perM4[1]=vec4( perM3[1][0],  perM3[1][1],  0,  perM3[1][2] );
    perM4[2]=vec4( 0,            0,            1,  0           );
    perM4[3]=vec4( perM3[2][0],  perM3[2][1],  0,  perM3[2][2] );

    mat4 worldM4;
    worldM4[0]=vec4( worldM3[0][0],  worldM3[0][1],  0,  worldM3[0][2] );
    worldM4[1]=vec4( worldM3[1][0],  worldM3[1][1],  0,  worldM3[1][2] );
    worldM4[2]=vec4( 0,              0,              1,  0             );
    worldM4[3]=vec4( worldM3[2][0],  worldM3[2][1],  0,  worldM3[2][2] );

    float w = spriteWidth / spriteScaleX;
    float h = spriteHeight / spriteScaleY;
    float iW = 1.0 / w;
    float iH = 1.0 / h;

    mat3 normalM3;
    normalM3[0]=vec3(iW,  0,  0 );
    normalM3[1]=vec3(0,   iH, 0 );
    normalM3[2]=vec3(0,   0,  1 );

    vec3 normalPos = normalM3 * worldM3T * vec3(aVertexPosition, 1.0);

    mat4 restoreM4;
    restoreM4[0]=vec4(w,  0,  0,  0 );
    restoreM4[1]=vec4(0,  h,  0,  0 );
    restoreM4[2]=vec4(0,  0,  1,  0 );
    restoreM4[3]=vec4(0,  0,  0,  1 );

    gl_Position = proM4 * worldM4 * restoreM4 * perM4 *  vec4(normalPos.xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}

`;
