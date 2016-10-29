import * as core from '../core';
import Matrix3 from './Matrix3';

export default class PerspectiveFilter extends core.Filter
{

    constructor(fromQuad, toQuad)
    {
        const vertSrc =  [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',
            'uniform mat3 projectionMatrix;',
            'varying vec2 vTextureCoord;',

            'uniform mat3 quadToSquareMatrix;',
            'uniform mat3 squareToQuadMatrix;',
            'uniform mat3 worldMatrix;',
            'uniform mat3 worldMatrixT;',

            'uniform float spriteScaleX;',
            'uniform float spriteScaleY;',
            'uniform float spriteWidth;',
            'uniform float spriteHeight;',

            'void main(void) {',
            '    vTextureCoord = aTextureCoord;',
            // '    gl_Position = perspectiveMatrix * vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);',

            '    mat3 proM3 = projectionMatrix;',
            '    mat3 worldM3 = worldMatrix;',
            '    mat3 worldM3T = worldMatrixT;',
            '    mat3 perM3 = quadToSquareMatrix * squareToQuadMatrix;',

            '    mat4 proM4;',
            '    proM4[0]=vec4( proM3[0][0],  proM3[0][1],  0,  proM3[0][2] );',
            '    proM4[1]=vec4( proM3[1][0],  proM3[1][1],  0,  proM3[1][2] );',
            '    proM4[2]=vec4( 0,            0,            1,  0           );',
            '    proM4[3]=vec4( proM3[2][0],  proM3[2][1],  0,  proM3[2][2] );',

            '    mat4 perM4;',
            '    perM4[0]=vec4( perM3[0][0],  perM3[0][1],  0,  perM3[0][2] );',
            '    perM4[1]=vec4( perM3[1][0],  perM3[1][1],  0,  perM3[1][2] );',
            '    perM4[2]=vec4( 0,            0,            1,  0           );',
            '    perM4[3]=vec4( perM3[2][0],  perM3[2][1],  0,  perM3[2][2] );',

            '    mat4 worldM4;',
            '    worldM4[0]=vec4( worldM3[0][0],  worldM3[0][1],  0,  worldM3[0][2] );',
            '    worldM4[1]=vec4( worldM3[1][0],  worldM3[1][1],  0,  worldM3[1][2] );',
            '    worldM4[2]=vec4( 0,              0,              1,  0             );',
            '    worldM4[3]=vec4( worldM3[2][0],  worldM3[2][1],  0,  worldM3[2][2] );',

            '    float w = spriteWidth / spriteScaleX;',
            '    float h = spriteHeight / spriteScaleY;',
            '    float iW = 1.0 / w;',
            '    float iH = 1.0 / h;',

            '    mat3 normalM3;',
            '    normalM3[0]=vec3(iW,  0,  0 );',
            '    normalM3[1]=vec3(0,   iH, 0 );',
            '    normalM3[2]=vec3(0,   0,  1 );',

            '    vec3 normalPos = normalM3 * worldM3T * vec3(aVertexPosition, 1.0);',

            '    mat4 restoreM4;',
            '    restoreM4[0]=vec4(w,  0,  0,  0 );',
            '    restoreM4[1]=vec4(0,  h,  0,  0 );',
            '    restoreM4[2]=vec4(0,  0,  1,  0 );',
            '    restoreM4[3]=vec4(0,  0,  0,  1 );',

            '    gl_Position = proM4 * worldM4 * restoreM4 * perM4 *  vec4(normalPos.xy, 0.0, 1.0);',

            '}',
        ].join('\n');

        const fragSrc = [
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',
            'void main(void) {',
            '    gl_FragColor = texture2D(uSampler, vTextureCoord);',
            '}',
        ].join('\n');

        super(
            // vertex shader
            vertSrc,
            // fragment shader
            fragSrc
        );

        this.updateMatrix(fromQuad, toQuad);

    }

    updateMatrix(fromQuad, toQuad)
    {

        this.fromQuad = fromQuad;
        this.toQuad = toQuad;

        // var qToS = getSquareToQuad.apply(null, fromQuad);
        // var sToQ = getSquareToQuad.apply(null, toQuad);
        // var pt = multiply(getInverse(sToQ), qToS);

        // computeQuadToSquare(src);
        // computeSquareToQuad(dst);
        // srcMat * dstMat

        const qToS = Matrix3.quadrilateralToSquare(
            fromQuad[0], fromQuad[1],
            fromQuad[2], fromQuad[3],
            fromQuad[4], fromQuad[5],
            fromQuad[6], fromQuad[7]
        );
        const sToQ = Matrix3.squareToQuadrilateral(
            toQuad[0], toQuad[1],
            toQuad[2], toQuad[3],
            toQuad[4], toQuad[5],
            toQuad[6], toQuad[7]
        );
        // const pt = new Float32Array(9);
        // Matrix3.multiply(pt, qToS, sToQ);
        // Matrix3.multiply(pt, sToQ, qToS);

        this.uniforms.quadToSquareMatrix = qToS;
        this.uniforms.squareToQuadMatrix = sToQ;
    }

    apply(filterManager, input, output, clear)
    {
        this.uniforms.worldMatrix = this.currentSprite.worldTransform.toArray(9);
        this.uniforms.worldMatrixT = Matrix3.invert(new Float32Array(9), this.uniforms.worldMatrix);
        this.uniforms.spriteWidth = this.currentSprite.width;
        this.uniforms.spriteHeight = this.currentSprite.height;
        this.uniforms.spriteScaleX = this.currentSprite.scale.x;
        this.uniforms.spriteScaleY = this.currentSprite.scale.y;
        filterManager.applyFilter(this, input, output, clear);
    }

}

