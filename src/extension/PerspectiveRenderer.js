import * as core from '../core';
import Matrix3 from './Matrix3';
import BaseSpriteShaderRenderer from './BaseSpriteShaderRenderer';

const WebGLRenderer = core.WebGLRenderer;

export default class PerspectiveRenderer extends BaseSpriteShaderRenderer
{

    constructor(renderer)
    {
        super(renderer);
        this.uniforms = {};
        this.defaultMatrix = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1,
        ]);
    }

    updateShaderParameters(shader, sprite)
    {
        shader.uniforms.worldMatrix = sprite.worldTransform.toArray(9);
        shader.uniforms.origWidth = sprite.origRealWidth;
        shader.uniforms.origHeight = sprite.origRealHeight;
        shader.uniforms.anchorX = sprite._anchor._x;
        shader.uniforms.anchorY = sprite._anchor._y;
        shader.uniforms.quadToSquareMatrix = sprite.quadToSquareMatrix || this.defaultMatrix;
        shader.uniforms.squareToQuadMatrix = sprite.squareToQuadMatrix || this.defaultMatrix;
    }

    getVertexSrc()
    {
        return [
            this.getVertexHeadSrc(),

            'uniform mat3 quadToSquareMatrix;',
            'uniform mat3 squareToQuadMatrix;',
            'uniform mat3 worldMatrix;',

            'uniform float origWidth;',
            'uniform float origHeight;',
            'uniform float anchorX;',
            'uniform float anchorY;',

            'void main(void) {',
            '    vTextureCoord = aTextureCoord;',
            // '    vColor = vec4(uColor.rgb * uColor.a, uColor.a);',
            '    vAlpha = uAlpha;',

            '    mat3 proM3 = projectionMatrix;',
            '    mat3 worldM3 = worldMatrix;',
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

            '    float w = origWidth;',
            '    float h = origHeight;',

            '    mat4 scaleM4;',
            '    scaleM4[0] = vec4(w,  0,  0,  0 );',
            '    scaleM4[1] = vec4(0,  h,  0,  0 );',
            '    scaleM4[2] = vec4(0,  0,  1,  0 );',
            '    scaleM4[3] = vec4(-w * anchorX,  -h * anchorY,  0,  1 );',

            '    gl_Position = proM4 * worldM4 * scaleM4 * perM4 * vec4(aVertexPosition.xy, 0.0, 1.0);',

            '}',
        ].join('\n');
    }

    static applyTo(sprite)
    {
        sprite._perspectiveRendererBakRenderWebGL = sprite._renderWebGL;
        sprite._renderWebGL = PerspectiveRenderer._spriteRenderWebGL;
        sprite.updatePerspective = PerspectiveRenderer._updatePerspective;
    }

    static unapplyTo(sprite)
    {
        if (sprite._perspectiveRendererBakRenderWebGL) {
            sprite._renderWebGL = sprite._perspectiveRendererBakRenderWebGL;
            sprite.updatePerspective = null;
        }
    }

    // sprite.updatePerspective(toQuad);
    // sprite.updatePerspective(fromQuad, toQuad);
    static _updatePerspective(fromQuad, toQuad)
    {
        const sprite = this;

        if (arguments.length === 1) {
            if (!sprite._texture) {
                return false;
            }
            toQuad = fromQuad;
            const frame = sprite._texture._frame;
            const x = 0; // frame.x;
            const y = 0; // frame.y;
            const w = frame.width;
            const h = frame.height;
            fromQuad = [
                x, y,
                x + w, y,
                x + w, y + h,
                x, y,
            ];
        }

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

        sprite.quadToSquareMatrix = qToS;
        sprite.squareToQuadMatrix = sToQ;

        return true;
    }

    static _spriteRenderWebGL(renderer)
    {
        const sprite = this;
        // sprite.calculateVertices();
        // PerspectiveRenderer.calculateSpriteVerticesWithoutTransform(sprite);
        sprite.calculateVerticesWithoutTransform(true);
        renderer.setObjectRenderer(renderer.plugins.perspective);
        renderer.plugins.perspective.render(sprite);
    }

}

WebGLRenderer.registerPlugin('perspective', PerspectiveRenderer);
